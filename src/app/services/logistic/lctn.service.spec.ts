import { TestBed } from '@angular/core/testing';

import { LctnService } from './lctn.service';

describe('LctnService', () => {
  let service: LctnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LctnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
