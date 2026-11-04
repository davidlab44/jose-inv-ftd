import { TestBed } from '@angular/core/testing';

import { CcoService } from './cco.service';

describe('CcoService', () => {
  let service: CcoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
