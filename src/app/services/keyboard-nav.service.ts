import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class KeyboardNavService {
  enabled = signal(false);

  toggle() {
    this.enabled.update(v => !v);
  }

  setEnabled(value: boolean) {
    this.enabled.set(value);
  }
}
