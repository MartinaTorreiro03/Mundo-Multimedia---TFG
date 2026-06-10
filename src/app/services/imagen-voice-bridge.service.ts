import { Injectable } from '@angular/core';
import type { ImagenVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class ImagenVoiceBridgeService {
  private handler: ((detail: ImagenVoiceDetail) => void) | null = null;

  connect(handler: (detail: ImagenVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: ImagenVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
