import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  isAudioDispositivoPopupOpen,
  isAudioEscucharDetalleOpen,
  isAudioEscucharPopupOpen,
  isAudioExplorarPopupOpen,
  isCarruselPopupOpen,
  isImagenDispositivoPopupOpen,
  isImagenMosaicoPopupOpen,
  isJuegoPopupOpen,
  isTextoCarruselPopupOpen,
  isTextoDispositivoPopupOpen,
  isVideoDispositivoPopupOpen,
  isVideoReproductoresPopupOpen,
  isMusicaDispositivoPopupOpen,
  isAudiovisualDispositivoPopupOpen,
  isInteractividadDispositivoPopupOpen,
} from '../utils/popup-dom';
import { parseMosaicoOpenCommand } from '../utils/imagen-mosaico-voice';
import { parseLineaSelectCommand } from '../utils/imagen-linea-voice';
import {
  isFiltrosEditorInViewport,
  parseFiltrosVoiceCommands,
  type FiltrosVoiceParsed,
} from '../utils/imagen-filtros-voice';
import {
  isImagenVentanitaInViewport,
  parseImagenVentanitaOpenCommand,
} from '../utils/imagen-ventanita-voice';
import { VOICE_IMAGEN_ACTION_EVENT } from '../utils/imagen-voice-dom';
import { IMAGEN_VOICE_STEP_ATTR } from '../utils/imagen-voice-dom';
import { isTextoBlocOnPage } from '../utils/texto-voice-dom';
import {
  hasEscucharPauseIntent,
  isBarePlayInDetalleCommand,
  matchEscucharDeviceId,
  parseEscucharGalleryCommand,
  parseEscucharGalleryPauseCommand,
} from '../utils/audio-escuchar-voice';
import {
  parseExplorarGalleryPauseCommand,
  parseExplorarPlayCommand,
} from '../utils/audio-explorar-voice';
import {
  hasAceptarVoiceCommand,
  parseReproductoresOpenCommand,
  type ReproductorClave,
} from '../utils/video-reproductores-voice';
import {
  hasMediaDeckPausarCommand,
  hasMediaDeckReproducirCommand,
  hasMediaDeckVolumenCommand,
  parseMediaDeckFormatoCommand,
  type MediaDeckFormatoId,
} from '../utils/video-media-deck-voice';
import {
  parseInmersivoFlechaCommand,
  type InmersivoFlechaId,
} from '../utils/video-inmersivo-voice';
import {
  isVideoVentanitaInViewport,
  parseVideoVentanitaOpenCommand,
} from '../utils/video-ventanita-voice';
import { VIDEO_VOICE_STEP_ATTR, VOICE_VIDEO_ACTION_EVENT } from '../utils/video-voice-dom';
import { MUSICA_VOICE_STEP_ATTR, VOICE_MUSICA_PAGE_ACTION_EVENT } from '../utils/musica-voice-dom';
import {
  isMusicaVentanitaInViewport,
  parseMusicaVentanitaOpenCommand,
} from '../utils/musica-ventanita-voice';
import { MusicaVoiceBridgeService } from './musica-voice-bridge.service';
import {
  parseInstrumentoPlayCommand,
  parseInstrumentoSelectCommand,
} from '../utils/musica-instrumentos-voice';
import {
  parseEvolucionControlCommand,
  parseEvolucionEraCommand,
} from '../utils/musica-evolucion-voice';
import { InstrumentosVoiceBridgeService } from './instrumentos-voice-bridge.service';
import { EvolucionVoiceBridgeService } from './evolucion-voice-bridge.service';
import {
  parseMesaMezclasVoiceCommands,
  type MesaMezclasVoiceParsed,
} from '../utils/musica-mesa-mezclas-voice';
import { MesaMezclasVoiceBridgeService } from './mesa-mezclas-voice-bridge.service';
import {
  AUDIOVISUAL_VOICE_STEP_ATTR,
  VOICE_COMPARACION_ACTION_EVENT,
  VOICE_SINTONIZADOR_ACTION_EVENT,
  VOICE_COLLAGE_ACTION_EVENT,
  VOICE_AUDIOVISUAL_PAGE_ACTION_EVENT,
} from '../utils/audiovisual-voice-dom';
import { parseAudiovisualVentanitaOpenCommand, isAudiovisualVentanitaInViewport } from '../utils/audiovisual-ventanita-voice';
import {
  parseComparacionVoiceCommands,
  type ComparacionVoiceParsed,
} from '../utils/audiovisual-comparacion-voice';
import {
  parseSintonizadorVoiceCommands,
  type SintonizadorVoiceParsed,
} from '../utils/audiovisual-sintonizador-voice';
import {
  parseCollageVoiceCommands,
  type CollageVoiceParsed,
} from '../utils/audiovisual-collage-voice';
import { ComparacionVoiceBridgeService } from './comparacion-voice-bridge.service';
import { SintonizadorVoiceBridgeService } from './sintonizador-voice-bridge.service';
import { CollageVoiceBridgeService } from './collage-voice-bridge.service';
import { AudiovisualVoiceBridgeService } from './audiovisual-voice-bridge.service';
import { HistoriaInteractivaVoiceBridgeService } from './historia-interactiva-voice-bridge.service';
import { EvolucionInterfacesVoiceBridgeService } from './evolucion-interfaces-voice-bridge.service';
import {
  parseHistoriaTarjetaCommand,
  parsePongOpenCommand,
  parsePongPaletaZonaCommand,
  isHistoriaInteractivaInViewport,
  isPongModalOpen,
  type HistoriaTarjetaId,
} from '../utils/historia-interactiva-voice';
import {
  parseEvolucionInterfazEpocaCommand,
  parseEvolucionInterfazDireccionCommand,
  isEvolucionInterfacesInViewport,
  type EvolucionInterfazEpocaId,
} from '../utils/evolucion-interfaces-voice';
import {
  VOICE_EVOLUCION_INTERFACES_ACTION_EVENT,
  VOICE_MULTIMEDIA_ACTION_EVENT,
} from '../utils/interactividad-voice-dom';
import { MultimediaVoiceBridgeService } from './multimedia-voice-bridge.service';
import {
  parseMultimediaVoiceCommand,
  isMultimediaInViewport,
  type MultimediaVoiceCommand,
} from '../utils/multimedia-voice';
import {
  INTERACTIVIDAD_VOICE_STEP_ATTR,
  VOICE_HISTORIA_INTERACTIVA_ACTION_EVENT,
  VOICE_INTERACTIVIDAD_PAGE_ACTION_EVENT,
} from '../utils/interactividad-voice-dom';
import {
  parseInteractividadVentanitaOpenCommand,
  isInteractividadVentanitaInViewport,
} from '../utils/interactividad-ventanita-voice';
import { InteractividadVoiceBridgeService } from './interactividad-voice-bridge.service';
import { AudioVoiceBridgeService } from './audio-voice-bridge.service';
import { EscucharVoiceBridgeService } from './escuchar-voice-bridge.service';
import { MediaDeckVoiceBridgeService } from './media-deck-voice-bridge.service';
import { VideoInmersivoVoiceBridgeService } from './video-inmersivo-voice-bridge.service';
import { VideoVoiceBridgeService } from './video-voice-bridge.service';
import { ReproductoresVoiceBridgeService } from './reproductores-voice-bridge.service';
import { ExplorarVoiceBridgeService } from './explorar-voice-bridge.service';
import { MosaicoVoiceBridgeService } from './mosaico-voice-bridge.service';
import { LineaVoiceBridgeService } from './linea-voice-bridge.service';
import { FiltrosVoiceBridgeService } from './filtros-voice-bridge.service';
import { ImagenVoiceBridgeService } from './imagen-voice-bridge.service';
import { PrincipalVoiceBridgeService } from './principal-voice-bridge.service';
import { TextoVoiceBridgeService } from './texto-voice-bridge.service';
import { VoiceMenuBridgeService } from './voice-menu-bridge.service';
import { JuegoVoiceBridgeService } from './juego-voice-bridge.service';
import { parseJuegoVoiceCommand, type JuegoVoiceDetail } from '../utils/juego-voice';

export const VOICE_MENU_ZONE_EVENT = 'mm:voice-menu-zone';
export const VOICE_SNAP_TEXT_EVENT = 'mm:voice-snap-text';
export type VoiceSnapTextDetail =
  | { direction: -1 | 1; steps?: number }
  | { mode: 'top' | 'middle' | 'bottom' };
export const VOICE_EXIT_EVENT = 'mm:voice-exit';
export const VOICE_PRINCIPAL_ACTION_EVENT = 'mm:principal-voz';
export const VOICE_TEXTO_ACTION_EVENT = 'mm:texto-voz';
export const VOICE_AUDIO_ACTION_EVENT = 'mm:audio-voz';
export const VOICE_JUEGO_ACTION_EVENT = 'mm:juego-voz';

export type VoiceMenuZone = 'nav' | 'accessibility' | 'lateral';
export type PrincipalVoiceAction =
  | 'juguemos'
  | 'cerrar'
  | 'siguientePagina'
  | 'carruselAbrir'
  | 'carruselIzquierda'
  | 'carruselDerecha';

export const VOICE_CARRUSEL_STEP_EVENT = 'mm:carrusel-paso';

export type PrincipalVoiceDetail = {
  action: PrincipalVoiceAction;
  steps?: number;
};

export type CarruselStepDetail = {
  direction: -1 | 1;
  steps?: number;
};

