// Implementacion del modulo.
import {

  AfterViewInit,

  ChangeDetectorRef,

  Component,

  NgZone,

  OnDestroy,

  computed,

  inject,

  signal,

} from '@angular/core';

import { NgIf } from '@angular/common';

import { UiStateService } from '../../services/ui-state.service';

import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

import { HistoriaInteractiva } from './historia-interactiva/historia-interactiva';

import { EvolucionInterfaces } from './evolucion-interfaces/evolucion-interfaces';

import { Multimedia } from './multimedia/multimedia';

import { Popup } from '../../componentes/popup/popup';

import { ExplicacionService } from '../../services/explicacion.service';

import { explicaciones } from './data/explicaciones';

import {

  dispositivosInteractividad,

  explicacionesDispositivosInteractividad,

  DispositivoInteractividad,

} from './data/dispositivos-interactividad';

import { SpeakableDirective } from '../../directives/app-speakable';

import { ColorService } from '../../services/color.service';

import { PopupThemeService } from '../../services/popup-theme';

import { VoiceNavigationService } from '../../services/voice-navigation.service';

import { InteractividadVoiceBridgeService } from '../../services/interactividad-voice-bridge.service';

import type { InteractividadVoiceDetail } from '../../services/voice-navigation.service';

import { VOICE_INTERACTIVIDAD_PAGE_ACTION_EVENT } from '../../utils/interactividad-voice-dom';

import {

  interactividadVentanitaHintLabel,

  type InteractividadVentanitaClave,

} from '../../utils/interactividad-ventanita-voice';

@Component({

  selector: 'app-interactividad',

  standalone: true,

  imports: [

    NgIf,

    ScrollRevealDirective,

    SpeakableDirective,

    HistoriaInteractiva,

    EvolucionInterfaces,

    Multimedia,

    Popup,

  ],

  templateUrl: './interactividad.html',

  styleUrl: './interactividad.scss',

})

export class Interactividad implements AfterViewInit, OnDestroy {

  ui = inject(UiStateService);

  readonly voiceNav = inject(VoiceNavigationService);

  private readonly interactividadVoiceBridge = inject(InteractividadVoiceBridgeService);

  private readonly ngZone = inject(NgZone);

  private readonly cdr = inject(ChangeDetectorRef);

  private colorService = inject(ColorService);

  private popupThemes = inject(PopupThemeService);

  explicacionService = inject(ExplicacionService);

  explicaciones = explicaciones;

  imagenPortada = this.ui.hoverSwap(

    'assets/imagenes/interactividad/portadaInteractividad.jpg',

    'assets/imagenes/interactividad/portadaInteractividadHover.jpg'

  );

  readonly h1Colors = { daltonismo1: '#fff', daltonismo2: '#fff' };

  dispositivos: DispositivoInteractividad[] = dispositivosInteractividad;

  isDispositivoPopupOpen = false;

  dispositivoSeleccionado: DispositivoInteractividad | null = null;

  readonly ventanitaVozActiva = signal(false);

  abrirDispositivo(d: DispositivoInteractividad) {

    this.dispositivoSeleccionado = d;

    this.isDispositivoPopupOpen = true;

    this.cdr.markForCheck();

  }

  abrirDispositivoPorClave(clave: InteractividadVentanitaClave) {

    const d = this.dispositivos.find(item => item.clave === clave);

    if (d) this.abrirDispositivo(d);

  }

  cerrarDispositivo() {

    this.isDispositivoPopupOpen = false;

    this.dispositivoSeleccionado = null;

    this.cdr.markForCheck();

  }

  pistaVozDispositivo(clave: InteractividadVentanitaClave): string {

    return interactividadVentanitaHintLabel(clave);

  }

  textoDispositivo(clave: DispositivoInteractividad['clave']): string {

    const nivel = this.explicacionService.nivelActivo();

    return explicacionesDispositivosInteractividad[clave][nivel];

  }

  interactividadTheme = computed(() => {

    const modo = this.colorService.colorActivo();

    if (modo === 'original') {

      return {

        overlayBg: 'rgba(0,0,0,0.85)',

        panelBg: '#faf6fc',

        panelText: '#000000',

        borderColor: '#9a5a8e',

        insetLight: '#ffffff',

        insetDark: '#5c2868',

        titlebarBg: 'linear-gradient(90deg, #d00000 0%, #008c72 50%, #8200a9 100%)',

        titlebarText: 'white',

        titlebarDivider: '#808080',

        closeBg: '#00cea8',

        buttonBg: '#a900dd',

        buttonBorderTop: '#fff',

        buttonBorderLeft: '#fff',

        buttonBorderBottom: '#860000',

        buttonBorderRight: '#8200a9',

        buttonActiveBg: '#d00000',

        buttonActiveBorderTop: '#8200a9',

        buttonActiveBorderLeft: '#860000',

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

  texto(clave: string) {

    return this.explicaciones[clave][this.explicacionService.nivelActivo()];

  }

  private readonly handleInteractividadVoice = (detail: InteractividadVoiceDetail): void => {

    this.ngZone.run(() => {

      switch (detail.action) {

        case 'abrirDispositivo':

          if (detail.clave) {

            this.abrirDispositivoPorClave(detail.clave as InteractividadVentanitaClave);

          }

          break;

        case 'cerrarDispositivo':

          this.cerrarDispositivo();

          break;

      }

      this.cdr.markForCheck();

    });

  };

  private readonly onInteractividadPageVoice = ((ev: Event) => {

    const detail = (ev as CustomEvent<InteractividadVoiceDetail>).detail;

    if (detail?.action) this.handleInteractividadVoice(detail);

  }) as EventListener;

  private viewportObserver?: IntersectionObserver;

  ngAfterViewInit(): void {

    this.interactividadVoiceBridge.connect(this.handleInteractividadVoice);

    window.addEventListener(VOICE_INTERACTIVIDAD_PAGE_ACTION_EVENT, this.onInteractividadPageVoice);

    const ventanita = document.querySelector('app-interactividad .ventanita');

    if (ventanita && typeof IntersectionObserver !== 'undefined') {

      this.viewportObserver = new IntersectionObserver(

        entries => {

          const visible = entries.some(e => e.isIntersecting && e.intersectionRatio >= 0.35);

          this.ngZone.run(() => {

            this.ventanitaVozActiva.set(visible);

            this.cdr.markForCheck();

          });

        },

        { threshold: [0, 0.35, 0.6] }

      );

      this.viewportObserver.observe(ventanita);

    }

  }

  ngOnDestroy(): void {

    this.interactividadVoiceBridge.disconnect();

    window.removeEventListener(VOICE_INTERACTIVIDAD_PAGE_ACTION_EVENT, this.onInteractividadPageVoice);

    this.viewportObserver?.disconnect();

  }

}

