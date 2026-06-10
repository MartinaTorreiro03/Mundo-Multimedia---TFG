import { Injectable } from '@angular/core';
import type { PrincipalVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class PrincipalVoiceBridgeService {
  private handler: ((detail: PrincipalVoiceDetail) => void) | null = null;

  connect(handler: (detail: PrincipalVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: PrincipalVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
