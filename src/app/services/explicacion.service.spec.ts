import { TestBed } from '@angular/core/testing';

import { ExplicacionService } from './explicacion.service';

describe('ExplicacionService', () => {
  let service: ExplicacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExplicacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
