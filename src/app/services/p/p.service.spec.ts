import { TestBed } from '@angular/core/testing';

import { PService } from './p.service';

describe('PService', () => {
  let service: PService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
