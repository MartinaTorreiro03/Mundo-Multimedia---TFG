import {
  Component,
  signal,
  OnDestroy,
  AfterViewInit,
  computed,
  inject,
  ElementRef,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiStateService } from '../../../services/ui-state.service';
import { KeyboardNavService } from '../../../services/keyboard-nav.service';
import { SpeakableDirective } from '../../../directives/app-speakable';
import {
  VOICE_MESA_MEZCLAS_ACTION_EVENT,
  VoiceNavigationService,
  type MesaMezclasVoiceDetail,
} from '../../../services/voice-navigation.service';
import { MesaMezclasVoiceBridgeService } from '../../../services/mesa-mezclas-voice-bridge.service';
import {
  mesaDeckPlayHint,
  mesaEqHint,
  mesaPadHint,
  mesaRecordHint,
  mesaSliderTargetLabel,
  mesaTuneHint,
  mesaVolHint,
  mesaWaveHint,
  type MesaDeckIndex,
  type MesaEqBand,
  type MesaMezclasVoiceParsed,
  type MesaSliderTarget,
  type MesaWaveType,
} from '../../../utils/musica-mesa-mezclas-voice';

interface Track {
  id: string;
  name: string;
  bpm: number;
  playing: boolean;
  volume: number;
  bass: number;
  mid: number;
  treble: number;
  freq: number;
  type: OscillatorType;
}

interface BeatPad {
  id: string;
  name: string;
  freq: number;
  type: OscillatorType;
  duration: number;
  sample?: string;
  buffer?: AudioBuffer;
}

@Component({
  selector: 'app-mesa-mezclas',
  standalone: true,
  imports: [CommonModule, FormsModule, SpeakableDirective],
  templateUrl: './mesa-mezclas.html',
  styleUrls: ['./mesa-mezclas.scss']
})
export class MesaMezclas implements AfterViewInit, OnDestroy {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private destNode: MediaStreamAudioDestinationNode | null = null;
  private animationFrameId: number | null = null;
  private beatPressTimers = new Map<string, ReturnType<typeof setInterval>>();
  ui = inject(UiStateService);
  keyboardNav = inject(KeyboardNavService);
  readonly voiceNav = inject(VoiceNavigationService);
  private mesaVoiceBridge = inject(MesaMezclasVoiceBridgeService);
  private host = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  readonly mesaSliderVozActivo = signal<MesaSliderTarget | null>(null);

  private oscMap = new Map<string, OscillatorNode>();
  private gainMap = new Map<string, GainNode>();
  private filterMap = new Map<string, { bf: BiquadFilterNode; mf: BiquadFilterNode; tf: BiquadFilterNode }>();

  private mediaRecorder: MediaRecorder | null = null;
  private recordingChunks: Blob[] = [];
  private recordingTimer: ReturnType<typeof setInterval> | null = null;
  private recordingStart = 0;

  tracks = signal<Track[]>([
    { id: 'deck1', name: 'TRACK 1', bpm: 128, playing: false, volume: 60, bass: 0, mid: 0, treble: 0, freq: 110, type: 'sawtooth' },
    { id: 'deck2', name: 'TRACK 2', bpm: 124, playing: false, volume: 60, bass: 0, mid: 0, treble: 0, freq: 220, type: 'square' },
    { id: 'deck3', name: 'TRACK 3', bpm: 130, playing: false, volume: 60, bass: 0, mid: 0, treble: 0, freq: 330, type: 'triangle' },
  ]);

  activeTracksCount = computed(() => 
    this.tracks().filter(t => t.playing).length
  );

  beatPads = signal<BeatPad[]>([
    { id: 'kick',    name: 'KICK',    sample: 'assets/audio/musica/kick.mp3' },
    { id: 'snare',   name: 'SNARE',   sample: 'assets/audio/musica/snare.mp3' },
    { id: 'hihat',   name: 'HI-HAT',  sample: 'assets/audio/musica/hi-hat.mp3' },
    { id: 'tom',     name: 'TOM',     sample: 'assets/audio/musica/tom.mp3' },
    { id: 'clap',    name: 'CLAP',    sample: 'assets/audio/musica/clap.mp3' },
    { id: 'cowbell', name: 'COWBELL', sample: 'assets/audio/musica/cowbell.mp3' },
    { id: 'conga',   name: 'CONGA',   sample: 'assets/audio/musica/conga.mp3' },
    { id: 'perc',    name: 'PERC',    sample: 'assets/audio/musica/perc.mp3' },
  ].map(p => ({ ...p, freq: 0, type: 'sine', duration: 0 })));

