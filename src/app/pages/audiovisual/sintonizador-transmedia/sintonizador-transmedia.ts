import {
  Component,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStateService } from '../../../services/ui-state.service';
import { SpeakableDirective } from '../../../directives/app-speakable';
import { ExplicacionService } from '../../../services/explicacion.service';
import { sintonizadorExplicaciones } from '../data/sintonizador-explicaciones';
import {
  VoiceNavigationService,
  type SintonizadorVoiceDetail,
} from '../../../services/voice-navigation.service';
import { SintonizadorVoiceBridgeService } from '../../../services/sintonizador-voice-bridge.service';
import {
  sintonizadorEraHint,
  sintonizadorMuteHint,
  sintonizadorPauseHint,
  sintonizadorPlayHint,
  type SintonizadorVoiceParsed,
} from '../../../utils/audiovisual-sintonizador-voice';
import { VOICE_SINTONIZADOR_ACTION_EVENT } from '../../../utils/audiovisual-voice-dom';

interface Era {
  id: string;
  year: string;
  title: string;
  videoSrc: string;
  uiStyle: 'cinema' | 'crt-60s' | 'vhs-90s' | 'youtube-00s' | 'streaming';
  filter: string;
  description: string;
}

@Component({
  selector: 'app-sintonizador-transmedia',
  standalone: true,
  imports: [CommonModule, SpeakableDirective],
  templateUrl: './sintonizador-transmedia.html',
  styleUrls: ['./sintonizador-transmedia.scss'],
})
export class SintonizadorTransmedia implements AfterViewInit, OnDestroy {
  ui = inject(UiStateService);
  readonly voiceNav = inject(VoiceNavigationService);
  private readonly sintonizadorVoiceBridge = inject(SintonizadorVoiceBridgeService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private explicacionService = inject(ExplicacionService);
  private readonly explicaciones = sintonizadorExplicaciones;

  @ViewChild('eraVideo') eraVideo!: ElementRef<HTMLVideoElement>;

  readonly pistaPlay = sintonizadorPlayHint;
  readonly pistaPause = sintonizadorPauseHint;

  pistaEra(index: number): string {
    return sintonizadorEraHint(index);
  }

  pistaMute(): string {
    return sintonizadorMuteHint(this.muted());
  }

  textoExplicacion(): string {
    const id = this.selectedEra().id;
    const nivel = this.explicacionService.nivelActivo();
    return this.explicaciones[id][nivel];
  }

  readonly playing = signal(false);
  readonly muted = signal(true);

  readonly videoWidth = 640;
  readonly videoHeight = 480;
  readonly aspectRatio = '4 / 3';

  readonly eras = signal<Era[]>([
    {
      id: 'cinema',
      year: '1930',
      title: 'CINE CLÁSICO',
      videoSrc: 'assets/videos/audiovisual/northByNorthwest.mp4',
      uiStyle: 'cinema',
      filter: 'grayscale(1) sepia(0.2) contrast(1.2)',
      description: 'La gran pantalla: el sonido llega para completar la imagen.',
    },
    {
      id: 'tv60',
      year: '1960',
      title: 'TELEVISIÓN CRT',
      videoSrc: 'assets/videos/audiovisual/theLoneRanger.mp4',
      uiStyle: 'crt-60s',
      filter: 'contrast(1.4) brightness(1.1) grayscale(0.5)',
      description: 'Lo audiovisual entra en el salón de cada casa.',
    },
    {
      id: 'vhs',
      year: '1990',
      title: 'VHS / DVD',
      videoSrc: 'assets/videos/audiovisual/vhsFootage.mp4',
      uiStyle: 'vhs-90s',
      filter: 'saturate(1.5) contrast(0.9)',
      description: 'El espectador toma el control: grabar, rebobinar y coleccionar.',
    },
    {
      id: 'youtube',
      year: '2005',
      title: 'YOUTUBE / WEB',
      videoSrc: 'assets/videos/audiovisual/firstYoutubeVideo.mp4',
      uiStyle: 'youtube-00s',
      filter: 'none',
      description: 'La democratización total: cualquiera puede crear y compartir contenido globalmente.',
    },
    {
      id: 'streaming',
      year: 'HOY',
      title: 'STREAMING',
      videoSrc: 'assets/videos/audiovisual/hboIntro.mp4',
      uiStyle: 'streaming',
      filter: 'none',
      description: 'La pantalla es ubicua: acceso infinito bajo demanda en cualquier lugar.',
    },
  ]);

  selectedEra = signal<Era>(this.eras()[0]);

  ngAfterViewInit() {
    this.setupListeners();
    this.sintonizadorVoiceBridge.connect(this.handleSintonizadorVoice);
    window.addEventListener(VOICE_SINTONIZADOR_ACTION_EVENT, this.onSintonizadorVoiceEvent);
  }

  ngOnDestroy() {
    this.sintonizadorVoiceBridge.disconnect();
    window.removeEventListener(VOICE_SINTONIZADOR_ACTION_EVENT, this.onSintonizadorVoiceEvent);
  }

  private readonly handleSintonizadorVoice = (detail: SintonizadorVoiceDetail): void => {
    this.ngZone.run(() => {
      this.applyVoiceCommands(detail.commands);
      this.cdr.markForCheck();
    });
  };

  private readonly onSintonizadorVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<SintonizadorVoiceDetail>).detail;
    if (detail?.commands?.length) this.handleSintonizadorVoice(detail);
  }) as EventListener;

  private applyVoiceCommands(commands: SintonizadorVoiceParsed[]): void {
    for (const cmd of commands) {
      switch (cmd.kind) {
        case 'selectEra':
          this.selectEraByIndex(cmd.index);
          this.focusRole(`sin-era-${cmd.index + 1}`);
          break;
        case 'play':
          this.play();
          this.focusRole('sin-play');
          break;
        case 'pause':
          this.pause();
          this.focusRole('sin-pause');
          break;
        case 'toggleMute':
          this.toggleMute();
          this.focusRole('sin-mute');
          break;
      }
    }
  }

  private focusRole(role: string): void {
    (
      document.querySelector(`app-sintonizador-transmedia [data-mm-role="${role}"]`) as HTMLElement | null
    )?.focus({ preventScroll: true });
  }

  selectEraByIndex(index: number) {
    const era = this.eras()[index];
    if (era) this.selectEra(era);
  }

  setupListeners() {
    const video = this.eraVideo?.nativeElement;
    if (video) {
      video.onplay = () => this.playing.set(true);
      video.onpause = () => this.playing.set(false);
      video.onended = () => this.playing.set(false);
      video.muted = this.muted();
    }
  }

  selectEra(era: Era) {
    this.selectedEra.set(era);
    setTimeout(() => {
      this.muted.set(true);
      this.playing.set(false);
      const video = this.eraVideo?.nativeElement;
      if (video) {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
        video.load();
      }
      this.setupListeners();
      this.cdr.markForCheck();
    }, 0);
  }

  play() {
    const video = this.eraVideo?.nativeElement;
    if (video) {
      video.play();
      this.playing.set(true);
    }
  }

  pause() {
    const video = this.eraVideo?.nativeElement;
    if (video) {
      video.pause();
      this.playing.set(false);
    }
  }

  toggleMute() {
    const video = this.eraVideo?.nativeElement;
    if (video) {
      video.muted = !video.muted;
      this.muted.set(video.muted);
    }
  }

  togglePlay() {
    const video = this.eraVideo?.nativeElement;
    if (video) {
      if (video.paused) {
        video.play();
        this.playing.set(true);
      } else {
        video.pause();
        this.playing.set(false);
      }
    }
  }
}