export type TextoVoiceAction =
  | 'blocEscribir'
  | 'blocGuardar'
  | 'blocLimpiar'
  | 'evolucionAbrir'
  | 'maquinaAbrir'
  | 'kindleAbrir'
  | 'cerrar'
  | 'siguientePagina';

export type TextoVoiceDetail = {
  action: TextoVoiceAction;
  text?: string;
};

export type AudioVoiceAction =
  | 'escucharAbrir'
  | 'explorarAbrir'
  | 'walkmanAbrir'
  | 'altavozAbrir'
  | 'carruselVer'
  | 'carruselOcultar'
  | 'carruselIzquierda'
  | 'carruselDerecha'
  | 'cerrar'
  | 'siguientePagina';

export type AudioVoiceDetail = {
  action: AudioVoiceAction;
};

export const VOICE_ESCUCHAR_ACTION_EVENT = 'mm:escuchar-voz';
export const VOICE_EXPLORAR_ACTION_EVENT = 'mm:explorar-voz';
export const VOICE_MOSAICO_ACTION_EVENT = 'mm:mosaico-voz';

export type MosaicoVoiceAction = 'abrir' | 'cerrar';

export type MosaicoVoiceDetail = {
  action: MosaicoVoiceAction;
  clave?: string;
};

export const VOICE_LINEA_ACTION_EVENT = 'mm:linea-voz';

export type LineaVoiceAction = 'seleccionar';

export type LineaVoiceDetail = {
  action: LineaVoiceAction;
  clave: string;
};

export const VOICE_FILTROS_ACTION_EVENT = 'mm:filtros-voz';

export type FiltrosVoiceAction = 'seleccionar' | 'ajustar' | 'salir';

export type FiltrosVoiceDetail =
  | { action: 'seleccionar'; clave: string }
  | { action: 'ajustar'; deltas: number[] }
  | { action: 'salir' }
  | { action: 'lote'; comandos: FiltrosVoiceParsed[] };

export type ImagenVoiceAction = 'abrirDispositivo' | 'cerrar' | 'siguientePagina';

export type ImagenVoiceDetail = {
  action: ImagenVoiceAction;
  clave?: string;
};

export type EscucharVoiceAction =
  | 'reproducir'
  | 'pausar'
  | 'verInfo'
  | 'detalleReproducir'
  | 'detallePausar'
  | 'detalleCerrar';

export type EscucharVoiceDetail = {
  action: EscucharVoiceAction;
  deviceId?: string;
};

export type ExplorarVoiceAction = 'reproducir' | 'pausar';

export type ExplorarVoiceDetail = {
  action: ExplorarVoiceAction;
  itemId?: string;
};

export const VOICE_REPRODUCTORES_ACTION_EVENT = 'mm:reproductores-voz';

export type ReproductoresVoiceAction = 'abrir' | 'cerrar';

export type ReproductoresVoiceDetail = {
  action: ReproductoresVoiceAction;
  clave?: ReproductorClave;
};

export const VOICE_MEDIA_DECK_ACTION_EVENT = 'mm:media-deck-voz';

export type MediaDeckVoiceAction = 'formato' | 'reproducir' | 'pausar' | 'toggleMute';

export type MediaDeckVoiceDetail = {
  action: MediaDeckVoiceAction;
  formatoId?: MediaDeckFormatoId;
};

export const VOICE_VIDEO_INMERSIVO_ACTION_EVENT = 'mm:video-inmersivo-voz';

export type VideoInmersivoVoiceAction = 'rotar';

export type VideoInmersivoVoiceDetail = {
  action: VideoInmersivoVoiceAction;
  flecha?: InmersivoFlechaId;
};

export type VideoVoiceAction = 'abrirDispositivo' | 'cerrar' | 'siguientePagina';

export type VideoVoiceDetail = {
  action: VideoVoiceAction;
  clave?: string;
};

export const VOICE_INSTRUMENTOS_ACTION_EVENT = 'mm:instrumentos-voz';

export type InstrumentosVoiceAction = 'seleccionar' | 'tocar';

export type InstrumentosVoiceDetail =
  | { action: 'seleccionar'; instrumentId: string }
  | { action: 'tocar'; slot: number };

export const VOICE_EVOLUCION_ACTION_EVENT = 'mm:evolucion-voz';

export type EvolucionVoiceDetail =
  | { action: 'anterior' }
  | { action: 'siguiente' }
  | { action: 'togglePlay' }
  | { action: 'era'; eraId: string };

export type MusicaVoiceAction = 'abrirDispositivo' | 'cerrarDispositivo' | 'siguientePagina';

export type MusicaVoiceDetail = {
  action: MusicaVoiceAction;
  clave?: string;
};

export type InteractividadVoiceAction = 'abrirDispositivo' | 'cerrarDispositivo';

export type InteractividadVoiceDetail = {
  action: InteractividadVoiceAction;
  clave?: string;
};

export const VOICE_MESA_MEZCLAS_ACTION_EVENT = 'mm:mesa-mezclas-voz';

export type MesaMezclasVoiceDetail = {
  commands: MesaMezclasVoiceParsed[];
};

export type ComparacionVoiceDetail = {
  commands: ComparacionVoiceParsed[];
};

export type SintonizadorVoiceDetail = {
  commands: SintonizadorVoiceParsed[];
};

export type CollageVoiceDetail = {
  commands: CollageVoiceParsed[];
};

export type AudiovisualVoiceAction = 'abrirDispositivo' | 'cerrarDispositivo' | 'siguientePagina';

export type AudiovisualVoiceDetail = {
  action: AudiovisualVoiceAction;
  clave?: string;
};

export type HistoriaInteractivaVoiceDetail =
  | { action: 'tarjetaHover'; tarjetaId: HistoriaTarjetaId }
  | { action: 'abrirPong' }
  | { action: 'paletaZona'; zona: number }
  | { action: 'cerrarPong' };

export type EvolucionInterfacesVoiceDetail =
  | { action: 'epoca'; epocaId: EvolucionInterfazEpocaId }
  | { action: 'mover'; direccion: 1 | 2 | 3 | 4 };

