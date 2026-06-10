import { Injectable } from '@angular/core';
import type { ReproductoresVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class ReproductoresVoiceBridgeService {
  private handler: ((detail: ReproductoresVoiceDetail) => void) | null = null;

  connect(handler: (detail: ReproductoresVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: ReproductoresVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
