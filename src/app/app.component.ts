import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
  GetPhotoComponent,
  type CamerasEnumeratedEvent,
} from 'get-my-photo';

export type CaptureFitMode = 'contain' | 'cover';

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

  lastCapture: SafeUrl | null = null;
  cameraActive = false;

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
  captureFit: CaptureFitMode = 'cover';

  cameraDeviceId: string | null = null;

  cameraReport: CamerasEnumeratedEvent | null = null;

  constructor(public sanitizer: DomSanitizer) {}

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

  clearPreview(): void {
    this.lastCapture = null;
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
    this.captureFit = 'cover';
    this.cameraDeviceId = null;
    void this.probeVideoInputs();
  }
}
