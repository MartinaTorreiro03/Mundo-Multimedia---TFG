import { Injectable } from '@angular/core';
import type { ComparacionVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class ComparacionVoiceBridgeService {
  private handler: ((detail: ComparacionVoiceDetail) => void) | null = null;

  connect(handler: (detail: ComparacionVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: ComparacionVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
