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
import { Comparacion } from './comparacion/comparacion';
import { SintonizadorTransmedia } from './sintonizador-transmedia/sintonizador-transmedia';
import { CollageInteractivo } from './collage-interactivo/collage-interactivo';
import { Popup } from '../../componentes/popup/popup';

import { ExplicacionService } from '../../services/explicacion.service';
import { explicaciones } from './data/explicaciones';
import {
  dispositivosAudiovisual,
  explicacionesDispositivosAudiovisual,
  DispositivoAudiovisual,
} from './data/dispositivos-audiovisual';
import { SpeakableDirective } from '../../directives/app-speakable';
import { ColorService } from '../../services/color.service';
import { PopupThemeService } from '../../services/popup-theme';
import { VOICE_AUDIOVISUAL_PAGE_ACTION_EVENT } from '../../utils/audiovisual-voice-dom';
import {
  VoiceNavigationService,
  type AudiovisualVoiceDetail,
} from '../../services/voice-navigation.service';
import { AudiovisualVoiceBridgeService } from '../../services/audiovisual-voice-bridge.service';
import {
  audiovisualVentanitaHintLabel,
  type AudiovisualVentanitaClave,
} from '../../utils/audiovisual-ventanita-voice';
import { voiceHintDisplay } from '../../utils/voice-hint-display';

@Component({
  selector: 'app-audiovisual',
  standalone: true,
  imports: [
    NgIf,
    ScrollRevealDirective,
    SpeakableDirective,
    Comparacion,
    SintonizadorTransmedia,
    CollageInteractivo,
    Popup,
  ],
  templateUrl: './audiovisual.html',
  styleUrl: './audiovisual.scss',
})
export class Audiovisual implements AfterViewInit, OnDestroy {
  ui = inject(UiStateService);
  readonly voiceNav = inject(VoiceNavigationService);
  private readonly audiovisualVoiceBridge = inject(AudiovisualVoiceBridgeService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private colorService = inject(ColorService);
  private popupThemes = inject(PopupThemeService);
  explicacionService = inject(ExplicacionService);
  explicaciones = explicaciones;

  readonly hint = voiceHintDisplay;

  imagenPortada = this.ui.hoverSwap(
    'assets/imagenes/audiovisual/portadaAudiovisual.jpg',
    'assets/imagenes/audiovisual/portadaAudiovisualHover.jpg'
  );

  readonly h1Colors = { daltonismo1: '#fff', daltonismo2: '#fff' };

  dispositivos: DispositivoAudiovisual[] = dispositivosAudiovisual;
  isDispositivoPopupOpen = false;
  dispositivoSeleccionado: DispositivoAudiovisual | null = null;
  readonly ventanitaVozActiva = signal(false);

  private viewportObserver?: IntersectionObserver;

  abrirDispositivo(d: DispositivoAudiovisual) {
    this.dispositivoSeleccionado = d;
    this.isDispositivoPopupOpen = true;
    this.cdr.markForCheck();
  }

  abrirDispositivoPorClave(clave: AudiovisualVentanitaClave) {
    const d = this.dispositivos.find(item => item.clave === clave);
    if (d) this.abrirDispositivo(d);
  }

  cerrarDispositivo() {
    this.isDispositivoPopupOpen = false;
    this.dispositivoSeleccionado = null;
    this.cdr.markForCheck();
  }

  pistaVozDispositivo(clave: AudiovisualVentanitaClave): string {
    return audiovisualVentanitaHintLabel(clave);
  }

  textoDispositivo(clave: DispositivoAudiovisual['clave']): string {
    const nivel = this.explicacionService.nivelActivo();
    return explicacionesDispositivosAudiovisual[clave][nivel];
  }

  audiovisualTheme = computed(() => {
    const modo = this.colorService.colorActivo();
    if (modo === 'original') {
      return {
        overlayBg: 'rgba(0,0,0,0.85)',
        panelBg: '#f0fffb',
        panelText: '#000000',
        borderColor: '#3ce8c9',
        insetLight: '#ffffff',
        insetDark: '#008c72',
        titlebarBg: '#00cea8',
        titlebarText: 'white',
        titlebarDivider: '#808080',
        closeBg: '#3ce8c9',
        buttonBg: '#00cea8',
        buttonBorderTop: '#fff',
        buttonBorderLeft: '#fff',
        buttonBorderBottom: '#008c72',
        buttonBorderRight: '#008c72',
        buttonActiveBg: '#3ce8c9',
        buttonActiveBorderTop: '#008c72',
        buttonActiveBorderLeft: '#008c72',
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
    this.router.navigate(['/interactividad']);
  }

  texto(clave: string) {
    return this.explicaciones[clave][this.explicacionService.nivelActivo()];
  }

  private readonly handleAudiovisualVoice = (detail: AudiovisualVoiceDetail): void => {
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'abrirDispositivo':
          if (detail.clave) {
            this.abrirDispositivoPorClave(detail.clave as AudiovisualVentanitaClave);
          }
          break;
        case 'cerrarDispositivo':
          this.cerrarDispositivo();
          break;
        case 'siguientePagina':
          this.siguientePagina();
          break;
      }
      this.cdr.markForCheck();
    });
  };

  private readonly onAudiovisualPageVoice = ((ev: Event) => {
    const detail = (ev as CustomEvent<AudiovisualVoiceDetail>).detail;
    if (detail?.action) this.handleAudiovisualVoice(detail);
  }) as EventListener;

  ngAfterViewInit(): void {
    this.audiovisualVoiceBridge.connect(this.handleAudiovisualVoice);
    window.addEventListener(VOICE_AUDIOVISUAL_PAGE_ACTION_EVENT, this.onAudiovisualPageVoice);

    const ventanita = document.querySelector('app-audiovisual .ventanita');
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
    this.audiovisualVoiceBridge.disconnect();
    window.removeEventListener(VOICE_AUDIOVISUAL_PAGE_ACTION_EVENT, this.onAudiovisualPageVoice);
  }
}
