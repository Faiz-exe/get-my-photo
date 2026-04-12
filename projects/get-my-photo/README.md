# get-my-photo

Capture photos and short video clips from the browser camera in Angular apps.

[npm package](https://www.npmjs.com/package/get-my-photo) | [GitHub repository](https://github.com/Faiz-exe/get-my-photo)

## Features

**Under the hood** this package uses standard browser media APIs—no native plugins: **[`getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)** ([Media Capture and Streams](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API)) for the live webcam, the **[Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)** to sample still frames, and **[`MediaRecorder`](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)** to encode video. Those are the same platform pieces often used alongside **WebRTC** for camera access; here there is **no** `RTCPeerConnection`, signaling, or networking—only **local** capture from the user’s device.

**You can use it to** capture still photos, record video clips, add **CSS filters** to the live preview and to saved stills, switch **cameras** when the browser exposes them, and tune output size and framing.

- Start/stop the webcam stream from the parent (**trigger inputs**)
- Capture the current frame and emit a **base64 data URL** (`outputImage`)
- Optional **in-component** still preview (`previewImage`) and automatic image download (`saveOnCLick`)
- **Video recording** via `MediaRecorder` (`startVideoRecord` / `stopVideoRecord`, `videoRecorded`, `saveVideoOnStop`)
- **CSS `filter`** on live video and on canvas still capture (`cssFilter`)
- Optional **camera device** binding (`cameraDeviceId`) plus **`camerasEnumerated`** for building your own device list
- **`captureFit`** (`contain` | `cover`) when both `width` and `height` are set
- Configurable output **width**, **height**, and **fileName**

## Installation

```bash
npm install get-my-photo
```

## Peer Dependencies

`get-my-photo` expects Angular in your app:

- `@angular/core` `^21.0.0`
- `@angular/common` `^21.0.0`

## Usage

The library is **standalone-first**: import `GetPhotoComponent` (or `GetMyPhotoComponent`) in your component's `imports` array. `GetMyPhotoModule` remains available if you still use NgModules.

### Standalone (recommended)

```ts
import { Component } from '@angular/core';
import { GetPhotoComponent } from 'get-my-photo';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [GetPhotoComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  camOnPayload = {};
  capturePayload = {};
  turnOffPayload = {};
  retakePayload = {};

  startCamera(): void {
    this.camOnPayload = { camOn: true };
  }

  capture(): void {
    this.capturePayload = { capture: true };
  }

  stopCamera(): void {
    this.turnOffPayload = { turnOff: true };
  }

  retake(): void {
    this.retakePayload = { retake: true };
  }

  onImageCaptured(dataUrl: string): void {
    console.log('Captured image:', dataUrl);
  }
}
```

Bootstrap with `bootstrapApplication` and add `GetPhotoComponent` to any standalone route or parent component that needs the camera UI.

### NgModule (still supported)

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GetMyPhotoModule } from 'get-my-photo';

@NgModule({
  imports: [BrowserModule, GetMyPhotoModule],
})
export class AppModule {}
```

### Template

Use the component:

```html
<get-photo
  [turnCamOn]="camOnPayload"
  [triggerEvent]="capturePayload"
  [turnCamoff]="turnOffPayload"
  [retake]="retakePayload"
  [previewImage]="true"
  [saveOnCLick]="false"
  [width]="640"
  [height]="480"
  [showError]="true"
  errorMessage="Camera permission was denied"
  fileName="profile-photo.png"
  (outputImage)="onImageCaptured($event)">
</get-photo>
```

The same template works for both standalone and NgModule setups.

### Video recording (optional)

Bind trigger objects (use a **new object reference** each time so setters run), listen for the blob, and stop the recorder before tearing down the camera when possible:

```ts
import type { VideoRecordedEvent } from 'get-my-photo';

startRecord = { start: true };
stopRecord = { stop: true };

onVideo(ev: VideoRecordedEvent) {
  const url = URL.createObjectURL(ev.blob);
  // play, upload, or save — then URL.revokeObjectURL(url)
}
```

```html
<get-photo
  …
  [startVideoRecord]="startRecord"
  [stopVideoRecord]="stopRecord"
  [saveVideoOnStop]="false"
  (videoRecorded)="onVideo($event)"
  (videoRecordingChange)="recording = $event">
</get-photo>
```

See **Inputs / Outputs** below for full detail. MIME/container support is browser-dependent (often WebM; Safari may use MP4 when supported).

## Demo app (this repository)

The sample app in this repo is a **playground**: live preview on the left, **Component props** on the right (every `get-photo` input), plus camera enumeration and an active-device selector that bind `cameraDeviceId` on the library.

**Demo toolbar mode** (first control in the props panel) only changes **which buttons** appear under the preview—it is **not** part of the npm package API:

| Mode | What you see under the camera |
|------|--------------------------------|
| **Both** | Turn on, Capture, Record, Stop recording, Retake, Turn off |
| **Capture only** | Stills workflow: Capture and Retake; record buttons hidden |
| **Record only** | Video workflow: Record and Stop recording; Capture / Retake hidden |
| **Capture on record** | Record controls always; **Capture** and **Retake** only while `videoRecording` is true |

The demo also shows **Last capture** and **Last recording** panels wired to `outputImage` and `videoRecorded`.

Run locally: `npm start` (or `ng serve` for the `lib-getMyPhoto` application project).

## API

### Selector

- `get-photo`

### Inputs

| Input | Type | Description |
|---|---|---|
| `FileType` | `string` | Reserved input (not currently used in logic). |
| `errorMessage` | `string` | Message shown when access fails and `showError` is true. |
| `fileName` | `string` | Download filename when `saveOnCLick` is true. Defaults to `image-<timestamp>.png`. |
| `width` | `number` | Output width in pixels. If only `width` is set, `height` is derived from the camera aspect ratio. Defaults to the stream's `videoWidth`. |
| `height` | `number` | Output height in pixels. If only `height` is set, `width` is derived from the camera aspect ratio. Defaults to the stream's `videoHeight`. |
| `captureFit` | `string` | When **both** `width` and `height` are set: `contain` (default) scales the frame to fit inside the box with letterboxing; `cover` scales to fill the box and crops. Preserves aspect ratio so the image is not stretched. |
| `cssFilter` | `string` | Optional CSS `filter` string (e.g. `grayscale(1)`). Applied to the live `<video>` and to canvas capture via `CanvasRenderingContext2D.filter` so downloaded / emitted images match what you see. Empty = no filter. |
| `showError` | `boolean` | Shows error text on permission failure. |
| `previewImage` | `boolean` | Shows captured image preview and stops camera. |
| `saveOnCLick` | `boolean` | Automatically downloads the image on capture. |
| `cameraDeviceId` | `string` / `null` | Optional `deviceId` from `enumerateDevices`. When set, opens that camera; when `null`/unset, uses the browser default (`video: true`). Changing while the stream is on restarts `getUserMedia`. Build your own device list and switcher in the parent; the preview template only renders video + optional preview + error. |
| `turnCamOn` | `object` | Trigger with `{ camOn: true }` to start camera. |
| `turnCamoff` | `object` | Trigger with `{ turnOff: true }` to stop camera. |
| `triggerEvent` | `object` | Trigger with `{ capture: true }` to capture current frame. |
| `retake` | `object` | Trigger with `{ retake: true }` to return to live camera after preview. |
| `startVideoRecord` | `object` | Trigger with `{ start: true }` while the live stream is active to begin **`MediaRecorder`** capture (no audio; same video track as preview). |
| `stopVideoRecord` | `object` | Trigger with `{ stop: true }` to stop recording, finalize chunks, and emit **`videoRecorded`** (and optional download if `saveVideoOnStop` is true). |
| `saveVideoOnStop` | `boolean` | When true, after a **user-intended** stop (`stopVideoRecord`), the library also downloads the file using `fileName` as a base (extension from MIME, e.g. `.webm` / `.mp4`). |

> Note: The input is named `saveOnCLick` (capital `CL`) to match the package API.

Recording uses the browser’s supported MIME types (often **WebM** on Chrome/Firefox; **Safari** may prefer **MP4** when supported). Stopping the camera or restarting the stream ends recording **without** emitting a file.

### Outputs

| Output | Type | Description |
|---|---|---|
| `outputImage` | `EventEmitter<string>` | Emits captured image as base64 data URL. |
| `camerasEnumerated` | `EventEmitter<CamerasEnumeratedEvent>` | Fires after each successful stream open (and after enumeration), with `count` and the full `devices` list (`videoinput` entries from `enumerateDevices`). Use this to build your own UI or logging. |
| `videoRecorded` | `EventEmitter<VideoRecordedEvent>` | Emits `{ blob, mimeType, extension }` when recording stops via **`stopVideoRecord`**. |
| `videoRecordingChange` | `EventEmitter<boolean>` | `true` while **`MediaRecorder`** is active; `false` when idle or after teardown. |

## Exports

The package exports:

- **`GetPhotoComponent`** — standalone; main camera UI (`get-photo`).
- **`CamerasEnumeratedEvent`** — type payload for `camerasEnumerated` (`count` + `devices`).
- **`VideoRecordedEvent`** — `{ blob, mimeType, extension }` from `videoRecorded`.
- **`GetMyPhotoComponent`** — standalone; simple placeholder shell.
- **`GetMyPhotoModule`** — optional NgModule that re-exports the above for legacy apps.
- **`GetMyPhotoService`** — injectable helper (`providedIn: 'root'`).

This repository's demo app uses **`bootstrapApplication`**, **`provideRouter`**, and a standalone root component that imports **`GetPhotoComponent`** directly.

## Author

Faizal Hussain (`hussainfaizal131@gmail.com`)

