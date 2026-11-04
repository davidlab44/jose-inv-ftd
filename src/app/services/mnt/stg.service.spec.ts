import { TestBed } from '@angular/core/testing';

import { StgService } from './stg.service';

describe('StgService', () => {
  let service: StgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
