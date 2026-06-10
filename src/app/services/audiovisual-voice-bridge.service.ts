// Implementacion del modulo.
import { Injectable } from '@angular/core';
import type { AudiovisualVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class AudiovisualVoiceBridgeService {
  private handler: ((detail: AudiovisualVoiceDetail) => void) | null = null;

  connect(handler: (detail: AudiovisualVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: AudiovisualVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