interface BrowserSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((this: BrowserSpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: BrowserSpeechRecognition, ev: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface BrowserSpeechRecognitionConstructor {
  new (): BrowserSpeechRecognition;
}

type SpeechRecognitionErrorLike = Event & { readonly error?: string };

type SpeechRecResultRow = {
  readonly 0?: { readonly transcript?: string };
  readonly isFinal?: boolean;
};

type SpeechRecResultWithFinal = SpeechRecResultRow & { readonly isFinal: boolean };

type SpeechResultsWithFinal = {
  readonly length: number;
  item(index: number): SpeechRecResultWithFinal | null;
  [index: number]: SpeechRecResultWithFinal;
};

@Injectable({ providedIn: 'root' })
export class VoiceNavigationService {
  private readonly router = inject(Router);
  private readonly principalBridge = inject(PrincipalVoiceBridgeService);
  private readonly textoBridge = inject(TextoVoiceBridgeService);
  private readonly audioBridge = inject(AudioVoiceBridgeService);
  private readonly reproductoresBridge = inject(ReproductoresVoiceBridgeService);
  private readonly mediaDeckBridge = inject(MediaDeckVoiceBridgeService);
  private readonly videoInmersivoBridge = inject(VideoInmersivoVoiceBridgeService);
  private readonly videoBridge = inject(VideoVoiceBridgeService);
  private readonly escucharBridge = inject(EscucharVoiceBridgeService);
  private readonly explorarBridge = inject(ExplorarVoiceBridgeService);
  private readonly mosaicoBridge = inject(MosaicoVoiceBridgeService);
  private readonly lineaBridge = inject(LineaVoiceBridgeService);
  private readonly filtrosBridge = inject(FiltrosVoiceBridgeService);
  private readonly imagenBridge = inject(ImagenVoiceBridgeService);
  private readonly instrumentosBridge = inject(InstrumentosVoiceBridgeService);
  private readonly evolucionBridge = inject(EvolucionVoiceBridgeService);
  private readonly mesaMezclasBridge = inject(MesaMezclasVoiceBridgeService);
  private readonly musicaBridge = inject(MusicaVoiceBridgeService);
  private readonly comparacionBridge = inject(ComparacionVoiceBridgeService);
  private readonly sintonizadorBridge = inject(SintonizadorVoiceBridgeService);
  private readonly collageBridge = inject(CollageVoiceBridgeService);
  private readonly audiovisualPageBridge = inject(AudiovisualVoiceBridgeService);
  private readonly historiaInteractivaBridge = inject(HistoriaInteractivaVoiceBridgeService);
  private readonly evolucionInterfacesBridge = inject(EvolucionInterfacesVoiceBridgeService);
  private readonly multimediaBridge = inject(MultimediaVoiceBridgeService);
  private readonly interactividadPageBridge = inject(InteractividadVoiceBridgeService);
  private readonly voiceMenuBridge = inject(VoiceMenuBridgeService);
  private readonly juegoBridge = inject(JuegoVoiceBridgeService);

  private blocNotasAwaitingDictation = false;

  readonly enabled = signal(false);
  readonly active = signal(false);
  readonly lastError = signal<string | null>(null);
  readonly liveTranscript = signal('');

  private recognition: BrowserSpeechRecognition | null = null;
  private started = false;
  private gestureBound = false;
  private userGestured = false;

  private static readonly maxTranscriptLines = 4;
  private static readonly approxCharsPerLine = 50;

  private transcriptCarry = '';
  private lastDispatchedFinalIndex = -1;

  private cooldownMenuMs = 750;
  private lastMenuAt = 0;
  private principalVoiceGapMs = 240;
  private lastPrincipalVoiceAt = 0;
  private lastJuegoCommandKey = '';
  private lastJuegoCommandAt = 0;

  setCooldownMenuMs(ms: number) {
    this.cooldownMenuMs = Math.max(200, ms);
  }

  setPrincipalVoiceGapMs(ms: number) {
    this.principalVoiceGapMs = Math.max(80, ms);
  }

  private trimLiveTranscript(raw: string): string {
    const t = raw.replace(/\s+/g, ' ').trim();
    if (!t) return '';
    const words = t.split(/\s+/).filter(Boolean);
    const maxWords =
      VoiceNavigationService.maxTranscriptLines * Math.ceil(VoiceNavigationService.approxCharsPerLine / 6);
    if (words.length <= maxWords) return words.join(' ');
    return words.slice(-maxWords).join(' ');
  }

  toggleEnabled(): void {
    if (this.enabled()) {
      this.enabled.set(false);
      this.stop();
      return;
    }
    this.enabled.set(true);
    window.dispatchEvent(new CustomEvent(VOICE_EXIT_EVENT));
    if (this.userGestured) {
      this.start();
    } else {
      this.bindUserGesture();
    }
  }

  bindUserGesture(): void {
    if (this.gestureBound) return;
    this.gestureBound = true;
    const go = () => {
      this.userGestured = true;
      if (this.enabled() && !this.started) {
        this.start();
      }
    };
    document.addEventListener('pointerdown', go, { once: true, capture: true });
  }

  armStartOnFirstUserGesture(): void {
    this.enabled.set(true);
    this.bindUserGesture();
  }

  start(): void {
    if (!this.enabled() || this.started) return;
    const win = window as unknown as {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    };
    const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SR) {
      this.lastError.set('Este navegador no expone reconocimiento de voz (SpeechRecognition).');
      return;
    }

    this.recognition = new SR();
    this.recognition.lang = 'es-ES';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (ev: Event) => {
      const evx = ev as Event & { resultIndex?: number; results: SpeechResultsWithFinal };
      const { results } = evx;
      if (!results?.length) return;

      let sessionDisplay = '';
      for (let i = 0; i < results.length; i++) {
        const row = results.item(i) ?? results[i];
        const t = row?.[0]?.transcript;
        if (t) {
          if (sessionDisplay && !/\s$/.test(sessionDisplay) && !/^\s/.test(t)) {
            sessionDisplay += ' ';
          }
          sessionDisplay += t;
        }
      }
      const merged = [this.transcriptCarry, sessionDisplay]
        .filter(s => s.replace(/\s+/g, '').length > 0)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      const trimmed = this.trimLiveTranscript(merged);
      this.liveTranscript.set(trimmed);

      if (this.isPrincipalHome() && isJuegoPopupOpen()) {
        const latestRow = results.item(results.length - 1) ?? results[results.length - 1];
        const latestTranscript = latestRow?.[0]?.transcript?.trim() ?? '';
        if (latestTranscript) {
          this.dispatchJuegoVoiceCommands(normalizeForMatch(latestTranscript));
        }
      }

      const start =
        typeof evx.resultIndex === 'number' && evx.resultIndex >= 0 ? evx.resultIndex : 0;
      let needsBounce = false;
      for (let i = start; i < results.length; i++) {
        if (i <= this.lastDispatchedFinalIndex) continue;
        const row = results.item(i) ?? results[i];
        if (!row?.isFinal) continue;
        const chunk = row[0]?.transcript?.trim() ?? '';
        if (!chunk) continue;
        this.lastDispatchedFinalIndex = i;
        const outcome = this.dispatchCommands(chunk);
        if (outcome === 'scroll' || outcome === 'principal' || outcome === 'carousel' || outcome === 'bounce') {
          needsBounce = true;
        }
      }
      if (needsBounce) {
        this.transcriptCarry = trimmed;
        this.bounceRecognitionAfterScroll();
      }
    };

    this.recognition.onerror = (ev: SpeechRecognitionErrorLike) => {
      if (ev.error === 'no-speech' || ev.error === 'aborted') return;
      if (ev.error) this.lastError.set(ev.error);
    };

    this.recognition.onend = () => {
      if (!this.started || !this.recognition) return;
      window.setTimeout(() => {
        if (!this.started || !this.recognition) return;
        try {
          this.recognition.start();
        } catch {
        }
      }, 120);
    };

    try {
      this.lastDispatchedFinalIndex = -1;
      this.recognition.start();
      this.started = true;
      this.active.set(true);
      this.lastError.set(null);
      this.liveTranscript.set('');
    } catch (e) {
      this.lastError.set(e instanceof Error ? e.message : String(e));
      this.recognition = null;
      this.started = false;
      this.active.set(false);
    }
  }

  stop(): void {
    this.started = false;
    this.active.set(false);
    this.transcriptCarry = '';
    this.liveTranscript.set('');
    if (this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.stop();
      } catch {
      }
      this.recognition = null;
    }
  }

  private bounceRecognitionAfterScroll(): void {
    if (!this.recognition || !this.started) return;
    this.lastDispatchedFinalIndex = -1;
    try {
      this.recognition.stop();
    } catch {
    }
  }

  private canFireMenu(): boolean {
    const now = Date.now();
    if (now - this.lastMenuAt < this.cooldownMenuMs) return false;
    this.lastMenuAt = now;
    return true;
  }

  private canFirePrincipalVoice(): boolean {
    const now = Date.now();
    if (now - this.lastPrincipalVoiceAt < this.principalVoiceGapMs) return false;
    this.lastPrincipalVoiceAt = now;
    return true;
  }

  private isPrincipalHome(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0] || '/';
    return path === '/' || path === '';
  }

  private isTextoPage(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0] || '/';
    return path === '/texto';
  }

  private isAudioPage(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0] || '/';
    return path === '/audio';
  }

  private isVideoPage(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0] || '/';
    return path === '/video';
  }

  private isImagenPage(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0] || '/';
    return path === '/imagen';
  }

  private emitTextoVoice(detail: TextoVoiceDetail): void {
    if (!this.textoBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<TextoVoiceDetail>(VOICE_TEXTO_ACTION_EVENT, { detail }));
    }
  }

  private emitPrincipalVoice(detail: PrincipalVoiceDetail): void {
    if (!this.principalBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<PrincipalVoiceDetail>(VOICE_PRINCIPAL_ACTION_EVENT, { detail }));
    }
  }

  private emitAudioVoice(detail: AudioVoiceDetail): void {
    this.audioBridge.dispatch(detail);
    window.dispatchEvent(new CustomEvent<AudioVoiceDetail>(VOICE_AUDIO_ACTION_EVENT, { detail }));
  }

  private emitJuegoVoice(detail: JuegoVoiceDetail): void {
    if (!this.juegoBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<JuegoVoiceDetail>(VOICE_JUEGO_ACTION_EVENT, { detail }));
    }
  }

  private emitReproductoresVoice(detail: ReproductoresVoiceDetail): void {
    if (!this.reproductoresBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<ReproductoresVoiceDetail>(VOICE_REPRODUCTORES_ACTION_EVENT, { detail }));
    }
  }

  private emitMediaDeckVoice(detail: MediaDeckVoiceDetail): void {
    if (!this.mediaDeckBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<MediaDeckVoiceDetail>(VOICE_MEDIA_DECK_ACTION_EVENT, { detail }));
    }
  }

  private emitVideoInmersivoVoice(detail: VideoInmersivoVoiceDetail): void {
    if (!this.videoInmersivoBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<VideoInmersivoVoiceDetail>(VOICE_VIDEO_INMERSIVO_ACTION_EVENT, { detail }));
    }
  }

  private emitVideoVoice(detail: VideoVoiceDetail): void {
    if (!this.videoBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<VideoVoiceDetail>(VOICE_VIDEO_ACTION_EVENT, { detail }));
    }
  }

  private videoVoiceStep(): number {
    if (typeof document === 'undefined') return -1;
    return Number(document.documentElement.getAttribute(VIDEO_VOICE_STEP_ATTR) ?? '-1');
  }

  private isVideoVentanitaVoiceContext(): boolean {
    if (this.videoVoiceStep() === 8) return true;
    if (document.querySelector('app-video .ventanita.video-ventanita-voz-activa')) return true;
    return isVideoVentanitaInViewport();
  }

  private scrollVideoReproductoresPopup(direction: -1 | 1, steps: number): void {
    const content = document.querySelector('app-reproductores app-popup .content');
    if (!(content instanceof HTMLElement)) return;
    const step = Math.max(120, content.clientHeight * 0.72);
    content.scrollBy({ top: direction * step * steps, behavior: 'smooth' });
  }

  private emitEscucharVoice(detail: EscucharVoiceDetail): void {
    if (!this.escucharBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<EscucharVoiceDetail>(VOICE_ESCUCHAR_ACTION_EVENT, { detail }));
    }
  }

  private emitExplorarVoice(detail: ExplorarVoiceDetail): void {
    if (!this.explorarBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<ExplorarVoiceDetail>(VOICE_EXPLORAR_ACTION_EVENT, { detail }));
    }
  }

  private emitMosaicoVoice(detail: MosaicoVoiceDetail): void {
    if (!this.mosaicoBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<MosaicoVoiceDetail>(VOICE_MOSAICO_ACTION_EVENT, { detail }));
    }
  }

  private emitLineaVoice(detail: LineaVoiceDetail): void {
    if (!this.lineaBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<LineaVoiceDetail>(VOICE_LINEA_ACTION_EVENT, { detail }));
    }
  }

  private emitFiltrosVoice(detail: FiltrosVoiceDetail): void {
    if (!this.filtrosBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<FiltrosVoiceDetail>(VOICE_FILTROS_ACTION_EVENT, { detail }));
    }
  }

  private emitImagenVoice(detail: ImagenVoiceDetail): void {
    if (!this.imagenBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<ImagenVoiceDetail>(VOICE_IMAGEN_ACTION_EVENT, { detail }));
    }
  }

  private emitInstrumentosVoice(detail: InstrumentosVoiceDetail): void {
    if (!this.instrumentosBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<InstrumentosVoiceDetail>(VOICE_INSTRUMENTOS_ACTION_EVENT, { detail }));
    }
  }

  private emitEvolucionVoice(detail: EvolucionVoiceDetail): void {
    if (!this.evolucionBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<EvolucionVoiceDetail>(VOICE_EVOLUCION_ACTION_EVENT, { detail }));
    }
  }

  private emitMesaMezclasVoice(detail: MesaMezclasVoiceDetail): void {
    if (!this.mesaMezclasBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<MesaMezclasVoiceDetail>(VOICE_MESA_MEZCLAS_ACTION_EVENT, { detail }));
    }
  }

  private emitMusicaVoice(detail: MusicaVoiceDetail): void {
    if (!this.musicaBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<MusicaVoiceDetail>(VOICE_MUSICA_PAGE_ACTION_EVENT, { detail }));
    }
  }

  private emitComparacionVoice(detail: ComparacionVoiceDetail): void {
    if (!this.comparacionBridge.dispatch(detail)) {
      window.dispatchEvent(
        new CustomEvent<ComparacionVoiceDetail>(VOICE_COMPARACION_ACTION_EVENT, { detail })
      );
    }
  }

  private emitSintonizadorVoice(detail: SintonizadorVoiceDetail): void {
    if (!this.sintonizadorBridge.dispatch(detail)) {
      window.dispatchEvent(
        new CustomEvent<SintonizadorVoiceDetail>(VOICE_SINTONIZADOR_ACTION_EVENT, { detail })
      );
    }
  }

  private emitCollageVoice(detail: CollageVoiceDetail): void {
    if (!this.collageBridge.dispatch(detail)) {
      window.dispatchEvent(new CustomEvent<CollageVoiceDetail>(VOICE_COLLAGE_ACTION_EVENT, { detail }));
    }
  }

  private emitAudiovisualPageVoice(detail: AudiovisualVoiceDetail): void {
    if (!this.audiovisualPageBridge.dispatch(detail)) {
      window.dispatchEvent(
        new CustomEvent<AudiovisualVoiceDetail>(VOICE_AUDIOVISUAL_PAGE_ACTION_EVENT, { detail })
      );
    }
  }

  private imagenVoiceStep(): number {
    if (typeof document === 'undefined') return -1;
    return Number(document.documentElement.getAttribute(IMAGEN_VOICE_STEP_ATTR) ?? '-1');
  }

  private isImagenLineaVoiceContext(): boolean {
    if (isFiltrosEditorInViewport()) return false;
    if (this.imagenVoiceStep() === 4) return true;
    return !!document.querySelector('.timeline-wrapper.linea-voz-activa');
  }

  private isImagenMosaicoVoiceContext(): boolean {
    if (isImagenMosaicoPopupOpen()) return true;
    const step = this.imagenVoiceStep();
    return step === 1 || step === 2;
  }

  private isImagenFiltrosVoiceContext(): boolean {
    if (isImagenVentanitaInViewport()) return false;
    if (this.imagenVoiceStep() === 7) return true;
    if (document.querySelector('.editor-window.filtros-voz-activa')) return true;
    return isFiltrosEditorInViewport();
  }

  private isImagenVentanitaVoiceContext(): boolean {
    const step = this.imagenVoiceStep();
    if (step === 8 || step === 9) return true;
    if (document.querySelector('app-imagen .ventanita.imagen-ventanita-voz-activa')) return true;
    return isImagenVentanitaInViewport();
  }

  private isMusicaPage(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/musica';
  }

  private musicaVoiceStep(): number {
    if (typeof document === 'undefined') return -1;
    return Number(document.documentElement.getAttribute(MUSICA_VOICE_STEP_ATTR) ?? '-1');
  }

  private isMusicaInstrumentosVoiceContext(): boolean {
    if (isMusicaDispositivoPopupOpen()) return false;
    if (this.musicaVoiceStep() === 1) return true;
    const host = document.querySelector('app-instrumentos');
    if (!host) return false;
    const rect = host.getBoundingClientRect();
    const vh = window.innerHeight;
    return rect.top < vh * 0.88 && rect.bottom > vh * 0.12;
  }

  private isMusicaEvolucionVoiceContext(): boolean {
    if (isMusicaDispositivoPopupOpen()) return false;
    if (this.musicaVoiceStep() === 3) return true;
    const host = document.querySelector('app-evolucion');
    if (!host) return false;
    const rect = host.getBoundingClientRect();
    const vh = window.innerHeight;
    return rect.top < vh * 0.88 && rect.bottom > vh * 0.12;
  }

  private isMusicaVentanitaVoiceContext(): boolean {
    if (isMusicaDispositivoPopupOpen()) return false;
    const step = this.musicaVoiceStep();
    if (step === 7 || step === 8) return true;
    if (document.querySelector('app-musica .ventanita.musica-ventanita-voz-activa')) return true;
    return isMusicaVentanitaInViewport();
  }

  private isAudiovisualPage(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/audiovisual';
  }

  private audiovisualVoiceStep(): number {
    if (typeof document === 'undefined') return -1;
    return Number(document.documentElement.getAttribute(AUDIOVISUAL_VOICE_STEP_ATTR) ?? '-1');
  }

  private isAudiovisualComparacionVoiceContext(): boolean {
    if (isAudiovisualDispositivoPopupOpen()) return false;
    const step = this.audiovisualVoiceStep();
    if (step === 2) return true;
    const host = document.querySelector('app-comparacion .player-wrap');
    if (!host) return false;
    const rect = host.getBoundingClientRect();
    const vh = window.innerHeight;
    return rect.top < vh * 0.88 && rect.bottom > vh * 0.12;
  }

  private isAudiovisualSintonizadorVoiceContext(): boolean {
    if (isAudiovisualDispositivoPopupOpen()) return false;
    const step = this.audiovisualVoiceStep();
    if (step === 5) return true;
    const host = document.querySelector('app-sintonizador-transmedia .win95-window');
    if (!host) return false;
    const rect = host.getBoundingClientRect();
    const vh = window.innerHeight;
    return rect.top < vh * 0.88 && rect.bottom > vh * 0.12;
  }

  private isAudiovisualCollageVoiceContext(): boolean {
    if (isAudiovisualDispositivoPopupOpen()) return false;
    const step = this.audiovisualVoiceStep();
    if (step === 7) return true;
    const host = document.querySelector('app-collage-interactivo #collage');
    if (!host) return false;
    const rect = host.getBoundingClientRect();
    const vh = window.innerHeight;
    return rect.top < vh * 0.88 && rect.bottom > vh * 0.12;
  }

  private isAudiovisualVentanitaVoiceContext(): boolean {
    if (isAudiovisualDispositivoPopupOpen()) return false;
    const step = this.audiovisualVoiceStep();
    if (step === 8 || step === 9) return true;
    if (document.querySelector('app-audiovisual .ventanita.audiovisual-ventanita-voz-activa')) {
      return true;
    }
    return isAudiovisualVentanitaInViewport();
  }

  private isMusicaMesaMezclasVoiceContext(): boolean {
    if (isMusicaDispositivoPopupOpen()) return false;
    if (this.isMusicaVentanitaVoiceContext()) return false;
    const step = this.musicaVoiceStep();
    if (step === 5 || step === 6) return true;
    const host = document.querySelector('app-mesa-mezclas');
    if (!host) return false;
    const rect = host.getBoundingClientRect();
    const vh = window.innerHeight;
    return rect.top < vh * 0.88 && rect.bottom > vh * 0.12;
  }

  private dispatchCarouselVoiceSteps(n: string, inPopup: boolean): boolean {
    const steps = listCarouselStepsInPhrase(n);
    if (!steps.length) return false;
    for (const direction of steps) {
      if (inPopup) {
        window.dispatchEvent(
          new CustomEvent<CarruselStepDetail>(VOICE_CARRUSEL_STEP_EVENT, { detail: { direction, steps: 1 } })
        );
      } else {
        this.emitPrincipalVoice({
          action: direction === -1 ? 'carruselIzquierda' : 'carruselDerecha',
          steps: 1,
        });
      }
    }
    return true;
  }

  private dispatchAudioCarouselVoiceSteps(n: string): boolean {
    const steps = listCarouselStepsInPhrase(n);
    if (!steps.length) return false;
    for (const direction of steps) {
      this.emitAudioVoice({
        action: direction === -1 ? 'carruselIzquierda' : 'carruselDerecha',
      });
    }
    return true;
  }

  private dispatchJuegoVoiceCommands(n: string): false | 'bounce' {
    const cmd = parseJuegoVoiceCommand(n);
    if (!cmd) return false;
    const key = JSON.stringify(cmd);
    const now = Date.now();
    if (this.lastJuegoCommandKey === key && now - this.lastJuegoCommandAt < 900) {
      return false;
    }
    this.lastJuegoCommandKey = key;
    this.lastJuegoCommandAt = now;
    this.emitJuegoVoice(cmd);
    return false;
  }

  private dispatchCommands(raw: string): false | 'scroll' | 'principal' | 'carousel' | 'bounce' {
    if (!this.enabled()) return false;
    if (this.isTypingTarget(document.activeElement)) return false;

    const n = normalizeForMatch(raw);
    if (!n) return false;

    if (this.voiceMenuBridge.tryPick(n, raw)) {
      return false;
    }

    if (this.isPrincipalHome()) {
      if (isJuegoPopupOpen()) {
        const juegoOutcome = this.dispatchJuegoVoiceCommands(n);
        if (juegoOutcome !== false) return juegoOutcome;
      }

      if (isCarruselPopupOpen()) {
        if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
          this.emitPrincipalVoice({ action: 'cerrar' });
          return false;
        }
        if (this.dispatchCarouselVoiceSteps(n, true)) return 'carousel';
        return false;
      }

      if (!isCarruselPopupOpen() && this.dispatchCarouselVoiceSteps(n, false)) {
        return 'carousel';
      }

      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitPrincipalVoice({ action: 'cerrar' });
        if (!hasOpenPrincipalPopup()) {
          window.dispatchEvent(new CustomEvent(VOICE_EXIT_EVENT));
        }
        return false;
      }
      if (hasJuguemosCommand(n)) {
        this.emitPrincipalVoice({ action: 'juguemos' });
        return false;
      }

      if (!isJuegoPopupOpen() && hasCarouselOpenCommand(n)) {
        this.emitPrincipalVoice({ action: 'carruselAbrir' });
        return false;
      }

      if (hasSiguientePaginaPrincipalCommand(n)) {
        this.emitPrincipalVoice({ action: 'siguientePagina' });
        return false;
      }
    }

    if (this.isTextoPage()) {
      const textoOutcome = this.dispatchTextoVoiceCommands(n, raw);
      if (textoOutcome !== false) return textoOutcome;
    } else {
      this.blocNotasAwaitingDictation = false;
    }

    if (this.isAudioPage()) {
      const audioOutcome = this.dispatchAudioVoiceCommands(n);
      if (audioOutcome !== false) return audioOutcome;
    }

    if (this.isVideoPage()) {
      const videoOutcome = this.dispatchVideoVoiceCommands(n);
      if (videoOutcome !== false) return videoOutcome;
    }

    if (this.isImagenPage()) {
      const imagenOutcome = this.dispatchImagenVoiceCommands(n);
      if (imagenOutcome !== false) return imagenOutcome;
    }

    if (this.isMusicaPage()) {
      const musicaOutcome = this.dispatchMusicaVoiceCommands(n);
      if (musicaOutcome !== false) return musicaOutcome;
    }

    if (this.isAudiovisualPage()) {
      const avOutcome = this.dispatchAudiovisualVoiceCommands(n);
      if (avOutcome !== false) return avOutcome;
    }

    if (this.isInteractividadPage()) {
      const intOutcome = this.dispatchInteractividadVoiceCommands(n);
      if (intOutcome !== false) return intOutcome;
      if (isPongModalOpen()) return false;
    }

    if (hasSalirCommand(n)) {
      if (!this.canFireMenu()) return false;
      window.dispatchEvent(new CustomEvent(VOICE_EXIT_EVENT));
      return false;
    }
    if (hasScrollTopCommand(n)) {
      window.dispatchEvent(
        new CustomEvent<VoiceSnapTextDetail>(VOICE_SNAP_TEXT_EVENT, { detail: { mode: 'top' } })
      );
      return 'scroll';
    }
    if (hasScrollBottomCommand(n)) {
      window.dispatchEvent(
        new CustomEvent<VoiceSnapTextDetail>(VOICE_SNAP_TEXT_EVENT, { detail: { mode: 'bottom' } })
      );
      return 'scroll';
    }
    if (hasScrollMiddleCommand(n)) {
      window.dispatchEvent(
        new CustomEvent<VoiceSnapTextDetail>(VOICE_SNAP_TEXT_EVENT, { detail: { mode: 'middle' } })
      );
      return 'scroll';
    }

    if (hasScrollUpCommand(n)) {
      const steps = countScrollUpRepeats(n);
      window.dispatchEvent(
        new CustomEvent<VoiceSnapTextDetail>(VOICE_SNAP_TEXT_EVENT, { detail: { direction: -1, steps } })
      );
      return 'scroll';
    }
    if (hasScrollDownCommand(n)) {
      const steps = countScrollDownRepeats(n);
      window.dispatchEvent(
        new CustomEvent<VoiceSnapTextDetail>(VOICE_SNAP_TEXT_EVENT, { detail: { direction: 1, steps } })
      );
      return 'scroll';
    }

    if (hasLateralMenuCommand(n)) {
      if (!this.canFireMenu()) return false;
      window.dispatchEvent(new CustomEvent<{ zone: VoiceMenuZone }>(VOICE_MENU_ZONE_EVENT, { detail: { zone: 'lateral' } }));
      return false;
    }
    if (hasAccessibilityMenuCommand(n)) {
      if (!this.canFireMenu()) return false;
      window.dispatchEvent(new CustomEvent<{ zone: VoiceMenuZone }>(VOICE_MENU_ZONE_EVENT, { detail: { zone: 'accessibility' } }));
      return false;
    }
    if (hasNavMenuCommand(n)) {
      if (!this.canFireMenu()) return false;
      window.dispatchEvent(new CustomEvent<{ zone: VoiceMenuZone }>(VOICE_MENU_ZONE_EVENT, { detail: { zone: 'nav' } }));
      return false;
    }

    return false;
  }

  private dispatchTextoVoiceCommands(
    n: string,
    raw: string
  ): false | 'carousel' | 'principal' {
    if (isTextoCarruselPopupOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitTextoVoice({ action: 'cerrar' });
        return false;
      }
      if (this.dispatchCarouselVoiceSteps(n, true)) return 'carousel';
      return false;
    }

    if (isTextoDispositivoPopupOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitTextoVoice({ action: 'cerrar' });
        return false;
      }
      return false;
    }

    if (hasMaquinaEscribirDeviceCommand(n)) {
      this.blocNotasAwaitingDictation = false;
      this.emitTextoVoice({ action: 'maquinaAbrir' });
      return false;
    }
    if (hasKindleDeviceCommand(n)) {
      this.blocNotasAwaitingDictation = false;
      this.emitTextoVoice({ action: 'kindleAbrir' });
      return false;
    }
    if (hasTextoEvolucionCommand(n)) {
      this.blocNotasAwaitingDictation = false;
      this.emitTextoVoice({ action: 'evolucionAbrir' });
      return false;
    }

    if (isTextoBlocOnPage()) {
      if (hasBlocGuardarCommand(n)) {
        this.blocNotasAwaitingDictation = false;
        this.emitTextoVoice({ action: 'blocGuardar' });
        return false;
      }
      if (hasBlocLimpiarCommand(n)) {
        this.blocNotasAwaitingDictation = false;
        this.emitTextoVoice({ action: 'blocLimpiar' });
        return false;
      }

      const writeText = extractBlocWriteText(n, raw);
      if (writeText !== null) {
        this.blocNotasAwaitingDictation = false;
        this.emitTextoVoice({ action: 'blocEscribir', text: writeText });
        return false;
      }
      if (isBlocEscribirOnlyCommand(n)) {
        this.blocNotasAwaitingDictation = true;
        return false;
      }
      if (
        this.blocNotasAwaitingDictation &&
        !isGlobalVoiceCommandPhrase(n) &&
        !hasMaquinaEscribirDeviceCommand(n) &&
        !hasKindleDeviceCommand(n)
      ) {
        const dictated = raw.replace(/\s+/g, ' ').trim();
        if (dictated.length > 0) {
          this.blocNotasAwaitingDictation = false;
          this.emitTextoVoice({ action: 'blocEscribir', text: dictated });
          return false;
        }
      }
    } else {
      this.blocNotasAwaitingDictation = false;
    }

    if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
      this.emitTextoVoice({ action: 'cerrar' });
      return false;
    }

    if (hasSiguientePaginaPrincipalCommand(n)) {
      this.emitTextoVoice({ action: 'siguientePagina' });
      return false;
    }

    return false;
  }

  private dispatchAudioVoiceCommands(n: string): false | 'carousel' {
    if (isAudioExplorarPopupOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitAudioVoice({ action: 'cerrar' });
        return false;
      }
      const pauseCmd = parseExplorarGalleryPauseCommand(n);
      if (pauseCmd) {
        this.emitExplorarVoice({
          action: 'pausar',
          itemId: pauseCmd.itemId ?? undefined,
        });
        return 'carousel';
      }
      const playId = parseExplorarPlayCommand(n);
      if (playId) {
        this.emitExplorarVoice({ action: 'reproducir', itemId: playId });
        return 'carousel';
      }
      return false;
    }

    if (isAudioEscucharDetalleOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitEscucharVoice({ action: 'detalleCerrar' });
        return false;
      }
      if (hasEscucharPauseIntent(n)) {
        this.emitEscucharVoice({ action: 'detallePausar' });
        return false;
      }
      if (isBarePlayInDetalleCommand(n)) {
        this.emitEscucharVoice({ action: 'detalleReproducir' });
        return false;
      }
      const deviceId = matchEscucharDeviceId(n);
      if (deviceId) {
        this.emitEscucharVoice({ action: 'verInfo', deviceId });
        return false;
      }
      return false;
    }

    if (isAudioEscucharPopupOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitAudioVoice({ action: 'cerrar' });
        return false;
      }
      const pauseCmd = parseEscucharGalleryPauseCommand(n);
      if (pauseCmd) {
        this.emitEscucharVoice({
          action: 'pausar',
          deviceId: pauseCmd.deviceId ?? undefined,
        });
        return false;
      }
      if (isBarePlayInDetalleCommand(n) && !matchEscucharDeviceId(n)) {
        return false;
      }
      const gallery = parseEscucharGalleryCommand(n);
      if (gallery?.play) {
        this.emitEscucharVoice({ action: 'reproducir', deviceId: gallery.deviceId });
        return false;
      }
      if (gallery) {
        this.emitEscucharVoice({ action: 'verInfo', deviceId: gallery.deviceId });
        return false;
      }
      return false;
    }

    if (isAudioDispositivoPopupOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitAudioVoice({ action: 'cerrar' });
        return false;
      }
      return false;
    }

    if (this.dispatchAudioCarouselVoiceSteps(n)) {
      return 'carousel';
    }

    if (hasWalkmanDeviceCommand(n)) {
      this.emitAudioVoice({ action: 'walkmanAbrir' });
      return false;
    }
    if (hasAltavozDeviceCommand(n)) {
      this.emitAudioVoice({ action: 'altavozAbrir' });
      return false;
    }
    if (hasAudioEscucharCommand(n)) {
      this.emitAudioVoice({ action: 'escucharAbrir' });
      return false;
    }
    if (hasAudioExplorarCommand(n)) {
      this.emitAudioVoice({ action: 'explorarAbrir' });
      return false;
    }
    if (hasOcultarCarruselCommand(n)) {
      this.emitAudioVoice({ action: 'carruselOcultar' });
      return 'carousel';
    }
    if (hasVerCarruselCommand(n)) {
      this.emitAudioVoice({ action: 'carruselVer' });
      return 'carousel';
    }

    if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
      this.emitAudioVoice({ action: 'cerrar' });
      return false;
    }

    if (hasSiguientePaginaPrincipalCommand(n)) {
      this.emitAudioVoice({ action: 'siguientePagina' });
      return false;
    }

    return false;
  }

  private dispatchVideoVoiceCommands(n: string): false | 'scroll' {
    if (isVideoReproductoresPopupOpen()) {
      if (hasAceptarVoiceCommand(n) || hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitReproductoresVoice({ action: 'cerrar' });
        return false;
      }
      if (hasScrollDownCommand(n)) {
        this.scrollVideoReproductoresPopup(1, countScrollDownRepeats(n));
        return 'scroll';
      }
      if (hasScrollUpCommand(n)) {
        this.scrollVideoReproductoresPopup(-1, countScrollUpRepeats(n));
        return 'scroll';
      }
      return false;
    }

    if (isVideoDispositivoPopupOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitVideoVoice({ action: 'cerrar' });
        return false;
      }
      return false;
    }

    const clave = parseReproductoresOpenCommand(n);
    if (clave) {
      this.emitReproductoresVoice({ action: 'abrir', clave });
      return false;
    }

    const formatoId = parseMediaDeckFormatoCommand(n);
    if (formatoId) {
      this.emitMediaDeckVoice({ action: 'formato', formatoId });
      return false;
    }
    if (hasMediaDeckPausarCommand(n)) {
      this.emitMediaDeckVoice({ action: 'pausar' });
      return false;
    }
    if (hasMediaDeckReproducirCommand(n)) {
      this.emitMediaDeckVoice({ action: 'reproducir' });
      return false;
    }
    if (hasMediaDeckVolumenCommand(n)) {
      this.emitMediaDeckVoice({ action: 'toggleMute' });
      return false;
    }

    const flecha = parseInmersivoFlechaCommand(n);
    if (flecha) {
      this.emitVideoInmersivoVoice({ action: 'rotar', flecha });
      return false;
    }

    if (this.isVideoVentanitaVoiceContext()) {
      if (hasSiguientePaginaPrincipalCommand(n)) {
        this.emitVideoVoice({ action: 'siguientePagina' });
        return false;
      }
      const ventanitaClave = parseVideoVentanitaOpenCommand(n);
      if (ventanitaClave) {
        this.emitVideoVoice({ action: 'abrirDispositivo', clave: ventanitaClave });
        return false;
      }
      return false;
    }

    return false;
  }

  private dispatchAudiovisualVoiceCommands(n: string): false | 'scroll' | 'bounce' {
    if (isAudiovisualDispositivoPopupOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitAudiovisualPageVoice({ action: 'cerrarDispositivo' });
        return 'bounce';
      }
      return false;
    }

    if (this.isAudiovisualVentanitaVoiceContext()) {
      if (hasSiguientePaginaPrincipalCommand(n)) {
        this.emitAudiovisualPageVoice({ action: 'siguientePagina' });
        return 'bounce';
      }
      const ventanitaClave = parseAudiovisualVentanitaOpenCommand(n);
      if (ventanitaClave) {
        this.emitAudiovisualPageVoice({ action: 'abrirDispositivo', clave: ventanitaClave });
        return 'bounce';
      }
      return false;
    }

    if (this.isAudiovisualComparacionVoiceContext()) {
      const cmds = parseComparacionVoiceCommands(n);
      if (cmds.length) {
        this.emitComparacionVoice({ commands: cmds });
        return 'bounce';
      }
    }

    if (this.isAudiovisualSintonizadorVoiceContext()) {
      const cmds = parseSintonizadorVoiceCommands(n);
      if (cmds.length) {
        this.emitSintonizadorVoice({ commands: cmds });
        return 'bounce';
      }
    }

    if (this.isAudiovisualCollageVoiceContext()) {
      const cmds = parseCollageVoiceCommands(n);
      if (cmds.length) {
        this.emitCollageVoice({ commands: cmds });
        return 'bounce';
      }
    }

    return false;
  }

  private isInteractividadPage(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/interactividad';
  }

  private interactividadVoiceStep(): number {
    if (typeof document === 'undefined') return -1;
    return Number(document.documentElement.getAttribute(INTERACTIVIDAD_VOICE_STEP_ATTR) ?? '-1');
  }

  private emitHistoriaInteractivaVoice(detail: HistoriaInteractivaVoiceDetail): void {
    if (!this.historiaInteractivaBridge.dispatch(detail)) {
      window.dispatchEvent(
        new CustomEvent<HistoriaInteractivaVoiceDetail>(VOICE_HISTORIA_INTERACTIVA_ACTION_EVENT, {
          detail,
        })
      );
    }
  }

  private emitEvolucionInterfacesVoice(detail: EvolucionInterfacesVoiceDetail): void {
    if (!this.evolucionInterfacesBridge.dispatch(detail)) {
      window.dispatchEvent(
        new CustomEvent<EvolucionInterfacesVoiceDetail>(VOICE_EVOLUCION_INTERFACES_ACTION_EVENT, {
          detail,
        })
      );
    }
  }

  private emitMultimediaVoice(detail: MultimediaVoiceCommand): void {
    if (!this.multimediaBridge.dispatch(detail)) {
      window.dispatchEvent(
        new CustomEvent<MultimediaVoiceCommand>(VOICE_MULTIMEDIA_ACTION_EVENT, { detail })
      );
    }
  }

  private emitInteractividadPageVoice(detail: InteractividadVoiceDetail): void {
    if (!this.interactividadPageBridge.dispatch(detail)) {
      window.dispatchEvent(
        new CustomEvent<InteractividadVoiceDetail>(VOICE_INTERACTIVIDAD_PAGE_ACTION_EVENT, {
          detail,
        })
      );
    }
  }

  private dispatchInteractividadVoiceCommands(n: string): false | 'scroll' | 'bounce' {
    if (isInteractividadDispositivoPopupOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitInteractividadPageVoice({ action: 'cerrarDispositivo' });
        return 'bounce';
      }
      return false;
    }

    if (this.isInteractividadVentanitaVoiceContext()) {
      const ventanitaClave = parseInteractividadVentanitaOpenCommand(n);
      if (ventanitaClave) {
        this.emitInteractividadPageVoice({ action: 'abrirDispositivo', clave: ventanitaClave });
        return 'bounce';
      }
      return false;
    }

    if (isPongModalOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitHistoriaInteractivaVoice({ action: 'cerrarPong' });
        return 'bounce';
      }
      const zona = parsePongPaletaZonaCommand(n);
      if (zona !== null) {
        this.emitHistoriaInteractivaVoice({ action: 'paletaZona', zona });
        return 'bounce';
      }
      return false;
    }

    if (this.isHistoriaInteractivaVoiceContext()) {
      if (parsePongOpenCommand(n)) {
        this.emitHistoriaInteractivaVoice({ action: 'abrirPong' });
        return 'bounce';
      }
      const tarjetaId = parseHistoriaTarjetaCommand(n);
      if (tarjetaId) {
        this.emitHistoriaInteractivaVoice({ action: 'tarjetaHover', tarjetaId });
        return 'bounce';
      }
    }

    if (this.isEvolucionInterfacesVoiceContext()) {
      const epocaId = parseEvolucionInterfazEpocaCommand(n);
      if (epocaId !== null) {
        this.emitEvolucionInterfacesVoice({ action: 'epoca', epocaId });
        return 'bounce';
      }
      const direccion = parseEvolucionInterfazDireccionCommand(n);
      if (direccion !== null) {
        this.emitEvolucionInterfacesVoice({ action: 'mover', direccion });
        return 'bounce';
      }
    }

    if (this.isMultimediaVoiceContext()) {
      const cmd = parseMultimediaVoiceCommand(n);
      if (cmd) {
        this.emitMultimediaVoice(cmd);
        return 'bounce';
      }
    }

    return false;
  }

  private isHistoriaInteractivaVoiceContext(): boolean {
    if (isPongModalOpen()) return false;
    const step = this.interactividadVoiceStep();
    if (step === 5) return false;
    if (step === 2) return true;
    return isHistoriaInteractivaInViewport();
  }

  private isEvolucionInterfacesVoiceContext(): boolean {
    if (isPongModalOpen()) return false;
    const step = this.interactividadVoiceStep();
    if (step === 2) return false;
    if (step === 8 || step === 9) return false;
    if (step === 5) return true;
    return isEvolucionInterfacesInViewport();
  }

  private isMultimediaVoiceContext(): boolean {
    if (isPongModalOpen()) return false;
    const step = this.interactividadVoiceStep();
    if (step === 5) return false;
    if (step === 8 || step === 9) return false;
    if (step === 7) return true;
    if (step === 6 && isMultimediaInViewport()) return true;
    return isMultimediaInViewport();
  }

  private isInteractividadVentanitaVoiceContext(): boolean {
    if (isPongModalOpen()) return false;
    const step = this.interactividadVoiceStep();
    if (step === 8 || step === 9) return true;
    if (document.querySelector('app-interactividad .ventanita.interactividad-ventanita-voz-activa')) {
      return true;
    }
    return isInteractividadVentanitaInViewport();
  }

  private dispatchMusicaVoiceCommands(n: string): false | 'scroll' {
    if (isMusicaDispositivoPopupOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitMusicaVoice({ action: 'cerrarDispositivo' });
        return false;
      }
      return false;
    }

    if (this.isMusicaVentanitaVoiceContext()) {
      if (hasSiguientePaginaPrincipalCommand(n)) {
        this.emitMusicaVoice({ action: 'siguientePagina' });
        return false;
      }
      const ventanitaClave = parseMusicaVentanitaOpenCommand(n);
      if (ventanitaClave) {
        this.emitMusicaVoice({ action: 'abrirDispositivo', clave: ventanitaClave });
        return false;
      }
      return false;
    }

    if (this.isMusicaInstrumentosVoiceContext()) {
      const instrumentId = parseInstrumentoSelectCommand(n);
      if (instrumentId) {
        this.emitInstrumentosVoice({ action: 'seleccionar', instrumentId });
        return false;
      }
      const slot = parseInstrumentoPlayCommand(n);
      if (slot) {
        this.emitInstrumentosVoice({ action: 'tocar', slot });
        return false;
      }
    }

    if (this.isMusicaEvolucionVoiceContext()) {
      const eraId = parseEvolucionEraCommand(n);
      if (eraId) {
        this.emitEvolucionVoice({ action: 'era', eraId });
        return false;
      }
      const control = parseEvolucionControlCommand(n);
      if (control) {
        this.emitEvolucionVoice({ action: control });
        return false;
      }
    }

    if (this.isMusicaMesaMezclasVoiceContext()) {
      const cmds = parseMesaMezclasVoiceCommands(n);
      if (cmds.length) {
        this.emitMesaMezclasVoice({ commands: cmds });
        return false;
      }
    }

    return false;
  }

  private dispatchImagenVoiceCommands(n: string): false | 'scroll' {
    if (isImagenMosaicoPopupOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitMosaicoVoice({ action: 'cerrar' });
        return false;
      }
      return false;
    }

    if (isImagenDispositivoPopupOpen()) {
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        this.emitImagenVoice({ action: 'cerrar' });
        return false;
      }
      return false;
    }

    if (this.isImagenVentanitaVoiceContext()) {
      if (hasSiguientePaginaPrincipalCommand(n)) {
        this.emitImagenVoice({ action: 'siguientePagina' });
        return false;
      }
      const ventanitaClave = parseImagenVentanitaOpenCommand(n);
      if (ventanitaClave) {
        this.emitImagenVoice({ action: 'abrirDispositivo', clave: ventanitaClave });
        return false;
      }
      if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
        return false;
      }
      return false;
    }

    if (this.isImagenFiltrosVoiceContext()) {
      const cmds = parseFiltrosVoiceCommands(n);
      if (cmds.length) {
        this.emitFiltrosVoice({ action: 'lote', comandos: cmds });
        return false;
      }
      return false;
    }

    if (this.isImagenLineaVoiceContext()) {
      const lineaClave = parseLineaSelectCommand(n);
      if (lineaClave) {
        this.emitLineaVoice({ action: 'seleccionar', clave: lineaClave });
        return false;
      }
      return false;
    }

    if (this.isImagenMosaicoVoiceContext()) {
      const clave = parseMosaicoOpenCommand(n);
      if (clave) {
        this.emitMosaicoVoice({ action: 'abrir', clave });
        return false;
      }
    }

    if (hasCerrarPrincipalPopupCommand(n) || hasSalirCommand(n)) {
      return false;
    }

    return false;
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el) return false;
    if (el.isContentEditable) return true;
    const tag = el.tagName;
    if (tag === 'TEXTAREA') {
      if (el.closest('app-bloc-notas')) return false;
      return true;
    }
    if (tag === 'SELECT') return true;
    if (tag !== 'INPUT') return false;
    const inp = el as HTMLInputElement;
    const t = (inp.type || 'text').toLowerCase();
    if (
      t === 'range' ||
      t === 'checkbox' ||
      t === 'radio' ||
      t === 'button' ||
      t === 'submit' ||
      t === 'reset' ||
      t === 'file' ||
      t === 'color' ||
      t === 'hidden'
    ) {
      return false;
    }
    if (inp.readOnly) return false;
    return true;
  }
}

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasSalirCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (t === 'salir' || t === 'sali' || t === 'salid') return true;
    if (/^s+a+l+i+r+$/u.test(t)) return true;
  }
  if (n.includes('salir')) return true;
  return wordBoundary(n, 'salir');
}

function hasScrollUpCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('up')) return true;
  for (const t of tokens) {
    if (
      t === 'arriba' ||
      t === 'ariba' ||
      t === 'arriva' ||
      t === 'subir'
    ) {
      return true;
    }
    if (/^a+r{2,6}i+b+a$/u.test(t)) return true;
  }
  if (n.includes('hacia arriba')) return true;
  if (n.includes('scroll') && n.includes('arriba')) return true;
  if (n.includes('arriba')) return true;
  if (n.includes('ariba')) return true;
  return wordBoundary(n, 'arriba');
}

function hasScrollDownCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('down')) return true;
  if (tokens.includes('abajo') || tokens.includes('bajar') || tokens.includes('baja') || tokens.includes('bajo')) return true;
  if (n.includes('hacia abajo')) return true;
  if (n.includes('scroll') && n.includes('abajo')) return true;
  return wordBoundary(n, 'abajo');
}

function hasScrollTopCommand(n: string): boolean {
  return (
    n.includes('arriba del todo') ||
    n.includes('arriba de todo') ||
    n.includes('arriba todo') ||
    n.includes('al principio') ||
    n.includes('inicio de pagina')
  );
}

function hasScrollBottomCommand(n: string): boolean {
  return (
    n.includes('abajo del todo') ||
    n.includes('abajo de todo') ||
    n.includes('abajo todo') ||
    n.includes('al final') ||
    n.includes('final de pagina')
  );
}

