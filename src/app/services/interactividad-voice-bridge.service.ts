import { Injectable } from '@angular/core';
import type { InteractividadVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class InteractividadVoiceBridgeService {
  private handler: ((detail: InteractividadVoiceDetail) => void) | null = null;

  connect(handler: (detail: InteractividadVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: InteractividadVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
