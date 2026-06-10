import { Injectable } from '@angular/core';
import type { VideoVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class VideoVoiceBridgeService {
  private handler: ((detail: VideoVoiceDetail) => void) | null = null;

  connect(handler: (detail: VideoVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: VideoVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
