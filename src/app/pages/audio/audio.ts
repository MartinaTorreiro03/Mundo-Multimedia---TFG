import { Component, inject, computed, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgIf } from '@angular/common';
import { UiStateService } from '../../services/ui-state.service';
import { Router } from '@angular/router';

import { ColorService } from '../../services/color.service';
import { PopupThemeService } from '../../services/popup-theme';
import { Popup } from '../../componentes/popup/popup';
import { Escuchar } from './escuchar/escuchar';
import { CarruselAudio } from './carrusel-audio/carrusel-audio';
import { Explorar } from './explorar/explorar';

import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

import { ExplicacionService } from '../../services/explicacion.service';
import { explicaciones } from './data/explicaciones';
import {
  dispositivosAudio,
  explicacionesDispositivosAudio,
  DispositivoAudio,
} from './data/dispositivos-audio';
import { SpeakableDirective } from '../../directives/app-speakable';
import {
  VOICE_AUDIO_ACTION_EVENT,
  VoiceNavigationService,
  type AudioVoiceDetail,
} from '../../services/voice-navigation.service';
import { AudioVoiceBridgeService } from '../../services/audio-voice-bridge.service';
import { voiceHintDisplay } from '../../utils/voice-hint-display';

@Component({
  selector: 'app-audio',
  standalone: true,
  imports: [ScrollRevealDirective, NgIf, Popup, Escuchar, CarruselAudio, Explorar, SpeakableDirective],
  templateUrl: './audio.html',
  styleUrl: './audio.scss',
})
export class Audio implements AfterViewInit, OnDestroy {
  ui = inject(UiStateService);
  voiceNav = inject(VoiceNavigationService);
  private audioVoiceBridge = inject(AudioVoiceBridgeService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private colorService = inject(ColorService);
  private popupThemes = inject(PopupThemeService);
  explicacionService = inject(ExplicacionService);
  explicaciones = explicaciones;

  readonly hint = voiceHintDisplay;

  imagenPortada = this.ui.hoverSwap(
    'assets/imagenes/audio/portadaAudio.jpg',
    'assets/imagenes/audio/portadaAudioHover.jpg'
  );

  imagenSeccion1 = this.ui.hoverSwap(
    'assets/imagenes/audio/ondaSonido.jpg',
    'assets/imagenes/audio/ondaSonidoHover.jpg'
  );

  imagenSeccion3 = this.ui.hoverSwap(
    'assets/imagenes/audio/cascos.png',
    'assets/imagenes/audio/cascosHover.png'
  );

  dispositivos: DispositivoAudio[] = dispositivosAudio;
  isDispositivoPopupOpen = false;
  dispositivoSeleccionado: DispositivoAudio | null = null;

  abrirDispositivo(d: DispositivoAudio) {
    this.dispositivoSeleccionado = d;
    this.isDispositivoPopupOpen = true;
  }

  cerrarDispositivo() {
    this.isDispositivoPopupOpen = false;
    this.dispositivoSeleccionado = null;
  }

  abrirDispositivoPorClave(clave: DispositivoAudio['clave']) {
    const d = this.dispositivos.find(item => item.clave === clave);
    if (d) this.abrirDispositivo(d);
  }

  pistaVozDispositivo(clave: DispositivoAudio['clave']): string | null {
    if (clave === 'walkman') return this.hint('walkman');
    if (clave === 'altavoz') return this.hint('altavoz');
    return null;
  }

  textoDispositivo(clave: DispositivoAudio['clave']): string {
    const nivel = this.explicacionService.nivelActivo();
    return explicacionesDispositivosAudio[clave][nivel];
  }

  readonly h1Colors = { daltonismo1: '#000', daltonismo2: '#000' };

  isPopupOpen = false;
  activePopup: 'escuchar' | 'explorar' | null = null;

  openPopup(popup: 'escuchar' | 'explorar') {
    this.activePopup = popup;
  }

  closePopup() {
    this.activePopup = null;
  }

  private closeAllPopups(): void {
    this.closePopup();
    this.cerrarDispositivo();
  }

  escuchaTheme = computed(() => {
    const modo = this.colorService.colorActivo();
    if (modo === 'original') {
      return {
        overlayBg: 'rgba(0,0,0,0.85)',
        panelBg: '#137ccc',
        panelText: '#000000',
        borderColor: '#0088ef',
        insetLight: '#ffffff',
        insetDark: '#005595',
        titlebarBg: '#004b85',
        titlebarText: 'white',
        titlebarDivider: '#808080',
        closeBg: '#0088ef',
        buttonBg: '#0088ef',
        buttonBorderTop: '#fff',
        buttonBorderLeft: '#fff',
        buttonBorderBottom: '#005595',
        buttonBorderRight: '#005595',
        buttonActiveBg: '#0088ef',
        buttonActiveBorderTop: '#005595',
        buttonActiveBorderLeft: '#005595',
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
    this.router.navigate(['/imagen']);
  }

  texto(clave: string) {
    return this.explicaciones[clave][this.explicacionService.nivelActivo()];
  }

  private readonly handleAudioVoice = (detail: AudioVoiceDetail): void => {
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'escucharAbrir':
          this.openPopup('escuchar');
          break;
        case 'explorarAbrir':
          this.openPopup('explorar');
          break;
        case 'walkmanAbrir':
          this.abrirDispositivoPorClave('walkman');
          break;
        case 'altavozAbrir':
          this.abrirDispositivoPorClave('altavoz');
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

  private readonly onAudioVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<AudioVoiceDetail>).detail;
    if (detail?.action) this.handleAudioVoice(detail);
  }) as EventListener;

  ngAfterViewInit(): void {
    this.audioVoiceBridge.connect(this.handleAudioVoice);
    window.addEventListener(VOICE_AUDIO_ACTION_EVENT, this.onAudioVoiceEvent);
  }

  ngOnDestroy(): void {
    this.audioVoiceBridge.disconnect();
    window.removeEventListener(VOICE_AUDIO_ACTION_EVENT, this.onAudioVoiceEvent);
  }
}
