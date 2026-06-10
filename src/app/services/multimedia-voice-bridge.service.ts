import { Injectable } from '@angular/core';
import type { MultimediaVoiceCommand } from '../utils/multimedia-voice';

@Injectable({ providedIn: 'root' })
export class MultimediaVoiceBridgeService {
  private handler: ((detail: MultimediaVoiceCommand) => void) | null = null;

  connect(handler: (detail: MultimediaVoiceCommand) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: MultimediaVoiceCommand): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
