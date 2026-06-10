import { Injectable } from '@angular/core';
import type { CollageVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class CollageVoiceBridgeService {
  private handler: ((detail: CollageVoiceDetail) => void) | null = null;

  connect(handler: (detail: CollageVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: CollageVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
