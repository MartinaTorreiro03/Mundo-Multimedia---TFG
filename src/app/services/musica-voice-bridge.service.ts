import { Injectable } from '@angular/core';
import type { MusicaVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class MusicaVoiceBridgeService {
  private handler: ((detail: MusicaVoiceDetail) => void) | null = null;

  connect(handler: (detail: MusicaVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: MusicaVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
