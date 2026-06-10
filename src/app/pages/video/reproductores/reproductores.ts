import { Component, inject, computed, OnDestroy, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ColorService } from '../../../services/color.service';
import { UiStateService } from '../../../services/ui-state.service';
import { Popup } from '../../../componentes/popup/popup';
import { PopupThemeService } from '../../../services/popup-theme';
import { ExplicacionService } from '../../../services/explicacion.service';
import { explicaciones } from '../data/explicaciones-reproductores';
import { SpeakableDirective } from '../../../directives/app-speakable';
import {
  VOICE_REPRODUCTORES_ACTION_EVENT,
  VoiceNavigationService,
  type ReproductoresVoiceDetail,
} from '../../../services/voice-navigation.service';
import { ReproductoresVoiceBridgeService } from '../../../services/reproductores-voice-bridge.service';
import {
  reproductorHintLabel,
  type ReproductorClave,
} from '../../../utils/video-reproductores-voice';
import { voiceHintDisplay } from '../../../utils/voice-hint-display';

interface Dispositivo {
  clave: ReproductorClave;
  id: number;
  titulo: string;
  videoUrl: string;
  imagenUrl: string;
  nombreDispositivo: string;
  especificaciones: string[];
}

@Component({
  selector: 'app-reproductores',
  standalone: true,
  imports: [Popup, SpeakableDirective],
  templateUrl: './reproductores.html',
  styleUrl: './reproductores.scss'
})
export class Reproductores implements AfterViewInit, OnDestroy {
  private colorService = inject(ColorService);
  private popupThemes = inject(PopupThemeService);
  private reproductoresVoiceBridge = inject(ReproductoresVoiceBridgeService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  readonly voiceNav = inject(VoiceNavigationService);
  ui = inject(UiStateService);

  readonly hintAbajo = voiceHintDisplay('abajo');
  readonly hintAceptar = voiceHintDisplay('aceptar');

  dispositivos: Dispositivo[] = [
    {
      clave: 'zootropo',
      id: 1,
      titulo: 'Zootropo',
      videoUrl: 'assets/imagenes/video/zootropo.gif',
      imagenUrl: 'assets/imagenes/video/zootropo.jpeg',
      nombreDispositivo: 'Zootropo de Tambor',
      especificaciones: ['Año: 1834', 'Tipo: Óptico', 'Sin audio'],
    },
    {
      clave: 'cinematografo',
      id: 2,
      titulo: 'Lumiere',
      videoUrl: 'assets/imagenes/video/cinematografo.gif',
      imagenUrl: 'assets/imagenes/video/cinematografo.jpeg',
      nombreDispositivo: 'Cinematógrafo',
      especificaciones: ['Lente: 35mm', 'Manivela manual', '16 fps'],
    },
    {
      clave: 'camaraDeceluloide',
      id: 3,
      titulo: 'Cine Mudo',
      videoUrl: 'assets/imagenes/video/cineMudo.gif',
      imagenUrl: 'assets/imagenes/video/cineMudo.jpg',
      nombreDispositivo: 'Cámara de Celuloide',
      especificaciones: ['Soporte: Nitrato', 'Blanco y Negro', 'Formato 4:3'],
    }
  ];

  reproductorSeleccionado: Dispositivo | null = null;

  isPopupOpen = false;

  pistaVoz(clave: ReproductorClave): string {
    return reproductorHintLabel(clave);
  }

  abrir(reproductor: Dispositivo) {
    this.reproductorSeleccionado = reproductor;
    this.isPopupOpen = true;
    this.cdr.markForCheck();
  }

  abrirPorClave(clave: ReproductorClave): void {
    const d = this.dispositivos.find(item => item.clave === clave);
    if (d) this.abrir(d);
  }

  cerrar() {
    this.isPopupOpen = false;
    this.cdr.markForCheck();
  }

  videoTheme = computed(() => {
    const modo = this.colorService.colorActivo();
    if (modo === 'original') {
      return {
        overlayBg: 'rgba(0,0,0,0.85)',
        panelBg: '#f551a6',
        panelText: '#000000',
        borderColor: '#d53588',
        insetLight: '#ffffff',
        insetDark: '#a72a6b',
        titlebarBg: '#a72a6b',
        titlebarText: 'white',
        titlebarDivider: '#808080',
        closeBg: '#d53588',
        buttonBg: '#d53588',
        buttonBorderTop: '#fff',
        buttonBorderLeft: '#fff',
        buttonBorderBottom: '#a72a6b',
        buttonBorderRight: '#a72a6b',
        buttonActiveBg: '#d53588',
        buttonActiveBorderTop: '#a72a6b',
        buttonActiveBorderLeft: '#a72a6b',
        buttonActiveBorderBottom: '#fff',
        buttonActiveBorderRight: '#fff',
      };
    }
    return this.popupThemes[modo];
  });

  explicacionService = inject(ExplicacionService);
  explicaciones = explicaciones;

  texto(clave: string) {
    return this.explicaciones[clave][this.explicacionService.nivelActivo()];
  }

  private readonly handleReproductoresVoice = (detail: ReproductoresVoiceDetail): void => {
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'abrir':
          if (detail.clave) this.abrirPorClave(detail.clave);
          break;
        case 'cerrar':
          if (this.isPopupOpen) this.cerrar();
          break;
      }
    });
  };

  private readonly onReproductoresVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<ReproductoresVoiceDetail>).detail;
    if (detail?.action) this.handleReproductoresVoice(detail);
  }) as EventListener;

  ngAfterViewInit(): void {
    this.reproductoresVoiceBridge.connect(this.handleReproductoresVoice);
    window.addEventListener(VOICE_REPRODUCTORES_ACTION_EVENT, this.onReproductoresVoiceEvent);
  }

  ngOnDestroy(): void {
    this.reproductoresVoiceBridge.disconnect();
    window.removeEventListener(VOICE_REPRODUCTORES_ACTION_EVENT, this.onReproductoresVoiceEvent);
  }
}
