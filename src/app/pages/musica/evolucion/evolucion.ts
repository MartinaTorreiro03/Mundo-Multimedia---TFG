import { Component, signal, OnDestroy, AfterViewInit, inject, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStateService } from '../../../services/ui-state.service';
import { SpeakableDirective } from '../../../directives/app-speakable';
import {
  VOICE_EVOLUCION_ACTION_EVENT,
  VoiceNavigationService,
  type EvolucionVoiceDetail,
} from '../../../services/voice-navigation.service';
import { EvolucionVoiceBridgeService } from '../../../services/evolucion-voice-bridge.service';
import {
  evolucionControlHint,
  evolucionEraHintLabel,
  type EvolucionEraId,
} from '../../../utils/musica-evolucion-voice';

export interface Era {
  id: string;
  year: number;
  label: string;
  device: string;
  sublabel: string;
  dialDeg: number;
  accentColor: string;
}

@Component({
  selector: 'app-evolucion',
  standalone: true,
  imports: [CommonModule, SpeakableDirective],
  templateUrl: './evolucion.html',
  styleUrls: ['./evolucion.scss']
})
export class Evolucion implements AfterViewInit, OnDestroy {
  private audioCtx: AudioContext | null = null;
  private playTimeout: ReturnType<typeof setTimeout> | null = null;
  ui = inject(UiStateService);
  readonly voiceNav = inject(VoiceNavigationService);
  private evolucionVoiceBridge = inject(EvolucionVoiceBridgeService);
  private ngZone = inject(NgZone);
  private host: ElementRef<HTMLElement> = inject(ElementRef);

  isPlaying = signal(false);
  isTransitioning = signal(false);
  currentIdx = signal(0);

  eras: Era[] = [
    { id: 'gramofono', year: 1920, label: 'ERA DEL GRAMÓFONO', device: 'Gramófono · bocina de latón', sublabel: '78 rpm · cilindro de cera', dialDeg: -130, accentColor: '#a900dd' },
    { id: 'vinilo',    year: 1960, label: 'ERA DEL VINILO',    device: 'Tocadiscos · aguja de diamante', sublabel: '33 rpm · alta fidelidad', dialDeg: -80, accentColor: '#8200a9' },
    { id: 'cassette',  year: 1979, label: 'ERA DEL CASSETTE',  device: 'Walkman · cinta magnética', sublabel: '90 min · estereo portátil', dialDeg: -20, accentColor: '#6e00b5' },
    { id: 'cd',        year: 1995, label: 'ERA DEL CD',        device: 'Discman · láser digital', sublabel: '74 min · sin pérdida', dialDeg: 30, accentColor: '#5500a0' },
    { id: 'mp3',       year: 2001, label: 'ERA DEL MP3',       device: 'iPod · 1000 canciones', sublabel: 'compresión · portabilidad', dialDeg: 80, accentColor: '#a900dd' },
    { id: 'streaming', year: 2015, label: 'ERA STREAMING',     device: 'Spotify · todo en la nube', sublabel: '320kbps · infinito', dialDeg: 130, accentColor: '#8200a9' },
  ];

  eraActiva = signal(this.eras[0]);

  get dialRotation(): string {
    return `rotate(${this.eraActiva().dialDeg}deg)`;
  }

  get prevDisabled(): boolean {
    return this.currentIdx() === 0;
  }

  get nextDisabled(): boolean {
    return this.currentIdx() === this.eras.length - 1;
  }

  textoCRT(): string {
    const e = this.eraActiva();
    return `${e.label}. Año ${e.year}. ${e.device}. ${e.sublabel}.`;
  }

  pistaEra(id: string): string {
    return evolucionEraHintLabel(id as EvolucionEraId);
  }

  pistaControl(tipo: 'anterior' | 'play' | 'siguiente'): string {
    return evolucionControlHint(tipo);
  }

  ngAfterViewInit(): void {
    this.evolucionVoiceBridge.connect(this.handleEvolucionVoice);
    window.addEventListener(VOICE_EVOLUCION_ACTION_EVENT, this.onEvolucionVoiceEvent);
  }

  seleccionarEraPorVoz(eraId: string): void {
    const era = this.eras.find(e => e.id === eraId);
    if (!era) return;
    this.cambiarEra(era);
    const btn = this.host.nativeElement.querySelector<HTMLElement>(
      `.era-btn[data-era-id="${eraId}"]`
    );
    btn?.focus();
  }

