import { TestBed } from '@angular/core/testing';

import { PchService } from './pch.service';

describe('PchService', () => {
  let service: PchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
