import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LectorPantallaService {
  lectorActivo = signal(false);
  speaking = signal(false);
  paused = signal(false);
  currentText = signal('');

  toggle(): void {
    this.lectorActivo.update((v) => !v);
    if (!this.lectorActivo()) {
      this.stop();
    }
  }

  speak(texto: string): void {
    if (!('speechSynthesis' in window) || !texto?.trim()) return;

    const normalized = texto.trim();

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(normalized);
    utterance.lang = 'es-ES';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      this.currentText.set(normalized);
      this.speaking.set(true);
      this.paused.set(false);
    };

    utterance.onend = () => this.resetPlaybackState();
    utterance.onerror = () => this.resetPlaybackState();

    this.currentText.set(normalized);
    this.speaking.set(true);
    this.paused.set(false);

    window.speechSynthesis.speak(utterance);
  }

  pause(): void {
    if (!this.speaking() || this.paused()) return;
    window.speechSynthesis.pause();
    this.paused.set(true);
  }

  resume(): void {
    if (!this.speaking() || !this.paused()) return;
    window.speechSynthesis.resume();
    this.paused.set(false);
  }

  stop(): void {
    window.speechSynthesis.cancel();
    this.resetPlaybackState();
  }

  private resetPlaybackState(): void {
    this.speaking.set(false);
    this.paused.set(false);
    this.currentText.set('');
  }
}
