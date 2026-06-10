import {
  Component,
  signal,
  computed,
  ViewChild,
  ElementRef,
  inject,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStateService } from '../../../services/ui-state.service';
import { SpeakableDirective } from '../../../directives/app-speakable';
import {
  VOICE_MEDIA_DECK_ACTION_EVENT,
  VoiceNavigationService,
  type MediaDeckVoiceDetail,
} from '../../../services/voice-navigation.service';
import { MediaDeckVoiceBridgeService } from '../../../services/media-deck-voice-bridge.service';
import {
  mediaDeckFormatoHint,
  type MediaDeckFormatoId,
} from '../../../utils/video-media-deck-voice';
import { voiceHintDisplay } from '../../../utils/voice-hint-display';

@Component({
  selector: 'app-media-deck',
  standalone: true,
  imports: [CommonModule, SpeakableDirective],
  templateUrl: './media-deck.html',
  styleUrl: './media-deck.scss'
})
export class MediaDeck implements AfterViewInit, OnDestroy {
  ui = inject(UiStateService);
  private mediaDeckVoiceBridge = inject(MediaDeckVoiceBridgeService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  readonly voiceNav = inject(VoiceNavigationService);

  readonly hintReproducir = voiceHintDisplay('reproducir');
  readonly hintPausar = 'pause';
  readonly hintVolumen = voiceHintDisplay('volumen');

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  formatoActivo = signal<MediaDeckFormatoId>('vhs');
  isCargando = signal(false);
  isPlaying = signal(false);
  isMuted = signal(true);

  formatos: { id: MediaDeckFormatoId; label: string; videoUrl: string; icon: string }[] = [
    { id: 'vhs', label: 'CINTA VHS', videoUrl: 'assets/videos/video/vhs.mp4', icon: '📼' },
    { id: 'beta', label: 'BETAMAX', videoUrl: 'assets/videos/video/betamax.mp4', icon: '📹' },
    { id: 'dvd', label: 'DVD DIGITAL', videoUrl: 'assets/videos/video/dvd.mp4', icon: '💿' }
  ];

  formatoSeleccionado = computed(() =>
    this.formatos.find(f => f.id === this.formatoActivo()) || this.formatos[0]
  );

  pistaFormato(id: MediaDeckFormatoId): string {
    return mediaDeckFormatoHint(id);
  }

  cargarFormato(id: MediaDeckFormatoId) {
    this.isCargando.set(true);
    this.isPlaying.set(false);
    setTimeout(() => {
      this.formatoActivo.set(id);
      this.isCargando.set(false);
      this.cdr.markForCheck();
    }, 600);
  }

  togglePlay() {
    const video = this.videoPlayer.nativeElement;
    if (video.paused) {
      video.play();
      this.isPlaying.set(true);
    } else {
      video.pause();
      this.isPlaying.set(false);
    }
  }

  stopVideo() {
    const video = this.videoPlayer.nativeElement;
    video.pause();
    video.currentTime = 0;
    this.isPlaying.set(false);
  }

  toggleMute() {
    const video = this.videoPlayer.nativeElement;
    video.muted = !video.muted;
    this.isMuted.set(video.muted);
  }

  voiceReproducir(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    if (this.isCargando()) return;
    video.play().then(() => this.isPlaying.set(true)).catch(() => {});
    this.cdr.markForCheck();
  }

  voicePausar(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    video.pause();
    this.isPlaying.set(false);
    this.cdr.markForCheck();
  }

  private readonly handleMediaDeckVoice = (detail: MediaDeckVoiceDetail): void => {
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'formato':
          if (detail.formatoId) this.cargarFormato(detail.formatoId);
          break;
        case 'reproducir':
          this.voiceReproducir();
          break;
        case 'pausar':
          this.voicePausar();
          break;
        case 'toggleMute':
          this.toggleMute();
          break;
      }
    });
  };

  private readonly onMediaDeckVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<MediaDeckVoiceDetail>).detail;
    if (detail?.action) this.handleMediaDeckVoice(detail);
  }) as EventListener;

  ngAfterViewInit(): void {
    this.mediaDeckVoiceBridge.connect(this.handleMediaDeckVoice);
    window.addEventListener(VOICE_MEDIA_DECK_ACTION_EVENT, this.onMediaDeckVoiceEvent);
    const video = this.videoPlayer?.nativeElement;
    if (video) this.isMuted.set(video.muted);
  }

  ngOnDestroy(): void {
    this.mediaDeckVoiceBridge.disconnect();
    window.removeEventListener(VOICE_MEDIA_DECK_ACTION_EVENT, this.onMediaDeckVoiceEvent);
  }
}
