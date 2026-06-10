import {
  Component,
  OnDestroy,
  HostListener,
  inject,
  signal,
  AfterViewInit,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStateService } from '../../../services/ui-state.service';
import { SpeakableDirective } from '../../../directives/app-speakable';
import {
  VoiceNavigationService,
  type CollageVoiceDetail,
} from '../../../services/voice-navigation.service';
import { CollageVoiceBridgeService } from '../../../services/collage-voice-bridge.service';
import {
  collageColumnHint,
  collageItemHint,
  type CollageColumn,
  type CollageVoiceParsed,
} from '../../../utils/audiovisual-collage-voice';
import { VOICE_COLLAGE_ACTION_EVENT } from '../../../utils/audiovisual-voice-dom';

interface MediaItem {
  src: string;
  alt: string;
}

interface VideoItem {
  src: string;
  label: string;
}

interface AudioItem {
  src: string;
  label: string;
}

export interface DraggableInstance {
  src: string;
  alt?: string;
  x: number;
  y: number;
  scale: number;
  dragging: boolean;
  offsetX: number;
  offsetY: number;
}

@Component({
  selector: 'app-collage-interactivo',
  standalone: true,
  imports: [CommonModule, SpeakableDirective],
  templateUrl: './collage-interactivo.html',
  styleUrls: ['./collage-interactivo.scss'],
})
export class CollageInteractivo implements AfterViewInit, OnDestroy {
  ui = inject(UiStateService);
  readonly voiceNav = inject(VoiceNavigationService);
  private readonly collageVoiceBridge = inject(CollageVoiceBridgeService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly clColumnaVozActiva = signal<CollageColumn | null>(null);

  activeVideoSrc: string | null = null;
  textoInstances: DraggableInstance[] = [];
  gifInstances: DraggableInstance[] = [];

  private draggingElement: DraggableInstance | null = null;
  private audioMap: Map<string, HTMLAudioElement> = new Map();
  activeAudioSrcs: Set<string> = new Set();

  ventanaActiva = false;

  videos: VideoItem[] = [
    { src: 'assets/videos/audiovisual/minecraft.mp4', label: 'Minecraft' },
    { src: 'assets/videos/audiovisual/luna.mp4', label: 'Luna' },
    { src: 'assets/videos/audiovisual/playa.mp4', label: 'Playa' },
  ];

  audios: AudioItem[] = [
    { src: 'assets/audio/audiovisual/boom.mp3', label: 'Explosión' },
    { src: 'assets/audio/audiovisual/uh.mp3', label: 'Roblox' },
    { src: 'assets/audio/audiovisual/uooo.mp3', label: 'Shin Chan' },
  ];

  textos: MediaItem[] = [
    { src: 'assets/videos/audiovisual/texto1.gif', alt: 'Brilli Brilli' },
    { src: 'assets/videos/audiovisual/texto2.gif', alt: 'Glitch' },
    { src: 'assets/videos/audiovisual/texto3.gif', alt: 'Evil' },
  ];

  gifs: MediaItem[] = [
    { src: 'assets/videos/audiovisual/calamardo.gif', alt: 'Calamardo' },
    { src: 'assets/videos/audiovisual/gatito.gif', alt: 'Gatito' },
    { src: 'assets/videos/audiovisual/alien.gif', alt: 'Alien' },
  ];

  ngAfterViewInit(): void {
    this.collageVoiceBridge.connect(this.handleCollageVoice);
    window.addEventListener(VOICE_COLLAGE_ACTION_EVENT, this.onCollageVoiceEvent);
  }

  ngOnDestroy(): void {
    this.collageVoiceBridge.disconnect();
    window.removeEventListener(VOICE_COLLAGE_ACTION_EVENT, this.onCollageVoiceEvent);
    this.audioMap.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioMap.clear();
  }

  pistaColumna(column: CollageColumn): string {
    return collageColumnHint(column);
  }

  pistaItem(index: number): string {
    return collageItemHint(index);
  }

  isClColumnaVozActiva(column: CollageColumn): boolean {
    return this.clColumnaVozActiva() === column;
  }

  private readonly handleCollageVoice = (detail: CollageVoiceDetail): void => {
    this.ngZone.run(() => {
      this.applyVoiceCommands(detail.commands);
      this.cdr.markForCheck();
    });
  };

  private readonly onCollageVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<CollageVoiceDetail>).detail;
    if (detail?.commands?.length) this.handleCollageVoice(detail);
  }) as EventListener;

  private applyVoiceCommands(commands: CollageVoiceParsed[]): void {
    for (const cmd of commands) {
      switch (cmd.kind) {
        case 'selectColumn':
          this.selectColumnVoz(cmd.column);
          break;
        case 'selectItem':
          this.selectItemVoz(cmd.index);
          break;
      }
    }
  }

  private focusRole(role: string): void {
    (
      document.querySelector(`app-collage-interactivo [data-mm-role="${role}"]`) as HTMLElement | null
    )?.focus({ preventScroll: true });
  }

  private selectColumnVoz(column: CollageColumn): void {
    this.clColumnaVozActiva.set(column);
    this.focusRole(`cl-col-${column}`);
  }

  private selectItemVoz(index: number): void {
    const column = this.clColumnaVozActiva();
    if (!column || index < 0 || index > 2) return;

    switch (column) {
      case 'videos': {
        const item = this.videos[index];
        if (item) {
          this.toggleVideo(item.src);
          this.focusRole(`cl-${column}-item-${index + 1}`);
        }
        break;
      }
      case 'audios': {
        const item = this.audios[index];
        if (item) {
          this.toggleAudio(item.src);
          this.focusRole(`cl-${column}-item-${index + 1}`);
        }
        break;
      }
      case 'textos': {
        const item = this.textos[index];
        if (item) {
          this.toggleTexto(item);
          this.focusRole(`cl-${column}-item-${index + 1}`);
        }
        break;
      }
      case 'gifs': {
        const item = this.gifs[index];
        if (item) {
          this.toggleGif(item);
          this.focusRole(`cl-${column}-item-${index + 1}`);
        }
        break;
      }
    }
  }

  get audioFiller(): number[] {
    const count = 3 - this.audios.length;
    return count > 0 ? Array(count).fill(0) : [];
  }

  get hasContent(): boolean {
    return !!this.activeVideoSrc || this.textoInstances.length > 0 || this.gifInstances.length > 0;
  }

  toggleVideo(src: string): void {
    this.activeVideoSrc = this.activeVideoSrc === src ? null : src;
  }

  isVideoActive(src: string): boolean {
    return this.activeVideoSrc === src;
  }

  toggleAudio(src: string): void {
    if (this.audioMap.has(src)) {
      const audio = this.audioMap.get(src)!;
      if (!audio.paused) {
        audio.pause();
        this.activeAudioSrcs.delete(src);
      } else {
        audio.play();
        this.activeAudioSrcs.add(src);
      }
    } else {
      const audio = new Audio(src);
      this.audioMap.set(src, audio);
      audio.play();
      this.activeAudioSrcs.add(src);
      audio.addEventListener('ended', () => this.activeAudioSrcs.delete(src));
    }
  }

  isAudioActive(src: string): boolean {
    return this.activeAudioSrcs.has(src);
  }

  toggleTexto(item: MediaItem): void {
    const idx = this.textoInstances.findIndex(t => t.src === item.src);
    if (idx > -1) {
      this.textoInstances.splice(idx, 1);
    } else {
      this.textoInstances.push(this.createNewInstance(item));
    }
  }

  isTextoActive(src: string): boolean {
    return this.textoInstances.some(t => t.src === src);
  }

  toggleGif(item: MediaItem): void {
    const idx = this.gifInstances.findIndex(g => g.src === item.src);
    if (idx > -1) {
      this.gifInstances.splice(idx, 1);
    } else {
      this.gifInstances.push(this.createNewInstance(item));
    }
  }

  isGifActive(src: string): boolean {
    return this.gifInstances.some(g => g.src === src);
  }

  private createNewInstance(item: MediaItem): DraggableInstance {
    return {
      src: item.src,
      alt: item.alt,
      x: 20 + Math.random() * 40,
      y: 20 + Math.random() * 40,
      scale: 1,
      dragging: false,
      offsetX: 0,
      offsetY: 0,
    };
  }

  onMouseDown(event: MouseEvent, element: DraggableInstance, screen: HTMLElement): void {
    event.preventDefault();
    const rect = screen.getBoundingClientRect();
    element.dragging = true;
    element.offsetX = event.clientX - rect.left - (element.x / 100) * rect.width;
    element.offsetY = event.clientY - rect.top - (element.y / 100) * rect.height;
    this.draggingElement = element;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.draggingElement) return;
    const screen = document.getElementById('screen');
    if (!screen) return;
    const rect = screen.getBoundingClientRect();
    const newX = ((event.clientX - rect.left - this.draggingElement.offsetX) / rect.width) * 100;
    const newY = ((event.clientY - rect.top - this.draggingElement.offsetY) / rect.height) * 100;
    this.draggingElement.x = Math.max(-10, Math.min(95, newX));
    this.draggingElement.y = Math.max(-10, Math.min(95, newY));
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.draggingElement) {
      this.draggingElement.dragging = false;
      this.draggingElement = null;
    }
  }

  handleScaleClick(event: MouseEvent, element: DraggableInstance): void {
    if (event.ctrlKey) {
      const scales = [1, 1.5, 2, 0.5];
      let currentIdx = scales.indexOf(element.scale);
      if (currentIdx === -1) currentIdx = 0;
      element.scale = scales[(currentIdx + 1) % scales.length];
    }
  }

  onNavHover(active: boolean): void {
    this.ventanaActiva = active;
  }
}