  masterVolume = signal(70);
  isBeating = signal(false);
  spectrum = signal<number[]>(new Array(32).fill(0));

  isRecording = signal(false);
  recordingTime = signal('00:00');
  downloadUrl = signal<string | null>(null);

  constructor() {
    this.startBeatLoop();
    this.startVisualizerUpdate();
  }

  deckIndexFromId(trackId: string): MesaDeckIndex {
    const i = this.tracks().findIndex(t => t.id === trackId);
    return (Math.min(2, Math.max(0, i)) + 1) as MesaDeckIndex;
  }

  pistaPlay(deckIndex: number, playing: boolean): string {
    return mesaDeckPlayHint((deckIndex + 1) as MesaDeckIndex, playing);
  }

  pistaWave(wave: MesaWaveType, deckIndex: number): string {
    return mesaWaveHint(wave, (deckIndex + 1) as MesaDeckIndex);
  }

  pistaTune(deckIndex: number): string {
    return mesaTuneHint((deckIndex + 1) as MesaDeckIndex);
  }

  pistaVol(trackIndex: number): string {
    return mesaVolHint((trackIndex + 1) as MesaDeckIndex);
  }

  pistaVolMaster(): string {
    return mesaVolHint('master');
  }

  pistaEq(band: MesaEqBand, trackIndex: number): string {
    return mesaEqHint(band, (trackIndex + 1) as MesaDeckIndex);
  }

  pistaPad(padId: string): string {
    return mesaPadHint(padId);
  }

  pistaRecord(): string {
    return mesaRecordHint(this.isRecording());
  }

  mesaSliderActivoLabel(): string {
    const t = this.mesaSliderVozActivo();
    return t ? mesaSliderTargetLabel(t) : '';
  }

  isTuneSliderVozActivo(deckIndex: number): boolean {
    const t = this.mesaSliderVozActivo();
    return t?.kind === 'tune' && t.deck === deckIndex + 1;
  }

  isVolSliderVozActivo(trackIndex: number): boolean {
    const t = this.mesaSliderVozActivo();
    return t?.kind === 'vol' && t.track === trackIndex + 1;
  }

  isMasterVolSliderVozActivo(): boolean {
    const t = this.mesaSliderVozActivo();
    return t?.kind === 'vol' && t.track === 'master';
  }

  isEqSliderVozActivo(trackIndex: number, band: MesaEqBand): boolean {
    const t = this.mesaSliderVozActivo();
    return t?.kind === 'eq' && t.track === trackIndex + 1 && t.band === band;
  }

  ngAfterViewInit(): void {
    this.mesaVoiceBridge.connect(this.handleMesaVoice);
    window.addEventListener(VOICE_MESA_MEZCLAS_ACTION_EVENT, this.onMesaVoiceEvent);
  }

  private readonly handleMesaVoice = (detail: MesaMezclasVoiceDetail): void => {
    this.ngZone.run(() => {
      this.applyVoiceCommands(detail.commands);
      this.cdr.markForCheck();
    });
  };

