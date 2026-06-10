import { Component, OnDestroy, AfterViewInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeakableDirective } from '../../../directives/app-speakable';
import { ExplicacionService } from '../../../services/explicacion.service';
import { explicacionesEscuchar } from '../data/explicaciones-escuchar';
import {
  VOICE_ESCUCHAR_ACTION_EVENT,
  VoiceNavigationService,
  type EscucharVoiceDetail,
} from '../../../services/voice-navigation.service';
import { EscucharVoiceBridgeService } from '../../../services/escuchar-voice-bridge.service';
import { escucharDeviceHintLabel } from '../../../utils/audio-escuchar-voice';
import { voiceHintDisplay } from '../../../utils/voice-hint-display';

export interface Dispositivo {
  id: string;
  nombre: string;
  imagen: string;
  audio: string;
}

@Component({
  selector: 'app-escuchar',
  standalone: true,
  imports: [CommonModule, SpeakableDirective],
  templateUrl: './escuchar.html',
  styleUrls: ['./escuchar.scss'],
})
export class Escuchar implements AfterViewInit, OnDestroy {
  private explicacionService = inject(ExplicacionService);
  private escucharVoiceBridge = inject(EscucharVoiceBridgeService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  readonly voiceNav = inject(VoiceNavigationService);

  private readonly explicaciones = explicacionesEscuchar;

  textoIntro(): string {
    return this.explicaciones['introGaleria'][this.explicacionService.nivelActivo()];
  }

  textoDispositivo(id: string): string {
    return this.explicaciones[id][this.explicacionService.nivelActivo()];
  }

  pistaDispositivo(id: string): string {
    return escucharDeviceHintLabel(id);
  }

  pistaPlayGaleria(id: string): string {
    const nombre = this.pistaDispositivo(id);
    if (this.dispositivoSonando === id) {
      return `${voiceHintDisplay('pausar')} ${nombre}`;
    }
    return `${voiceHintDisplay('reproducir')} ${nombre}`;
  }

  pistaPlayDetalle(): string {
    return this.popupSonando ? voiceHintDisplay('pausar') : voiceHintDisplay('reproducir');
  }

  dispositivos: Dispositivo[] = [
    {
      id: 'fonografo',
      nombre: 'Fonógrafo',
      imagen: 'assets/imagenes/principal/fonografo.png',
      audio: 'assets/audio/audio/fonografo.mp3',
    },
    {
      id: 'gramofono',
      nombre: 'Gramófono',
      imagen: 'assets/imagenes/principal/gramofono.png',
      audio: 'assets/audio/audio/gramofono.mp3',
    },
    {
      id: 'radio',
      nombre: 'Radio AM',
      imagen: 'assets/imagenes/audio/radioAM.jpg',
      audio: 'assets/audio/audio/radioAM.mp3',
    },
    {
      id: 'cassette',
      nombre: 'Cassette',
      imagen: 'assets/imagenes/audio/cassette.jpg',
      audio: 'assets/audio/audio/cassette.mp3',
    },
    {
      id: 'cd',
      nombre: 'Disco Compacto',
      imagen: 'assets/imagenes/audio/cd.png',
      audio: 'assets/audio/audio/cd.mp3',
    },
    {
      id: 'carrete',
      nombre: 'Carrete Abierto',
      imagen: 'assets/imagenes/audio/grabadoraCarrete.jpg',
      audio: 'assets/audio/audio/grabadoraCarrete.mp3',
    },
  ];

  dispositivoSeleccionado: Dispositivo | null = null;
  dispositivoSonando: string | null = null;
  popupSonando = false;

  private audioActivo: HTMLAudioElement | null = null;
  private audioPopup: HTMLAudioElement | null = null;

  toggleAudio(dispositivo: Dispositivo, event: Event): void {
    event.stopPropagation();
    this.pararAudioPopup();

    const audioEl = document.getElementById(`audio-${dispositivo.id}`) as HTMLAudioElement;

    if (this.dispositivoSonando === dispositivo.id) {
      audioEl.pause();
      this.dispositivoSonando = null;
      this.audioActivo = null;
    } else {
      this.pararAudioActivo();
      audioEl.currentTime = 0;
      audioEl.play();
      this.audioActivo = audioEl;
      this.dispositivoSonando = dispositivo.id;
    }
    this.cdr.markForCheck();
  }

  onAudioEnded(id: string): void {
    if (this.dispositivoSonando === id) {
      this.dispositivoSonando = null;
      this.audioActivo = null;
      this.cdr.markForCheck();
    }
  }

  abrirInfo(dispositivo: Dispositivo): void {
    this.dispositivoSeleccionado = dispositivo;
    this.popupSonando = false;
    this.audioPopup = new Audio(dispositivo.audio);
    this.audioPopup.onended = () => {
      this.popupSonando = false;
      this.cdr.markForCheck();
    };
    this.cdr.markForCheck();
  }

  cerrarInfo(): void {
    this.pararAudioPopup();
    this.dispositivoSeleccionado = null;
    this.cdr.markForCheck();
  }

  toggleAudioPopup(): void {
    if (!this.audioPopup) return;

    if (this.popupSonando) {
      this.audioPopup.pause();
      this.popupSonando = false;
    } else {
      this.pararAudioActivo();
      this.audioPopup.currentTime = 0;
      this.audioPopup.play();
      this.popupSonando = true;
    }
    this.cdr.markForCheck();
  }

  voiceReproducir(deviceId: string): void {
    const d = this.dispositivos.find(item => item.id === deviceId);
    if (!d) return;
    if (this.dispositivoSeleccionado) this.cerrarInfo();
    this.pararAudioPopup();
    const audioEl = document.getElementById(`audio-${d.id}`) as HTMLAudioElement | null;
    if (!audioEl) return;
    if (this.dispositivoSonando === d.id) {
      audioEl.pause();
      this.dispositivoSonando = null;
      this.audioActivo = null;
    } else {
      this.pararAudioActivo();
      audioEl.currentTime = 0;
      void audioEl.play();
      this.audioActivo = audioEl;
      this.dispositivoSonando = d.id;
    }
    this.cdr.markForCheck();
  }

  voiceVerInfo(deviceId: string): void {
    const d = this.dispositivos.find(item => item.id === deviceId);
    if (d) this.abrirInfo(d);
  }

  voicePausar(deviceId?: string): void {
    if (deviceId) {
      if (this.dispositivoSonando === deviceId) {
        const audioEl = document.getElementById(`audio-${deviceId}`) as HTMLAudioElement | null;
        audioEl?.pause();
        this.dispositivoSonando = null;
        this.audioActivo = null;
      }
      this.cdr.markForCheck();
      return;
    }
    this.pararAudioActivo();
    this.pararAudioPopup();
    this.cdr.markForCheck();
  }

  voiceDetallePausar(): void {
    if (this.popupSonando) this.toggleAudioPopup();
  }

  private readonly handleEscucharVoice = (detail: EscucharVoiceDetail): void => {
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'reproducir':
          if (detail.deviceId) this.voiceReproducir(detail.deviceId);
          break;
        case 'pausar':
          this.voicePausar(detail.deviceId);
          break;
        case 'verInfo':
          if (detail.deviceId) this.voiceVerInfo(detail.deviceId);
          break;
        case 'detalleReproducir':
          if (!this.popupSonando) this.toggleAudioPopup();
          break;
        case 'detallePausar':
          this.voiceDetallePausar();
          break;
        case 'detalleCerrar':
          this.cerrarInfo();
          break;
      }
    });
  };

  private readonly onEscucharVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<EscucharVoiceDetail>).detail;
    if (detail?.action) this.handleEscucharVoice(detail);
  }) as EventListener;

  ngAfterViewInit(): void {
    this.escucharVoiceBridge.connect(this.handleEscucharVoice);
    window.addEventListener(VOICE_ESCUCHAR_ACTION_EVENT, this.onEscucharVoiceEvent);
  }

  ngOnDestroy(): void {
    this.escucharVoiceBridge.disconnect();
    window.removeEventListener(VOICE_ESCUCHAR_ACTION_EVENT, this.onEscucharVoiceEvent);
    this.pararAudioActivo();
    this.pararAudioPopup();
  }

  private pararAudioActivo(): void {
    if (this.audioActivo) {
      this.audioActivo.pause();
      this.audioActivo.currentTime = 0;
      this.audioActivo = null;
      this.dispositivoSonando = null;
    }
  }

  private pararAudioPopup(): void {
    if (this.audioPopup) {
      this.audioPopup.pause();
      this.audioPopup.currentTime = 0;
      this.audioPopup = null;
      this.popupSonando = false;
    }
  }
}
