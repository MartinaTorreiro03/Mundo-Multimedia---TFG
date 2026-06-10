import {
  Component,
  inject,
  computed,
  signal,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { UiStateService } from '../../services/ui-state.service';
import { Router } from '@angular/router';

import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { Reproductores } from './reproductores/reproductores';
import { MediaDeck } from './media-deck/media-deck';
import { VideoInmersivo } from './video-inmersivo/video-inmersivo';
import { Popup } from '../../componentes/popup/popup';
import { ColorService } from '../../services/color.service';
import { PopupThemeService } from '../../services/popup-theme';

import { ExplicacionService } from '../../services/explicacion.service';
import { explicaciones } from './data/explicaciones';
import {
  dispositivosVideo,
  explicacionesDispositivosVideo,
  DispositivoVideo,
} from './data/dispositivos-video';
import { SpeakableDirective } from '../../directives/app-speakable';
import { VOICE_VIDEO_ACTION_EVENT } from '../../utils/video-voice-dom';
import {
  VoiceNavigationService,
  type VideoVoiceDetail,
} from '../../services/voice-navigation.service';
import { VideoVoiceBridgeService } from '../../services/video-voice-bridge.service';
import {
  videoVentanitaHintLabel,
  type VideoVentanitaClave,
} from '../../utils/video-ventanita-voice';
import { voiceHintDisplay } from '../../utils/voice-hint-display';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [
    NgIf,
    Popup,
    Reproductores,
    MediaDeck,
    VideoInmersivo,
    ScrollRevealDirective,
    SpeakableDirective,
  ],
  templateUrl: './video.html',
  styleUrl: './video.scss',
})
export class Video implements AfterViewInit, OnDestroy {
  ui = inject(UiStateService);
  readonly voiceNav = inject(VoiceNavigationService);
  private readonly videoVoiceBridge = inject(VideoVoiceBridgeService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private colorService = inject(ColorService);
  private popupThemes = inject(PopupThemeService);
  explicacionService = inject(ExplicacionService);
  explicaciones = explicaciones;

  readonly hint = voiceHintDisplay;

  imagenPortada = this.ui.hoverSwap(
    'assets/imagenes/video/portadaVideo.gif',
    'assets/imagenes/video/portadaVideoHover.gif'
  );

  readonly h1Colors = { daltonismo1: '#fff', daltonismo2: '#fff' };

  dispositivos: DispositivoVideo[] = dispositivosVideo;
  isDispositivoPopupOpen = false;
  dispositivoSeleccionado: DispositivoVideo | null = null;

  readonly ventanitaVozActiva = signal(false);

  abrirDispositivo(d: DispositivoVideo) {
    this.dispositivoSeleccionado = d;
    this.isDispositivoPopupOpen = true;
    this.cdr.markForCheck();
  }

  abrirDispositivoPorClave(clave: VideoVentanitaClave) {
    const d = this.dispositivos.find(item => item.clave === clave);
    if (d) this.abrirDispositivo(d);
  }

  cerrarDispositivo() {
    this.isDispositivoPopupOpen = false;
    this.dispositivoSeleccionado = null;
    this.cdr.markForCheck();
  }

  pistaVozDispositivo(clave: VideoVentanitaClave): string {
    return videoVentanitaHintLabel(clave);
  }

  textoDispositivo(clave: DispositivoVideo['clave']): string {
    const nivel = this.explicacionService.nivelActivo();
    return explicacionesDispositivosVideo[clave][nivel];
  }

  videoTheme = computed(() => {
    const modo = this.colorService.colorActivo();
    if (modo === 'original') {
      return {
        overlayBg: 'rgba(0,0,0,0.85)',
        panelBg: '#ffe8f2',
        panelText: '#000000',
        borderColor: '#d53588',
        insetLight: '#ffffff',
        insetDark: '#a72a6b',
        titlebarBg: '#d3004d',
        titlebarText: 'white',
        titlebarDivider: '#808080',
        closeBg: '#d53588',
        buttonBg: '#d53588',
        buttonBorderTop: '#fff',
        buttonBorderLeft: '#fff',
        buttonBorderBottom: '#a72a6b',
        buttonBorderRight: '#a72a6b',
        buttonActiveBg: '#f551a6',
        buttonActiveBorderTop: '#a72a6b',
        buttonActiveBorderLeft: '#a72a6b',
        buttonActiveBorderBottom: '#fff',
        buttonActiveBorderRight: '#fff',
      };
    }
    return this.popupThemes[modo];
  });

  onVideoHover(event: MouseEvent, isHovering: boolean): void {
    const host = event.currentTarget as HTMLElement | null;
    if (!host) return;
    const video = host.querySelector('video');
    if (!(video instanceof HTMLVideoElement)) return;
    video.playbackRate = isHovering ? 2 : 1;
    if (isHovering && video.paused) {
      void video.play();
    }
  }

  constructor(private router: Router) {}

  siguientePagina() {
    this.router.navigate(['/musica']);
  }

  texto(clave: string) {
    return this.explicaciones[clave][this.explicacionService.nivelActivo()];
  }

  private readonly handleVideoVoice = (detail: VideoVoiceDetail) => {
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'abrirDispositivo':
          if (detail.clave) this.abrirDispositivoPorClave(detail.clave as VideoVentanitaClave);
          break;
        case 'cerrar':
          this.cerrarDispositivo();
          break;
        case 'siguientePagina':
          this.siguientePagina();
          break;
      }
      this.cdr.markForCheck();
    });
  };

  private readonly onVideoVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<VideoVoiceDetail>).detail;
    if (detail?.action) this.handleVideoVoice(detail);
  }) as EventListener;

  private viewportObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.videoVoiceBridge.connect(this.handleVideoVoice);
    window.addEventListener(VOICE_VIDEO_ACTION_EVENT, this.onVideoVoiceEvent);

    const ventanita = document.querySelector('app-video .ventanita');
    if (ventanita && typeof IntersectionObserver !== 'undefined') {
      this.viewportObserver = new IntersectionObserver(
        entries => {
          const visible = entries.some(e => e.isIntersecting && e.intersectionRatio >= 0.35);
          this.ngZone.run(() => {
            this.ventanitaVozActiva.set(visible);
            this.cdr.markForCheck();
          });
        },
        { threshold: [0, 0.35, 0.55] }
      );
      this.viewportObserver.observe(ventanita);
    }
  }

  ngOnDestroy(): void {
    this.viewportObserver?.disconnect();
    this.videoVoiceBridge.disconnect();
    window.removeEventListener(VOICE_VIDEO_ACTION_EVENT, this.onVideoVoiceEvent);
  }
}
