import { Injectable } from '@angular/core';
import type { ExplorarVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class ExplorarVoiceBridgeService {
  private handler: ((detail: ExplorarVoiceDetail) => void) | null = null;

  connect(handler: (detail: ExplorarVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: ExplorarVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
