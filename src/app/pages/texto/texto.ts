import { Component, inject, computed, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { UiStateService } from '../../services/ui-state.service';

import { Popup } from '../../componentes/popup/popup';
import { CarruselTexto } from './carrusel-texto/carrusel-texto';

import { ColorService } from '../../services/color.service';
import { PopupThemeService } from '../../services/popup-theme';

import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

import { ExplicacionService } from '../../services/explicacion.service';
import { explicaciones } from '../../pages/texto/data/explicaciones';
import { getCarruselPopup } from '../../pages/texto/data/carrusel';
import {
  dispositivosTexto,
  explicacionesDispositivosTexto,
  DispositivoTexto,
} from '../../pages/texto/data/dispositivos-texto';
import { BlocNotas } from './bloc-notas/bloc-notas';
import { SpeakableDirective } from "../../directives/app-speakable";
import {
  VOICE_TEXTO_ACTION_EVENT,
  VoiceNavigationService,
  type TextoVoiceDetail,
} from '../../services/voice-navigation.service';
import { TextoVoiceBridgeService } from '../../services/texto-voice-bridge.service';

@Component({
  selector: 'app-texto',
  standalone: true,
  imports: [ScrollRevealDirective, NgIf, CarruselTexto, Popup, BlocNotas, SpeakableDirective],
  templateUrl: './texto.html',
  styleUrl: './texto.scss',
})
export class Texto implements AfterViewInit, OnDestroy {
  @ViewChild(BlocNotas) blocNotas?: BlocNotas;

  ui = inject(UiStateService);
  voiceNav = inject(VoiceNavigationService);
  private textoVoiceBridge = inject(TextoVoiceBridgeService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private colorService = inject(ColorService);
  private popupThemes = inject(PopupThemeService);
  explicacionService = inject(ExplicacionService);
  explicaciones = explicaciones;

  pistaVozDispositivo(clave: DispositivoTexto['clave']): string | null {
    if (clave === 'maquinaEscribir') return 'máquina';
    if (clave === 'kindle') return 'kindle';
    return null;
  }

  imagenPortada = this.ui.hoverSwap(
    'assets/imagenes/texto/portadaTexto.jpg',
    'assets/imagenes/texto/portadaTextoHover.jpg'
  );

  videoMaquina = 'assets/videos/texto/maquinaEscribir.webm';
  videoKindle = 'assets/videos/texto/kindle.webm';

  dispositivos: DispositivoTexto[] = dispositivosTexto;
  isDispositivoPopupOpen = false;
  dispositivoSeleccionado: DispositivoTexto | null = null;

  abrirDispositivo(d: DispositivoTexto) {
    this.dispositivoSeleccionado = d;
    this.isDispositivoPopupOpen = true;
  }

  cerrarDispositivo() {
    this.isDispositivoPopupOpen = false;
    this.dispositivoSeleccionado = null;
  }

  abrirDispositivoPorClave(clave: DispositivoTexto['clave']) {
    const d = this.dispositivos.find(item => item.clave === clave);
    if (d) this.abrirDispositivo(d);
  }

  private closeAllPopups(): void {
    this.closePopup();
    this.cerrarDispositivo();
  }

  private focusBlocNotas(instantScroll = false): void {
    const bloc = document.querySelector('app-bloc-notas');
    if (!bloc) return;
    bloc.scrollIntoView({ behavior: instantScroll ? 'auto' : 'smooth', block: 'center' });
    const ta = bloc.querySelector('textarea.area-texto');
    if (ta instanceof HTMLTextAreaElement) {
      requestAnimationFrame(() => ta.focus({ preventScroll: true }));
    }
  }

  private readonly handleTextoVoice = (detail: TextoVoiceDetail): void => {
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'blocEscribir':
          this.focusBlocNotas();
          this.blocNotas?.appendVoiceText(detail.text ?? '');
          break;
        case 'blocGuardar':
          this.focusBlocNotas();
          this.blocNotas?.guardar();
          break;
        case 'blocLimpiar':
          this.focusBlocNotas(true);
          this.blocNotas?.limpiar();
          break;
        case 'evolucionAbrir':
          this.openCarouselPopup();
          break;
        case 'maquinaAbrir':
          this.abrirDispositivoPorClave('maquinaEscribir');
          break;
        case 'kindleAbrir':
          this.abrirDispositivoPorClave('kindle');
          break;
        case 'cerrar':
          this.closeAllPopups();
          break;
        case 'siguientePagina':
          this.siguientePagina();
          break;
      }
      this.cdr.markForCheck();
    });
  };

  private readonly onTextoVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<TextoVoiceDetail>).detail;
    if (detail?.action) this.handleTextoVoice(detail);
  }) as EventListener;

  ngAfterViewInit(): void {
    this.textoVoiceBridge.connect(this.handleTextoVoice);
    window.addEventListener(VOICE_TEXTO_ACTION_EVENT, this.onTextoVoiceEvent);
  }

  ngOnDestroy(): void {
    this.textoVoiceBridge.disconnect();
    window.removeEventListener(VOICE_TEXTO_ACTION_EVENT, this.onTextoVoiceEvent);
  }

  textoDispositivo(clave: DispositivoTexto['clave']): string {
    const nivel = this.explicacionService.nivelActivo();
    return explicacionesDispositivosTexto[clave][nivel];
  }

  readonly h1Colors = { daltonismo1: '#dc267f', daltonismo2: '#8c8c8c' };

  carruselItems = [
    { src: 'assets/imagenes/texto/maquinaMecanica.jpg',    hover: null,                                              title: 'Máquina de escribir mecánica - siglo XIX' },
    { src: 'assets/imagenes/texto/maquinaElectrica.jpg',   hover: null,                                              title: 'Máquina de escribir eléctrica - mediados siglo XX' },
    { src: 'assets/imagenes/texto/teletipo.jpg',           hover: null,                                              title: 'Teletipo - 1920s-1960s' },
    { src: 'assets/imagenes/texto/linotipia.jpg',          hover: null,                                              title: 'Linotipia y fotocomposición - finales s. XIX - s. XX' },
    { src: 'assets/imagenes/texto/perforadora.jpeg',       hover: null,                                              title: 'Ordenador de tarjetas perforadas - 1930s-1950s' },
    { src: 'assets/imagenes/texto/vt100.jpg',              hover: null,                                              title: 'Terminales de texto (VT100 y similares) - 1970s' },
    { src: 'assets/imagenes/texto/procesadorTexto.png',    hover: null,                                              title: 'Procesadores de texto dedicados - 1970s-1980s' },
    { src: 'assets/imagenes/texto/impresoraMatricial.png', hover: null,                                              title: 'Impresoras matriciales y láser - 1970s-1980s' },
    { src: 'assets/imagenes/texto/macintosh.jpg',          hover: null,                                              title: 'Ordenadores personales (IBM PC, Apple II, Macintosh) - 1980s' },
    { src: 'assets/imagenes/texto/disquetes.jpg',          hover: null,                                              title: 'Disquetes y CD-ROM - 1980s-1990s' },
    { src: 'assets/imagenes/texto/http.jpg',               hover: null,                                              title: 'Hipertexto y HTML (World Wide Web) - 1990s' },
    { src: 'assets/imagenes/texto/ebook.jpg',              hover: null,                                              title: 'E-books y lectores digitales (Kindle, Sony Reader) - 2000s' },
    { src: 'assets/imagenes/texto/smartphonesTablets.jpg', hover: null,                                              title: 'Smartphones y tablets - 2007 en adelante' },
    { src: 'assets/imagenes/texto/asistenteVirtual.jpg',   hover: null,                                              title: 'Asistentes virtuales y dictado por voz - 2010s' },
    { src: 'assets/imagenes/texto/ia.png',                 hover: null,                                              title: 'Plataformas colaborativas y multimedia - actualidad' },
  ];

  get carruselPopup() {
    return getCarruselPopup(this.explicacionService.nivelActivo());
  }

  isPopupOpen = false;
  popupCarouselIndex = 0;

  openCarouselPopup(startIndex = 0) {
    this.popupCarouselIndex = startIndex;
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
  }

  onPopupCarouselIndexChange(newIndex: number) {
    this.popupCarouselIndex = newIndex;
  }

  carruselTheme = computed(() => {
    const modo = this.colorService.colorActivo();
    if (modo === 'original') {
      return {
        overlayBg: 'rgba(0,0,0,0.85)',
        panelBg: '#50b965',
        panelText: '#000000',
        borderColor: '#00a822',
        insetLight: '#ffffff',
        insetDark: '#004f10',
        titlebarBg: '#1a6b62',
        titlebarText: 'white',
        titlebarDivider: '#808080',
        closeBg: '#00ca28',
        buttonBg: '#00a822',
        buttonBorderTop: '#fff',
        buttonBorderLeft: '#fff',
        buttonBorderBottom: '#004f10',
        buttonBorderRight: '#004f10',
        buttonActiveBg: '#00ca28',
        buttonActiveBorderTop: '#004f10',
        buttonActiveBorderLeft: '#004f10',
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
    this.router.navigate(['/audio']);
  }

  texto(clave: string) {
    return this.explicaciones[clave][this.explicacionService.nivelActivo()];
  }
}
