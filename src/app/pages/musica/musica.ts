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

import { Instrumentos } from './instrumentos/instrumentos';

import { Evolucion } from './evolucion/evolucion';

import { MesaMezclas } from './mesa-mezclas/mesa-mezclas';

import { Popup } from '../../componentes/popup/popup';

import { ColorService } from '../../services/color.service';

import { PopupThemeService } from '../../services/popup-theme';

import { ExplicacionService } from '../../services/explicacion.service';

import { explicaciones } from './data/explicaciones';

import {

  dispositivosMusica,

  explicacionesDispositivosMusica,

  DispositivoMusica,

} from './data/dispositivos-musica';

import { SpeakableDirective } from '../../directives/app-speakable';

import { VOICE_MUSICA_PAGE_ACTION_EVENT } from '../../utils/musica-voice-dom';

import {

  VoiceNavigationService,

  type MusicaVoiceDetail,

} from '../../services/voice-navigation.service';

import { MusicaVoiceBridgeService } from '../../services/musica-voice-bridge.service';

import {

  musicaVentanitaHintLabel,

  type MusicaVentanitaClave,

} from '../../utils/musica-ventanita-voice';

import { voiceHintDisplay } from '../../utils/voice-hint-display';

@Component({

  selector: 'app-musica',

  standalone: true,

  imports: [

    NgIf,

    ScrollRevealDirective,

    SpeakableDirective,

    Instrumentos,

    Evolucion,

    MesaMezclas,

    Popup,

  ],

  templateUrl: './musica.html',

  styleUrl: './musica.scss',

})

export class Musica implements AfterViewInit, OnDestroy {

  ui = inject(UiStateService);

  readonly voiceNav = inject(VoiceNavigationService);

  private readonly musicaVoiceBridge = inject(MusicaVoiceBridgeService);

  private readonly ngZone = inject(NgZone);

  private readonly cdr = inject(ChangeDetectorRef);

  private colorService = inject(ColorService);

  private popupThemes = inject(PopupThemeService);

  explicacionService = inject(ExplicacionService);

  explicaciones = explicaciones;

  readonly hint = voiceHintDisplay;

  imagenPortada = this.ui.hoverSwap(

    'assets/imagenes/musica/portadaMusica.jpg',

    'assets/imagenes/musica/portadaMusicaHover.jpg'

  );

  readonly h1Colors = { daltonismo1: '#fff', daltonismo2: '#fff' };

  dispositivos: DispositivoMusica[] = dispositivosMusica;

  isDispositivoPopupOpen = false;

  dispositivoSeleccionado: DispositivoMusica | null = null;

  readonly ventanitaVozActiva = signal(false);

  abrirDispositivo(d: DispositivoMusica) {

    this.dispositivoSeleccionado = d;

    this.isDispositivoPopupOpen = true;

    this.cdr.markForCheck();

  }

  abrirDispositivoPorClave(clave: MusicaVentanitaClave) {

    const d = this.dispositivos.find(item => item.clave === clave);

    if (d) this.abrirDispositivo(d);

  }

  cerrarDispositivo() {

    this.isDispositivoPopupOpen = false;

    this.dispositivoSeleccionado = null;

    this.cdr.markForCheck();

  }

  pistaVozDispositivo(clave: MusicaVentanitaClave): string {

    return musicaVentanitaHintLabel(clave);

  }

  textoDispositivo(clave: DispositivoMusica['clave']): string {

    const nivel = this.explicacionService.nivelActivo();

    return explicacionesDispositivosMusica[clave][nivel];

  }

  musicaTheme = computed(() => {

    const modo = this.colorService.colorActivo();

    if (modo === 'original') {

      return {

        overlayBg: 'rgba(0,0,0,0.85)',

        panelBg: '#f3e8fa',

        panelText: '#000000',

        borderColor: '#c850ed',

        insetLight: '#ffffff',

        insetDark: '#8200a9',

        titlebarBg: '#a900dd',

        titlebarText: 'white',

        titlebarDivider: '#808080',

        closeBg: '#c850ed',

        buttonBg: '#a900dd',

        buttonBorderTop: '#fff',

        buttonBorderLeft: '#fff',

        buttonBorderBottom: '#8200a9',

        buttonBorderRight: '#8200a9',

        buttonActiveBg: '#c850ed',

        buttonActiveBorderTop: '#8200a9',

        buttonActiveBorderLeft: '#8200a9',

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

    this.router.navigate(['/audiovisual']);

  }

  texto(clave: string) {

    return this.explicaciones[clave][this.explicacionService.nivelActivo()];

  }

  private readonly handleMusicaVoice = (detail: MusicaVoiceDetail) => {

    this.ngZone.run(() => {

      switch (detail.action) {

        case 'abrirDispositivo':

          if (detail.clave) this.abrirDispositivoPorClave(detail.clave as MusicaVentanitaClave);

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

  private readonly onMusicaPageVoice = ((ev: Event) => {

    const detail = (ev as CustomEvent<MusicaVoiceDetail>).detail;

    if (detail?.action) this.handleMusicaVoice(detail);

  }) as EventListener;

  private viewportObserver?: IntersectionObserver;

  ngAfterViewInit(): void {

    this.musicaVoiceBridge.connect(this.handleMusicaVoice);

    window.addEventListener(VOICE_MUSICA_PAGE_ACTION_EVENT, this.onMusicaPageVoice);

    const ventanita = document.querySelector('app-musica .ventanita');

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

    this.musicaVoiceBridge.disconnect();

    window.removeEventListener(VOICE_MUSICA_PAGE_ACTION_EVENT, this.onMusicaPageVoice);

  }

}

