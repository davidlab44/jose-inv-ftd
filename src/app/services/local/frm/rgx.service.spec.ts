import { TestBed } from '@angular/core/testing';

import { RgxService } from './rgx.service';

describe('RgxService', () => {
  let service: RgxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RgxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
