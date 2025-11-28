import { TestBed } from '@angular/core/testing';

import { GlppricesService } from './glpprices.service';

describe('GlppricesService', () => {
  let service: GlppricesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlppricesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
