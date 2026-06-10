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

import { Mosaico } from './mosaico/mosaico';
import { LineaDispositivos } from './linea-dispositivos/linea-dispositivos';
import { Filtros } from './filtros/filtros';
import { Popup } from '../../componentes/popup/popup';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

import { ColorService } from '../../services/color.service';
import { PopupThemeService } from '../../services/popup-theme';
import { ExplicacionService } from '../../services/explicacion.service';
import { explicaciones } from './data/explicaciones';
import {
  dispositivosImagen,
  explicacionesDispositivosImagen,
  DispositivoImagen,
} from './data/dispositivos-imagen';
import { SpeakableDirective } from '../../directives/app-speakable';
import {
  VOICE_IMAGEN_ACTION_EVENT,
  VOICE_IMAGEN_VENTANITA_COLLAPSE_EVENT,
  VOICE_IMAGEN_VENTANITA_DEPLOY_EVENT,
} from '../../utils/imagen-voice-dom';
import {
  VoiceNavigationService,
  type ImagenVoiceDetail,
} from '../../services/voice-navigation.service';
import { ImagenVoiceBridgeService } from '../../services/imagen-voice-bridge.service';
import {
  imagenVentanitaHintLabel,
  type ImagenVentanitaClave,
} from '../../utils/imagen-ventanita-voice';
import { voiceHintDisplay } from '../../utils/voice-hint-display';

@Component({
  selector: 'app-imagen',
  standalone: true,
  imports: [ScrollRevealDirective, NgIf, Mosaico, LineaDispositivos, Filtros, Popup, SpeakableDirective],
  templateUrl: './imagen.html',
  styleUrl: './imagen.scss',
})
export class Imagen implements AfterViewInit, OnDestroy {
  ui = inject(UiStateService);
  readonly voiceNav = inject(VoiceNavigationService);
  private readonly imagenVoiceBridge = inject(ImagenVoiceBridgeService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private colorService = inject(ColorService);
  private popupThemes = inject(PopupThemeService);
  explicacionService = inject(ExplicacionService);
  explicaciones = explicaciones;

  readonly hint = voiceHintDisplay;

  imagenPortada = this.ui.hoverSwap(
    'assets/imagenes/imagen/portadaImagen.jpg',
    'assets/imagenes/imagen/portadaImagenHover.jpg'
  );

  dispositivos: DispositivoImagen[] = dispositivosImagen;
  isDispositivoPopupOpen = false;
  dispositivoSeleccionado: DispositivoImagen | null = null;

  readonly ventanitaVozActiva = signal(false);

  abrirDispositivo(d: DispositivoImagen) {
    this.dispositivoSeleccionado = d;
    this.isDispositivoPopupOpen = true;
  }

  abrirDispositivoPorClave(clave: ImagenVentanitaClave) {
    const d = this.dispositivos.find(item => item.clave === clave);
    if (d) this.abrirDispositivo(d);
  }

  cerrarDispositivo() {
    this.isDispositivoPopupOpen = false;
    this.dispositivoSeleccionado = null;
  }

  pistaVozDispositivo(clave: ImagenVentanitaClave): string {
    return imagenVentanitaHintLabel(clave);
  }

  textoDispositivo(clave: DispositivoImagen['clave']): string {
    const nivel = this.explicacionService.nivelActivo();
    return explicacionesDispositivosImagen[clave][nivel];
  }

  imagenDispositivoTheme = computed(() => {
    const modo = this.colorService.colorActivo();
    if (modo === 'original') {
      return {
        overlayBg: 'rgba(0,0,0,0.85)',
        panelBg: '#c93e3e',
        panelText: '#000000',
        borderColor: '#d00000',
        insetLight: '#ffffff',
        insetDark: '#5a0000',
        titlebarBg: '#860000',
        titlebarText: 'white',
        titlebarDivider: '#808080',
        closeBg: '#d00000',
        buttonBg: '#d00000',
        buttonBorderTop: '#fff',
        buttonBorderLeft: '#fff',
        buttonBorderBottom: '#5a0000',
        buttonBorderRight: '#5a0000',
        buttonActiveBg: '#e04040',
        buttonActiveBorderTop: '#5a0000',
        buttonActiveBorderLeft: '#5a0000',
        buttonActiveBorderBottom: '#fff',
        buttonActiveBorderRight: '#fff',
      };
    }
    return this.popupThemes[modo];
  });

  readonly h1Colors = { daltonismo1: '#fff', daltonismo2: '#fff' };

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
    this.router.navigate(['/video']);
  }

  texto(clave: string) {
    return this.explicaciones[clave][this.explicacionService.nivelActivo()];
  }

  private readonly handleImagenVoice = (detail: ImagenVoiceDetail) => {
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'abrirDispositivo':
          if (detail.clave) this.abrirDispositivoPorClave(detail.clave as ImagenVentanitaClave);
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

  private readonly onImagenVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<ImagenVoiceDetail>).detail;
    if (detail?.action) this.handleImagenVoice(detail);
  }) as EventListener;

  private readonly onVentanitaDeploy = () => {
    this.ngZone.run(() => {
      this.ventanitaVozActiva.set(true);
      this.cdr.markForCheck();
    });
  };

  private readonly onVentanitaCollapse = () => {
    this.ngZone.run(() => {
      this.ventanitaVozActiva.set(false);
      this.cdr.markForCheck();
    });
  };

  private viewportObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.imagenVoiceBridge.connect(this.handleImagenVoice);
    window.addEventListener(VOICE_IMAGEN_ACTION_EVENT, this.onImagenVoiceEvent);
    window.addEventListener(VOICE_IMAGEN_VENTANITA_DEPLOY_EVENT, this.onVentanitaDeploy);
    window.addEventListener(VOICE_IMAGEN_VENTANITA_COLLAPSE_EVENT, this.onVentanitaCollapse);

    const ventanita = document.querySelector('app-imagen .ventanita');
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
    this.imagenVoiceBridge.disconnect();
    window.removeEventListener(VOICE_IMAGEN_ACTION_EVENT, this.onImagenVoiceEvent);
    window.removeEventListener(VOICE_IMAGEN_VENTANITA_DEPLOY_EVENT, this.onVentanitaDeploy);
    window.removeEventListener(VOICE_IMAGEN_VENTANITA_COLLAPSE_EVENT, this.onVentanitaCollapse);
  }
}
