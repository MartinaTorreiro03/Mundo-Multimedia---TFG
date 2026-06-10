import { Injectable } from '@angular/core';
import type { EscucharVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class EscucharVoiceBridgeService {
  private handler: ((detail: EscucharVoiceDetail) => void) | null = null;

  connect(handler: (detail: EscucharVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: EscucharVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
