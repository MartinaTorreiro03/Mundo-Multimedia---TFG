import { Injectable } from '@angular/core';
import type { VideoInmersivoVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class VideoInmersivoVoiceBridgeService {
  private handler: ((detail: VideoInmersivoVoiceDetail) => void) | null = null;

  connect(handler: (detail: VideoInmersivoVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: VideoInmersivoVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
