import { Injectable } from '@angular/core';
import type { FiltrosVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class FiltrosVoiceBridgeService {
  private handler: ((detail: FiltrosVoiceDetail) => void) | null = null;

  connect(handler: (detail: FiltrosVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: FiltrosVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
