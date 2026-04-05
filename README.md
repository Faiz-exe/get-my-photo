# get-my-photo

Angular library that captures still images from the device camera using the [MediaDevices `getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) API. It emits a data URL you can upload or display, with optional download and preview.

**Stack:** Angular **21**, TypeScript **5.9**, RxJS **7**, `ng-packagr` for the publishable package.

## Requirements

- **Node.js** 20.19+ (LTS recommended). Angular 21 supports the current Node LTS line; avoid odd-numbered Node releases for production builds.
- A **secure context** (HTTPS or `localhost`) so the browser allows camera access.

## Quick start

```bash
git clone https://github.com/Faiz-exe/get-my-photo.git
cd get-my-photo
npm install
```

Build the library (output: `dist/get-my-photo/`):

```bash
npm run build:lib
```

Run the demo application (serves at `http://localhost:4200/`):

```bash
npm start
```

Production build for the demo app:

```bash
ng build lib-getMyPhoto --configuration production
```

## Use in your Angular app

1. Build or install the package so it resolves as `get-my-photo` (this workspace maps it via `tsconfig` paths; published consumers use the npm package name).

2. Import the module:

```typescript
import { GetMyPhotoModule } from 'get-my-photo';

@NgModule({
  imports: [GetMyPhotoModule],
  // ...
})
export class AppModule {}
```

3. Use the `get-photo` component in a template (see `src/app/app.component.html` for a full example):

```html
<get-photo
  [turnCamOn]="{ camOn: true }"
  (outputImage)="handleImage($event)"
  [previewImage]="true"
  [width]="640"
  [height]="480">
</get-photo>
```

### `get-photo` inputs and outputs

| Member | Kind | Purpose |
|--------|------|---------|
| `FileType` | `@Input()` | Reserved for file-type hints. |
| `errorMessage` | `@Input()` | Message shown when camera access fails and `showError` is true. |
| `fileName` | `@Input()` | Download filename when saving from the canvas (defaults to a timestamped PNG). |
| `width` / `height` | `@Input()` | Capture dimensions in pixels (falls back to video element size). |
| `showError` | `@Input()` | Show an error state when permission is denied. |
| `previewImage` | `@Input()` | After capture, show preview and stop the camera. |
| `saveOnCLick` | `@Input()` | Trigger download when capturing. |
| `turnCamOn` | `@Input()` set | Pass `{ camOn: true }` to start the camera. |
| `turnCamoff` | `@Input()` set | Pass `{ turnOff: true }` to stop the camera. |
| `triggerEvent` | `@Input()` set | Pass `{ capture: true }` to grab a frame while the stream is active. |
| `retake` | `@Input()` set | Pass `{ retake: true }` to return from preview to live video. |
| `outputImage` | `@Output()` | Emits a data URL string of the captured image. |

## Workspace layout

| Path | Role |
|------|------|
| `projects/get-my-photo/` | Library source and `ng-package.json` |
| `src/` | Demo application that consumes the library |
| `dist/get-my-photo/` | Built npm package (after `npm run build:lib`) |

## Scripts

| Script | Command |
|--------|---------|
| `npm start` | `ng serve` — demo app |
| `npm run build:lib` | `ng build getMyPhoto` — library package |
| `npm run build` | `ng build` — default Angular CLI project build |
| `npm test` | `ng test` — unit tests (Karma) |

## Publishing

After `npm run build:lib`, publish from the generated folder (adjust registry and version in `projects/get-my-photo/package.json`):

```bash
cd dist/get-my-photo && npm publish
```

## Author & repository

- **Author:** Faizal Hussain (`hussainfaizal131@gmail.com`)
- **Repository:** [github.com/Faiz-exe/get-my-photo](https://github.com/Faiz-exe/get-my-photo)

## License

Add a `LICENSE` file in the repository when you choose terms for this package.
