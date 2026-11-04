import { TestBed } from '@angular/core/testing';

import { WithdrawnService } from './withdrawn.service';

describe('WithdrawnService', () => {
  let service: WithdrawnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WithdrawnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
