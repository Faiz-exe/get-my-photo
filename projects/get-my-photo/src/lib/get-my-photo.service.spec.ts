import { TestBed } from '@angular/core/testing';

import { GetMyPhotoService } from './get-my-photo.service';

describe('GetMyPhotoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GetMyPhotoService = TestBed.get(GetMyPhotoService);
    expect(service).toBeTruthy();
  });
});
