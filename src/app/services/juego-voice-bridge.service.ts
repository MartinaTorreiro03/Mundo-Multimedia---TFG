import { Injectable } from '@angular/core';
import type { JuegoVoiceDetail } from '../utils/juego-voice';

@Injectable({ providedIn: 'root' })
export class JuegoVoiceBridgeService {
  private handler: ((detail: JuegoVoiceDetail) => void) | null = null;

  connect(handler: (detail: JuegoVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: JuegoVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
