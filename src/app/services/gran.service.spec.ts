import { TestBed } from '@angular/core/testing';

import { GranService } from './util.service';

describe('GranService', () => {
  let service: GranService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GranService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