  private readonly onMesaVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<MesaMezclasVoiceDetail>).detail;
    if (detail?.commands?.length) this.handleMesaVoice(detail);
  }) as EventListener;

  private applyVoiceCommands(commands: MesaMezclasVoiceParsed[]): void {
    for (const cmd of commands) {
      switch (cmd.kind) {
        case 'deckPlay':
          this.voiceDeckPlay(cmd.deck, cmd.play);
          break;
        case 'deckWave':
          this.voiceDeckWave(cmd.deck, cmd.wave);
          break;
        case 'pad':
          this.voicePad(cmd.padId);
          break;
        case 'recordStart':
          if (!this.isRecording()) this.toggleRecording();
          break;
        case 'recordStop':
          if (this.isRecording()) this.toggleRecording();
          break;
        case 'download':
          this.voiceDownload();
          break;
        case 'selectSlider':
          this.selectSliderVoz(cmd.target);
          break;
        case 'adjust':
          this.adjustSliderVoz(cmd.deltas);
          break;
      }
    }
  }

  private trackIdForDeck(deck: MesaDeckIndex): string {
    return this.tracks()[deck - 1]?.id ?? 'deck1';
  }

  private queryHost<T extends Element>(selector: string): T | null {
    return this.host.nativeElement.querySelector(selector) as T | null;
  }

  private voiceDeckPlay(deck: MesaDeckIndex, play: boolean): void {
    const id = this.trackIdForDeck(deck);
    const t = this.tracks().find(tr => tr.id === id);
    if (!t) return;
    if (play && !t.playing) this.toggleTrack(id);
    if (!play && t.playing) this.toggleTrack(id);
    this.queryHost<HTMLElement>(
      `[data-mm-role="deck-play"][data-mm-deck="${deck - 1}"]`
    )?.focus();
  }

  private voiceDeckWave(deck: MesaDeckIndex, wave: MesaWaveType): void {
    this.setTrackWave(this.trackIdForDeck(deck), wave);
    const waveIdx = { sine: 0, triangle: 1, square: 2, sawtooth: 3 }[wave];
    this.queryHost<HTMLElement>(
      `[data-mm-role="deck-wave"][data-mm-deck="${deck - 1}"][data-mm-wave="${waveIdx}"]`
    )?.focus();
  }

  private voicePad(padId: string): void {
    this.playBeatPad(padId);
    this.queryHost<HTMLElement>(`[data-mm-role="effect-pad"][data-mm-pad-id="${padId}"]`)?.focus();
  }

  private voiceDownload(): void {
    if (!this.downloadUrl()) return;
    this.queryHost<HTMLAnchorElement>('[data-mm-role="download"]')?.click();
  }

  private selectSliderVoz(target: MesaSliderTarget): void {
    this.mesaSliderVozActivo.set(target);
    const sel = this.sliderSelector(target);
    this.queryHost<HTMLInputElement>(sel)?.focus({ preventScroll: true });
  }

  private sliderSelector(target: MesaSliderTarget): string {
    switch (target.kind) {
      case 'tune':
        return `[data-mm-role="deck-tune"][data-mm-deck="${target.deck - 1}"]`;
      case 'vol':
        if (target.track === 'master') return `[data-mm-role="master-vol"]`;
        return `[data-mm-role="track-vol"][data-mm-track="${target.track - 1}"]`;
      case 'eq':
        return `[data-mm-role="track-eq"][data-mm-track="${target.track - 1}"][data-mm-band="${target.band}"]`;
    }
  }

  private adjustSliderVoz(deltas: number[]): void {
    const target = this.mesaSliderVozActivo();
    if (!target || !deltas.length) return;

    const input = this.queryHost<HTMLInputElement>(this.sliderSelector(target));
    if (!input) return;

    const min = Number(input.min);
    const max = Number(input.max);
    const step = Number(input.step) || 1;
    let value = Number(input.value);

    for (const d of deltas) {
      value = Math.min(max, Math.max(min, value + d * step));
    }

    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));

    switch (target.kind) {
      case 'tune':
        this.setTrackFreq(this.trackIdForDeck(target.deck), value);
        break;
      case 'vol':
        if (target.track === 'master') this.setMasterVolume(value);
        else this.setTrackVolume(this.trackIdForDeck(target.track), value);
        break;
      case 'eq':
        this.setEQ(this.trackIdForDeck(target.track), target.band, value);
        break;
    }
  }

  textoEstadoGrabacion(): string {
    if (this.isRecording()) {
      return 'Texto. Estado: grabando.';
    }
    if (this.downloadUrl()) {
      return 'Texto. Estado: grabación lista. Puede descargar el archivo.';
    }
    return 'Texto. Estado: listo para grabar.';
  }

  textoBarraEstado(i: number): string {
    if (i === 0) {
      return `Texto. Decks: ${this.activeTracksCount()} activos.`;
    }
    if (i === 1) {
      return 'Texto. Pads: ocho.';
    }
    return this.isRecording()
      ? `Texto. Grabando. Tiempo ${this.recordingTime()}.`
      : 'Texto. Listo para reproducir.';
  }

  ngOnDestroy() {
    this.mesaVoiceBridge.disconnect();
    window.removeEventListener(VOICE_MESA_MEZCLAS_ACTION_EVENT, this.onMesaVoiceEvent);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.beatPressTimers.forEach(t => clearInterval(t));
    if (this.recordingTimer) clearInterval(this.recordingTimer);
    if (this.audioCtx) this.audioCtx.close();
  }

  private initAudio() {
    if (this.audioCtx) return;
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = this.masterVolume() / 100 * 0.4;

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 128;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    this.destNode = this.audioCtx.createMediaStreamDestination();
    this.masterGain.connect(this.destNode);

    this.preloadSamples();
  }

  private async resumeCtx(): Promise<void> {
    if (this.audioCtx?.state === 'suspended') await this.audioCtx.resume();
  }

  toggleTrack(trackId: string) {
    if (!this.audioCtx) this.initAudio();
    this.resumeCtx();

    this.tracks.update(tks => tks.map(t => {
      if (t.id !== trackId) return t;
      const newState = !t.playing;
      newState ? this.startTrack(t) : this.stopTrack(t.id);
      return { ...t, playing: newState };
    }));
  }

  private startTrack(track: Track) {
    if (!this.audioCtx || !this.masterGain) return;
    if (this.oscMap.has(track.id)) return;

    const osc = this.audioCtx.createOscillator();
    const g = this.audioCtx.createGain();
    const bf = this.audioCtx.createBiquadFilter();
    const mf = this.audioCtx.createBiquadFilter();
    const tf = this.audioCtx.createBiquadFilter();

    bf.type = 'lowshelf';  bf.frequency.value = 200;  bf.gain.value = track.bass;
    mf.type = 'peaking';   mf.frequency.value = 1000; mf.Q.value = 1; mf.gain.value = track.mid;
    tf.type = 'highshelf'; tf.frequency.value = 3000; tf.gain.value = track.treble;

    osc.type = track.type;
    osc.frequency.value = track.freq;

    g.gain.setValueAtTime(0, this.audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(track.volume / 100 * 0.2, this.audioCtx.currentTime + 0.3);

    osc.connect(g);
    g.connect(bf);
    bf.connect(mf);
    mf.connect(tf);
    tf.connect(this.masterGain);
    osc.start();

    this.oscMap.set(track.id, osc);
    this.gainMap.set(track.id, g);
    this.filterMap.set(track.id, { bf, mf, tf });
  }

  private stopTrack(trackId: string) {
    const osc = this.oscMap.get(trackId);
    const g = this.gainMap.get(trackId);
    if (!osc || !g || !this.audioCtx) return;

    g.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.3);
    setTimeout(() => {
      try { osc.stop(); osc.disconnect(); } catch (_) {}
      this.oscMap.delete(trackId);
      this.gainMap.delete(trackId);
      this.filterMap.delete(trackId);
    }, 320);
  }

  setTrackVolume(trackId: string, volume: number) {
    this.tracks.update(tks => tks.map(t => t.id === trackId ? { ...t, volume } : t));
    const g = this.gainMap.get(trackId);
    if (g && this.audioCtx) {
      g.gain.setTargetAtTime(volume / 100 * 0.2, this.audioCtx.currentTime, 0.01);
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume.set(volume);
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(volume / 100 * 0.4, this.audioCtx.currentTime, 0.01);
    }
  }

  setEQ(trackId: string, band: 'bass' | 'mid' | 'treble', value: number) {
    this.tracks.update(tks => tks.map(t => t.id === trackId ? { ...t, [band]: value } : t));
    const fm = this.filterMap.get(trackId);
    if (fm && this.audioCtx) {
      const node = band === 'bass' ? fm.bf : band === 'mid' ? fm.mf : fm.tf;
      node.gain.setTargetAtTime(value, this.audioCtx.currentTime, 0.01);
    }
  }

  setTrackFreq(trackId: string, freq: number) {
    this.tracks.update(tks => tks.map(t => t.id === trackId ? { ...t, freq } : t));
    const osc = this.oscMap.get(trackId);
    if (osc && this.audioCtx) {
      osc.frequency.setTargetAtTime(freq, this.audioCtx.currentTime, 0.01);
    }
  }

  setTrackWave(trackId: string, type: OscillatorType) {
    this.tracks.update(tks => tks.map(t => t.id === trackId ? { ...t, type } : t));
    const osc = this.oscMap.get(trackId);
    if (osc) {
      osc.type = type;
    }
  }

  beatMouseDown(padId: string) {
    this.playBeatPad(padId);
    const timer = setInterval(() => this.playBeatPad(padId), 120);
    this.beatPressTimers.set(padId, timer);
  }

  beatMouseUp(padId: string) {
    const timer = this.beatPressTimers.get(padId);
    if (timer !== undefined) {
      clearInterval(timer);
      this.beatPressTimers.delete(padId);
    }
  }

  onPadKey(event: Event, padId: string, isDown: boolean) {
    event.preventDefault();
    if (isDown) {
      if ((event as KeyboardEvent).repeat) return;
      this.beatMouseDown(padId);
    } else {
      this.beatMouseUp(padId);
    }
  }

  private readonly padSynthFallback: Record<string, { freq: number; type: OscillatorType; duration: number }> = {
    kick: { freq: 90, type: 'sine', duration: 0.35 },
    snare: { freq: 220, type: 'triangle', duration: 0.12 },
    hihat: { freq: 8000, type: 'square', duration: 0.05 },
    tom: { freq: 140, type: 'sine', duration: 0.2 },
    clap: { freq: 1200, type: 'square', duration: 0.08 },
    cowbell: { freq: 800, type: 'square', duration: 0.15 },
    conga: { freq: 200, type: 'sine', duration: 0.18 },
    perc: { freq: 440, type: 'triangle', duration: 0.1 },
  };

  private playBeatPad(padId: string) {
    if (!this.audioCtx || !this.masterGain) this.initAudio();
    void this.resumeCtx();

    const pad = this.beatPads().find(p => p.id === padId);
    if (!pad || !this.audioCtx || !this.masterGain) return;

    if (pad.buffer) {
      const source = this.audioCtx.createBufferSource();
      source.buffer = pad.buffer;
      source.connect(this.masterGain);
      source.start();
    } else {
      const fb = this.padSynthFallback[padId] ?? { freq: 220, type: 'sine' as OscillatorType, duration: 0.12 };
      const freq = pad.freq > 0 ? pad.freq : fb.freq;
      const type = pad.freq > 0 ? pad.type : fb.type;
      const duration = pad.duration > 0 ? pad.duration : fb.duration;
      const osc = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.7, this.audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration + 0.05);
      osc.onended = () => { osc.disconnect(); };
    }
  }

  private async preloadSamples() {
    if (!this.audioCtx) return;

    const currentPads = this.beatPads();
    
    const promises = currentPads.map(async (pad) => {
      if (!pad.sample) return pad;
      
      try {
        const response = await fetch(pad.sample);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioCtx!.decodeAudioData(arrayBuffer);
        return { ...pad, buffer: audioBuffer };
      } catch (e) {
        console.error(`Error cargando el sample: ${pad.sample}`, e);
        return pad;
      }
    });

    const updatedPads = await Promise.all(promises);
    this.beatPads.set(updatedPads);
  }

  toggleRecording() {
    if (!this.audioCtx) this.initAudio();
    this.resumeCtx();

    if (!this.isRecording()) {
      this.startRecording();
    } else {
      this.stopRecording();
    }
  }

  private startRecording() {
    if (!this.destNode) return;
    this.recordingChunks = [];
    this.downloadUrl.set(null);

    this.mediaRecorder = new MediaRecorder(this.destNode.stream);
    this.mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) this.recordingChunks.push(e.data);
    };
    this.mediaRecorder.onstop = () => this.finalizeRecording();
    this.mediaRecorder.start();

    this.isRecording.set(true);
    this.recordingStart = Date.now();
    this.recordingTimer = setInterval(() => this.updateRecordingTime(), 500);
  }

  private stopRecording() {
    this.mediaRecorder?.stop();
    this.isRecording.set(false);
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
    this.recordingTime.set('00:00');
  }

  private finalizeRecording() {
    const blob = new Blob(this.recordingChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    this.downloadUrl.set(url);
  }

  private updateRecordingTime() {
    const s = Math.floor((Date.now() - this.recordingStart) / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    this.recordingTime.set(`${mm}:${ss}`);
  }

  private startVisualizerUpdate() {
    const update = () => {
      if (this.analyser) {
        const data = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(data);
        const spec = Array.from({ length: 32 }, (_, i) => {
          const idx = Math.floor(i / 32 * data.length);
          return Math.round((data[idx] / 255) * 100);
        });
        this.spectrum.set(spec);
      }
      this.animationFrameId = requestAnimationFrame(update);
    };
    update();
  }

  private startBeatLoop() {
    let phase = 0;
    setInterval(() => {
      phase = (phase + 1) % 4;
      if (phase === 0) {
        this.isBeating.set(true);
        setTimeout(() => this.isBeating.set(false), 120);
      }
    }, 60000 / 128);
  }
}