function hasScrollMiddleCommand(n: string): boolean {
  return n.includes('mitad de pagina') || n.includes('media pagina') || n.includes('centro de pagina');
}

const SNAP_REPEAT_CAP = 8;

function countScrollDownRepeats(n: string): number {
  const tokens = n.split(/\s+/).filter(Boolean);
  let c = 0;
  for (const t of tokens) {
    if (t === 'down' || t === 'abajo' || t === 'bajar' || t === 'baja' || t === 'bajo') c++;
  }
  if (c > 0) return Math.min(c, SNAP_REPEAT_CAP);
  if (hasScrollDownCommand(n)) return 1;
  return 1;
}

function countScrollUpRepeats(n: string): number {
  const tokens = n.split(/\s+/).filter(Boolean);
  let c = 0;
  for (const t of tokens) {
    if (t === 'up' || t === 'arriba' || t === 'ariba' || t === 'arriva' || t === 'subir') {
      c++;
    } else if (/^a+r{2,6}i+b+a$/u.test(t)) {
      c++;
    }
  }
  if (c > 0) return Math.min(c, SNAP_REPEAT_CAP);
  if (hasScrollUpCommand(n)) return 1;
  return 1;
}

function wordBoundary(normalized: string, word: string): boolean {
  const re = new RegExp(`(?:^|\\s)${word}(?:$|\\s)`, 'u');
  return re.test(normalized);
}

function hasNavMenuCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('navegacion')) return true;
  return wordBoundary(n, 'navegacion');
}

function hasAccessibilityMenuCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('accesibilidad')) return true;
  return wordBoundary(n, 'accesibilidad');
}

function hasLateralMenuCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('lateral')) return true;
  return wordBoundary(n, 'lateral');
}

function hasCerrarPrincipalPopupCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (t === 'cerrar' || t === 'cierra' || t === 'cerra' || t === 'cerrad' || t === 'cerrame') return true;
    if (/^c+e+r+r+a+r?$/u.test(t)) return true;
  }
  if (n.includes('cerrar') || n.includes('cierra')) return true;
  return wordBoundary(n, 'cerrar') || wordBoundary(n, 'cierra');
}

function hasOpenPrincipalPopup(): boolean {
  if (typeof document === 'undefined') return false;
  return isJuegoPopupOpen() || isCarruselPopupOpen();
}

function isCarouselLeftToken(t: string): boolean {
  if (t === 'izquierda' || t === 'izquierdo' || t === 'izq') return true;
  return /^i+z?q?uierd[ao]?$/u.test(t);
}

function isCarouselRightToken(t: string): boolean {
  if (t === 'derecha' || t === 'derecho' || t === 'der') return true;
  return /^d+e+r+e?c+h?[ao]?$/u.test(t);
}

function hasCarouselLeftCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.some(isCarouselLeftToken)) return true;
  if (n.includes('izquierda') || n.includes('izquierdo')) return true;
  return wordBoundary(n, 'izquierda');
}

function hasCarouselRightCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.some(isCarouselRightToken)) return true;
  if (n.includes('derecha') || n.includes('derecho')) return true;
  return wordBoundary(n, 'derecha');
}

function listCarouselStepsInPhrase(n: string): (-1 | 1)[] {
  const steps: (-1 | 1)[] = [];
  for (const t of n.split(/\s+/).filter(Boolean)) {
    if (isCarouselLeftToken(t)) steps.push(-1);
    else if (isCarouselRightToken(t)) steps.push(1);
  }
  if (!steps.length) {
    if (hasCarouselLeftCommand(n)) steps.push(-1);
    else if (hasCarouselRightCommand(n)) steps.push(1);
  }
  return steps.slice(0, SNAP_REPEAT_CAP);
}

function hasCarouselOpenCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('carrusel') || tokens.includes('carousel')) return true;
  if (n.includes('carrusel') || n.includes('carousel')) return true;
  return wordBoundary(n, 'carrusel');
}

function hasJuguemosCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (t === 'juguemos' || t === 'jugamos' || t === 'jugemos' || t === 'juguemoz') return true;
    if (/^j[uú]gu?e?m[o0]s$/u.test(t)) return true;
    if (/^j[uú]gamos$/u.test(t)) return true;
    if (/^h[uú]gu?e?m[o0]s$/u.test(t)) return true;
  }
  if (n.includes('juguemos') || n.includes('jugamos')) return true;
  return wordBoundary(n, 'juguemos') || wordBoundary(n, 'jugamos');
}

function hasSiguientePaginaPrincipalCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('siguiente') || tokens.includes('next')) return true;
  if (n.includes('siguiente')) return true;
  return wordBoundary(n, 'siguiente');
}

function isGlobalVoiceCommandPhrase(n: string): boolean {
  return (
    hasSalirCommand(n) ||
    hasScrollTopCommand(n) ||
    hasScrollBottomCommand(n) ||
    hasScrollMiddleCommand(n) ||
    hasScrollUpCommand(n) ||
    hasScrollDownCommand(n) ||
    hasNavMenuCommand(n) ||
    hasAccessibilityMenuCommand(n) ||
    hasLateralMenuCommand(n) ||
    hasCarouselLeftCommand(n) ||
    hasCarouselRightCommand(n) ||
    hasSiguientePaginaPrincipalCommand(n) ||
    hasCerrarPrincipalPopupCommand(n) ||
    hasTextoEvolucionCommand(n) ||
    hasMaquinaEscribirDeviceCommand(n) ||
    hasKindleDeviceCommand(n) ||
    hasBlocGuardarCommand(n) ||
    hasBlocLimpiarCommand(n) ||
    isBlocEscribirOnlyCommand(n)
  );
}

function hasBlocGuardarCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.some(t => t === 'guardar' || t === 'guarda' || t === 'save')) return true;
  return wordBoundary(n, 'guardar') || wordBoundary(n, 'guarda') || wordBoundary(n, 'save');
}

function hasBlocLimpiarCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (
    tokens.some(t =>
      t === 'limpiar' ||
      t === 'limpia' ||
      t === 'clean' ||
      t === 'borrar' ||
      t === 'borra' ||
      t === 'vaciar' ||
      t === 'vacía' ||
      t === 'vacia'
    )
  ) {
    return true;
  }
  if (n.includes('limpiar todo') || n.includes('borrar todo') || n.includes('vaciar')) return true;
  return wordBoundary(n, 'limpiar') || wordBoundary(n, 'limpia') || wordBoundary(n, 'clean') || wordBoundary(n, 'borrar');
}

function isBlocEscribirOnlyCommand(n: string): boolean {
  const t = n.trim();
  if (/^(?:escribir|escribe|write)(?:\s+(?:otra vez|de nuevo|nuevo|otra cosa))?\s*$/iu.test(t)) return true;
  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length === 1 && (tokens[0] === 'escribir' || tokens[0] === 'escribe' || tokens[0] === 'write')) return true;
  return t === 'escribir' || t === 'escribe' || t === 'write';
}

function extractBlocWriteText(n: string, raw: string): string | null {
  if (hasMaquinaEscribirDeviceCommand(n)) return null;

  const m = n.match(/\b(?:escribir|escribe|write)\s+(.+)$/iu);
  if (m?.[1]) {
    const text = m[1].replace(/\s+/g, ' ').trim();
    if (text && !isBlocEscribirMetaPhrase(text)) return text;
  }

  const rawM = raw.trim().match(/^(?:escribir|escribe|write)\s+(.+)$/iu);
  if (rawM?.[1]) {
    const text = rawM[1].replace(/\s+/g, ' ').trim();
    if (text && !isBlocEscribirMetaPhrase(text)) return text;
  }

  const tokens = n.split(/\s+/).filter(Boolean);
  const idx = tokens.findIndex(t => t === 'escribir' || t === 'escribe' || t === 'write');
  if (idx >= 0 && idx < tokens.length - 1) {
    const text = tokens.slice(idx + 1).join(' ');
    if (!isBlocEscribirMetaPhrase(text)) return text;
  }
  return null;
}

function isBlocEscribirMetaPhrase(text: string): boolean {
  return /^(?:otra vez|de nuevo|nuevo|otra cosa)$/iu.test(text.trim());
}

function hasTextoEvolucionCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (t === 'evolucion' || t === 'evolucionar' || t === 'evolutivo' || t === 'evolution') return true;
    if (/^e+v+o+l+u/i.test(t) && t.length >= 6) return true;
    if (/^e+v+o+lucion/i.test(t)) return true;
  }
  if (
    n.includes('evolucion de dispositivos') ||
    n.includes('evolucion dispositivos') ||
    n.includes('dispositivos del texto') ||
    n.includes('evolucion del texto')
  ) {
    return true;
  }
  return wordBoundary(n, 'evolucion') || wordBoundary(n, 'evolucionar') || wordBoundary(n, 'evolution');
}

function hasMaquinaEscribirDeviceCommand(n: string): boolean {
  if (n.includes('maquina de escribir') || n.includes('maquina escribir')) return true;
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (t === 'maquina' || t === 'maquinas') return true;
    if (/^m+a+q+u?i+n+a?s?$/iu.test(t)) return true;
  }
  if (tokens.includes('mecanica') && tokens.some(t => /^m+a+q/i.test(t))) return true;
  return wordBoundary(n, 'maquina');
}

function hasKindleDeviceCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (t === 'kindle' || t === 'kindleo') return true;
    if (/^k+i+n?d+l+e?/iu.test(t) && t.length >= 5) return true;
  }
  if (n.includes('kindle')) return true;
  return wordBoundary(n, 'kindle');
}

function hasAudioEscucharCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('escuchar') || tokens.includes('escucha')) return true;
  if (n.includes('escucha un fragmento') || n.includes('fragmento de audio')) return true;
  return wordBoundary(n, 'escuchar') || wordBoundary(n, 'escucha');
}

function hasAudioExplorarCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('explorar') || tokens.includes('explora')) return true;
  if (n.includes('explora ejemplos') || n.includes('explorar ejemplos')) return true;
  return wordBoundary(n, 'explorar') || wordBoundary(n, 'explora');
}

function hasOcultarCarruselCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (
    tokens.some(t =>
      t === 'ocultar' ||
      t === 'oculta' ||
      t === 'esconder' ||
      t === 'esconde' ||
      t === 'hide' ||
      t === 'ocultame'
    )
  ) {
    return true;
  }
  if (n.includes('ocultar') || n.includes('esconder')) return true;
  return wordBoundary(n, 'ocultar') || wordBoundary(n, 'esconder');
}

function hasVerCarruselCommand(n: string): boolean {
  if (hasOcultarCarruselCommand(n)) return false;
  if (n.includes('ver mas') || n.includes('ver más')) return false;
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('ver') || tokens.includes('ve') || tokens.includes('mirar') || tokens.includes('see')) {
    return true;
  }
  return wordBoundary(n, 'ver') || wordBoundary(n, 'mirar');
}

function hasWalkmanDeviceCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (t === 'walkman' || t === 'walkmen') return true;
    if (/^w+a+l+k/i.test(t) && t.length >= 6) return true;
  }
  if (n.includes('walkman')) return true;
  return wordBoundary(n, 'walkman');
}

function hasAltavozDeviceCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (t === 'altavoz' || t === 'altavoces' || t === 'altavozes') return true;
    if (/^a+l+t+a+v/i.test(t) && t.length >= 6) return true;
  }
  if (n.includes('altavoz') || n.includes('altavoces')) return true;
  return wordBoundary(n, 'altavoz');
}
