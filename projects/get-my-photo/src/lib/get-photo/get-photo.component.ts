import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export interface CamerasEnumeratedEvent {
  count: number;
  devices: MediaDeviceInfo[];
}

export interface VideoRecordedEvent {
  blob: Blob;
  mimeType: string;
  extension: string;
}

@Component({
  selector: 'get-photo',
  templateUrl: './get-photo.component.html',
  styleUrls: ['./get-photo.component.css'],
  standalone: true,
})
export class GetPhotoComponent implements OnChanges {
  base64File: any;
  src: any;
  videoPreview: any;
  imagepreview = false;
  isInitiallyOn = false;
  captureFrame: HTMLVideoElement | null = null;
  error = false;
  outputCanvas: HTMLCanvasElement | null = null;
  context: CanvasRenderingContext2D | null = null;

  private activeStream: MediaStream | null = null;

  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private pendingEmitRecordedVideo = false;
  private lastRecorderMime = 'video/webm';

  videoRecording = false;

  @Input() cameraDeviceId: string | null | undefined;

  @Input() public FileType: string;
  @Input() public errorMessage = '';
  @Input() public fileName: string;
  @Input() public width: number;
  @Input() public height: number;
  @Input() public showError: boolean;
  @Input() public previewImage: boolean;
  @Input() public saveOnCLick: boolean;
  @Input() public captureFit: 'contain' | 'cover' = 'contain';

  @Input() public cssFilter = '';

  @Input() public saveVideoOnStop = false;

  @Output() outputImage: EventEmitter<any> = new EventEmitter<any>();
  @Output() camerasEnumerated = new EventEmitter<CamerasEnumeratedEvent>();
  @Output() videoRecorded = new EventEmitter<VideoRecordedEvent>();
  @Output() videoRecordingChange = new EventEmitter<boolean>();

  @Input() set turnCamoff(data) {
    if (data && data.turnOff && this.isInitiallyOn) {
      this.imagepreview = false;
      this.videoPreview = false;
      this.isInitiallyOn = false;
      this.stopCam();
    }
  }

  @Input() set triggerEvent(data) {
    if (data && data.capture && this.isInitiallyOn && this.videoPreview) {
      this.capture();
    }
  }

  @Input() set retake(data) {
    if (data && data.retake && this.isInitiallyOn && this.imagepreview) {
      this.videoPreview = true;
      this.imagepreview = false;
      this.cdRef.detectChanges();
      this.loadVars();
      this.src = null;
    }
  }

  @Input() set turnCamOn(data) {
    if (data && data.camOn && !this.isInitiallyOn) {
      this.isInitiallyOn = data.camOn;
      this.videoPreview = data.camOn;
      this.cdRef.detectChanges();
      this.loadVars();
    }
  }

  @Input() set startVideoRecord(data: { start?: boolean } | null) {
    if (data?.start && this.isInitiallyOn && this.videoPreview && this.activeStream) {
      this.beginVideoRecording();
    }
  }

  @Input() set stopVideoRecord(data: { stop?: boolean } | null) {
    if (data?.stop) {
      this.endVideoRecording(true);
    }
  }

  constructor(
    public sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
  ) {}

  get videoFilterStyle(): string {
    return this.cssFilter?.trim() ?? '';
  }

  private canvasFilterValue(): string {
    const t = this.cssFilter?.trim();
    return t ? t : 'none';
  }

  ngOnChanges(changes: SimpleChanges): void {
    const ch = changes['cameraDeviceId'];
    if (!ch || ch.firstChange) {
      return;
    }
    if (!this.isInitiallyOn || !this.videoPreview) {
      return;
    }
    if (ch.previousValue === ch.currentValue) {
      return;
    }
    this.loadVars();
  }

  private buildStreamConstraints(): MediaStreamConstraints {
    const id = this.cameraDeviceId;
    if (id) {
      return {
        video: { deviceId: { exact: id } },
        audio: false,
      };
    }
    return { video: true, audio: false };
  }

