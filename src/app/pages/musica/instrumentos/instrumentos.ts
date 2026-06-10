import {
  Component,
  signal,
  inject,
  ElementRef,
  NgZone,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStateService } from '../../../services/ui-state.service';
import { KeyboardNavService } from '../../../services/keyboard-nav.service';
import { SpeakableDirective } from '../../../directives/app-speakable';
import {
  VOICE_INSTRUMENTOS_ACTION_EVENT,
  VoiceNavigationService,
  type InstrumentosVoiceDetail,
} from '../../../services/voice-navigation.service';
import { InstrumentosVoiceBridgeService } from '../../../services/instrumentos-voice-bridge.service';
import {
  instrumentoHintLabel,
  instrumentoSlotHint,
  type InstrumentoId,
  type InstrumentoSlot,
} from '../../../utils/musica-instrumentos-voice';

@Component({
  selector: 'app-instrumentos',
  standalone: true,
  imports: [CommonModule, SpeakableDirective],
  templateUrl: './instrumentos.html',
  styleUrls: ['./instrumentos.scss']
})
export class Instrumentos implements AfterViewInit, OnDestroy {
  private audioCtx?: AudioContext;
  private master?: GainNode;
  private comp?: DynamicsCompressorNode;
  private reverb?: ConvolverNode;
  private reverbSend?: GainNode;
  private lastTrigger = new Map<string, number>();
  private sampleCache = new Map<string, Promise<AudioBuffer>>();
  ui = inject(UiStateService);
  keyboardNav = inject(KeyboardNavService);
  readonly voiceNav = inject(VoiceNavigationService);
  private instrumentosVoiceBridge = inject(InstrumentosVoiceBridgeService);
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  private readonly onEnterFromSelector = (e: Event) => {
    const ce = e as CustomEvent<{ instrumentId: string }>;
    const id = ce.detail?.instrumentId;
    const ins = this.instrumentos.find(i => i.id === id);
    if (!ins) return;

    this.ngZone.run(() => {
      this.cambiarInstrumento(ins);
      this.cdr.markForCheck();
      setTimeout(() => {
        const root: HTMLElement = this.host.nativeElement;
        const first = root.querySelector('.area-interaccion .ins-playable') as HTMLElement | null;
        first?.focus();
      }, 0);
    });
  };

  instrumentos = [
    { id: 'piano', nombre: 'Piano', icon: '🎹', color: '#a900dd' },
    { id: 'guitarra', nombre: 'Guitarra', icon: '🎸', color: '#ff0080' },
    { id: 'tambor', nombre: 'Tambor', icon: '🥁', color: '#00ffcc' },
    { id: 'flauta', nombre: 'Flauta', icon: '🪈', color: '#ffcc00' },
    { id: 'violin', nombre: 'Violín', icon: '🎻', color: '#8200a9' }
  ];

  instrumentoActivo = signal(this.instrumentos[0]);
  notas = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

