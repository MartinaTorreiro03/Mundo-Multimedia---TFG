import { Injectable } from '@angular/core';
import type { HistoriaInteractivaVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class HistoriaInteractivaVoiceBridgeService {
  private handler: ((detail: HistoriaInteractivaVoiceDetail) => void) | null = null;

  connect(handler: (detail: HistoriaInteractivaVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: HistoriaInteractivaVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
