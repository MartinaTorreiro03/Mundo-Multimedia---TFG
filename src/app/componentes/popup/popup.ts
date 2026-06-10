import {
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  Output,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  SimpleChanges,
  inject,
} from '@angular/core';
import { VoiceNavigationService } from '../../services/voice-navigation.service';
import { applyPopupCssVars } from '../../services/popup-theme-vars';

export type ModalSize =
  | { w?: number | string; h?: number | string };

export interface ModalTheme {
  overlayBg?: string;
  panelBg?: string;
  panelText?: string;
  borderColor?: string;
  insetLight?: string;
  insetDark?: string;
  titlebarBg?: string;
  titlebarText?: string;
  titlebarDivider?: string;
  closeBg?: string;
  buttonBg?: string;
  buttonBorderTop?: string;
  buttonBorderLeft?: string;
  buttonBorderBottom?: string;
  buttonBorderRight?: string;
  buttonActiveBg?: string;
  buttonActiveBorderTop?: string;
  buttonActiveBorderLeft?: string;
  buttonActiveBorderBottom?: string;
  buttonActiveBorderRight?: string;
}

@Component({
  selector: 'app-popup',
  standalone: true,
  templateUrl: './popup.html',
  styleUrl: './popup.scss',
})
export class Popup implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('modalRoot') modalRef!: ElementRef<HTMLElement>;
  private keydownCaptureBlocker?: (ev: KeyboardEvent) => void;
  private keyupCaptureBlocker?: (ev: KeyboardEvent) => void;
  private keypressCaptureBlocker?: (ev: KeyboardEvent) => void;
  private focusInCaptureBlocker?: (ev: FocusEvent) => void;
  private previousActiveElement: HTMLElement | null = null;
  private listenersActive = false;

  @Input() title = '';
  @Input() size: ModalSize | null = null;
  @Input() theme: ModalTheme = {};
  @Input() backdropClosable = true;
  @Input() open = true;
  readonly voiceNav = inject(VoiceNavigationService);

  @HostBinding('class.popup-host--closed') get hostClosed(): boolean {
    return !this.open;
  }

  @Output() closed = new EventEmitter<void>();

  constructor(private el: ElementRef) {}

  close(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (!this.open) return;
    this.close();
  }

  stop(e: MouseEvent): void {
    e.stopPropagation();
  }

  get safeWidth(): string | null {
    if (!this.size?.w) return null;
    const w = this.size.w;
    if (typeof w === 'number') return `${w}px`;
    const trimmed = w.trim();
    return trimmed.length ? trimmed : null;
  }

  get safeHeight(): string | null {
    if (!this.size?.h) return null;
    const h = this.size.h;
    if (typeof h === 'number') return `${h}px`;
    const trimmed = h.trim();
    return trimmed.length ? trimmed : null;
  }

  get overlayBg(): string { return this.theme.overlayBg ?? 'rgba(0,0,0,0.85)'; }
  get panelBg(): string { return this.theme.panelBg ?? '#ff77d4'; }
  get panelText(): string { return this.theme.panelText ?? 'black'; }
  get borderColor(): string { return this.theme.borderColor ?? '#df0097'; }
  get insetLight(): string { return this.theme.insetLight ?? '#ffffff'; }
  get insetDark(): string { return this.theme.insetDark ?? '#6d004a'; }
  get titlebarBg(): string { return this.theme.titlebarBg ?? '#ab0075'; }
  get titlebarText(): string { return this.theme.titlebarText ?? 'white'; }
  get titlebarDivider(): string { return this.theme.titlebarDivider ?? '#808080'; }
  get closeBg(): string { return this.theme.closeBg ?? this.panelBg; }

  ngOnChanges(changes: SimpleChanges): void {
    if ('theme' in changes) {
      this.applyThemeVars();
    }
    if ('open' in changes) {
      if (this.open) this.activate();
      else this.deactivate();
    }
  }

  ngAfterViewInit(): void {
    this.applyThemeVars();
    if (this.open) this.activate();
  }

  ngOnDestroy(): void {
    this.deactivate();
  }

  private applyThemeVars(): void {
    const hosts: HTMLElement[] = [this.el.nativeElement as HTMLElement];
    const modal = this.modalRef?.nativeElement;
    if (modal) {
      hosts.push(modal);
    }
    for (const host of hosts) {
      applyPopupCssVars(host, this.theme);
    }
  }

  private activate(): void {
    if (this.listenersActive) return;
    this.listenersActive = true;
    document.body.style.overflow = 'hidden';
    this.previousActiveElement = document.activeElement as HTMLElement | null;

    const blockKeyboard = (ev: KeyboardEvent) => {
      if (!this.open) return;
      const modal = this.modalRef?.nativeElement;
      if (!modal) return;
      const target = ev.target as Node | null;
      const inside = !!target && modal.contains(target);
      const insideJuego =
        target instanceof Element && !!target.closest('app-juego');
      const hasJuegoInModal = !!modal.querySelector('app-juego');

      if (!inside) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        this.focusInitialInPopup();
        return;
      }

      if (ev.key !== 'Escape') {
        if (hasJuegoInModal) {
          if (
            ev.key === 'ArrowLeft' ||
            ev.key === 'ArrowRight' ||
            ev.key === 'ArrowUp' ||
            ev.key === 'ArrowDown'
          ) {
            return;
          }
          if (
            (insideJuego || hasJuegoInModal) &&
            (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar')
          ) {
            return;
          }
        }
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      }
    };
    this.keydownCaptureBlocker = blockKeyboard;
    this.keyupCaptureBlocker = blockKeyboard;
    this.keypressCaptureBlocker = blockKeyboard;

    document.addEventListener('keydown', this.keydownCaptureBlocker, true);
    document.addEventListener('keyup', this.keyupCaptureBlocker, true);
    document.addEventListener('keypress', this.keypressCaptureBlocker, true);

    this.focusInCaptureBlocker = (ev: FocusEvent) => {
      if (!this.open) return;
      const modal = this.modalRef?.nativeElement;
      if (!modal) return;
      const target = ev.target as Node | null;
      if (target && !modal.contains(target)) {
        ev.stopPropagation();
        this.focusInitialInPopup();
      }
    };
    document.addEventListener('focusin', this.focusInCaptureBlocker, true);

    queueMicrotask(() => this.focusInitialInPopup());
  }

  private deactivate(): void {
    if (!this.listenersActive) return;
    this.listenersActive = false;

    if (this.keydownCaptureBlocker) {
      document.removeEventListener('keydown', this.keydownCaptureBlocker, true);
      this.keydownCaptureBlocker = undefined;
    }
    if (this.keyupCaptureBlocker) {
      document.removeEventListener('keyup', this.keyupCaptureBlocker, true);
      this.keyupCaptureBlocker = undefined;
    }
    if (this.keypressCaptureBlocker) {
      document.removeEventListener('keypress', this.keypressCaptureBlocker, true);
      this.keypressCaptureBlocker = undefined;
    }
    if (this.focusInCaptureBlocker) {
      document.removeEventListener('focusin', this.focusInCaptureBlocker, true);
      this.focusInCaptureBlocker = undefined;
    }
    document.body.style.overflow = '';
    this.previousActiveElement?.focus?.();
    this.previousActiveElement = null;
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(ev: KeyboardEvent): void {
    if (!this.open) return;
    if (ev.key !== 'Tab') return;
    if (!this.modalRef?.nativeElement) return;

    const focusable = this.getFocusableElements();
    if (focusable.length === 0) {
      ev.preventDefault();
      this.modalRef.nativeElement.focus();
      return;
    }

    const active = document.activeElement as HTMLElement | null;
    const currentIndex = active ? focusable.indexOf(active) : -1;

    if (ev.shiftKey) {
      if (currentIndex <= 0) {
        ev.preventDefault();
        focusable[focusable.length - 1].focus();
      }
      return;
    }

    if (currentIndex === -1 || currentIndex === focusable.length - 1) {
      ev.preventDefault();
      focusable[0].focus();
    }
  }

  private focusInitialInPopup(): void {
    const juegoRoot = this.el.nativeElement.querySelector('app-juego');
    if (juegoRoot instanceof HTMLElement) {
      const firstTile = juegoRoot.querySelector(
        '.columna-dispositivos .dispositivo[data-device-id]'
      );
      if (firstTile instanceof HTMLElement) {
        firstTile.focus();
        return;
      }
      const game = juegoRoot.querySelector('.game-container');
      if (game instanceof HTMLElement) {
        game.focus();
        return;
      }
    }
    this.focusFirstElement();
  }

  private focusFirstElement(): void {
    const focusable = this.getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
      return;
    }
    this.modalRef?.nativeElement.focus();
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.modalRef?.nativeElement) return [];
    const selectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    return Array.from(this.modalRef.nativeElement.querySelectorAll<HTMLElement>(selectors))
      .filter(el => !el.hasAttribute('disabled') && el.tabIndex >= 0 && this.isVisible(el));
  }

  private isVisible(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }
}
