# get-my-photo

Capture photos from the browser camera in Angular apps.

[npm package](https://www.npmjs.com/package/get-my-photo) | [GitHub repository](https://github.com/Faiz-exe/get-my-photo)

## Features

- Start/stop webcam stream from parent component
- Capture current frame and emit as base64 data URL
- Optional in-component preview mode
- Optional automatic download of captured image
- Configurable output width, height, and filename

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
| `showError` | `boolean` | Shows error text on permission failure. |
| `previewImage` | `boolean` | Shows captured image preview and stops camera. |
| `saveOnCLick` | `boolean` | Automatically downloads the image on capture. |
| `cameraDeviceId` | `string` / `null` | Optional `deviceId` from `enumerateDevices`. When set, opens that camera; when `null`/unset, uses the browser default (`video: true`). Changing while the stream is on restarts `getUserMedia`. Build your own device list and switcher in the parent; the preview template only renders video + optional preview + error. |
| `turnCamOn` | `object` | Trigger with `{ camOn: true }` to start camera. |
| `turnCamoff` | `object` | Trigger with `{ turnOff: true }` to stop camera. |
| `triggerEvent` | `object` | Trigger with `{ capture: true }` to capture current frame. |
| `retake` | `object` | Trigger with `{ retake: true }` to return to live camera after preview. |

> Note: The input is named `saveOnCLick` (capital `CL`) to match the package API.

### Outputs

| Output | Type | Description |
|---|---|---|
| `outputImage` | `EventEmitter<string>` | Emits captured image as base64 data URL. |
| `camerasEnumerated` | `EventEmitter<CamerasEnumeratedEvent>` | Fires after each successful stream open (and after enumeration), with `count` and the full `devices` list (`videoinput` entries from `enumerateDevices`). Use this to build your own UI or logging. |

## Exports

The package exports:

- **`GetPhotoComponent`** — standalone; main camera UI (`get-photo`).
- **`CamerasEnumeratedEvent`** — type payload for `camerasEnumerated` (`count` + `devices`).
- **`GetMyPhotoComponent`** — standalone; simple placeholder shell.
- **`GetMyPhotoModule`** — optional NgModule that re-exports the above for legacy apps.
- **`GetMyPhotoService`** — injectable helper (`providedIn: 'root'`).

This repository's demo app uses **`bootstrapApplication`**, **`provideRouter`**, and a standalone root component that imports **`GetPhotoComponent`** directly.

## GitHub Pages (live demo)

The workflow [`.github/workflows/github-pages.yml`](.github/workflows/github-pages.yml) builds with **`baseHref: /get-my-photo/`** (for `https://<user>.github.io/get-my-photo/`) and deploys with **GitHub Actions**.

1. Push these changes to your default branch (`main` or `master`).
2. In the repo on GitHub: **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions** (not “Deploy from a branch”).
3. Open **Actions**, wait for **GitHub Pages** to finish, then visit **`https://faiz-exe.github.io/get-my-photo/`** (replace with your username if different).

If the repository name is not **`get-my-photo`**, edit **`baseHref`** in `angular.json` under `lib-getMyPhoto → architect → build → configurations → github-pages` to `/<your-repo-name>/`, then push again.

Local check: `npm run build:pages` writes to `dist/lib-getMyPhoto/` (and copies `index.html` to **`404.html`** so client-side routes behave on Pages).

## Browser requirements

- Camera APIs require secure context (`https://` or `http://localhost`)
- User must grant camera permission

## Author

Faizal Hussain (`hussainfaizal131@gmail.com`)
