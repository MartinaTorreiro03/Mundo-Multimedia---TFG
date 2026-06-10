import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, AfterViewInit, inject, computed } from '@angular/core';
import { SpeakableDirective } from '../../../directives/app-speakable';
import { VOICE_CARRUSEL_STEP_EVENT, VoiceNavigationService } from '../../../services/voice-navigation.service';

type CarouselItem = {
  src: string;
  title: string;
  text: string;
};

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [SpeakableDirective],
  templateUrl: './carrusel.html',
  styleUrl: './carrusel.scss',
})
export class Carrusel implements OnChanges, AfterViewInit, OnDestroy {
  @Input() items: CarouselItem[] = [];
  @Input() startIndex = 0;

  @Output() indexChange = new EventEmitter<number>();

  voiceNav = inject(VoiceNavigationService);
  voiceHints = computed(() => this.voiceNav.enabled());

  idx = 0;

  private readonly onVoiceStep = ((ev: Event) => {
    const detail = (ev as CustomEvent<{ direction: -1 | 1; steps?: number }>).detail;
    const direction = detail?.direction;
    const steps = Math.min(8, Math.max(1, detail?.steps ?? 1));
    for (let s = 0; s < steps; s++) {
      if (direction === -1) this.prev();
      else if (direction === 1) this.next();
    }
  }) as EventListener;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startIndex']) this.idx = this.clampIndex(this.startIndex);
    if (changes['items']) this.idx = this.clampIndex(this.idx);
  }

  ngAfterViewInit(): void {
    window.addEventListener(VOICE_CARRUSEL_STEP_EVENT, this.onVoiceStep);
  }

  ngOnDestroy(): void {
    window.removeEventListener(VOICE_CARRUSEL_STEP_EVENT, this.onVoiceStep);
  }

  prev() {
    if (!this.items.length) return;
    this.idx = (this.idx - 1 + this.items.length) % this.items.length;
    this.indexChange.emit(this.idx);
  }

  next() {
    if (!this.items.length) return;
    this.idx = (this.idx + 1) % this.items.length;
    this.indexChange.emit(this.idx);
  }

  onPrevClick(ev: MouseEvent) {
    ev.stopPropagation();
    this.prev();
  }

  onNextClick(ev: MouseEvent) {
    ev.stopPropagation();
    this.next();
  }

  private clampIndex(i: number) {
    if (!this.items.length) return 0;
    if (i < 0) return 0;
    if (i >= this.items.length) return this.items.length - 1;
    return i;
  }

}
