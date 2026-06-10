import { Injectable } from '@angular/core';
import type { LineaVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class LineaVoiceBridgeService {
  private handler: ((detail: LineaVoiceDetail) => void) | null = null;

  connect(handler: (detail: LineaVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: LineaVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
