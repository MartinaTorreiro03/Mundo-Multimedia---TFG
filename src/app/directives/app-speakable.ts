import {
  Directive,
  ElementRef,
  Renderer2,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  AfterViewChecked,
  SimpleChanges,
  inject,
  Injector
} from '@angular/core';
import { effect, EffectRef } from '@angular/core';
import { LectorPantallaService } from '../services/lector-pantalla';

@Directive({
  selector: '[appSpeakable]',
  standalone: true
})
export class SpeakableDirective implements OnInit, OnDestroy, OnChanges, AfterViewChecked {
  @Input('appSpeakable') textToSpeak?: string;

  private host = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private lector = inject(LectorPantallaService);
  private injector = inject(Injector);

  private buttonEl?: HTMLButtonElement;
  private iconEl?: HTMLSpanElement;
  private labelEl?: HTMLSpanElement;
  private hostTextSnapshot = '';
  private unlistenClick?: () => void;
  private stateEffect?: EffectRef;
  private playbackEffect?: EffectRef;

  ngOnInit(): void {
    this.syncHostTextSnapshot();

    this.stateEffect = effect(
      () => {
        if (this.lector.lectorActivo()) {
          this.ensureButton();
        } else {
          this.removeButton();
        }
      },
      { injector: this.injector }
    );

    this.playbackEffect = effect(
      () => {
        if (!this.buttonEl) return;
        this.updateButtonState();
      },
      { injector: this.injector }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['textToSpeak']) {
      this.syncHostTextSnapshot();
      this.updateAriaLabel();
      this.updateButtonState();
    }
  }

  ngAfterViewChecked(): void {
    if (this.lector.lectorActivo()) {
      this.ensureButton();
    }

    if (this.textToSpeak !== undefined && this.textToSpeak !== null) {
      return;
    }
    const live = this.readHostText();
    if (live === this.hostTextSnapshot) return;
    this.hostTextSnapshot = live;
    this.updateAriaLabel();
    this.updateButtonState();
  }

  private syncHostTextSnapshot(): void {
    const t = this.textToSpeak;
    if (t !== undefined && t !== null) {
      this.hostTextSnapshot = String(t);
    } else {
      this.hostTextSnapshot = this.readHostText();
    }
  }

  ngOnDestroy(): void {
    this.removeButton();
    this.stateEffect?.destroy();
    this.playbackEffect?.destroy();
  }

  private ensureButton(): void {
    const hostEl = this.host.nativeElement;

    if (this.buttonEl) {
      if (this.buttonEl.parentNode !== hostEl) {
        this.renderer.appendChild(hostEl, this.buttonEl);
      }
      this.updateAriaLabel();
      this.updateButtonState();
      return;
    }

    const btn = this.renderer.createElement('button') as HTMLButtonElement;
    this.buttonEl = btn;
    this.syncHostTextSnapshot();

    this.renderer.setAttribute(btn, 'type', 'button');
    this.renderer.addClass(btn, 'speak-btn');
    this.updateAriaLabel();

    const icon = this.renderer.createElement('span') as HTMLSpanElement;
    this.iconEl = icon;
    this.renderer.setAttribute(icon, 'aria-hidden', 'true');
    this.renderer.appendChild(icon, this.renderer.createText('🔊'));

    const label = this.renderer.createElement('span') as HTMLSpanElement;
    this.labelEl = label;
    this.renderer.addClass(label, 'speak-btn-label');
    this.renderer.appendChild(label, this.renderer.createText('Escuchar'));

    this.renderer.appendChild(btn, icon);
    this.renderer.appendChild(btn, label);

    this.unlistenClick = this.renderer.listen(btn, 'click', (event: Event) => {
      event.stopPropagation();
      this.handleButtonClick();
    });

    this.renderer.appendChild(hostEl, btn);
    this.updateButtonState();
  }

  private updateAriaLabel(): void {
    if (!this.buttonEl) return;
    this.renderer.setAttribute(
      this.buttonEl,
      'aria-label',
      `Escuchar texto: ${this.getSpeakText()}`
    );
  }

  private removeButton(): void {
    if (this.unlistenClick) {
      this.unlistenClick();
      this.unlistenClick = undefined;
    }

    if (this.buttonEl?.parentNode) {
      this.renderer.removeChild(this.buttonEl.parentNode, this.buttonEl);
    }

    this.buttonEl = undefined;
    this.iconEl = undefined;
    this.labelEl = undefined;
  }

  private readHostText(): string {
    const hostEl = this.host.nativeElement;
    const nodes = Array.from(hostEl.childNodes) as ChildNode[];

    const directText = nodes
      .filter((n: ChildNode) => n.nodeType === Node.TEXT_NODE)
      .map((n: ChildNode) => n.textContent ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return directText || hostEl.textContent?.trim() || '';
  }

  private getSpeakText(): string {
    if (this.textToSpeak?.trim()) return this.textToSpeak.trim();
    if (this.hostTextSnapshot) return this.hostTextSnapshot;
    return this.readHostText();
  }

  private handleButtonClick(): void {
    const text = this.getSpeakText();
    const isCurrentText = this.lector.currentText() === text;
    const isPlayingThisText = this.lector.speaking() && isCurrentText;

    if (!isPlayingThisText) {
      this.lector.speak(text);
      return;
    }

    if (this.lector.paused()) {
      this.lector.resume();
      return;
    }

    this.lector.pause();
  }

  private updateButtonState(): void {
    if (!this.buttonEl || !this.labelEl || !this.iconEl) return;

    const text = this.getSpeakText();
    const isCurrentText = this.lector.currentText() === text;
    const isPlayingThisText = this.lector.speaking() && isCurrentText;
    const isPaused = this.lector.paused() && isCurrentText;

    this.renderer.removeClass(this.buttonEl, 'active');
    this.renderer.removeClass(this.buttonEl, 'paused');

    const nextLabel = isPlayingThisText ? (isPaused ? 'Reanudar' : 'Pausar') : 'Escuchar';
    const nextIcon = isPlayingThisText ? (isPaused ? '▶' : '⏸') : '▶';

    this.labelEl.textContent = nextLabel;
    this.iconEl.textContent = nextIcon;

    if (isPlayingThisText && !isPaused) {
      this.renderer.addClass(this.buttonEl, 'active');
    }
    if (isPaused) {
      this.renderer.addClass(this.buttonEl, 'paused');
    }

    const ariaAction = isPlayingThisText
      ? (isPaused ? 'Reanudar texto' : 'Pausar texto')
      : 'Escuchar texto';

    this.renderer.setAttribute(this.buttonEl, 'aria-label', `${ariaAction}: ${text}`);
  }
}
