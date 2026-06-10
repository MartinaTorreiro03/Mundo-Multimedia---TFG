import { Injectable } from '@angular/core';
import type { EvolucionInterfacesVoiceDetail } from './voice-navigation.service';

@Injectable({ providedIn: 'root' })
export class EvolucionInterfacesVoiceBridgeService {
  private handler: ((detail: EvolucionInterfacesVoiceDetail) => void) | null = null;

  connect(handler: (detail: EvolucionInterfacesVoiceDetail) => void): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  dispatch(detail: EvolucionInterfacesVoiceDetail): boolean {
    if (!this.handler) return false;
    this.handler(detail);
    return true;
  }
}
