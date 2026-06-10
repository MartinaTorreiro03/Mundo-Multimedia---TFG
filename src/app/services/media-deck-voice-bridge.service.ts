import { Injectable } from '@angular/core';
import type { MediaDeckVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class MediaDeckVoiceBridgeService {
  private handler: ((detail: MediaDeckVoiceDetail) => void) | null = null;

  connect(handler: (detail: MediaDeckVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: MediaDeckVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
