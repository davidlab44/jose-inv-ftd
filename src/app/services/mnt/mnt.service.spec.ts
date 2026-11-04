import { TestBed } from '@angular/core/testing';

import { MntService } from './mnt.service';

describe('MntService', () => {
  let service: MntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
