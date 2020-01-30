import { NgModule } from '@angular/core';
import { GetMyPhotoComponent } from './get-my-photo.component';
import { GetPhotoComponent } from './get-photo/get-photo.component';
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';



@NgModule({
  declarations: [GetMyPhotoComponent, GetPhotoComponent],
  imports: [
    CommonModule
  ],
  exports: [GetMyPhotoComponent , GetPhotoComponent]
})
export class GetMyPhotoModule { }