  private pickRecorderMime(): string {
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
      return '';
    }
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) {
        return c;
      }
    }
    return '';
  }

  private clearRecorderFlags(): void {
    this.recordedChunks = [];
    this.pendingEmitRecordedVideo = false;
    if (this.videoRecording) {
      this.videoRecording = false;
      this.videoRecordingChange.emit(false);
    }
  }

  /**
   * Tear down recorder without emitting a file. Clears handlers so async `onstop`
   * does not race with a new MediaRecorder.
   */
  private hardStopRecorderNoEmit(): void {
    this.pendingEmitRecordedVideo = false;
    const mr = this.mediaRecorder;
    if (!mr) {
      return;
    }
    mr.ondataavailable = null;
    mr.onstop = null;
    mr.onerror = null;
    try {
      if (mr.state !== 'inactive') {
        mr.stop();
      }
    } catch {
      /* ignore */
    }
    this.mediaRecorder = null;
    this.clearRecorderFlags();
  }

  private beginVideoRecording(): void {
    if (typeof MediaRecorder === 'undefined') {
      console.warn('get-photo: MediaRecorder is not available');
      return;
    }
    if (!this.activeStream || this.videoRecording) {
      return;
    }
    this.hardStopRecorderNoEmit();

    const mime = this.pickRecorderMime();
    const opts: MediaRecorderOptions = mime ? { mimeType: mime } : {};
    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(this.activeStream, opts);
    } catch {
      try {
        mr = new MediaRecorder(this.activeStream);
      } catch (e) {
        console.error('get-photo: MediaRecorder constructor failed', e);
        return;
      }
    }

    this.recordedChunks = [];
    mr.ondataavailable = (ev: BlobEvent) => {
      if (ev.data?.size) {
        this.recordedChunks.push(ev.data);
      }
    };
    mr.onerror = (ev) => {
      console.error('get-photo: MediaRecorder error', ev);
    };
    mr.onstop = () => this.onMediaRecorderStopped(mr);

    this.mediaRecorder = mr;
    this.lastRecorderMime = mr.mimeType || mime || 'video/webm';

    try {
      mr.start(250);
      this.videoRecording = true;
      this.videoRecordingChange.emit(true);
      this.cdRef.markForCheck();
    } catch (e) {
      console.error('get-photo: MediaRecorder.start failed', e);
      this.mediaRecorder = null;
      this.clearRecorderFlags();
    }
  }

  private endVideoRecording(emitBlob: boolean): void {
    const mr = this.mediaRecorder;
    if (!mr || mr.state === 'inactive') {
      return;
    }
    this.pendingEmitRecordedVideo = emitBlob;
    try {
      mr.stop();
    } catch {
      this.onMediaRecorderStopped(mr);
    }
  }

  private onMediaRecorderStopped(mr: MediaRecorder): void {
    if (this.mediaRecorder !== mr) {
      return;
    }
    const mime = mr.mimeType || this.lastRecorderMime || 'video/webm';
    const chunks = this.recordedChunks.slice();
    const shouldEmit = this.pendingEmitRecordedVideo;

    this.mediaRecorder = null;
    this.clearRecorderFlags();
    this.cdRef.markForCheck();

    if (!shouldEmit || chunks.length === 0) {
      return;
    }
    const blob = new Blob(chunks, { type: mime });
    const extension = mime.includes('mp4') ? 'mp4' : 'webm';
    this.videoRecorded.emit({ blob, mimeType: mime, extension });
    if (this.saveVideoOnStop) {
      this.downloadVideoBlob(blob, extension);
    }
  }

  private downloadVideoBlob(blob: Blob, extension: string): void {
    const base =
      this.fileName && this.fileName.trim()
        ? this.fileName.replace(/\.(png|jpe?g|webp|webm|mp4)$/i, '')
        : `video-${Date.now()}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${base}.${extension}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private stopActiveStream(): void {
    this.hardStopRecorderNoEmit();
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((t) => t.stop());
      this.activeStream = null;
    }
    const el =
      this.captureFrame ??
      (document.getElementById('captureFrame') as HTMLVideoElement | null);
    if (el) {
      el.srcObject = null;
    }
  }

  async refreshVideoDevices(): Promise<void> {
    if (!navigator.mediaDevices?.enumerateDevices) {
      this.camerasEnumerated.emit({ count: 0, devices: [] });
      return;
    }
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const devices = all.filter((d) => d.kind === 'videoinput');
      this.camerasEnumerated.emit({
        count: devices.length,
        devices: [...devices],
      });
    } catch {
      this.camerasEnumerated.emit({ count: 0, devices: [] });
    }
    this.cdRef.markForCheck();
  }

  loadVars() {
    this.captureFrame = document.getElementById(
      'captureFrame',
    ) as HTMLVideoElement | null;

    this.outputCanvas = document.createElement('canvas');
    this.context = this.outputCanvas.getContext('2d');

    this.stopActiveStream();

    const constraints = this.buildStreamConstraints();
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        this.activeStream = stream;
        if (this.captureFrame) {
          this.captureFrame.srcObject = stream;
        }
        this.error = false;
        void this.refreshVideoDevices();
        this.cdRef.markForCheck();
      })
      .catch((error) => {
        this.videoPreview = false;
        if (this.showError) {
          this.error = true;
        }
        console.error('access to camera has been denied', error);
        void this.refreshVideoDevices();
        this.cdRef.markForCheck();
      });
  }

  capture() {
    const video = this.captureFrame as HTMLVideoElement;
    if (!video || !this.context || !this.outputCanvas) {
      return;
    }
    const vw = video.videoWidth || video.clientWidth;
    const vh = video.videoHeight || video.clientHeight;
    if (!vw || !vh) {
      return;
    }

    let outW: number;
    let outH: number;
    if (this.width != null && this.height != null) {
      outW = this.width;
      outH = this.height;
    } else if (this.width != null) {
      outW = this.width;
      outH = Math.round(this.width * (vh / vw));
    } else if (this.height != null) {
      outH = this.height;
      outW = Math.round(this.height * (vw / vh));
    } else {
      outW = vw;
      outH = vh;
    }

    this.outputCanvas.width = outW;
    this.outputCanvas.height = outH;

    const useFit = this.width != null && this.height != null;
    const f = this.canvasFilterValue();
    if (useFit && this.captureFit === 'cover') {
      this.context.filter = f;
      const scale = Math.max(outW / vw, outH / vh);
      const drawW = vw * scale;
      const drawH = vh * scale;
      const dx = (outW - drawW) / 2;
      const dy = (outH - drawH) / 2;
      this.context.drawImage(video, 0, 0, vw, vh, dx, dy, drawW, drawH);
    } else if (useFit && this.captureFit === 'contain') {
      this.context.filter = 'none';
      const scale = Math.min(outW / vw, outH / vh);
      const drawW = vw * scale;
      const drawH = vh * scale;
      const dx = (outW - drawW) / 2;
      const dy = (outH - drawH) / 2;
      this.context.fillStyle = '#000';
      this.context.fillRect(0, 0, outW, outH);
      this.context.filter = f;
      this.context.drawImage(video, 0, 0, vw, vh, dx, dy, drawW, drawH);
    } else {
      this.context.filter = f;
      this.context.drawImage(video, 0, 0, vw, vh, 0, 0, outW, outH);
    }
    this.context.filter = 'none';
    if (this.saveOnCLick) {
      this.downloadImage();
    }

    this.outputCanvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.addEventListener('load', () => {
        const url = reader.result;
        this.outputImage.emit(url);
        if (this.previewImage) {
          this.src = this.sanitizer.bypassSecurityTrustUrl(url as any);
          this.imagepreview = true;
          this.stopCam();
        }
      });
    });
  }

  stopCam() {
    this.hardStopRecorderNoEmit();
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((t) => t.stop());
      this.activeStream = null;
    }
    const el =
      this.captureFrame ??
      (document.getElementById('captureFrame') as HTMLVideoElement | null);
    if (el) {
      el.srcObject = null;
    }
    this.videoPreview = false;
    this.cdRef.detectChanges();
  }

  downloadImage() {
    if (!this.outputCanvas) {
      return;
    }
    let fileName = '';

    if (this.fileName === '' || !this.fileName) {
      fileName = `image-${new Date().getTime()}.png`;
    } else {
      fileName = this.fileName;
    }
    const imageLink = document.createElement('a');
    imageLink.setAttribute('download', `${fileName}`);
    this.outputCanvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      imageLink.setAttribute('href', URL.createObjectURL(blob));
      imageLink.click();
    });
  }
}
