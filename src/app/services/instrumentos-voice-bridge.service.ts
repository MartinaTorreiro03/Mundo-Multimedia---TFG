import { Injectable } from '@angular/core';
import type { InstrumentosVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class InstrumentosVoiceBridgeService {
  private handler: ((detail: InstrumentosVoiceDetail) => void) | null = null;

  connect(handler: (detail: InstrumentosVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: InstrumentosVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
