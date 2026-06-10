import { TestBed } from '@angular/core/testing';

import { KeyboardNav } from './keyboard-nav';

describe('KeyboardNav', () => {
  let service: KeyboardNav;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyboardNav);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
