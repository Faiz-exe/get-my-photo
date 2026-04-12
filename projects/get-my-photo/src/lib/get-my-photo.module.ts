import { NgModule } from '@angular/core';
import { GetMyPhotoComponent } from './get-my-photo.component';
import { GetPhotoComponent } from './get-photo/get-photo.component';

@NgModule({
  imports: [GetMyPhotoComponent, GetPhotoComponent],
  exports: [GetMyPhotoComponent, GetPhotoComponent],
})
export class GetMyPhotoModule {}
