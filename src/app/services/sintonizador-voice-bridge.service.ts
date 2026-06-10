import { Injectable } from '@angular/core';
import type { SintonizadorVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class SintonizadorVoiceBridgeService {
  private handler: ((detail: SintonizadorVoiceDetail) => void) | null = null;

  connect(handler: (detail: SintonizadorVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: SintonizadorVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
