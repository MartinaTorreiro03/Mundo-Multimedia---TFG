import {

  Component,

  ElementRef,

  ViewChild,

  AfterViewInit,

  OnDestroy,

  signal,

  computed,

  inject,

  NgZone,

  ChangeDetectorRef,

} from '@angular/core';

import { CommonModule } from '@angular/common';

import { UiStateService } from '../../../services/ui-state.service';
import { KeyboardNavService } from '../../../services/keyboard-nav.service';

import { SpeakableDirective } from '../../../directives/app-speakable';

import {

  VoiceNavigationService,

  type ComparacionVoiceDetail,

} from '../../../services/voice-navigation.service';

import { ComparacionVoiceBridgeService } from '../../../services/comparacion-voice-bridge.service';

import {

  comparacionFiltroHint,

  comparacionMuteHint,

  comparacionPauseHint,

  comparacionPlayHint,

  comparacionSliderActivoLabel,

  comparacionSliderHint,

  type ComparacionSlider,

  type ComparacionVoiceParsed,

} from '../../../utils/audiovisual-comparacion-voice';

import { VOICE_COMPARACION_ACTION_EVENT } from '../../../utils/audiovisual-voice-dom';

interface VideoSource {

  src: string;

  type: string;

  label: string;

}

@Component({

  selector: 'app-comparacion',

  standalone: true,

  imports: [CommonModule, SpeakableDirective],

  templateUrl: './comparacion.html',

  styleUrls: ['./comparacion.scss'],

})

export class Comparacion implements AfterViewInit, OnDestroy {

  ui = inject(UiStateService);
  keyboardNav = inject(KeyboardNavService);

  readonly voiceNav = inject(VoiceNavigationService);

  private readonly comparacionVoiceBridge = inject(ComparacionVoiceBridgeService);

  private readonly ngZone = inject(NgZone);

  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('videoLeft') videoLeft!: ElementRef<HTMLVideoElement>;

  @ViewChild('videoRight') videoRight!: ElementRef<HTMLVideoElement>;

  readonly videoConfig = {

    left: {

      src: 'assets/videos/audiovisual/videoByN.mp4',

      type: 'video/mp4',

      label: 'Versión B/N — Muda',

    } as VideoSource,

    right: {

      src: 'assets/videos/audiovisual/videoColor.mp4',

      type: 'video/mp4',

      label: 'Versión Color — Música y voz',

    } as VideoSource,

  };

  volume = signal(1);

  isMuted = signal(false);

  isForceBW = signal(true);

  currentTime = signal(0);

  duration = signal(0);

  progress = signal(0);

  cmpSliderVozActivo = signal<ComparacionSlider | null>(null);

  private animationFrameId: number | null = null;

  private videosReady = false;

  readonly pistaPlay = comparacionPlayHint;

  readonly pistaPause = comparacionPauseHint;

  timeDisplay = computed(() => {

    return `${this.fmt(this.currentTime())} / ${this.fmt(this.duration())}`;

  });

  pistaMute(): string {

    return comparacionMuteHint(this.isMuted());

  }

  pistaFiltro(): string {

    return comparacionFiltroHint(this.isForceBW());

  }

  pistaSlider(slider: ComparacionSlider): string {

    return comparacionSliderHint(slider);

  }

  cmpSliderActivoLabel(): string {

    return comparacionSliderActivoLabel(this.cmpSliderVozActivo());

  }

  isCmpSliderVozActivo(slider: ComparacionSlider): boolean {

    return this.cmpSliderVozActivo() === slider;

  }

  ngAfterViewInit() {
    this.initVideos();
    this.comparacionVoiceBridge.connect(this.handleComparacionVoice);
    window.addEventListener(VOICE_COMPARACION_ACTION_EVENT, this.onComparacionVoiceEvent);
  }

  ngOnDestroy() {
    this.comparacionVoiceBridge.disconnect();
    window.removeEventListener(VOICE_COMPARACION_ACTION_EVENT, this.onComparacionVoiceEvent);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.videosReady = false;
    const vL = this.videoLeft?.nativeElement;
    const vR = this.videoRight?.nativeElement;
    vL?.pause();
    vR?.pause();
  }

  private readonly handleComparacionVoice = (detail: ComparacionVoiceDetail): void => {

    this.ngZone.run(() => {

      this.applyVoiceCommands(detail.commands);

      this.cdr.markForCheck();

    });

  };

  private readonly onComparacionVoiceEvent = ((ev: Event) => {

    const detail = (ev as CustomEvent<ComparacionVoiceDetail>).detail;

    if (detail?.commands?.length) this.handleComparacionVoice(detail);

  }) as EventListener;

  private applyVoiceCommands(commands: ComparacionVoiceParsed[]): void {

    for (const cmd of commands) {

      switch (cmd.kind) {

        case 'play':

          void this.playBoth();

          this.focusRole('cmp-play');

          break;

        case 'pause':

          this.pauseBoth();

          this.focusRole('cmp-pause');

          break;

        case 'toggleMute':

          this.toggleMute();

          this.focusRole('cmp-mute');

          break;

        case 'toggleBw':

          this.toggleBW();

          this.focusRole('cmp-filtro');

          break;

        case 'selectSlider':

          this.selectSliderVoz(cmd.slider);

          break;

        case 'adjust':

          this.adjustSliderVoz(cmd.deltas);

          break;

      }

    }

  }

  private focusRole(role: string): void {

    this.queryHost<HTMLElement>(`[data-mm-role="${role}"]`)?.focus({ preventScroll: true });

  }

