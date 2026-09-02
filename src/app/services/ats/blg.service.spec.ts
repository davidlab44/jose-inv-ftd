import { TestBed } from '@angular/core/testing';

import { BlgService } from './blg.service';

describe('BlgService', () => {
  let service: BlgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
