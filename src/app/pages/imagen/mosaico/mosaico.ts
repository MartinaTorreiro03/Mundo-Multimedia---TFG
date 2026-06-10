import { Component, inject, computed, OnDestroy, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { NgStyle } from '@angular/common';
import { Popup } from '../../../componentes/popup/popup';
import { ColorService } from '../../../services/color.service';
import { PopupThemeService } from '../../../services/popup-theme';
import { UiStateService } from '../../../services/ui-state.service';
import {
  VOICE_MOSAICO_ACTION_EVENT,
  VoiceNavigationService,
  type MosaicoVoiceDetail,
} from '../../../services/voice-navigation.service';
import { MosaicoVoiceBridgeService } from '../../../services/mosaico-voice-bridge.service';
import { mosaicoItemHintLabel } from '../../../utils/imagen-mosaico-voice';
import { ExplicacionService } from '../../../services/explicacion.service';
import { explicacionesDispositivos } from '../data/explicaciones-mosaico';
import { SpeakableDirective } from '../../../directives/app-speakable';

interface Fotografia {
  clave: string;
  tipo: string;
  dispositivo: string;
  dispositivoImg: string;
  urlImagen: string;
  urlImagenHover: string;
  alt: string;
}

@Component({
  selector: 'app-mosaico',
  standalone: true,
  imports: [Popup, SpeakableDirective, NgStyle],
  templateUrl: './mosaico.html',
  styleUrls: ['./mosaico.scss']
})
export class Mosaico implements AfterViewInit, OnDestroy {
  private colorService = inject(ColorService);
  private popupThemes = inject(PopupThemeService);
  private mosaicoVoiceBridge = inject(MosaicoVoiceBridgeService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  ui = inject(UiStateService);
  readonly voiceNav = inject(VoiceNavigationService);

  fotos: Fotografia[] = [
    {
      clave: 'daguerrotipo',
      tipo: 'daguerrotipo',
      dispositivo: 'Cámara Daguerrotipo - 1840',
      dispositivoImg: 'assets/imagenes/imagen/daguerrotipo.jpg',
      urlImagen: 'assets/imagenes/imagen/fotografiaDaguerrotipo.jpg',
      urlImagenHover: 'assets/imagenes/imagen/fotografiaDaguerrotipoHover.jpg',
      alt: 'Daguerrotipo'
    },
    {
      clave: 'kodakBrownie',
      tipo: 'kodak brownie',
      dispositivo: 'Cámara Kodak Brownie - 1900',
      dispositivoImg: 'assets/imagenes/imagen/kodakBrownie.jpg',
      urlImagen: 'assets/imagenes/imagen/fotografiaKodak.jpg',
      urlImagenHover: 'assets/imagenes/imagen/fotografiaKodakHover.jpg',
      alt: 'Kodak Brownie'
    },
    {
      clave: 'kodakCarousel',
      tipo: 'kodak carousel',
      dispositivo: 'Proyector Kodak Carousel - 1960',
      dispositivoImg: 'assets/imagenes/imagen/kodakCarousel.jpg',
      urlImagen: 'assets/imagenes/imagen/diapositivasKodakCarousel.jpg',
      urlImagenHover: 'assets/imagenes/imagen/diapositivasKodakCarouselHover.jpg',
      alt: 'Kodak Carousel'
    },
    {
      clave: 'polaroidSX70',
      tipo: 'polaroid',
      dispositivo: 'Polaroid SX-70 - 1970',
      dispositivoImg: 'assets/imagenes/imagen/polaroid.jpg',
      urlImagen: 'assets/imagenes/imagen/fotografiaPolaroid.jpg',
      urlImagenHover: 'assets/imagenes/imagen/fotografiaPolaroidHover.jpg',
      alt: 'Polaroid SX-70'
    },    
  ];

  fotoSeleccionada: Fotografia | null = null;

  isPopupOpen = false;

  abrir(foto: Fotografia) {
    this.fotoSeleccionada = foto;
    this.isPopupOpen = true;
  }

  abrirPorClave(clave: string) {
    const foto = this.fotos.find(f => f.clave === clave);
    if (foto) this.abrir(foto);
  }

  cerrar() {
    this.isPopupOpen = false;
    this.fotoSeleccionada = null;
  }

  pistaVoz(clave: string): string {
    return mosaicoItemHintLabel(clave);
  }

  private readonly handleMosaicoVoice = (detail: MosaicoVoiceDetail): void => {
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'abrir':
          if (detail.clave) this.abrirPorClave(detail.clave);
          break;
        case 'cerrar':
          this.cerrar();
          break;
      }
      this.cdr.markForCheck();
    });
  };

  private readonly onMosaicoVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<MosaicoVoiceDetail>).detail;
    if (detail?.action) this.handleMosaicoVoice(detail);
  }) as EventListener;

  ngAfterViewInit(): void {
    this.mosaicoVoiceBridge.connect(this.handleMosaicoVoice);
    window.addEventListener(VOICE_MOSAICO_ACTION_EVENT, this.onMosaicoVoiceEvent);
  }

  ngOnDestroy(): void {
    this.mosaicoVoiceBridge.disconnect();
    window.removeEventListener(VOICE_MOSAICO_ACTION_EVENT, this.onMosaicoVoiceEvent);
  }

  imagenTheme = computed(() => {
    const modo = this.colorService.colorActivo();
    if (modo === 'original') {
      return {
        overlayBg: 'rgba(0,0,0,0.85)',
        panelBg: '#c93e3e',
        panelText: '#000000',
        borderColor: '#d00000',
        insetLight: '#ffffff',
        insetDark: '#8d0101',
        titlebarBg: '#8d0101',
        titlebarText: 'white',
        titlebarDivider: '#808080',
        closeBg: '#d00000',
        buttonBg: '#d00000',
        buttonBorderTop: '#fff',
        buttonBorderLeft: '#fff',
        buttonBorderBottom: '#8d0101',
        buttonBorderRight: '#8d0101',
        buttonActiveBg: '#d00000',
        buttonActiveBorderTop: '#8d0101',
        buttonActiveBorderLeft: '#8d0101',
        buttonActiveBorderBottom: '#fff',
        buttonActiveBorderRight: '#fff',
      };
    }
    return this.popupThemes[modo];
  });

  private getThemeVars(theme: {
    panelBg?: string;
    borderColor?: string;
    insetLight?: string;
    insetDark?: string;
    titlebarBg?: string;
  }) {
    return {
      '--mosaico-bg': theme.panelBg ?? '#c0c0c0',
      '--mosaico-border-light': theme.insetLight ?? '#dfdfdf',
      '--mosaico-border-dark': theme.insetDark ?? '#808080',
      '--mosaico-title-bg': theme.titlebarBg ?? '#8d0101',
      '--mosaico-border-color': theme.borderColor ?? '#808080',
    };
  }

  mosaicoBaseVars = computed(() => {
    const modo = this.colorService.colorActivo();
    if (modo === 'original') {
      return this.getThemeVars({
        panelBg: '#c0c0c0',
        borderColor: '#808080',
        insetLight: '#dfdfdf',
        insetDark: '#808080',
      });
    }
    return this.getThemeVars(this.popupThemes[modo]);
  });

  popupVars = computed(() => {
    const modo = this.colorService.colorActivo();
    if (modo === 'original') {
      return this.getThemeVars({
        panelBg: '#c0c0c0',
        borderColor: '#808080',
        insetLight: '#dfdfdf',
        insetDark: '#808080',
        titlebarBg: '#8d0101',
      });
    }
    return this.getThemeVars(this.popupThemes[modo]);
  });

  explicacionService = inject(ExplicacionService);
  explicaciones = explicacionesDispositivos;

  texto(clave: string) {
    return this.explicaciones[clave][this.explicacionService.nivelActivo()];
  }
}