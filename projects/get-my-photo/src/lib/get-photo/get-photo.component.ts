import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'get-photo',
  templateUrl: './get-photo.component.html',
  styleUrls: ['./get-photo.component.css']
})
export class GetPhotoComponent  {

  base64File: any;
  src: any;
  videoPreview: any;
  imagepreview = false;
  isInitiallyOn = false;
  captureFrame: any;
  error = false;
   outputCanvas: any;
   context: any;
   constraints = {
    video: true
  };
  @Input() public FileType: string;
  @Input() public errorMessage = '';
  @Input() public fileName: string;
  @Input() public width: number;
  @Input() public height: number;
  @Input() public showError: boolean;
  @Input() public previewImage: boolean;
  @Input() public saveOnCLick: boolean;
  @Output() outputImage: EventEmitter<any> = new EventEmitter<any>();
  @Input() set turnCamoff(data) {

    if (data && data.turnOff && this.isInitiallyOn) {

      this.imagepreview = false;
      this.videoPreview = false;
      this.isInitiallyOn = false;
      this.stopCam();
    }



  }
  @Input() set triggerEvent(data) {

    // console.log(data , this.saveOnCLick , this.previewImage);
    if (data && data.capture && this.isInitiallyOn && this.videoPreview) {
      this.capture();
    }
  }
  @Input() set retake(data) {

    // console.log(data);
    if (data && data.retake && this.isInitiallyOn && this.imagepreview) {
        this.videoPreview = true;
        this.imagepreview = false;
        this.cdRef.detectChanges();
        this.loadVars();
        this.src = null;


    }
  }
  @Input() set turnCamOn(data) {

    if (data && data.camOn && !this.isInitiallyOn ) {
      this.isInitiallyOn = data.camOn;
      this.videoPreview = data.camOn;
      this.cdRef.detectChanges();
      this.loadVars();

  }
}









  constructor(public sanitizer: DomSanitizer  ,  private cdRef: ChangeDetectorRef) { }


loadVars() {
  this.captureFrame = document.getElementById('captureFrame');
  // this.outputCanvas = document.getElementById('output') as HTMLCanvasElement;

  this.outputCanvas =  document.createElement('canvas');
  this.context = this.outputCanvas.getContext('2d');
  navigator.mediaDevices.getUserMedia(this.constraints).
  then((stream) => {this.captureFrame.srcObject = stream; }).catch((error) => {
    this.videoPreview =  false;
    if (this.showError) {
      this.error = true;
    }
    console.error('access to camera has been denied' , error);


    // this.stopCam();
  });

}








capture() {

  const imageWidth =this.width ? this.width: this.captureFrame.offsetWidth ;
  const imageHeight = this.height ? this.height :  this.captureFrame.offsetHeight;

  this.outputCanvas.width = imageWidth;
  this.outputCanvas.height = imageHeight;

  this.context.drawImage(this.captureFrame, 0, 0, imageWidth, imageHeight);
  if (this.saveOnCLick) {
       this.downloadImage();
  }



  this.outputCanvas.toBlob((blob) => {
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
    }, false);




});


}


stopCam() {
  const stream = this.captureFrame.srcObject;
  const tracks = stream.getTracks();
  // tslint:disable-next-line: only-arrow-functions
  tracks.forEach(function(track) {
track.stop();
});

  // this.captureFrame.srcObject = null;
  this.videoPreview = false;
  this.cdRef.detectChanges();

}

  ngAfterViewInit() {



  }




  downloadImage() {

    let fileName = '';

    if (this.fileName === '' || !this.fileName) {
      fileName = `image-${new Date().getTime()}.png`;
      // console.log(fileName);
    }
    // tslint:disable-next-line: one-line
    else{
      fileName = this.fileName;
    }
    const imageLink = document.createElement('a');
    imageLink.setAttribute('download', `${fileName}`);
    this.outputCanvas.toBlob((blob) => {
      imageLink.setAttribute('href', URL.createObjectURL(blob));
      imageLink.click();
  });
  }
}
