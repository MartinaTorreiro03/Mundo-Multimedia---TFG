import { Component, OnDestroy, AfterViewInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeakableDirective } from '../../../directives/app-speakable';
import {
  VOICE_EXPLORAR_ACTION_EVENT,
  VoiceNavigationService,
  type ExplorarVoiceDetail,
} from '../../../services/voice-navigation.service';
import { ExplorarVoiceBridgeService } from '../../../services/explorar-voice-bridge.service';
import { explorarItemHintLabel } from '../../../utils/audio-explorar-voice';
import { voiceHintDisplay } from '../../../utils/voice-hint-display';

export interface Dispositivo {
  id: string;
  nombre: string;
  imagen: string;
  audio: string;
}

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, SpeakableDirective],
  templateUrl: './explorar.html',
  styleUrls: ['./explorar.scss'],
})
export class Explorar implements AfterViewInit, OnDestroy {
  private explorarVoiceBridge = inject(ExplorarVoiceBridgeService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  readonly voiceNav = inject(VoiceNavigationService);

  dispositivos: Dispositivo[] = [
    {
      id: 'minecraft',
      nombre: 'Minecraft',
      imagen: 'assets/imagenes/audio/maincra.png',
      audio: 'assets/audio/audio/maincra.mp3',
    },
    {
      id: 'caperucita',
      nombre: 'Caperucita Roja',
      imagen: 'assets/imagenes/audio/caperucitaRoja.jpg',
      audio: 'assets/audio/audio/caperucitaRoja.mp3',
    },
    {
      id: 'movil',
      nombre: 'Teléfono Móvil',
      imagen: 'assets/imagenes/audio/movil.png',
      audio: 'assets/audio/audio/notificacion.mp3',
    },
    {
      id: 'netflix',
      nombre: 'Netflix',
      imagen: 'assets/imagenes/audio/netflix.jpg',
      audio: 'assets/audio/audio/netflix.mp3',
    },
  ];

  dispositivoSonando: string | null = null;

  private audioActivo: HTMLAudioElement | null = null;

  pistaPlay(itemId: string): string {
    const nombre = explorarItemHintLabel(itemId);
    if (this.dispositivoSonando === itemId) {
      return `${voiceHintDisplay('pausar')} ${nombre}`;
    }
    return `${voiceHintDisplay('reproducir')} ${nombre}`;
  }

  toggleAudio(dispositivo: Dispositivo, event: Event): void {
    event.stopPropagation();
    this.toggleAudioById(dispositivo.id);
  }

  toggleAudioById(id: string): void {
    if (this.dispositivoSonando === id) {
      this.pausarPorId(id);
    } else {
      this.reproducirPorId(id);
    }
  }

  reproducirPorId(id: string): void {
    const dispositivo = this.dispositivos.find(d => d.id === id);
    if (!dispositivo) return;
    if (this.dispositivoSonando === id) return;

    const audioEl = document.getElementById(`audio-${dispositivo.id}`) as HTMLAudioElement | null;
    if (!audioEl) return;

    this.pararAudioActivo();
    audioEl.currentTime = 0;
    void audioEl.play();
    this.audioActivo = audioEl;
    this.dispositivoSonando = dispositivo.id;
    this.cdr.markForCheck();
  }

  private pausarPorId(id: string): void {
    if (this.dispositivoSonando !== id) return;
    const audioEl = document.getElementById(`audio-${id}`) as HTMLAudioElement | null;
    audioEl?.pause();
    this.dispositivoSonando = null;
    this.audioActivo = null;
    this.cdr.markForCheck();
  }

  voicePausar(itemId?: string): void {
    if (itemId) {
      this.pausarPorId(itemId);
      return;
    }
    this.pararAudioActivo();
    this.cdr.markForCheck();
  }

  onAudioEnded(id: string): void {
    if (this.dispositivoSonando === id) {
      this.dispositivoSonando = null;
      this.audioActivo = null;
    }
  }

  private readonly handleExplorarVoice = (detail: ExplorarVoiceDetail): void => {
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'reproducir':
          if (detail.itemId) this.reproducirPorId(detail.itemId);
          break;
        case 'pausar':
          this.voicePausar(detail.itemId);
          break;
      }
    });
  };

  private readonly onExplorarVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<ExplorarVoiceDetail>).detail;
    if (detail?.action) this.handleExplorarVoice(detail);
  }) as EventListener;

  ngAfterViewInit(): void {
    this.explorarVoiceBridge.connect(this.handleExplorarVoice);
    window.addEventListener(VOICE_EXPLORAR_ACTION_EVENT, this.onExplorarVoiceEvent);
  }

  ngOnDestroy(): void {
    this.explorarVoiceBridge.disconnect();
    window.removeEventListener(VOICE_EXPLORAR_ACTION_EVENT, this.onExplorarVoiceEvent);
    this.pararAudioActivo();
  }

  private pararAudioActivo(): void {
    if (this.audioActivo) {
      this.audioActivo.pause();
      this.audioActivo.currentTime = 0;
      this.audioActivo = null;
      this.dispositivoSonando = null;
    }
  }
}
