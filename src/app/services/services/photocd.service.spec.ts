import { TestBed } from '@angular/core/testing';

import { PhotocdService } from './photocd.service';

describe('PhotocdService', () => {
  let service: PhotocdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotocdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
