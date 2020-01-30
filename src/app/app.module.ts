import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GetMyPhotoModule } from 'get-my-photo';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GetMyPhotoModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
