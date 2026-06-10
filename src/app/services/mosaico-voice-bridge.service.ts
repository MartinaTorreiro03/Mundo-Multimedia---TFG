import { Injectable } from '@angular/core';
import type { MosaicoVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class MosaicoVoiceBridgeService {
  private handler: ((detail: MosaicoVoiceDetail) => void) | null = null;

  connect(handler: (detail: MosaicoVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: MosaicoVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
