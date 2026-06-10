import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VoiceMenuBridgeService {
  private handler: ((normalized: string, raw: string) => boolean) | null = null;

  connect(handler: (normalized: string, raw: string) => boolean): void {
    this.handler = handler;
  }

  disconnect(): void {
    this.handler = null;
  }

  tryPick(normalized: string, raw: string): boolean {
    return this.handler?.(normalized, raw) ?? false;
  }
}
