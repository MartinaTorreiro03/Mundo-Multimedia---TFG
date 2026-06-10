import { TestBed } from '@angular/core/testing';

import { VisionReducida } from './vision-reducida';

describe('VisionReducida', () => {
  let service: VisionReducida;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisionReducida);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
