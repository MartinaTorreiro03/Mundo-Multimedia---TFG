import {
  Component,
  signal,
  computed,
  HostListener,
  inject,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { UiStateService } from '../../../services/ui-state.service';
import {
  VOICE_VIDEO_INMERSIVO_ACTION_EVENT,
  VoiceNavigationService,
  type VideoInmersivoVoiceDetail,
} from '../../../services/voice-navigation.service';
import { VideoInmersivoVoiceBridgeService } from '../../../services/video-inmersivo-voice-bridge.service';
import {
  inmersivoFlechaHint,
  type InmersivoFlechaId,
} from '../../../utils/video-inmersivo-voice';

export interface FlechaNavConfig {
  id: InmersivoFlechaId;
  css: string;
  symbol: string;
  aria: string;
  rotX: number;
  rotY: number;
  holdX: number;
  holdY: number;
}

@Component({
  selector: 'app-video-inmersivo',
  standalone: true,
  templateUrl: './video-inmersivo.html',
  styleUrls: ['./video-inmersivo.scss']
})
export class VideoInmersivo implements AfterViewInit, OnDestroy {
  ui = inject(UiStateService);
  private inmersivoVoiceBridge = inject(VideoInmersivoVoiceBridgeService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  readonly voiceNav = inject(VoiceNavigationService);

  readonly flechasNav: FlechaNavConfig[] = [
    { id: 1, css: 'up', symbol: '▲', aria: 'Rotar arriba', rotX: 4, rotY: 0, holdX: 2, holdY: 0 },
    { id: 2, css: 'up-right', symbol: '◥', aria: 'Rotar arriba derecha', rotX: 4, rotY: 4, holdX: 2, holdY: 2 },
    { id: 3, css: 'right', symbol: '▶', aria: 'Rotar a la derecha', rotX: 0, rotY: 4, holdX: 0, holdY: 2 },
    { id: 4, css: 'down-right', symbol: '◢', aria: 'Rotar abajo derecha', rotX: -4, rotY: 4, holdX: -2, holdY: 2 },
    { id: 5, css: 'down', symbol: '▼', aria: 'Rotar abajo', rotX: -4, rotY: 0, holdX: -2, holdY: 0 },
    { id: 6, css: 'down-left', symbol: '◣', aria: 'Rotar abajo izquierda', rotX: -4, rotY: -4, holdX: -2, holdY: -2 },
    { id: 7, css: 'left', symbol: '◀', aria: 'Rotar a la izquierda', rotX: 0, rotY: -4, holdX: 0, holdY: -2 },
    { id: 8, css: 'up-left', symbol: '◤', aria: 'Rotar arriba izquierda', rotX: 4, rotY: -4, holdX: 2, holdY: -2 },
  ];

  rotationX = signal(-10);
  rotationY = signal(20);
  isDragging = signal(false);
  intervalo: ReturnType<typeof setInterval> | undefined;

  transformStyle = computed(() =>
    `translateZ(-350px) rotateX(${this.rotationX()}deg) rotateY(${this.rotationY()}deg)`
  );

  pistaFlecha(id: InmersivoFlechaId): string {
    return inmersivoFlechaHint(id);
  }

  startRotation(x: number, y: number) {
    this.stopRotation();
    this.rotar(x, y);
    this.intervalo = setInterval(() => {
      this.rotar(x, y);
    }, 50);
  }

  stopRotation() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  rotar(x: number, y: number) {
    this.rotationX.update(v => v + x);
    this.rotationY.update(v => v + y);
  }

  voiceRotarFlecha(flecha: InmersivoFlechaId): void {
    const cfg = this.flechasNav.find(f => f.id === flecha);
    if (!cfg) return;
    this.rotar(cfg.rotX, cfg.rotY);
    this.cdr.markForCheck();
  }

  onEnterDown(event: Event, x: number, y: number) {
    event.preventDefault();
    if ((event as KeyboardEvent).repeat) return;
    this.startRotation(x, y);
  }

  @HostListener('mousedown') onMouseDown() { this.isDragging.set(true); }
  @HostListener('window:mouseup') onMouseUp() {
    this.isDragging.set(false);
    this.stopRotation();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging()) {
      this.rotationY.update(v => v + event.movementX * 0.2);
      this.rotationX.update(v => v - event.movementY * 0.2);
    }
  }

  private readonly handleInmersivoVoice = (detail: VideoInmersivoVoiceDetail): void => {
    this.ngZone.run(() => {
      if (detail.action === 'rotar' && detail.flecha) {
        this.voiceRotarFlecha(detail.flecha);
      }
    });
  };

  private readonly onInmersivoVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<VideoInmersivoVoiceDetail>).detail;
    if (detail?.action) this.handleInmersivoVoice(detail);
  }) as EventListener;

  ngAfterViewInit(): void {
    this.inmersivoVoiceBridge.connect(this.handleInmersivoVoice);
    window.addEventListener(VOICE_VIDEO_INMERSIVO_ACTION_EVENT, this.onInmersivoVoiceEvent);
  }

  ngOnDestroy(): void {
    this.inmersivoVoiceBridge.disconnect();
    window.removeEventListener(VOICE_VIDEO_INMERSIVO_ACTION_EVENT, this.onInmersivoVoiceEvent);
    this.stopRotation();
  }
}
