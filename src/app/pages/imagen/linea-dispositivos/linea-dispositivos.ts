import { Component, inject, OnDestroy, AfterViewInit, NgZone, ChangeDetectorRef, signal } from '@angular/core';
import { UiStateService } from '../../../services/ui-state.service';
import {
  VOICE_IMAGEN_TIMELINE_COLLAPSE_EVENT,
  VOICE_IMAGEN_TIMELINE_DEPLOY_EVENT,
  VOICE_LINEA_ACTION_EVENT,
} from '../../../utils/imagen-voice-dom';
import {
  VoiceNavigationService,
  type LineaVoiceDetail,
} from '../../../services/voice-navigation.service';
import { LineaVoiceBridgeService } from '../../../services/linea-voice-bridge.service';
import { lineaDeviceHintLabel } from '../../../utils/imagen-linea-voice';
import { ExplicacionService } from '../../../services/explicacion.service';
import { explicacionesLinea } from '../data/explicaciones-linea';
import { SpeakableDirective } from '../../../directives/app-speakable';

interface Dispositivo {
  clave: string;
  nombre: string;
  anio: string;
  dispositivoImg: string;
  dispositivoImgHover: string;
}

@Component({
  selector: 'app-linea-dispositivos',
  standalone: true,
  imports: [SpeakableDirective],
  templateUrl: './linea-dispositivos.html',
  styleUrls: ['./linea-dispositivos.scss']
})
export class LineaDispositivos implements AfterViewInit, OnDestroy {
  ui = inject(UiStateService);
  readonly voiceNav = inject(VoiceNavigationService);
  private lineaVoiceBridge = inject(LineaVoiceBridgeService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  dispositivos: Dispositivo[] = [
    {
      clave: 'camaraRollo',
      nombre: 'Cámara de rollo Kodak',
      anio: '1888',
      dispositivoImg: 'assets/imagenes/imagen/kodak.jpg',
      dispositivoImgHover: 'assets/imagenes/imagen/kodakHover.jpg'
    },
    {
      clave: 'fotografiaDigital',
      nombre: 'Fotografía Digital',
      anio: '1975',
      dispositivoImg: 'assets/imagenes/imagen/kodakPrimeraDigital.jpg',
      dispositivoImgHover: 'assets/imagenes/imagen/kodakPrimeraDigitalHover.jpg'
    },
    {
      clave: 'smartphone',
      nombre: 'Smartphone',
      anio: '2007',
      dispositivoImg: 'assets/imagenes/imagen/smartphone.jpg',
      dispositivoImgHover: 'assets/imagenes/imagen/smartphoneHover.jpg'
    },
    {
      clave: 'redesSociales',
      nombre: 'Redes sociales',
      anio: '2010+',
      dispositivoImg: 'assets/imagenes/imagen/redesSociales.jpg',
      dispositivoImgHover: 'assets/imagenes/imagen/redesSocialesHover.jpg'
    },
  ];

  dispositivoSeleccionado: Dispositivo | null = null;
  readonly lineaVozActiva = signal(false);
  private hideTimer?: ReturnType<typeof setTimeout>;

  seleccionar(dispositivo: Dispositivo) {
    clearTimeout(this.hideTimer);
    this.dispositivoSeleccionado = dispositivo;
  }

  seleccionarPorClave(clave: string) {
    const d = this.dispositivos.find(x => x.clave === clave);
    if (d) this.seleccionar(d);
  }

  pistaVoz(clave: string): string {
    return lineaDeviceHintLabel(clave);
  }

  deseleccionar() {
    if (this.lineaVozActiva()) return;
    this.hideTimer = setTimeout(() => {
      this.hideTimer = undefined;
      this.dispositivoSeleccionado = null;
    }, 200);
  }

  explicacionService = inject(ExplicacionService);
  explicaciones = explicacionesLinea;

  texto(clave: string) {
    return this.explicaciones[clave][this.explicacionService.nivelActivo()];
  }

  isMobile = () => window.innerWidth <= 850;

  toggleSeleccion(dispositivo: any) {
    if (this.dispositivoSeleccionado === dispositivo) {
      this.deseleccionar();
    } else {
      this.seleccionar(dispositivo);
    }
  }

  onFocusOut(event: FocusEvent) {
    if (this.lineaVozActiva() || this.isMobile()) return;
    const next = event.relatedTarget as Node | null;
    const wrapper = event.currentTarget as HTMLElement | null;
    if (next && wrapper?.contains(next)) return;
    this.deseleccionar();
  }

  private readonly onVoiceTimelineDeploy = () => {
    this.ngZone.run(() => {
      clearTimeout(this.hideTimer);
      this.lineaVozActiva.set(true);
      if (this.dispositivos.length) {
        this.dispositivoSeleccionado = this.dispositivos[0];
      }
      this.cdr.markForCheck();
    });
  };

  private readonly onVoiceTimelineCollapse = () => {
    this.ngZone.run(() => {
      clearTimeout(this.hideTimer);
      this.lineaVozActiva.set(false);
      this.dispositivoSeleccionado = null;
      this.cdr.markForCheck();
    });
  };

  private readonly handleLineaVoice = (detail: LineaVoiceDetail) => {
    this.ngZone.run(() => {
      if (detail.action === 'seleccionar' && detail.clave) {
        this.seleccionarPorClave(detail.clave);
      }
      this.cdr.markForCheck();
    });
  };

  private readonly onLineaVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<LineaVoiceDetail>).detail;
    if (detail?.action) this.handleLineaVoice(detail);
  }) as EventListener;

  ngAfterViewInit(): void {
    window.addEventListener(VOICE_IMAGEN_TIMELINE_DEPLOY_EVENT, this.onVoiceTimelineDeploy);
    window.addEventListener(VOICE_IMAGEN_TIMELINE_COLLAPSE_EVENT, this.onVoiceTimelineCollapse);
    this.lineaVoiceBridge.connect(this.handleLineaVoice);
    window.addEventListener(VOICE_LINEA_ACTION_EVENT, this.onLineaVoiceEvent);
  }

  ngOnDestroy(): void {
    window.removeEventListener(VOICE_IMAGEN_TIMELINE_DEPLOY_EVENT, this.onVoiceTimelineDeploy);
    window.removeEventListener(VOICE_IMAGEN_TIMELINE_COLLAPSE_EVENT, this.onVoiceTimelineCollapse);
    this.lineaVoiceBridge.disconnect();
    window.removeEventListener(VOICE_LINEA_ACTION_EVENT, this.onLineaVoiceEvent);
    clearTimeout(this.hideTimer);
  }
}