import { TestBed } from '@angular/core/testing';

import { UmService } from './um.service';

describe('UmService', () => {
  let service: UmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
