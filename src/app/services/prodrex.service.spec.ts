import { TestBed } from '@angular/core/testing';

import { ProdrexService } from './prodrex.service';

describe('ProdrexService', () => {
  let service: ProdrexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProdrexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