  private queryHost<T extends Element>(selector: string): T | null {

    return document.querySelector(`app-comparacion ${selector}`) as T | null;

  }

  private selectSliderVoz(slider: ComparacionSlider): void {

    this.cmpSliderVozActivo.set(slider);

    const sel =

      slider === 'duracion' ? '[data-mm-role="cmp-duracion"]' : '[data-mm-role="cmp-volumen"]';

    this.queryHost<HTMLInputElement>(sel)?.focus({ preventScroll: true });

  }

  private adjustSliderVoz(deltas: number[]): void {

    const slider = this.cmpSliderVozActivo();

    if (!slider || !deltas.length) return;

    const sel =

      slider === 'duracion' ? '[data-mm-role="cmp-duracion"]' : '[data-mm-role="cmp-volumen"]';

    const input = this.queryHost<HTMLInputElement>(sel);

    if (!input) return;

    const min = Number(input.min);

    const max = Number(input.max);

    const step = slider === 'volumen' ? 0.01 : Number(input.step) || 1;

    let value = Number(input.value);

    for (const d of deltas) {
      value = Math.min(max, Math.max(min, value + d * step));
    }

    input.value = String(value);

    input.dispatchEvent(new Event('input', { bubbles: true }));

  }

  private fmt(s: number): string {

    if (!isFinite(s)) return '00:00';

    const mm = Math.floor(s / 60);

    const ss = Math.floor(s % 60);

    return String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');

  }

  private initVideos(): void {
    const vLeft = this.videoLeft?.nativeElement;
    const vRight = this.videoRight?.nativeElement;
    if (!vLeft || !vRight) return;

    const onError = () => this.reloadVideos();
    vLeft.addEventListener('error', onError);
    vRight.addEventListener('error', onError);
    this.loadVideos();
  }

  private loadVideos(): void {
    const vLeft = this.videoLeft?.nativeElement;
    const vRight = this.videoRight?.nativeElement;
    if (!vLeft || !vRight) return;

    this.videosReady = false;
    vLeft.pause();
    vRight.pause();

    let leftReady = false;
    let rightReady = false;

    const tryFinish = () => {
      if (!leftReady || !rightReady) return;
      this.videosReady = true;
      vRight.volume = this.volume();
      vRight.muted = this.isMuted();
      vLeft.currentTime = 0;
      vRight.currentTime = 0;
      void this.primeVideoFrame(vLeft).then(() => this.primeVideoFrame(vRight));
      if (this.animationFrameId === null) this.startSyncLoop();
    };

    const markLeft = () => {
      leftReady = true;
      tryFinish();
    };
    const markRight = () => {
      rightReady = true;
      tryFinish();
    };

    if (vLeft.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) markLeft();
    else vLeft.addEventListener('loadeddata', markLeft, { once: true });

    if (vRight.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) markRight();
    else vRight.addEventListener('loadeddata', markRight, { once: true });

    vLeft.load();
    vRight.load();
  }

  private reloadVideos(): void {
    if (!this.videoLeft?.nativeElement || !this.videoRight?.nativeElement) return;
    this.loadVideos();
  }

  private async primeVideoFrame(video: HTMLVideoElement): Promise<void> {
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    const wasMuted = video.muted;
    video.muted = true;
    try {
      await video.play();
      video.pause();
      video.currentTime = 0;
    } catch {
    } finally {
      video.muted = wasMuted;
    }
  }

  private startSyncLoop(): void {
    const vLeft = this.videoLeft.nativeElement;
    const vRight = this.videoRight.nativeElement;

    const sync = () => {
      if (this.videosReady) {
        this.currentTime.set(vRight.currentTime);
        if (vRight.duration) {
          this.duration.set(vRight.duration);
          this.progress.set((vRight.currentTime / vRight.duration) * 100);
        }

        if (vRight.readyState >= 2 && vLeft.readyState >= 2) {
          const drift = vLeft.currentTime - vRight.currentTime;
          if (Math.abs(drift) > 0.15) {
            vLeft.currentTime = vRight.currentTime;
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(sync);
    };

    sync();
  }

  async playBoth() {
    const vLeft = this.videoLeft.nativeElement;
    const vRight = this.videoRight.nativeElement;
    if (!this.videosReady || vLeft.readyState < 2 || vRight.readyState < 2) {
      this.reloadVideos();
      return;
    }
    try {
      await Promise.all([vLeft.play(), vRight.play()]);
    } catch {
      console.log('Interacción requerida para reproducir audio');
    }
  }

  pauseBoth() {

    this.videoLeft.nativeElement.pause();

    this.videoRight.nativeElement.pause();

  }

  onProgressInput(event: Event) {
    if (!this.videosReady) return;
    const input = event.target as HTMLInputElement;
    const pct = parseFloat(input.value) / 100;
    const newTime = (this.videoRight.nativeElement.duration || 0) * pct;
    this.videoRight.nativeElement.currentTime = newTime;
    this.videoLeft.nativeElement.currentTime = newTime;
  }

  onVolumeInput(event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.volume.set(val);
    this.videoRight.nativeElement.volume = val;
    if (val === 0) {
      this.isMuted.set(true);
      this.videoRight.nativeElement.muted = true;
    }
  }

  toggleMute() {

    const newState = !this.isMuted();

    this.isMuted.set(newState);

    this.videoRight.nativeElement.muted = newState;

  }

  toggleBW() {

    this.isForceBW.update(v => !v);

  }

}

