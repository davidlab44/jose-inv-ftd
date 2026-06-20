import { TestBed } from '@angular/core/testing';

import { VdrService } from './vdr.service';

describe('VdrService', () => {
  let service: VdrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VdrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
