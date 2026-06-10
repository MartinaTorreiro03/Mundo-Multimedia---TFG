import { Injectable } from '@angular/core';
import type { TextoVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class TextoVoiceBridgeService {
  private handler: ((detail: TextoVoiceDetail) => void) | null = null;

  connect(handler: (detail: TextoVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: TextoVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
