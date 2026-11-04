import { TestBed } from '@angular/core/testing';

import { LstService } from './lst.service';

describe('LstService', () => {
  let service: LstService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LstService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
