import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetMyPhotoComponent } from './get-my-photo.component';

describe('GetMyPhotoComponent', () => {
  let component: GetMyPhotoComponent;
  let fixture: ComponentFixture<GetMyPhotoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetMyPhotoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetMyPhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
