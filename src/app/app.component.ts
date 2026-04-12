import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import {
  GetPhotoComponent,
  type CamerasEnumeratedEvent,
  type VideoRecordedEvent,
} from 'get-my-photo';

export type CaptureFitMode = 'contain' | 'cover';

/** Demo app only: which actions appear under the live preview. */
export type DemoToolbarMode =
  | 'both'
  | 'capture'
  | 'record'
  | 'capture-on-record';

@Component({
  selector: 'getPhoto-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FormsModule, GetPhotoComponent],
})
export class AppComponent implements OnInit {
  title = 'get-my-photo';

  triggerCapture: { capture?: boolean } | null = null;
  camOnPayload: { camOn?: boolean } | null = null;
  turnOffPayload: { turnOff?: boolean } | null = null;
  retakePayload: { retake?: boolean } = {};
  private recordSeq = 0;
  startVideoRecordPayload: { start?: boolean; seq?: number } | null = null;
  stopVideoRecordPayload: { stop?: boolean; seq?: number } | null = null;

  lastCapture: SafeUrl | null = null;
  lastVideoSrc: SafeResourceUrl | null = null;
  private lastVideoBlobUrl: string | null = null;
  cameraActive = false;
  videoRecording = false;

  /** Mirrors every public `@Input()` on `get-photo` (playground). */
  fileType = '';
  errorMessage =
    'Could not access the camera. Allow permission or use HTTPS / localhost.';
  fileName = 'capture.png';
  width: number | null = 300;
  height: number | null = 300;
  showError = true;
  previewImage = false;
  saveOnCLick = true;
  saveVideoOnStop = false;
  captureFit: CaptureFitMode = 'cover';

  filterPreset = '';
  filterCustom = '';

  cameraDeviceId: string | null = null;

  cameraReport: CamerasEnumeratedEvent | null = null;

  /** Demo: still capture + retake row under the camera. */
  demoToolbarMode: DemoToolbarMode = 'both';

  constructor(public sanitizer: DomSanitizer) {}

  /** Stills: Capture + Retake. Hidden in record-only mode; in capture-on-record, only while recording. */
  showStillsToolbar(): boolean {
    switch (this.demoToolbarMode) {
      case 'capture':
      case 'both':
        return true;
      case 'record':
        return false;
      case 'capture-on-record':
        return this.videoRecording;
      default:
        return true;
    }
  }

  /** Video: Record + Stop recording. Hidden in capture-only mode. */
  showRecordToolbar(): boolean {
    switch (this.demoToolbarMode) {
      case 'record':
      case 'both':
      case 'capture-on-record':
        return true;
      case 'capture':
        return false;
      default:
        return true;
    }
  }

  get effectiveCssFilter(): string {
    return this.filterCustom.trim() || this.filterPreset;
  }

  ngOnInit(): void {
    void this.probeVideoInputs();
  }

  /** Lists video inputs without opening a stream (labels may be empty until permission). */
  private async probeVideoInputs(): Promise<void> {
    if (!navigator.mediaDevices?.enumerateDevices) {
      this.cameraReport = { count: 0, devices: [] };
      return;
    }
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const devices = all.filter((d) => d.kind === 'videoinput');
      this.cameraReport = { count: devices.length, devices: [...devices] };
    } catch {
      this.cameraReport = { count: 0, devices: [] };
    }
  }

  startCamera(): void {
    this.camOnPayload = { camOn: true };
    this.cameraActive = true;
  }

  captureFrame(): void {
    this.triggerCapture = { capture: true };
  }

  stopCamera(): void {
    this.stopVideoRecordPayload = { stop: true, seq: ++this.recordSeq };
    this.turnOffPayload = { turnOff: true };
    this.cameraActive = false;
    this.cameraDeviceId = null;
  }

  retake(): void {
    this.retakePayload = { retake: true };
  }

  onImageCaptured(dataUrl: string): void {
    this.lastCapture = this.sanitizer.bypassSecurityTrustUrl(dataUrl);
  }

  onCamerasEnumerated(ev: CamerasEnumeratedEvent): void {
    this.cameraReport = ev;
  }

  onVideoRecordingChange(on: boolean): void {
    this.videoRecording = on;
  }

  onVideoRecorded(ev: VideoRecordedEvent): void {
    if (this.lastVideoBlobUrl) {
      URL.revokeObjectURL(this.lastVideoBlobUrl);
    }
    this.lastVideoBlobUrl = URL.createObjectURL(ev.blob);
    this.lastVideoSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.lastVideoBlobUrl,
    );
  }

  startVideoRecording(): void {
    this.startVideoRecordPayload = { start: true, seq: ++this.recordSeq };
  }

  stopVideoRecording(): void {
    this.stopVideoRecordPayload = { stop: true, seq: ++this.recordSeq };
  }

  clearPreview(): void {
    this.lastCapture = null;
  }

  clearVideoPreview(): void {
    if (this.lastVideoBlobUrl) {
      URL.revokeObjectURL(this.lastVideoBlobUrl);
    }
    this.lastVideoBlobUrl = null;
    this.lastVideoSrc = null;
  }

  resetProps(): void {
    this.fileType = '';
    this.errorMessage =
      'Could not access the camera. Allow permission or use HTTPS / localhost.';
    this.fileName = 'capture.png';
    this.width = 300;
    this.height = 300;
    this.showError = true;
    this.previewImage = false;
    this.saveOnCLick = true;
    this.saveVideoOnStop = false;
    this.captureFit = 'cover';
    this.filterPreset = '';
    this.filterCustom = '';
    this.cameraDeviceId = null;
    this.demoToolbarMode = 'both';
    this.clearVideoPreview();
    void this.probeVideoInputs();
  }
}
