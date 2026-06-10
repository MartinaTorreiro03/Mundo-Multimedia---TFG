import { TestBed } from '@angular/core/testing';

import { PopupTheme } from './popup-theme';

describe('PopupTheme', () => {
  let service: PopupTheme;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopupTheme);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
