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

  @Output() outputImage: EventEmitter<any> = new EventEmitter<any>();
  @Output() camerasEnumerated = new EventEmitter<CamerasEnumeratedEvent>();

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

  constructor(
    public sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
  ) {}

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

  private stopActiveStream(): void {
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
    if (useFit && this.captureFit === 'cover') {
      const scale = Math.max(outW / vw, outH / vh);
      const drawW = vw * scale;
      const drawH = vh * scale;
      const dx = (outW - drawW) / 2;
      const dy = (outH - drawH) / 2;
      this.context.drawImage(video, 0, 0, vw, vh, dx, dy, drawW, drawH);
    } else if (useFit && this.captureFit === 'contain') {
      const scale = Math.min(outW / vw, outH / vh);
      const drawW = vw * scale;
      const drawH = vh * scale;
      const dx = (outW - drawW) / 2;
      const dy = (outH - drawH) / 2;
      this.context.fillStyle = '#000';
      this.context.fillRect(0, 0, outW, outH);
      this.context.drawImage(video, 0, 0, vw, vh, dx, dy, drawW, drawH);
    } else {
      this.context.drawImage(video, 0, 0, vw, vh, 0, 0, outW, outH);
    }
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
    this.stopActiveStream();
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
