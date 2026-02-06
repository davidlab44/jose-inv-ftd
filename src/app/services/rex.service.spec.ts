import { TestBed } from '@angular/core/testing';

import { RexService } from './rex.service';

describe('RexService', () => {
  let service: RexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