  private initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (!this.master) {
      this.master = this.audioCtx.createGain();
      this.master.gain.value = 0.36;

      this.comp = this.audioCtx.createDynamicsCompressor();
      this.comp.threshold.value = -22;
      this.comp.knee.value = 18;
      this.comp.ratio.value = 4.2;
      this.comp.attack.value = 0.004;
      this.comp.release.value = 0.16;

      this.reverb = this.audioCtx.createConvolver();
      this.reverb.buffer = this.makeImpulseResponse(this.audioCtx, 1.25, 2.2);
      this.reverbSend = this.audioCtx.createGain();
      this.reverbSend.gain.value = 0.16;

      this.master.connect(this.comp);
      this.comp.connect(this.audioCtx.destination);
      this.reverbSend.connect(this.reverb);
      this.reverb.connect(this.comp);
    }
  }

  pistaInstrumento(id: string): string {
    return instrumentoHintLabel(id as InstrumentoId);
  }

  pistaSlot(slot: number): string {
    return instrumentoSlotHint(slot as InstrumentoSlot);
  }

  ngAfterViewInit(): void {
    this.host.nativeElement.addEventListener(
      'instrumentos-enter-from-selector',
      this.onEnterFromSelector
    );
    this.instrumentosVoiceBridge.connect(this.handleInstrumentosVoice);
    window.addEventListener(VOICE_INSTRUMENTOS_ACTION_EVENT, this.onInstrumentosVoiceEvent);
  }

  ngOnDestroy(): void {
    this.host.nativeElement.removeEventListener(
      'instrumentos-enter-from-selector',
      this.onEnterFromSelector
    );
    this.instrumentosVoiceBridge.disconnect();
    window.removeEventListener(VOICE_INSTRUMENTOS_ACTION_EVENT, this.onInstrumentosVoiceEvent);
  }

  cambiarInstrumento(ins: (typeof this.instrumentos)[number]) {
    this.instrumentoActivo.set(ins);
  }

  seleccionarInstrumentoPorVoz(instrumentId: string): void {
    const ins = this.instrumentos.find(i => i.id === instrumentId);
    if (!ins) return;
    this.cambiarInstrumento(ins);
    this.cdr.markForCheck();
    setTimeout(() => this.focusPrimerPlayable(), 0);
  }

  tocarSlotPorVoz(slot: number): void {
    const id = this.instrumentoActivo().id;
    if (id === 'tambor') {
      if (slot === 1) this.tocarNota(0);
      return;
    }
    if (slot < 1 || slot > 8) return;
    this.tocarNota(this.notas[slot - 1]);
    const root = this.host.nativeElement;
    const el = root.querySelector<HTMLElement>(`.ins-playable[data-voice-slot="${slot}"]`);
    el?.focus();
  }

  private focusPrimerPlayable(): void {
    const root = this.host.nativeElement;
    const first = root.querySelector<HTMLElement>('.area-interaccion .ins-playable');
    first?.focus();
  }

  private readonly handleInstrumentosVoice = (detail: InstrumentosVoiceDetail): void => {
    this.ngZone.run(() => {
      if (detail.action === 'seleccionar') {
        this.seleccionarInstrumentoPorVoz(detail.instrumentId);
      } else if (detail.action === 'tocar') {
        this.tocarSlotPorVoz(detail.slot);
      }
    });
  };

  private readonly onInstrumentosVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<InstrumentosVoiceDetail>).detail;
    if (detail?.action) this.handleInstrumentosVoice(detail);
  }) as EventListener;

  tocarNota(frecuencia: number) {
    this.initAudio();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const id = this.instrumentoActivo().id;

    const key = `${id}:${frecuencia}`;
    const last = this.lastTrigger.get(key) ?? 0;
    const nowMs = performance.now();
    if (nowMs - last < 90) return;
    this.lastTrigger.set(key, nowMs);

    if (id === 'tambor') {
      this.tocarTambor();
      return;
    }
    if (id === 'guitarra') {
      void this.playGuitarSample(frecuencia, now);
      return;
    }

    if (id === 'piano') {
      this.playPiano(frecuencia, now);
      return;
    }

    if (id === 'violin') {
      void this.playViolinSample(frecuencia, now);
      return;
    }

    if (id === 'flauta') {
      this.playFlute(frecuencia, now);
      return;
    }
  }

  private outConnect(node: AudioNode, reverbAmount = 0.12) {
    if (!this.audioCtx || !this.master || !this.reverbSend) return;
    node.connect(this.master);
    if (reverbAmount > 0) {
      const send = this.audioCtx.createGain();
      send.gain.value = reverbAmount;
      node.connect(send);
      send.connect(this.reverbSend);
    }
  }

  private makeNoiseBuffer(ctx: AudioContext, seconds: number) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private makeImpulseResponse(ctx: AudioContext, seconds: number, decay: number) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buffer.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
      }
    }
    return buffer;
  }

  private freqToMidi(f: number) {
    return 69 + 12 * Math.log2(f / 440);
  }

  private async loadSample(url: string) {
    if (!this.audioCtx) throw new Error('AudioContext no inicializado');
    const existing = this.sampleCache.get(url);
    if (existing) return existing;

    const p = fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`No se pudo cargar: ${url}`);
        return r.arrayBuffer();
      })
      .then(async ab => {
        const decode = this.audioCtx!.decodeAudioData(ab);
        const timeout = new Promise<AudioBuffer>((_, rej) =>
          setTimeout(() => rej(new Error(`Timeout decodificando: ${url}`)), 1500)
        );
        return await Promise.race([decode, timeout]);
      })
      .catch(err => {
        this.sampleCache.delete(url);
        throw err;
      });

    this.sampleCache.set(url, p);
    return p;
  }

  private async playSampleNote(opts: {
    baseUrl: string;
    availableNotes: string[];
    targetFreq: number;
    now: number;
    gain: number;
    dur: number;
    reverb: number;
    detuneCents?: number;
  }) {
    if (!this.audioCtx) return;
    const { baseUrl, availableNotes, targetFreq, gain, dur, reverb, detuneCents = 0 } = opts;

    const noteToMidi: Record<string, number> = {
      C3: 48, G3: 55,
      C4: 60, G4: 67, A4: 69,
      C5: 72,
    };

    const targetMidi = this.freqToMidi(targetFreq);
    let best = availableNotes[0];
    let bestDist = Infinity;
    for (const n of availableNotes) {
      const m = noteToMidi[n];
      if (m === undefined) continue;
      const dist = Math.abs(targetMidi - m);
      if (dist < bestDist) {
        best = n;
        bestDist = dist;
      }
    }

    const baseMidi = noteToMidi[best] ?? Math.round(targetMidi);
    const rate = Math.pow(2, (targetMidi - baseMidi) / 12);

    const candidates = [
      best,
      ...availableNotes.filter(n => n !== best),
    ];

    let picked = best;
    let buffer: AudioBuffer | null = null;
    for (const n of candidates) {
      const url = `${baseUrl}/${n}.wav`;
      try {
        buffer = await this.loadSample(url);
        picked = n;
        break;
      } catch {
      }
    }
    if (!buffer) throw new Error(`No se pudo cargar ningún sample en ${baseUrl}`);

    const pickedMidi = noteToMidi[picked] ?? baseMidi;
    const pickedRate = Math.pow(2, (targetMidi - pickedMidi) / 12);

    const t0 = this.audioCtx.currentTime;
    const tunedRate = pickedRate * Math.pow(2, detuneCents / 1200);

    const src = this.audioCtx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.setValueAtTime(tunedRate, t0);

    const vca = this.audioCtx.createGain();
    vca.gain.setValueAtTime(0.0001, t0);
    vca.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    vca.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    const lp = this.audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.min(9000, 2000 + targetFreq * 4), t0);

    src.connect(lp);
    lp.connect(vca);
    this.outConnect(vca, reverb);

    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  private playPiano(f: number, now: number) {
    if (!this.audioCtx) return;
    const g = this.audioCtx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.9, now + 0.004);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    const lp = this.audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(5200, now);
    lp.frequency.exponentialRampToValueAtTime(1400, now + 0.35);

    const hp = this.audioCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(70, now);

    hp.connect(lp);
    lp.connect(g);
    this.outConnect(g, 0.22);

    const partials: Array<[number, number, OscillatorType]> = [
      [1, 0.55, 'triangle'],
      [2, 0.18, 'sine'],
      [3, 0.10, 'sine'],
      [4, 0.06, 'sine'],
    ];

    for (const [mult, amp, type] of partials) {
      const o = this.audioCtx.createOscillator();
      const og = this.audioCtx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f * mult, now);
      o.detune.setValueAtTime((Math.random() * 8 - 4), now);
      og.gain.setValueAtTime(amp, now);
      o.connect(og);
      og.connect(hp);
      o.start(now);
      o.stop(now + 1.2);
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = this.makeNoiseBuffer(this.audioCtx, 0.02);
    const nf = this.audioCtx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.setValueAtTime(2300, now);
    nf.Q.value = 0.8;
    const ng = this.audioCtx.createGain();
    ng.gain.setValueAtTime(0.18, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    noise.connect(nf);
    nf.connect(ng);
    ng.connect(hp);
    noise.start(now);
    noise.stop(now + 0.03);
  }

  private playGuitarKS(f: number, now: number) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const dur = 1.4;

    const delay = ctx.createDelay(0.2);
    delay.delayTime.setValueAtTime(1 / f, now);

    const fb = ctx.createGain();
    fb.gain.setValueAtTime(0.86, now);

    const damp = ctx.createBiquadFilter();
    damp.type = 'lowpass';
    damp.frequency.setValueAtTime(Math.min(5200, f * 12), now);
    damp.frequency.exponentialRampToValueAtTime(Math.min(1400, f * 5), now + 0.6);

    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0, now);
    out.gain.linearRampToValueAtTime(0.28, now + 0.006);
    out.gain.exponentialRampToValueAtTime(0.001, now + dur);

    delay.connect(damp);
    damp.connect(fb);
    fb.connect(delay);

    delay.connect(out);
    this.outConnect(out, 0.18);

    const src = ctx.createBufferSource();
    src.buffer = this.makeNoiseBuffer(ctx, 0.03);
    const pick = ctx.createBiquadFilter();
    pick.type = 'highpass';
    pick.frequency.setValueAtTime(900, now);
    const pg = ctx.createGain();
    pg.gain.setValueAtTime(0.13, now);
    pg.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    src.connect(pick);
    pick.connect(pg);
    pg.connect(delay);

    src.start(now);
    src.stop(now + 0.05);
  }

  private async playGuitarSample(f: number, now: number) {
    try {
      await this.playSampleNote({
        baseUrl: 'assets/audio/musica/guitarra',
        availableNotes: ['C3', 'G3', 'C4', 'G4', 'C5'],
        targetFreq: f,
        now,
        gain: 0.5,
        dur: 1.25,
        reverb: 0.12,
        detuneCents: -80,
      });
    } catch {
      this.playGuitarKS(f, now);
    }
  }

  private playViolin(f: number, now: number) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const dur = 1.6;

    const vca = ctx.createGain();
    vca.gain.setValueAtTime(0.0, now);
    vca.gain.linearRampToValueAtTime(0.55, now + 0.12);
    vca.gain.setValueAtTime(0.55, now + 1.0);
    vca.gain.exponentialRampToValueAtTime(0.001, now + dur);

    const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.setValueAtTime(520, now);  f1.Q.value = 0.9;
    const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.setValueAtTime(1200, now); f2.Q.value = 0.8;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';   lp.frequency.setValueAtTime(5200, now);
    f1.connect(f2); f2.connect(lp); lp.connect(vca);
    this.outConnect(vca, 0.24);

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = 'sawtooth'; o2.type = 'sawtooth';
    o1.frequency.setValueAtTime(f, now);
    o2.frequency.setValueAtTime(f, now);
    o2.detune.setValueAtTime(6, now);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.22, now);
    o1.connect(og); o2.connect(og);
    og.connect(f1);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.4, now);
    const lfoG = ctx.createGain();
    lfoG.gain.setValueAtTime(1.2, now);
    lfo.connect(lfoG);
    lfoG.connect(o1.frequency);
    lfoG.connect(o2.frequency);

    const bow = ctx.createBufferSource();
    bow.buffer = this.makeNoiseBuffer(ctx, dur);
    const bowBp = ctx.createBiquadFilter();
    bowBp.type = 'bandpass';
    bowBp.frequency.setValueAtTime(1800, now);
    bowBp.Q.value = 0.7;
    const bowG = ctx.createGain();
    bowG.gain.setValueAtTime(0.0, now);
    bowG.gain.linearRampToValueAtTime(0.07, now + 0.08);
    bowG.gain.exponentialRampToValueAtTime(0.001, now + dur);
    bow.connect(bowBp); bowBp.connect(bowG); bowG.connect(f1);

    o1.start(now); o2.start(now);
    o1.stop(now + dur); o2.stop(now + dur);
    lfo.start(now); lfo.stop(now + dur);
    bow.start(now); bow.stop(now + dur);
  }

  private async playViolinSample(f: number, now: number) {
    try {
      await this.playSampleNote({
        baseUrl: 'assets/audio/musica/violin',
        availableNotes: ['G3', 'C4', 'A4', 'C5'],
        targetFreq: f,
        now,
        gain: 0.8,
        dur: 1.35,
        reverb: 0.18,
      });
    } catch {
      this.playViolin(f, now);
    }
  }

  private playFlute(f: number, now: number) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const dur = 1.0;

    const vca = ctx.createGain();
    vca.gain.setValueAtTime(0.0, now);
    vca.gain.linearRampToValueAtTime(0.42, now + 0.12);
    vca.gain.exponentialRampToValueAtTime(0.001, now + dur);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3400, now);

    lp.connect(vca);
    this.outConnect(vca, 0.28);

    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = 'sine';
    o2.type = 'sine';
    o1.frequency.setValueAtTime(f, now);
    o2.frequency.setValueAtTime(f * 2, now);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.24, now);
    const og2 = ctx.createGain();
    og2.gain.setValueAtTime(0.05, now);
    o1.connect(og); og.connect(lp);
    o2.connect(og2); og2.connect(lp);

    const n = ctx.createBufferSource();
    n.buffer = this.makeNoiseBuffer(ctx, dur);
    const nhp = ctx.createBiquadFilter();
    nhp.type = 'highpass';
    nhp.frequency.setValueAtTime(1500, now);
    const nlp = ctx.createBiquadFilter();
    nlp.type = 'lowpass';
    nlp.frequency.setValueAtTime(5200, now);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0, now);
    ng.gain.linearRampToValueAtTime(0.06, now + 0.14);
    ng.gain.exponentialRampToValueAtTime(0.001, now + dur);
    n.connect(nhp); nhp.connect(nlp); nlp.connect(ng); ng.connect(lp);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.1, now);
    const lfoG = ctx.createGain();
    lfoG.gain.setValueAtTime(0.7, now);
    lfo.connect(lfoG);
    lfoG.connect(o1.detune);
    lfoG.connect(o2.detune);

    o1.start(now); o2.start(now);
    o1.stop(now + dur); o2.stop(now + dur);
    n.start(now); n.stop(now + dur);
    lfo.start(now); lfo.stop(now + dur);
  }

  private tocarTambor() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const oscGain = this.audioCtx.createGain();
    
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    const bufferSize = this.audioCtx.sampleRate * 0.1;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }

    const noise = this.audioCtx.createBufferSource();
    const noiseGain = this.audioCtx.createGain();
    const noiseFilter = this.audioCtx.createBiquadFilter();

    noise.buffer = buffer;
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, now);
    
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    const bodyFilter = this.audioCtx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(900, now);
    osc.connect(oscGain);
    oscGain.connect(bodyFilter);
    this.outConnect(bodyFilter, 0.06);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    this.outConnect(noiseGain, 0.08);

    osc.start(now);
    noise.start(now);
  }
}
