import { Injectable } from '@angular/core';
import type { MesaMezclasVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class MesaMezclasVoiceBridgeService {
  private handler: ((detail: MesaMezclasVoiceDetail) => void) | null = null;

  connect(handler: (detail: MesaMezclasVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: MesaMezclasVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
