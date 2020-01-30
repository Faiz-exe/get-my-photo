import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'getPhoto-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  test : any;
  src : any;
  camon : {}
  turnOff : {}
  retake = {};
  title = 'lib-getMyPhoto';
  constructor(public sanitizer: DomSanitizer ) { }


  Capture(){
    this.test = {capture : true};


  }
  CamOn(){
    this.camon = {camOn : true};

  }
  getImag(data){
   console.log(data);
   this.src = this.sanitizer.bypassSecurityTrustUrl(data as any);

  }


  Retake(){
    this.retake = {retake : true};
  }
  Off(){
    this.turnOff = {turnOff : true};
  }
}
