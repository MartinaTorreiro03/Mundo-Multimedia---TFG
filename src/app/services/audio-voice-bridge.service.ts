import { Injectable } from '@angular/core';
import type { AudioVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class AudioVoiceBridgeService {
  private handler: ((detail: AudioVoiceDetail) => void) | null = null;

  connect(handler: (detail: AudioVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: AudioVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
