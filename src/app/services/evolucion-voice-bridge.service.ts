import { Injectable } from '@angular/core';
import type { EvolucionVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class EvolucionVoiceBridgeService {
  private handler: ((detail: EvolucionVoiceDetail) => void) | null = null;

  connect(handler: (detail: EvolucionVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: EvolucionVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