  private readonly handleEvolucionVoice = (detail: EvolucionVoiceDetail): void => {
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'anterior':
          this.stepEra(-1);
          break;
        case 'siguiente':
          this.stepEra(1);
          break;
        case 'togglePlay':
          this.togglePlay();
          break;
        case 'era':
          this.seleccionarEraPorVoz(detail.eraId);
          break;
      }
    });
  };

  private readonly onEvolucionVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<EvolucionVoiceDetail>).detail;
    if (detail?.action) this.handleEvolucionVoice(detail);
  }) as EventListener;

  cambiarEra(era: Era): void {
    if (this.isTransitioning()) return;
    if (era.id === this.eraActiva().id) return;

    const active = document.activeElement as HTMLElement | null;
    const refocusTarget =
      active && this.host.nativeElement.contains(active) ? active : null;

    this.isTransitioning.set(true);
    this.stopPlaybackUi();

    setTimeout(() => {
      this.eraActiva.set(era);
      this.currentIdx.set(this.eras.indexOf(era));
      this.isTransitioning.set(false);

      setTimeout(() => this.restoreFocus(refocusTarget), 0);

      setTimeout(() => {
        this.startPlaybackUi(era);
      }, 200);
    }, 350);
  }

  private restoreFocus(target: HTMLElement | null): void {
    const root = this.host.nativeElement;
    if (
      target &&
      document.body.contains(target) &&
      !(target as HTMLButtonElement).disabled
    ) {
      target.focus();
      return;
    }
    const play = root.querySelector('.btn-play') as HTMLElement | null;
    play?.focus();
  }

  stepEra(dir: number): void {
    const next = this.currentIdx() + dir;
    if (next < 0 || next >= this.eras.length) return;
    this.cambiarEra(this.eras[next]);
  }

  togglePlay(): void {
    if (this.isPlaying()) {
      this.stopPlaybackUi();
      return;
    }
    this.startPlaybackUi(this.eraActiva());
  }

  private getAudioCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioCtx;
  }

  private startPlaybackUi(era: Era): void {
    this.isPlaying.set(true);
    const durationS = this.playEraSound(era);
    if (durationS > 0) {
      this.playTimeout = setTimeout(() => {
        if (this.isTransitioning()) return;
        this.isPlaying.set(false);
        this.playTimeout = null;
      }, Math.ceil(durationS * 1000));
    }
  }

  private stopPlaybackUi(): void {
    this.isPlaying.set(false);
    if (this.playTimeout) {
      clearTimeout(this.playTimeout);
      this.playTimeout = null;
    }
  }

  playEraSound(era: Era): number {
    try {
      const y = era.year;
      if (y <= 1950) return this.playGramofono();
      if (y <= 1975) return this.playVinilo();
      if (y <= 1988) return this.playCassette();
      if (y <= 1999) return this.playCD();
      if (y <= 2005) return this.playMP3();
      return this.playStreaming();
    } catch (e) {
      console.log('Audio no disponible:', e);
      return 0;
    }
  }

  private playGramofono(): number {
    const ctx = this.getAudioCtx();
    const dur = 0.75;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * 0.18 * (1 - i / d.length);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 400; f.Q.value = 0.4;
    src.connect(f); f.connect(ctx.destination);
    src.start();

    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 220;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
    return dur;
  }

  private playVinilo(): number {
    const ctx = this.getAudioCtx();
    const dur = 0.55;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * 0.1 * (1 - i / d.length);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = 0.5;
    src.connect(f); f.connect(ctx.destination);
    src.start();

    [220, 330, 440].forEach((freq, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.04);
      g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + i * 0.04 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.04);
      o.stop(ctx.currentTime + 0.45);
    });
    return dur;
  }

  private playCassette(): number {
    const ctx = this.getAudioCtx();
    const dur = 0.5;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.08;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 2500;
    src.connect(f); f.connect(ctx.destination);
    src.start();

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 90;
    const g = ctx.createGain(); g.gain.value = 0.04;
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
    return dur;
  }

  private playCD(): number {
    const ctx = this.getAudioCtx();
    const dur = 0.35;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.3);
    return dur;
  }

  private playMP3(): number {
    const ctx = this.getAudioCtx();
    const dur = 0.22;
    [880, 1320, 1760].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.07);
      g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.07 + 0.03);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.07 + 0.12);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.07);
      o.stop(ctx.currentTime + i * 0.07 + 0.15);
    });
    return dur + 0.14;
  }

  private playStreaming(): number {
    const ctx = this.getAudioCtx();
    const dur = 0.5;
    [440, 550, 660, 880, 1100].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05 + i * 0.03);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.45);
    });
    return dur;
  }

  ngOnDestroy(): void {
    this.evolucionVoiceBridge.disconnect();
    window.removeEventListener(VOICE_EVOLUCION_ACTION_EVENT, this.onEvolucionVoiceEvent);
    if (this.playTimeout) clearTimeout(this.playTimeout);
    this.audioCtx?.close();
  }
}
