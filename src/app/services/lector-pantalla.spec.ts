import { TestBed } from '@angular/core/testing';

import { LectorPantalla } from './lector-pantalla';

describe('LectorPantalla', () => {
  let service: LectorPantalla;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LectorPantalla);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
