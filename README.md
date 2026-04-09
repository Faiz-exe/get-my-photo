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

Import the module:

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GetMyPhotoModule } from 'get-my-photo';

@NgModule({
  imports: [BrowserModule, GetMyPhotoModule]
})
export class AppModule {}
```

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

```ts
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
```

## API

### Selector

- `get-photo`

### Inputs

| Input | Type | Description |
|---|---|---|
| `FileType` | `string` | Reserved input (not currently used in logic). |
| `errorMessage` | `string` | Message shown when access fails and `showError` is true. |
| `fileName` | `string` | Download filename when `saveOnCLick` is true. Defaults to `image-<timestamp>.png`. |
| `width` | `number` | Captured image width. Defaults to video element width. |
| `height` | `number` | Captured image height. Defaults to video element height. |
| `showError` | `boolean` | Shows error text on permission failure. |
| `previewImage` | `boolean` | Shows captured image preview and stops camera. |
| `saveOnCLick` | `boolean` | Automatically downloads the image on capture. |
| `turnCamOn` | `object` | Trigger with `{ camOn: true }` to start camera. |
| `turnCamoff` | `object` | Trigger with `{ turnOff: true }` to stop camera. |
| `triggerEvent` | `object` | Trigger with `{ capture: true }` to capture current frame. |
| `retake` | `object` | Trigger with `{ retake: true }` to return to live camera after preview. |

> Note: The input is named `saveOnCLick` (capital `CL`) to match the package API.

### Outputs

| Output | Type | Description |
|---|---|---|
| `outputImage` | `EventEmitter<string>` | Emits captured image as base64 data URL. |

## Exports

The package exports:

- `GetMyPhotoModule`
- `GetPhotoComponent`
- `GetMyPhotoComponent`
- `GetMyPhotoService`

## Browser requirements

- Camera APIs require secure context (`https://` or `http://localhost`)
- User must grant camera permission

## Author

Faizal Hussain (`hussainfaizal131@gmail.com`)
