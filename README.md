# `get-my-photo`

| Field | Value |
|--------|--------|
| **Package name** | `get-my-photo` |
| **Version** | `0.1.0` |
| **Author** | Faizal Hussain (`hussainfaizal131@gmail.com`) |
| **Repository** | [github.com/Faiz-exe/get-my-photo](https://github.com/Faiz-exe/get-my-photo) |

## Package description

Angular library for capturing a still image from the device **webcam** in the browser. It uses [`navigator.mediaDevices.getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), draws the video frame to a canvas, and emits a **data URL** (`string`) you can bind, upload, or persist. Optional behaviors include **preview**, **automatic download**, and **error messaging** when camera access is denied.

**Keywords:** `photo`, `get photo`, `base 64`, `web api`, `image`, `web cam`

---

## Peer dependencies

This package expects your app to already provide compatible Angular packages:

| Package | Range |
|---------|--------|
| `@angular/core` | `^21.0.0` |
| `@angular/common` | `^21.0.0` |

Install matching versions in your application (for example `21.x` aligned with your workspace).

## Runtime dependency

| Package | Notes |
|---------|--------|
| `tslib` | Listed in the published `package.json` for the compiled output helpers. |

---

## Installation

### From npm (after you publish)

```bash
npm install get-my-photo
```

### From this monorepo (local development)

1. Clone the repo and install workspace dependencies:

   ```bash
   git clone https://github.com/Faiz-exe/get-my-photo.git
   cd get-my-photo
   npm install
   ```

2. Build the library (output: `dist/get-my-photo/`):

   ```bash
   npm run build:lib
   ```

3. In another project, depend on the folder or use `npm link` / `file:` path to `dist/get-my-photo` as your workflow prefers.

---

## Public API (what this package exports)

Everything below is re-exported from the package entry (`public-api.ts`).

| Export | Kind | Description |
|--------|------|-------------|
| `GetMyPhotoModule` | `NgModule` | Import this in your `AppModule` (or a feature module). Declares and exports the components below. |
| `GetMyPhotoComponent` | Component | Placeholder/demo-style component (`getMyphoto-getMyPhoto`). |
| `GetPhotoComponent` | Component | Main camera capture UI (`get-photo`). |
| `GetMyPhotoService` | `Injectable` | Injectable stub (`providedIn: 'root'`); extend or use for future shared logic. |

### Template selectors

| Selector | Component |
|----------|-----------|
| `get-photo` | `GetPhotoComponent` — primary capture UI |
| `getMyphoto-getMyPhoto` | `GetMyPhotoComponent` — simple “works” placeholder |

---

## Using `get-photo` in your app

### 1. Import the module

```typescript
import { GetMyPhotoModule } from 'get-my-photo';

@NgModule({
  imports: [GetMyPhotoModule],
})
export class AppModule {}
```

### 2. Add the component to a template

Minimal pattern (start camera, handle capture output):

```html
<get-photo
  [turnCamOn]="camState"
  [triggerEvent]="captureState"
  (outputImage)="onImage($event)">
</get-photo>
```

```typescript
camState = { camOn: true };
captureState = { capture: false };

onImage(dataUrl: string) {
  // dataUrl is a base64 data URL from canvas.toBlob → FileReader
}

triggerCapture() {
  this.captureState = { capture: true };
}
```

See the demo in `src/app/app.component.html` for buttons that toggle `turnCamOn`, `triggerEvent`, `turnCamoff`, and `retake`.

---

## Component API — `GetPhotoComponent` (`get-photo`)

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `outputImage` | `EventEmitter<string>` | Fires with a **data URL** string of the captured frame. |

### Inputs (plain)

| Name | Type | Default / notes |
|------|------|------------------|
| `FileType` | `string` | Present in the API; reserved / future use. |
| `errorMessage` | `string` | Shown when `showError` is true and camera access fails. |
| `fileName` | `string` | Filename used when `saveOnCLick` triggers a download (defaults to `image-<timestamp>.png` if empty). |
| `width` | `number` | Capture width in pixels; if omitted, uses the video element width. |
| `height` | `number` | Capture height in pixels; if omitted, uses the video element height. |
| `showError` | `boolean` | When true, permission errors surface in the template. |
| `previewImage` | `boolean` | When true, after capture shows the still image and stops the camera. |
| `saveOnCLick` | `boolean` | When true, capture also triggers a file download. |

### Inputs (setters — pass objects from the parent)

Callers typically swap objects so Angular detects changes (e.g. `{ camOn: true }` → new object when toggling).

| Setter | When it runs | Expected payload shape |
|--------|----------------|-------------------------|
| `turnCamOn` | Start camera | `{ camOn: true }` |
| `turnCamoff` | Stop camera | `{ turnOff: true }` (requires camera was on) |
| `triggerEvent` | Capture frame | `{ capture: true }` (requires camera on and video active) |
| `retake` | Back to live video from preview | `{ retake: true }` |

> **Note:** The input name is spelled `saveOnCLick` (capital “CL”) in source; use that exact name in templates.

### Browser behavior

- **Secure context:** Camera access requires **HTTPS** or **`http://localhost`**.
- **Permissions:** The user must allow camera access; otherwise the component can set `error` and optionally show `errorMessage` when `showError` is true.

---

## Package layout (this repository)

| Path | Purpose |
|------|---------|
| `projects/get-my-photo/` | Library source, `ng-package.json`, and publishable `package.json` |
| `projects/get-my-photo/src/public-api.ts` | Public export surface |
| `dist/get-my-photo/` | **Generated npm package** after `npm run build:lib` |
| `src/` | Demo Angular app consuming the library |

---

## Scripts (workspace root)

| Script | Command |
|--------|---------|
| `npm start` | `ng serve` — run the demo app (`http://localhost:4200/`) |
| `npm run build:lib` | `ng build getMyPhoto` — build the library into `dist/get-my-photo/` |
| `npm run build` | `ng build` — build the default application project |
| `npm test` | `ng test` — unit tests |

---

## Publishing

1. Bump **`version`** in `projects/get-my-photo/package.json` as needed.
2. Run `npm run build:lib`.
3. Publish from the build output:

   ```bash
   cd dist/get-my-photo && npm publish
   ```

Use `--access public` on the first publish if the scope/name requires it.

---

## Tooling alignment (this repo)

The workspace that builds **get-my-photo** uses **Angular 21**, **TypeScript ~5.9**, **RxJS 7**, **ng-packagr 21**, and **Node.js ≥ 20.19** (see root `package.json` `engines`). Consumers only need to satisfy the **peer dependencies** above.

---

## License

Add a `LICENSE` file when you choose terms for distribution.
