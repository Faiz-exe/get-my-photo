# get-my-photo


npm package to download image  , save images , get image (base64) directly from web cam using web api 

## installing package

```shell
npm i get-my-photo
```


## using package

```shell
.....
...
import { GetMyPhotoModule } from 'get-my-photo';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
 ..... ,
    GetMyPhotoModule
  ]

```


## Example
 

 app.componenet.html


 ```
  <get-photo
  [triggerEvent] = 'test'
  (outputImage) = 'getImage($event)'
  [saveOnCLick] = true
  [turnCamOn] = 'camon'
  [fileName] = '"saveImage"'
  [turnCamoff] = 'turnOff'
  [width] = 100
  [height] = 200
  [retake] = 'retake'
  [errorMessage]= '"Access denied"'
  [showError]= true
  [previewImage] = false
  >
  </get-photo>



  <button (click)='Capture()'>Capture</button>
  <button (click)='CamOn()'>ON</button>
  <button (click)='CamOff()'>OFF</button>
  <button (click)='Retake()'>Retake</button>
  ```

  app.componenet.ts


  ```

  export class AppComponent {
  test : {};
  camon : {}
  turnOff : {}
  retake = {};
  constructor() { }


  Capture(){
    this.test = {capture : true}; 
    /* pass this object as input to the getphoto componenet to capture image */
  }

  CamOn(){
    this.camon = {camOn : true};
    /* pass this object as input to the getphoto componenet to turn on camera */

  }

  getImage(data){
   console.log(data);
   /* the @output from the getphoto will provide the captured image (base 64)*/
  }

  Retake(){
    this.retake = {retake : true};
     /* pass this object as input to turn the camera on again , after taking an image ( for retakes the previewImage @input should be enabled) */
  }


  CamOff(){
    this.turnOff = {turnOff : true};
   /*  pass this object as input to turn the camera off */
  }
}


  ```


## Input Parameters


| Name             | value / type    | Description |
| ---              | ---             | ---         |
| unauthMessage    | String          | Error description to show if acces to camera is denied( showError should be enabled to show the error  )  |
| showError        | boolean         | enable this input to show error messages |
| fileName         | string          | input to provide file name of downloaded image  (if not provided , the name will be image-(local time).png )|  
| previewImage     | boolean         | if enabled a preview of captured image will be shown |
| saveOnCLick      | boolean         | if enabled an image will be saved locally 
| width(optional)  | Number          |  The width of output image(in px)
| height(optional) | Number          |  The height of output image(in px)

