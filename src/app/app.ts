import { Component, inject, computed, AfterViewInit, OnDestroy, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UiStateService } from './services/ui-state.service';
import { FontService } from './services/font.service';

import { HeaderComponent } from './componentes/header/header';
import { MenuAccesibilidad } from './componentes/menu-accesibilidad/menu-accesibilidad';
import { MenuLateral } from './componentes/menu-lateral/menu-lateral';
import { PiePagina } from './componentes/pie-pagina/pie-pagina';
import { Popup } from './componentes/popup/popup';
import { Info } from './componentes/menu-lateral/info/info';
import { ColorService } from './services/color.service';
import { PopupThemeService } from './services/popup-theme';
import { KeyboardNavService } from './services/keyboard-nav.service';
import {
  VoiceNavigationService,
  VOICE_MENU_ZONE_EVENT,
  VOICE_SNAP_TEXT_EVENT,
  VOICE_EXIT_EVENT,
  VOICE_PRINCIPAL_ACTION_EVENT,
  VOICE_TEXTO_ACTION_EVENT,
  VOICE_AUDIO_ACTION_EVENT,
  VOICE_ESCUCHAR_ACTION_EVENT,
  VOICE_REPRODUCTORES_ACTION_EVENT,
  type VoiceMenuZone,
  type VoiceSnapTextDetail,
} from './services/voice-navigation.service';

import { CursorComponent } from './componentes/cursor/cursor';
import { VoiceTranscriptPanelComponent } from './componentes/voice-transcript-panel/voice-transcript-panel';
import Lenis from 'lenis';
import {
  isAnyPopupOpen,
  isAudioEscucharDetalleOpen,
  isCarruselPopupOpen,
  isImagenDispositivoPopupOpen,
  isImagenMosaicoPopupOpen,
  isJuegoPopupOpen,
  isVideoDispositivoPopupOpen,
  isVideoReproductoresPopupOpen,
} from './utils/popup-dom';
import {
  VOICE_IMAGEN_TIMELINE_COLLAPSE_EVENT,
  VOICE_IMAGEN_TIMELINE_DEPLOY_EVENT,
  VOICE_IMAGEN_FILTROS_COLLAPSE_EVENT,
  VOICE_IMAGEN_FILTROS_DEPLOY_EVENT,
  VOICE_IMAGEN_VENTANITA_COLLAPSE_EVENT,
  VOICE_IMAGEN_VENTANITA_DEPLOY_EVENT,
  VOICE_MOSAICO_ACTION_EVENT,
  VOICE_IMAGEN_ACTION_EVENT,
  IMAGEN_VOICE_STEP_ATTR,
} from './utils/imagen-voice-dom';
import { VIDEO_VOICE_STEP_ATTR, VOICE_VIDEO_ACTION_EVENT } from './utils/video-voice-dom';
import { MUSICA_VOICE_STEP_ATTR } from './utils/musica-voice-dom';
import { AUDIOVISUAL_VOICE_STEP_ATTR } from './utils/audiovisual-voice-dom';
import { INTERACTIVIDAD_VOICE_STEP_ATTR } from './utils/interactividad-voice-dom';
import { VoiceMenuBridgeService } from './services/voice-menu-bridge.service';
import {
  hasVoiceCerrarCommand,
  hasVoiceSalirCommand,
  matchAccessibilityMenuItem,
  matchLateralMenuItem,
  scoreNavMenuItem,
} from './utils/voice-menu-match';

type PopupId = 'info' | null;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, MenuAccesibilidad, MenuLateral, PiePagina, Popup, Info, CursorComponent, VoiceTranscriptPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit, OnDestroy {

  ui = inject(UiStateService);
  private font = inject(FontService);
  private router = inject(Router);
  keyboardNav = inject(KeyboardNavService);
  readonly voiceNav = inject(VoiceNavigationService);
  private voiceMenuBridge = inject(VoiceMenuBridgeService);
  private ngZone = inject(NgZone);

  constructor() {
    this.font.init();

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.lenis?.scrollTo(0, { immediate: true });
      this.lastVoiceSnapIndex = null;
      this.lastVoiceSnapEl = null;
      this.principalHomeVoiceStep = 0;
      this.textoPageVoiceStep = 0;
      this.audioPageVoiceStep = 0;
      this.videoPageVoiceStep = 0;
      this.imagenPageVoiceStep = 0;
      this.musicaPageVoiceStep = 0;
      this.audiovisualPageVoiceStep = 0;
      this.interactividadPageVoiceStep = 0;
      this.syncImagenVoiceStepAttr();
      this.syncVideoVoiceStepAttr();
      this.syncMusicaVoiceStepAttr();
      this.syncAudiovisualVoiceStepAttr();
      this.syncInteractividadVoiceStepAttr();
      window.dispatchEvent(new CustomEvent(VOICE_IMAGEN_TIMELINE_COLLAPSE_EVENT));
      this.voiceReadingSnapStack.length = 0;
    });

    effect(() => {
      const enabled = this.keyboardNav.enabled();
      document.body.classList.toggle('keyboard-nav-enabled', enabled);
    });
  }

  activePopup: PopupId = null;

  openInfoPopup() {
    this.activePopup = 'info';
  }

  closePopup() {
    this.activePopup = null;
  }

  private colorService = inject(ColorService);
  private popupThemes = inject(PopupThemeService);

  private rafId?: number;
  private lenis?: Lenis;
  private resizeObserver?: ResizeObserver;

  private onRefreshScroll = () => {
    this.lenis?.resize();
  };

  private readonly onVoiceMenuZone = ((event: Event) => {
    if (isAnyPopupOpen()) return;
    const zone = (event as CustomEvent<{ zone: VoiceMenuZone }>).detail?.zone;
    if (zone === 'nav' || zone === 'accessibility' || zone === 'lateral') {
      this.enterZone(zone);
    }
  }) as EventListener;

  private readonly onVoiceSnapText = ((event: Event) => {
    const detail = (event as CustomEvent<VoiceSnapTextDetail>).detail;
    const mode = (detail as { mode?: 'top' | 'middle' | 'bottom' } | undefined)?.mode;
    const direction = (detail as { direction?: -1 | 1 } | undefined)?.direction;
    if (!mode && direction !== -1 && direction !== 1) return;
    const steps = Math.min(8, Math.max(1, (detail as { steps?: number } | undefined)?.steps ?? 1));

    if (this.isInfoPopupOpen()) {
      if ((direction === -1 || direction === 1) && this.snapInfoPopupScroll(direction, steps)) return;
    }

    if (isAnyPopupOpen()) return;

    if (mode === 'top' || mode === 'middle' || mode === 'bottom') {
      this.snapVoiceAbsolutePosition(mode);
      return;
    }

    if (direction !== -1 && direction !== 1) return;

    if (this.keyboardZone === 'nav' || this.keyboardZone === 'accessibility') {
      this.exitZone();
      return;
    }
    if (this.keyboardZone === 'lateral') {
      const delta = direction === 1 ? 1 : -1;
      for (let s = 0; s < steps; s++) {
        this.moveZoneSelection(delta);
      }
      return;
    }

    if (this.snapPrincipalHomeVoice(direction, steps)) {
      return;
    }

    if (this.snapTextoPageVoice(direction, steps)) {
      return;
    }

    if (this.snapAudioPageVoice(direction, steps)) {
      return;
    }

    if (this.snapVideoPageVoice(direction, steps)) {
      return;
    }

    if (this.snapImagenPageVoice(direction, steps)) {
      return;
    }

    if (this.snapMusicaPageVoice(direction, steps)) {
      return;
    }

    if (this.snapAudiovisualPageVoice(direction, steps)) {
      return;
    }

    if (this.snapInteractividadPageVoice(direction, steps)) {
      return;
    }

    this.snapVoiceTextLandmark(direction, steps);
  }) as EventListener;

  private readonly onVoiceExit = ((_event: Event) => {
    if (this.isInfoPopupOpen()) {
      this.ngZone.run(() => this.closePopup());
      return;
    }
    if (isAnyPopupOpen()) {
      const p = this.router.url.split('?')[0];
      if (p === '' || p === '/') {
        window.dispatchEvent(
          new CustomEvent(VOICE_PRINCIPAL_ACTION_EVENT, { detail: { action: 'cerrar' } })
        );
      } else if (p === '/texto') {
        window.dispatchEvent(
          new CustomEvent(VOICE_TEXTO_ACTION_EVENT, { detail: { action: 'cerrar' } })
        );
      } else if (p === '/audio') {
        if (isAudioEscucharDetalleOpen()) {
          window.dispatchEvent(
            new CustomEvent(VOICE_ESCUCHAR_ACTION_EVENT, { detail: { action: 'detalleCerrar' } })
          );
        } else {
          window.dispatchEvent(
            new CustomEvent(VOICE_AUDIO_ACTION_EVENT, { detail: { action: 'cerrar' } })
          );
        }
      } else if (p === '/imagen' && isImagenMosaicoPopupOpen()) {
        window.dispatchEvent(
          new CustomEvent(VOICE_MOSAICO_ACTION_EVENT, { detail: { action: 'cerrar' } })
        );
      } else if (p === '/imagen' && isImagenDispositivoPopupOpen()) {
        window.dispatchEvent(
          new CustomEvent(VOICE_IMAGEN_ACTION_EVENT, { detail: { action: 'cerrar' } })
        );
      } else if (p === '/video' && isVideoReproductoresPopupOpen()) {
        window.dispatchEvent(
          new CustomEvent(VOICE_REPRODUCTORES_ACTION_EVENT, { detail: { action: 'cerrar' } })
        );
      } else if (p === '/video' && isVideoDispositivoPopupOpen()) {
        window.dispatchEvent(
          new CustomEvent(VOICE_VIDEO_ACTION_EVENT, { detail: { action: 'cerrar' } })
        );
      }
      return;
    }
    this.exitZone();
  }) as EventListener;

  private isInfoPopupOpen(): boolean {
    return this.activePopup === 'info' || !!document.querySelector('app-popup app-info');
  }

  private snapInfoPopupScroll(direction: -1 | 1, steps: number): boolean {
    const content = document.querySelector('app-popup app-info')?.closest('app-popup')?.querySelector('.content');
    if (!(content instanceof HTMLElement)) return false;
    const step = Math.max(120, content.clientHeight * 0.72);
    content.scrollBy({ top: direction * step * steps, behavior: 'smooth' });
    return true;
  }

  private readonly tryVoiceMenuPick = (n: string, _raw: string): boolean => {
    if (this.isInfoPopupOpen() && (hasVoiceCerrarCommand(n) || hasVoiceSalirCommand(n))) {
      this.ngZone.run(() => this.closePopup());
      return true;
    }

    const zone =
      this.ui.activeMenu() ?? (this.keyboardZone !== 'general' ? this.keyboardZone : null);
    if (zone === 'accessibility' && this.pickAccessibilityMenuItem(n)) return true;
    if (zone === 'lateral' && this.pickLateralMenuItem(n)) return true;
    if (zone === 'nav' && this.pickNavMenuItem(n)) return true;

    return false;
  };

  private pickNavMenuItem(n: string): boolean {
    const items = this.getZoneItems('nav');
    let bestRoute: string | null = null;
    let bestScore = 0;
    for (const el of items) {
      const label =
        el.querySelector<HTMLElement>('.nav-item-label')?.textContent?.replace(/\s+/g, ' ').trim() ??
        el.textContent?.replace(/\s+/g, ' ').trim() ??
        '';
      const score = scoreNavMenuItem(n, label);
      if (score > bestScore) {
        bestScore = score;
        bestRoute = el.getAttribute('data-voice-route');
      }
    }
    if (bestScore <= 0 || bestRoute === null) return false;
    this.ngZone.run(() => {
      if (bestRoute === '' || bestRoute === '/') {
        void this.router.navigate(['/']);
      } else {
        void this.router.navigateByUrl(bestRoute);
      }
      this.exitZone();
    });
    return true;
  }

  private pickAccessibilityMenuItem(n: string): boolean {
    const items = this.getZoneItems('accessibility');
    for (let i = 0; i < items.length; i++) {
      if (!matchAccessibilityMenuItem(n, i)) continue;
      this.ngZone.run(() => items[i].click());
      return true;
    }
    return false;
  }

  private pickLateralMenuItem(n: string): boolean {
    const items = this.getZoneItems('lateral');
    for (const el of items) {
      const alt = el.getAttribute('alt') ?? '';
      if (!matchLateralMenuItem(n, alt)) continue;
      this.ngZone.run(() => el.click());
      return true;
    }
    return false;
  }

  private collectVoiceReadingBlocks(): HTMLElement[] {
    const root = document.querySelector<HTMLElement>('main.contenido');
    if (!root) return [];
    const selector = 'h1, h2, h3, h4, p';
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(el => {
      if (el.closest('app-popup')) return false;
      const text = el.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      if (text.length < 2) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 6) return false;
      const style = getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }

  private findVoiceReadingAnchorIndex(blocks: HTMLElement[]): number {
    if (!blocks.length) return 0;
    const vh = window.innerHeight;
    const vmid = vh * 0.5;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < blocks.length; i++) {
      const r = blocks[i].getBoundingClientRect();
      if (r.bottom <= 4 || r.top >= vh - 4) continue;
      const mid = r.top + r.height / 2;
      const d = Math.abs(mid - vmid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    if (bestDist < Infinity) return best;
    for (let i = 0; i < blocks.length; i++) {
      const r = blocks[i].getBoundingClientRect();
      const mid = r.top + r.height / 2;
      const d = Math.abs(mid - vmid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }

  private snapVoiceTextLandmark(direction: -1 | 1, steps = 1): void {
    const blocks = this.collectVoiceReadingBlocks();
    if (!blocks.length) return;

    if (direction === -1 && this.voiceReadingSnapStack.length > 0) {
      const pops = Math.min(steps, this.voiceReadingSnapStack.length);
      const from = this.voiceReadingSnapStack.length - pops;
      const targetEl = this.voiceReadingSnapStack[from];
      if (targetEl && document.contains(targetEl)) {
        const j = blocks.indexOf(targetEl);
        if (j >= 0) {
          for (let s = 0; s < pops; s++) {
            this.voiceReadingSnapStack.pop();
          }
          const now = Date.now();
          this.scrollVoiceReadingBlockToCenter(blocks[j]);
          this.lastVoiceSnapIndex = j;
          this.lastVoiceSnapEl = blocks[j];
          this.lastVoiceSnapAt = now;
          window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
          return;
        }
      }
    }

    const L = this.lenis;
    const scroll = L?.animatedScroll ?? window.scrollY;
    const vh = window.innerHeight;
    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - vh);
    const slideRatio = 0.76;
    const magnitude = slideRatio * vh * Math.max(1, steps);
    const viewCenterDoc = scroll + vh / 2;
    const now = Date.now();

    const centerDoc = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top + scroll + r.height / 2;
    };

    const chainMs = 14_000;
    let chainOk =
      this.lastVoiceSnapEl !== null &&
      document.contains(this.lastVoiceSnapEl) &&
      Date.now() - this.lastVoiceSnapAt < chainMs;
    if (chainOk) {
      const r = this.lastVoiceSnapEl!.getBoundingClientRect();
      const stillFramed = r.bottom > -vh * 0.25 && r.top < vh * 1.35;
      if (!stillFramed) {
        chainOk = false;
      }
    }

    let anchorIdx = this.findVoiceReadingAnchorIndex(blocks);
    if (chainOk) {
      const j = blocks.indexOf(this.lastVoiceSnapEl!);
      if (j >= 0) {
        anchorIdx = j;
      }
    }

    const n = blocks.length;
    const last = n - 1;

    if (direction === 1) {
      if (anchorIdx >= last) {
        this.voiceReadingSnapStack.push(blocks[anchorIdx]);
        L?.scrollTo(lim, { programmatic: true });
        this.lastVoiceSnapIndex = last;
        this.lastVoiceSnapEl = blocks[last] ?? null;
        this.lastVoiceSnapAt = now;
        window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
        return;
      }

      const goal = viewCenterDoc + magnitude;
      let targetIdx = -1;
      for (let i = anchorIdx + 1; i < n; i++) {
        if (centerDoc(blocks[i]) >= goal) {
          targetIdx = i;
          break;
        }
      }
      if (targetIdx < 0) {
        targetIdx = last;
        for (let i = last; i > anchorIdx; i--) {
          if (centerDoc(blocks[i]) > viewCenterDoc + vh * 0.06) {
            targetIdx = i;
            break;
          }
        }
        if (targetIdx <= anchorIdx) targetIdx = anchorIdx + 1;
      }

      while (targetIdx < last) {
        const cand = blocks[targetIdx];
        const r = cand.getBoundingClientRect();
        const y = r.top + scroll + r.height / 2 - vh / 2;
        const targetScroll = L?.targetScroll ?? scroll;
        const clamped = Math.max(0, Math.min(y, lim));
        if (!L || Math.abs(clamped - targetScroll) >= 10) break;
        targetIdx++;
      }

      const target = blocks[targetIdx];
      this.voiceReadingSnapStack.push(blocks[anchorIdx]);
      this.scrollVoiceReadingBlockToCenter(target);
      this.lastVoiceSnapIndex = targetIdx;
      this.lastVoiceSnapEl = target;
      this.lastVoiceSnapAt = now;
      window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
      return;
    }

    if (anchorIdx <= 0) {
      L?.scrollTo(0, { programmatic: true });
      this.lastVoiceSnapIndex = 0;
      this.lastVoiceSnapEl = blocks[0] ?? null;
      this.lastVoiceSnapAt = now;
      window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
      return;
    }

    const goal = viewCenterDoc - magnitude;
    let targetIdx = -1;
    for (let i = anchorIdx - 1; i >= 0; i--) {
      if (centerDoc(blocks[i]) <= goal) {
        targetIdx = i;
        break;
      }
    }
    if (targetIdx < 0) {
      targetIdx = -1;
      for (let i = anchorIdx - 1; i >= 0; i--) {
        if (centerDoc(blocks[i]) < viewCenterDoc - vh * 0.06) {
          targetIdx = i;
          break;
        }
      }
      if (targetIdx < 0) targetIdx = anchorIdx - 1;
      else if (targetIdx >= anchorIdx) targetIdx = anchorIdx - 1;
    }

    while (targetIdx > 0) {
      const cand = blocks[targetIdx];
      const r = cand.getBoundingClientRect();
      const y = r.top + scroll + r.height / 2 - vh / 2;
      const targetScroll = L?.targetScroll ?? scroll;
      const clamped = Math.max(0, Math.min(y, lim));
      if (!L || Math.abs(clamped - targetScroll) >= 10) break;
      targetIdx--;
    }

    const target = blocks[targetIdx];
    this.scrollVoiceReadingBlockToCenter(target);
    this.lastVoiceSnapIndex = targetIdx;
    this.lastVoiceSnapEl = target;
    this.lastVoiceSnapAt = now;
    window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
  }

  private principalHomeVoiceStep = 0;

  private textoPageVoiceStep = 0;
  private audioPageVoiceStep = 0;
  private videoPageVoiceStep = 0;
  private imagenPageVoiceStep = 0;
  private musicaPageVoiceStep = 0;
  private audiovisualPageVoiceStep = 0;
  private interactividadPageVoiceStep = 0;

  private readonly principalVoiceHeaderOffset = 88;

  private snapVoiceStepToMode(
    mode: 'top' | 'middle' | 'bottom',
    maxStep: number,
    currentStep: number,
    snapFn: (direction: -1 | 1, steps: number) => boolean
  ): boolean {
    const targetStep =
      mode === 'top' ? 0 :
      mode === 'bottom' ? maxStep :
      Math.floor(maxStep / 2);
    const delta = targetStep - currentStep;
    if (delta === 0) return true;
    const direction: -1 | 1 = delta > 0 ? 1 : -1;
    return snapFn(direction, Math.abs(delta));
  }

  private currentVoiceScrollY(): number {
    return this.lenis?.animatedScroll ?? window.scrollY;
  }

  private nearestVoiceStepFromScroll(
    maxStep: number,
    computeY: (step: number) => number | null
  ): number {
    const current = this.currentVoiceScrollY();
    let bestStep = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let step = 0; step <= maxStep; step++) {
      const y = computeY(step);
      if (y === null) continue;
      const dist = Math.abs(y - current);
      if (dist < bestDist) {
        bestDist = dist;
        bestStep = step;
      }
    }
    return bestStep;
  }

  private snapVoiceAbsolutePosition(mode: 'top' | 'middle' | 'bottom'): void {
    if (this.isHomePathForPrincipalVoice()) {
      this.snapVoiceStepToMode(mode, 5, this.principalHomeVoiceStep, (d, s) => this.snapPrincipalHomeVoice(d, s));
      return;
    }
    if (this.isTextoPathForVoice()) {
      this.snapVoiceStepToMode(mode, 6, this.textoPageVoiceStep, (d, s) => this.snapTextoPageVoice(d, s));
      return;
    }
    if (this.isAudioPathForVoice()) {
      this.snapVoiceStepToMode(mode, 7, this.audioPageVoiceStep, (d, s) => this.snapAudioPageVoice(d, s));
      return;
    }
    if (this.isVideoPathForVoice()) {
      this.snapVoiceStepToMode(mode, 8, this.videoPageVoiceStep, (d, s) => this.snapVideoPageVoice(d, s));
      return;
    }
    if (this.isImagenPathForVoice()) {
      this.snapVoiceStepToMode(mode, 9, this.imagenPageVoiceStep, (d, s) => this.snapImagenPageVoice(d, s));
      return;
    }
    if (this.isMusicaPathForVoice()) {
      this.snapVoiceStepToMode(mode, 8, this.musicaPageVoiceStep, (d, s) => this.snapMusicaPageVoice(d, s));
      return;
    }
    if (this.isAudiovisualPathForVoice()) {
      this.snapVoiceStepToMode(mode, 9, this.audiovisualPageVoiceStep, (d, s) => this.snapAudiovisualPageVoice(d, s));
      return;
    }
    if (this.isInteractividadPathForVoice()) {
      this.snapVoiceStepToMode(mode, 9, this.interactividadPageVoiceStep, (d, s) => this.snapInteractividadPageVoice(d, s));
      return;
    }

    const L = this.lenis;
    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const y = mode === 'top' ? 0 : mode === 'bottom' ? lim : lim * 0.5;
    this.lastVoiceSnapIndex = null;
    this.lastVoiceSnapEl = null;
    this.voiceReadingSnapStack.length = 0;
    if (L) L.scrollTo(y, { programmatic: true });
    else window.scrollTo({ top: y, behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
  }

  private isHomePathForPrincipalVoice(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '' || p === '/';
  }

  private snapPrincipalHomeVoice(direction: -1 | 1, steps: number): boolean {
    if (!this.isHomePathForPrincipalVoice()) return false;
    const host = document.querySelector('app-principal');
    if (!host) return false;

    this.principalHomeVoiceStep = this.nearestVoiceStepFromScroll(
      5,
      (step) => this.computePrincipalHomeScrollY(step)
    );
    const prevStep = this.principalHomeVoiceStep;
    const delta = direction === 1 ? steps : -steps;
    this.principalHomeVoiceStep = Math.max(0, Math.min(5, this.principalHomeVoiceStep + delta));

    if (this.principalHomeVoiceStep === prevStep) return true;

    const y = this.computePrincipalHomeScrollY(this.principalHomeVoiceStep);
    if (y === null) return true;

    const L = this.lenis;
    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clamped = Math.max(0, Math.min(y, lim));

    this.lastVoiceSnapIndex = null;
    this.lastVoiceSnapEl = null;

    if (L) {
      L.scrollTo(clamped, { programmatic: true });
    } else {
      window.scrollTo({ top: clamped, behavior: 'smooth' });
    }

    window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
    return true;
  }

  private computePrincipalHomeScrollY(step: number): number | null {
    const host = document.querySelector('app-principal') as HTMLElement | null;
    if (!host) return null;

    const L = this.lenis;
    const scroll = L?.animatedScroll ?? window.scrollY;
    const vh = window.innerHeight;
    const ho = this.principalVoiceHeaderOffset;

    const docTop = (el: Element) => el.getBoundingClientRect().top + scroll;

    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - vh);

    const seccion1 = host.querySelector<HTMLElement>('#seccion1');
    const seccion2 = host.querySelector<HTMLElement>('#seccion2');
    const pie = document.querySelector<HTMLElement>('app-pie-pagina');

    const h2s2      = seccion2?.querySelector<HTMLElement>('h2');
    const subtitulo1 = seccion2?.querySelector<HTMLElement>('.subtitulo-1');
    const carrusel1  = seccion2?.querySelector<HTMLElement>('.carrusel-1');
    const subtitulo2 = seccion2?.querySelector<HTMLElement>('.subtitulo-2');
    const carrusel2  = seccion2?.querySelector<HTMLElement>('.carrusel-2');
    const subtitulo3 = seccion2?.querySelector<HTMLElement>('.subtitulo-3');
    const btnSig     = seccion2?.querySelector<HTMLElement>('.siguiente');

    const clamp = (y: number) => Math.max(0, Math.min(y, lim));

    switch (step) {
      case 0:
        return 0;

      case 1: {
        if (!seccion1) return clamp(vh * 0.85);
        return clamp(docTop(seccion1) - ho);
      }

      case 2: {
        if (seccion1) {
          const s1height = seccion1.getBoundingClientRect().height;
          return clamp(docTop(seccion1) - ho + s1height * 0.6);
        }
        return clamp(vh * 1.5);
      }

      case 3: {
        const anchor = h2s2 ?? subtitulo1 ?? carrusel1;
        if (anchor) return clamp(docTop(anchor) - ho);
        if (seccion2) return clamp(docTop(seccion2) - ho);
        return clamp(vh * 1.8);
      }

      case 4: {
        const anchor = subtitulo2 ?? carrusel2;
        if (anchor) return clamp(docTop(anchor) - ho);
        if (seccion2) {
          const r = seccion2.getBoundingClientRect();
          return clamp(docTop(seccion2) + r.height * 0.5 - ho);
        }
        return clamp(vh * 2.6);
      }

      case 5: {
        const anchor = subtitulo3 ?? btnSig;
        if (anchor) {
          const y = docTop(anchor) - ho;
          if (pie) {
            const pieTop = docTop(pie) - vh + 60;
            return clamp(Math.max(y, Math.min(pieTop, lim)));
          }
          return clamp(y);
        }
        return lim;
      }

      default:
        return 0;
    }
  }

  private isTextoPathForVoice(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/texto';
  }

  private isAudioPathForVoice(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/audio';
  }

  private isVideoPathForVoice(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/video';
  }

  private isImagenPathForVoice(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/imagen';
  }

  private isMusicaPathForVoice(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/musica';
  }

  private isAudiovisualPathForVoice(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/audiovisual';
  }

  private isInteractividadPathForVoice(): boolean {
    const p = this.router.url.split('?')[0];
    return p === '/interactividad';
  }

  private snapTextoPageVoice(direction: -1 | 1, steps: number): boolean {
    if (!this.isTextoPathForVoice()) return false;
    const host = document.querySelector('app-texto');
    if (!host) return false;

    const maxStep = 6;
    this.textoPageVoiceStep = this.nearestVoiceStepFromScroll(
      maxStep,
      (step) => this.computeTextoPageScrollY(step)
    );
    const prevStep = this.textoPageVoiceStep;
    const delta = direction === 1 ? steps : -steps;
    this.textoPageVoiceStep = Math.max(0, Math.min(maxStep, this.textoPageVoiceStep + delta));

    if (this.textoPageVoiceStep === prevStep) return true;

    const y = this.computeTextoPageScrollY(this.textoPageVoiceStep);
    if (y === null) return true;

    const L = this.lenis;
    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clamped = Math.max(0, Math.min(y, lim));

    this.lastVoiceSnapIndex = null;
    this.lastVoiceSnapEl = null;
    this.voiceReadingSnapStack.length = 0;

    if (L) {
      L.scrollTo(clamped, { programmatic: true });
    } else {
      window.scrollTo({ top: clamped, behavior: 'smooth' });
    }

    window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
    return true;
  }

  private snapAudioPageVoice(direction: -1 | 1, steps: number): boolean {
    if (!this.isAudioPathForVoice()) return false;
    const host = document.querySelector('app-audio');
    if (!host) return false;

    const maxStep = 7;
    this.audioPageVoiceStep = this.nearestVoiceStepFromScroll(
      maxStep,
      (step) => this.computeAudioPageScrollY(step)
    );
    const prevStep = this.audioPageVoiceStep;
    const delta = direction === 1 ? steps : -steps;
    this.audioPageVoiceStep = Math.max(0, Math.min(maxStep, this.audioPageVoiceStep + delta));

    if (this.audioPageVoiceStep === prevStep) return true;

    const y = this.computeAudioPageScrollY(this.audioPageVoiceStep);
    if (y === null) return true;

    const L = this.lenis;
    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clamped = Math.max(0, Math.min(y, lim));

    this.lastVoiceSnapIndex = null;
    this.lastVoiceSnapEl = null;
    this.voiceReadingSnapStack.length = 0;

    if (L) {
      L.scrollTo(clamped, { programmatic: true });
    } else {
      window.scrollTo({ top: clamped, behavior: 'smooth' });
    }

    window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
    return true;
  }

  private snapVideoPageVoice(direction: -1 | 1, steps: number): boolean {
    if (!this.isVideoPathForVoice()) return false;
    const host = document.querySelector('app-video');
    if (!host) return false;

    const maxStep = 8;
    this.videoPageVoiceStep = this.nearestVoiceStepFromScroll(
      maxStep,
      (step) => this.computeVideoPageScrollY(step)
    );
    const prevStep = this.videoPageVoiceStep;
    const delta = direction === 1 ? steps : -steps;
    this.videoPageVoiceStep = Math.max(0, Math.min(maxStep, this.videoPageVoiceStep + delta));

    if (this.videoPageVoiceStep === prevStep) return true;

    this.syncVideoVoiceStepAttr();

    const applyScroll = () => {
      const y = this.computeVideoPageScrollY(this.videoPageVoiceStep);
      if (y === null) return;

      const L = this.lenis;
      const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const clamped = Math.max(0, Math.min(y, lim));

      this.lastVoiceSnapIndex = null;
      this.lastVoiceSnapEl = null;
      this.voiceReadingSnapStack.length = 0;

      if (L) {
        L.scrollTo(clamped, { programmatic: true });
      } else {
        window.scrollTo({ top: clamped, behavior: 'smooth' });
      }

      window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
    };

    if (this.videoPageVoiceStep === 8) {
      this.lenis?.resize();
      requestAnimationFrame(() => requestAnimationFrame(() => applyScroll()));
    } else {
      applyScroll();
    }
    return true;
  }

  private syncImagenVoiceStepAttr(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute(IMAGEN_VOICE_STEP_ATTR, String(this.imagenPageVoiceStep));
  }

  private syncVideoVoiceStepAttr(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute(VIDEO_VOICE_STEP_ATTR, String(this.videoPageVoiceStep));
  }

  private syncMusicaVoiceStepAttr(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute(MUSICA_VOICE_STEP_ATTR, String(this.musicaPageVoiceStep));
  }

  private syncAudiovisualVoiceStepAttr(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute(AUDIOVISUAL_VOICE_STEP_ATTR, String(this.audiovisualPageVoiceStep));
  }

  private syncInteractividadVoiceStepAttr(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute(
      INTERACTIVIDAD_VOICE_STEP_ATTR,
      String(this.interactividadPageVoiceStep)
    );
  }

  private snapAudiovisualPageVoice(direction: -1 | 1, steps: number): boolean {
    if (!this.isAudiovisualPathForVoice()) return false;
    const host = document.querySelector('app-audiovisual');
    if (!host) return false;

    const maxStep = 9;
    this.audiovisualPageVoiceStep = this.nearestVoiceStepFromScroll(
      maxStep,
      (step) => this.computeAudiovisualPageScrollY(step)
    );
    const prevStep = this.audiovisualPageVoiceStep;
    const delta = direction === 1 ? steps : -steps;
    this.audiovisualPageVoiceStep = Math.max(0, Math.min(maxStep, this.audiovisualPageVoiceStep + delta));

    if (this.audiovisualPageVoiceStep === prevStep) return true;

    this.syncAudiovisualVoiceStepAttr();

    const applyScroll = () => {
      if (this.audiovisualPageVoiceStep === 9) {
        this.lenis?.resize();
      }

      const y = this.computeAudiovisualPageScrollY(this.audiovisualPageVoiceStep);
      if (y === null) return;

      const L = this.lenis;
      const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const clamped = Math.max(0, Math.min(y, lim));

      this.lastVoiceSnapIndex = null;
      this.lastVoiceSnapEl = null;
      this.voiceReadingSnapStack.length = 0;

      if (L) {
        L.scrollTo(clamped, { programmatic: true });
      } else {
        window.scrollTo({ top: clamped, behavior: 'smooth' });
      }

      window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
    };

    if (
      this.audiovisualPageVoiceStep === 2 ||
      this.audiovisualPageVoiceStep === 3 ||
      this.audiovisualPageVoiceStep === 5 ||
      this.audiovisualPageVoiceStep === 7 ||
      this.audiovisualPageVoiceStep === 8 ||
      this.audiovisualPageVoiceStep === 9
    ) {
      requestAnimationFrame(() => requestAnimationFrame(() => applyScroll()));
    } else {
      applyScroll();
    }
    return true;
  }

  private snapInteractividadPageVoice(direction: -1 | 1, steps: number): boolean {
    if (!this.isInteractividadPathForVoice()) return false;
    const host = document.querySelector('app-interactividad');
    if (!host) return false;

    const maxStep = 9;
    this.interactividadPageVoiceStep = this.nearestVoiceStepFromScroll(
      maxStep,
      (step) => this.computeInteractividadPageScrollY(step)
    );
    const prevStep = this.interactividadPageVoiceStep;
    const delta = direction === 1 ? steps : -steps;
    this.interactividadPageVoiceStep = Math.max(0, Math.min(maxStep, this.interactividadPageVoiceStep + delta));

    if (this.interactividadPageVoiceStep === prevStep) return true;

    this.syncInteractividadVoiceStepAttr();

    const applyScroll = () => {
      if (this.interactividadPageVoiceStep === 9) {
        this.lenis?.resize();
      }

      const y = this.computeInteractividadPageScrollY(this.interactividadPageVoiceStep);
      if (y === null) return;

      const L = this.lenis;
      const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const clamped = Math.max(0, Math.min(y, lim));

      this.lastVoiceSnapIndex = null;
      this.lastVoiceSnapEl = null;
      this.voiceReadingSnapStack.length = 0;

      if (L) {
        L.scrollTo(clamped, { programmatic: true });
      } else {
        window.scrollTo({ top: clamped, behavior: 'smooth' });
      }

      window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
    };

    if (
      this.interactividadPageVoiceStep >= 2 &&
      this.interactividadPageVoiceStep <= 9
    ) {
      requestAnimationFrame(() => requestAnimationFrame(() => applyScroll()));
    } else {
      applyScroll();
    }
    return true;
  }

  private snapMusicaPageVoice(direction: -1 | 1, steps: number): boolean {
    if (!this.isMusicaPathForVoice()) return false;
    const host = document.querySelector('app-musica');
    if (!host) return false;

    const maxStep = 8;
    this.musicaPageVoiceStep = this.nearestVoiceStepFromScroll(
      maxStep,
      (step) => this.computeMusicaPageScrollY(step)
    );
    const prevStep = this.musicaPageVoiceStep;
    const delta = direction === 1 ? steps : -steps;
    this.musicaPageVoiceStep = Math.max(0, Math.min(maxStep, this.musicaPageVoiceStep + delta));

    if (this.musicaPageVoiceStep === prevStep) return true;

    this.syncMusicaVoiceStepAttr();

    const applyScroll = () => {
      if (this.musicaPageVoiceStep === 8) {
        this.lenis?.resize();
      }

      const y = this.computeMusicaPageScrollY(this.musicaPageVoiceStep);
      if (y === null) return;

      const L = this.lenis;
      const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const clamped = Math.max(0, Math.min(y, lim));

      this.lastVoiceSnapIndex = null;
      this.lastVoiceSnapEl = null;
      this.voiceReadingSnapStack.length = 0;

      if (L) {
        L.scrollTo(clamped, { programmatic: true });
      } else {
        window.scrollTo({ top: clamped, behavior: 'smooth' });
      }

      window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
    };

    if (
      this.musicaPageVoiceStep === 3 ||
      this.musicaPageVoiceStep === 6 ||
      this.musicaPageVoiceStep === 7 ||
      this.musicaPageVoiceStep === 8
    ) {
      requestAnimationFrame(() => requestAnimationFrame(() => applyScroll()));
    } else {
      applyScroll();
    }
    return true;
  }

  private snapImagenPageVoice(direction: -1 | 1, steps: number): boolean {
    if (!this.isImagenPathForVoice()) return false;
    const host = document.querySelector('app-imagen');
    if (!host) return false;

    const maxStep = 9;
    this.imagenPageVoiceStep = this.nearestVoiceStepFromScroll(
      maxStep,
      (step) => this.computeImagenPageScrollY(step)
    );
    const prevStep = this.imagenPageVoiceStep;
    const delta = direction === 1 ? steps : -steps;
    this.imagenPageVoiceStep = Math.max(0, Math.min(maxStep, this.imagenPageVoiceStep + delta));

    if (this.imagenPageVoiceStep === prevStep) return true;

    this.syncImagenVoiceStepAttr();

    if (this.imagenPageVoiceStep === 4) {
      window.dispatchEvent(new CustomEvent(VOICE_IMAGEN_TIMELINE_DEPLOY_EVENT));
    } else if (prevStep === 4) {
      window.dispatchEvent(new CustomEvent(VOICE_IMAGEN_TIMELINE_COLLAPSE_EVENT));
    }

    if (this.imagenPageVoiceStep === 7) {
      window.dispatchEvent(new CustomEvent(VOICE_IMAGEN_FILTROS_DEPLOY_EVENT));
    } else if (prevStep === 7) {
      window.dispatchEvent(new CustomEvent(VOICE_IMAGEN_FILTROS_COLLAPSE_EVENT));
    }

    if (this.imagenPageVoiceStep === 8) {
      window.dispatchEvent(new CustomEvent(VOICE_IMAGEN_VENTANITA_DEPLOY_EVENT));
    } else if (prevStep === 8) {
      window.dispatchEvent(new CustomEvent(VOICE_IMAGEN_VENTANITA_COLLAPSE_EVENT));
    }

    const applyScroll = () => {
      if (this.imagenPageVoiceStep === 9) {
        this.lenis?.resize();
      }

      const y = this.computeImagenPageScrollY(this.imagenPageVoiceStep);
      if (y === null) return;

      const L = this.lenis;
      const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const clamped = Math.max(0, Math.min(y, lim));

      this.lastVoiceSnapIndex = null;
      this.lastVoiceSnapEl = null;
      this.voiceReadingSnapStack.length = 0;

      if (L) {
        L.scrollTo(clamped, { programmatic: true });
      } else {
        window.scrollTo({ top: clamped, behavior: 'smooth' });
      }

      window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
    };

    if (
      this.imagenPageVoiceStep === 4 ||
      this.imagenPageVoiceStep === 7 ||
      this.imagenPageVoiceStep === 8 ||
      this.imagenPageVoiceStep === 9
    ) {
      requestAnimationFrame(() => requestAnimationFrame(() => applyScroll()));
    } else {
      applyScroll();
    }
    return true;
  }

  private computeImagenPageScrollY(step: number): number | null {
    const host = document.querySelector('app-imagen') as HTMLElement | null;
    if (!host) return null;

    const L = this.lenis;
    const scroll = L?.animatedScroll ?? window.scrollY;
    const vh = window.innerHeight;
    const ho = this.principalVoiceHeaderOffset;

    const docTop = (el: Element) => el.getBoundingClientRect().top + scroll;
    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - vh);
    const clamp = (y: number) => Math.max(0, Math.min(y, lim));

    const seccion1 = host.querySelector<HTMLElement>('#seccion1');
    const h3s1 = seccion1?.querySelector<HTMLElement>(':scope > h3');
    const mosaico = seccion1?.querySelector<HTMLElement>('app-mosaico');
    const p1 = seccion1?.querySelector<HTMLElement>(':scope > p');
    const seccion2 = host.querySelector<HTMLElement>('#seccion2');
    const h3s2 = seccion2?.querySelector<HTMLElement>(':scope > h3');
    const linea = seccion2?.querySelector<HTMLElement>('app-linea-dispositivos');
    const p2 = seccion2?.querySelector<HTMLElement>(':scope > p');
    const seccion3 = host.querySelector<HTMLElement>('#seccion3');
    const h3s3 = seccion3?.querySelector<HTMLElement>(':scope > h3');
    const p3 = seccion3?.querySelector<HTMLElement>(':scope > p');
    const filtros = seccion3?.querySelector<HTMLElement>('app-filtros');
    const cierreS3 = seccion3?.querySelector<HTMLElement>('.seccion3-cierre');
    const ventanita = cierreS3?.querySelector<HTMLElement>('.ventanita');
    const btnSig = cierreS3?.querySelector<HTMLElement>('.btn-seccion3');
    const pie = document.querySelector<HTMLElement>('app-pie-pagina');

    const centerBlock = (el: HTMLElement): number => {
      const top = docTop(el);
      const h = el.getBoundingClientRect().height;
      const pad = 24;
      const avail = vh - ho - pad;
      if (h <= avail) return clamp(top - ho - Math.max(0, (avail - h) / 2));
      return clamp(top - ho);
    };

    const centerInFullViewport = (el: HTMLElement, withMargins = false): number => {
      let top = docTop(el);
      let h = el.getBoundingClientRect().height;
      if (withMargins) {
        const st = getComputedStyle(el);
        const mt = parseFloat(st.marginTop) || 0;
        const mb = parseFloat(st.marginBottom) || 0;
        top -= mt;
        h += mt + mb;
      }
      return clamp(top + h / 2 - vh / 2);
    };

    const frameBlock = (topEl: HTMLElement, bottomEl: HTMLElement): number => {
      const top = docTop(topEl);
      const bottom = docTop(bottomEl) + bottomEl.getBoundingClientRect().height;
      const blockH = bottom - top;
      const pad = 24;
      const avail = vh - ho - pad;
      if (blockH <= avail) {
        return clamp(top - ho - Math.max(0, (avail - blockH) / 2));
      }
      const yCenter = top + blockH / 2 - vh / 2;
      const yBottom = bottom - vh + pad;
      const yTop = top - ho;
      if (yTop >= yBottom) {
        return clamp(Math.max(yBottom, Math.min(yTop, yCenter)));
      }
      return clamp(yBottom);
    };

    switch (step) {
      case 0:
        return 0;

      case 1: {
        if (h3s1 && mosaico) return frameBlock(h3s1, mosaico);
        if (mosaico) return centerBlock(mosaico);
        if (h3s1) return centerBlock(h3s1);
        return clamp(vh * 0.85);
      }

      case 2: {
        if (p1) return centerBlock(p1);
        return clamp(vh * 1.2);
      }

      case 3: {
        if (h3s2) return centerBlock(h3s2);
        return clamp(vh * 1.6);
      }

      case 4: {
        if (linea) return clamp(centerInFullViewport(linea, false) + 28);
        return clamp(vh * 2);
      }

      case 5: {
        if (p2) return centerBlock(p2);
        return clamp(vh * 2.4);
      }

      case 6: {
        if (h3s3 && p3) return frameBlock(h3s3, p3);
        if (h3s3) return centerBlock(h3s3);
        if (p3) return centerBlock(p3);
        return clamp(vh * 2.8);
      }

      case 7: {
        const win = filtros?.querySelector<HTMLElement>('.editor-window');
        if (win) return centerInFullViewport(win, true);
        if (filtros) return centerInFullViewport(filtros, false);
        return clamp(vh * 3.2);
      }

      case 8: {
        if (ventanita) return centerInFullViewport(ventanita, true);
        return clamp(vh * 3.6);
      }

      case 9: {
        if (pie) {
          const pieBottom = docTop(pie) + pie.getBoundingClientRect().height;
          return clamp(pieBottom - vh + 16);
        }
        return lim;
      }

      default:
        return 0;
    }
  }

  private computeMusicaPageScrollY(step: number): number | null {
    const host = document.querySelector('app-musica') as HTMLElement | null;
    if (!host) return null;

    const L = this.lenis;
    const scroll = L?.animatedScroll ?? window.scrollY;
    const vh = window.innerHeight;
    const ho = this.principalVoiceHeaderOffset;

    const docTop = (el: Element) => el.getBoundingClientRect().top + scroll;
    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - vh);
    const clamp = (y: number) => Math.max(0, Math.min(y, lim));

    const seccion1 = host.querySelector<HTMLElement>('#seccion1');
    const h3s1 = seccion1?.querySelector<HTMLElement>(':scope > h3');
    const p1 = seccion1?.querySelector<HTMLElement>(':scope > p');
    const instrumentos = seccion1?.querySelector<HTMLElement>('app-instrumentos');
    const seccion2 = host.querySelector<HTMLElement>('#seccion2');
    const h3s2 = seccion2?.querySelector<HTMLElement>(':scope > h3');
    const evolucion = seccion2?.querySelector<HTMLElement>('app-evolucion');
    const p2 = seccion2?.querySelector<HTMLElement>(':scope > p');
    const seccion3 = host.querySelector<HTMLElement>('#seccion3');
    const h3s3 = seccion3?.querySelector<HTMLElement>(':scope > h3');
    const mesa = seccion3?.querySelector<HTMLElement>('app-mesa-mezclas');
    const mesaWin = mesa?.querySelector<HTMLElement>('.win95-container');
    const cierreS3 = seccion3?.querySelector<HTMLElement>('.seccion3-cierre');
    const ventanita = cierreS3?.querySelector<HTMLElement>('.ventanita');
    const pie = document.querySelector<HTMLElement>('app-pie-pagina');

    const centerBlock = (el: HTMLElement): number => {
      const top = docTop(el);
      const h = el.getBoundingClientRect().height;
      const pad = 24;
      if (h <= vh - pad) return clamp(top + h / 2 - vh / 2);
      return clamp(top - ho);
    };

    const frameBlock = (topEl: HTMLElement, bottomEl: HTMLElement): number => {
      const top = docTop(topEl);
      const bottom = docTop(bottomEl) + bottomEl.getBoundingClientRect().height;
      const blockH = bottom - top;
      const pad = 24;
      const avail = vh - ho - pad;
      if (blockH <= avail) {
        return clamp(top - ho - Math.max(0, (avail - blockH) / 2));
      }
      const yCenter = top + blockH / 2 - vh / 2;
      const yBottom = bottom - vh + pad;
      const yTop = top - ho;
      if (yTop >= yBottom) {
        return clamp(Math.max(yBottom, Math.min(yTop, yCenter)));
      }
      return clamp(yBottom);
    };

    const centerInFullViewport = (el: HTMLElement, withMargins = false): number => {
      let top = docTop(el);
      let h = el.getBoundingClientRect().height;
      if (withMargins) {
        const st = getComputedStyle(el);
        const mt = parseFloat(st.marginTop) || 0;
        const mb = parseFloat(st.marginBottom) || 0;
        top -= mt;
        h += mt + mb;
      }
      return clamp(top + h / 2 - vh / 2);
    };

    switch (step) {
      case 0:
        return 0;

      case 1: {
        if (h3s1 && instrumentos) return frameBlock(h3s1, instrumentos);
        if (h3s1 && p1) return frameBlock(h3s1, p1);
        if (instrumentos) return centerBlock(instrumentos);
        if (h3s1) return centerBlock(h3s1);
        return clamp(vh * 0.85);
      }

      case 2: {
        if (h3s2) return centerBlock(h3s2);
        return clamp(vh * 1.6);
      }

      case 3: {
        const evoPanel = evolucion?.querySelector<HTMLElement>('.machine-wrap') ?? evolucion;
        if (evoPanel) return centerInFullViewport(evoPanel, true);
        return clamp(vh * 2);
      }

      case 4: {
        if (p2) return centerBlock(p2);
        return clamp(vh * 2.4);
      }

      case 5: {
        if (h3s3) return centerBlock(h3s3);
        return clamp(vh * 2.8);
      }

      case 6: {
        const mixer = mesaWin ?? mesa;
        if (mixer) return centerInFullViewport(mixer, true);
        return clamp(vh * 3.2);
      }

      case 7: {
        if (ventanita) return centerInFullViewport(ventanita, true);
        return clamp(vh * 3.6);
      }

      case 8: {
        if (pie) {
          const pieBottom = docTop(pie) + pie.getBoundingClientRect().height;
          return clamp(pieBottom - vh + 16);
        }
        return lim;
      }

      default:
        return 0;
    }
  }

  private computeAudiovisualPageScrollY(step: number): number | null {
    const host = document.querySelector('app-audiovisual') as HTMLElement | null;
    if (!host) return null;

    const L = this.lenis;
    const scroll = L?.animatedScroll ?? window.scrollY;
    const vh = window.innerHeight;
    const ho = this.principalVoiceHeaderOffset;

    const docTop = (el: Element) => el.getBoundingClientRect().top + scroll;
    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - vh);
    const clamp = (y: number) => Math.max(0, Math.min(y, lim));

    const seccion1 = host.querySelector<HTMLElement>('#seccion1');
    const h3s1 = seccion1?.querySelector<HTMLElement>(':scope > h3');
    const p1 = seccion1?.querySelector<HTMLElement>(':scope > p');
    const comparacion = seccion1?.querySelector<HTMLElement>('app-comparacion');
    const comparacionWrap = comparacion?.querySelector<HTMLElement>('.player-wrap') ?? comparacion;

    const seccion2 = host.querySelector<HTMLElement>('#seccion2');
    const h3s2 = seccion2?.querySelector<HTMLElement>(':scope > h3');
    const sintonizador = seccion2?.querySelector<HTMLElement>('app-sintonizador-transmedia');
    const sintonizadorWin = sintonizador?.querySelector<HTMLElement>('.win95-window') ?? sintonizador;

    const seccion3 = host.querySelector<HTMLElement>('#seccion3');
    const h3s3 = seccion3?.querySelector<HTMLElement>(':scope > h3');
    const collage = seccion3?.querySelector<HTMLElement>('app-collage-interactivo');
    const collageRoot = collage?.querySelector<HTMLElement>('#collage') ?? collage;
    const cierreS3 = seccion3?.querySelector<HTMLElement>('.seccion3-cierre');
    const ventanita = cierreS3?.querySelector<HTMLElement>('.ventanita');
    const siguienteBtn = cierreS3?.querySelector<HTMLElement>('.btn-seccion3');
    const pie = document.querySelector<HTMLElement>('app-pie-pagina');

    const centerBlock = (el: HTMLElement): number => {
      const top = docTop(el);
      const h = el.getBoundingClientRect().height;
      const pad = 24;
      if (h <= vh - pad) return clamp(top + h / 2 - vh / 2);
      return clamp(top - ho);
    };

    const frameBlock = (topEl: HTMLElement, bottomEl: HTMLElement): number => {
      const top = docTop(topEl);
      const bottom = docTop(bottomEl) + bottomEl.getBoundingClientRect().height;
      const blockH = bottom - top;
      const pad = 24;
      const avail = vh - ho - pad;
      if (blockH <= avail) {
        return clamp(top - ho - Math.max(0, (avail - blockH) / 2));
      }
      const yCenter = top + blockH / 2 - vh / 2;
      const yBottom = bottom - vh + pad;
      const yTop = top - ho;
      if (yTop >= yBottom) {
        return clamp(Math.max(yBottom, Math.min(yTop, yCenter)));
      }
      return clamp(yBottom);
    };

    const centerInFullViewport = (el: HTMLElement, withMargins = false): number => {
      let top = docTop(el);
      let h = el.getBoundingClientRect().height;
      if (withMargins) {
        const st = getComputedStyle(el);
        const mt = parseFloat(st.marginTop) || 0;
        const mb = parseFloat(st.marginBottom) || 0;
        top -= mt;
        h += mt + mb;
      }
      return clamp(top + h / 2 - vh / 2);
    };

    switch (step) {
      case 0:
        return 0;

      case 1: {
        if (h3s1) return centerBlock(h3s1);
        return clamp(vh * 0.85);
      }

      case 2: {
        const comp = comparacionWrap ?? comparacion;
        if (comp) return centerInFullViewport(comp, true);
        return clamp(vh * 1.2);
      }

      case 3: {
        if (p1) return centerBlock(p1);
        return clamp(vh * 1.35);
      }

      case 4: {
        if (h3s2) return centerBlock(h3s2);
        return clamp(vh * 1.6);
      }

      case 5: {
        if (sintonizadorWin) return centerInFullViewport(sintonizadorWin, true);
        return clamp(vh * 2);
      }

      case 6: {
        if (h3s3) return centerBlock(h3s3);
        return clamp(vh * 2.6);
      }

      case 7: {
        if (collageRoot) return centerInFullViewport(collageRoot, true);
        return clamp(vh * 3);
      }

      case 8: {
        if (ventanita && siguienteBtn) return frameBlock(ventanita, siguienteBtn);
        if (cierreS3) return centerInFullViewport(cierreS3, true);
        if (ventanita) return centerInFullViewport(ventanita, true);
        return clamp(vh * 3.4);
      }

      case 9: {
        if (pie) {
          const pieBottom = docTop(pie) + pie.getBoundingClientRect().height;
          return clamp(pieBottom - vh + 16);
        }
        return lim;
      }

      default:
        return 0;
    }
  }

  private computeInteractividadPageScrollY(step: number): number | null {
    const host = document.querySelector('app-interactividad') as HTMLElement | null;
    if (!host) return null;

    const L = this.lenis;
    const scroll = L?.animatedScroll ?? window.scrollY;
    const vh = window.innerHeight;
    const ho = this.principalVoiceHeaderOffset;

    const docTop = (el: Element) => el.getBoundingClientRect().top + scroll;
    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - vh);
    const clamp = (y: number) => Math.max(0, Math.min(y, lim));

    const seccion1 = host.querySelector<HTMLElement>('#seccion1');
    const h3s1 = seccion1?.querySelector<HTMLElement>(':scope > h3');
    const p1 = seccion1?.querySelector<HTMLElement>(':scope > p');
    const historia = seccion1?.querySelector<HTMLElement>('app-historia-interactiva');
    const historiaWrap =
      historia?.querySelector<HTMLElement>('.main-wrapper') ?? historia;

    const seccion2 = host.querySelector<HTMLElement>('#seccion2');
    const h3s2 = seccion2?.querySelector<HTMLElement>(':scope > h3');
    const p2 = seccion2?.querySelector<HTMLElement>(':scope > p');
    const evolucion = seccion2?.querySelector<HTMLElement>('app-evolucion-interfaces');
    const evolucionWrap =
      evolucion?.querySelector<HTMLElement>('.evolucion-wrapper') ?? evolucion;

    const seccion3 = host.querySelector<HTMLElement>('#seccion3');
    const h2s3 = seccion3?.querySelector<HTMLElement>(':scope > h2');
    const h3s3 = seccion3?.querySelector<HTMLElement>(':scope > h3');
    const p3 = seccion3?.querySelector<HTMLElement>(':scope > p');
    const multimedia = seccion3?.querySelector<HTMLElement>('app-multimedia');
    const multimediaShell =
      multimedia?.querySelector<HTMLElement>('.mm-shell') ?? multimedia;
    const cierreS3 = seccion3?.querySelector<HTMLElement>('.seccion3-cierre');
    const ventanita = cierreS3?.querySelector<HTMLElement>('.ventanita');
    const pie = document.querySelector<HTMLElement>('app-pie-pagina');

    const centerBlock = (el: HTMLElement): number => {
      const top = docTop(el);
      const h = el.getBoundingClientRect().height;
      const pad = 24;
      if (h <= vh - pad) return clamp(top + h / 2 - vh / 2);
      return clamp(top - ho);
    };

    const blockTopWithMargin = (el: HTMLElement): number => {
      const mt = parseFloat(getComputedStyle(el).marginTop) || 0;
      return docTop(el) - mt;
    };

    const blockBottomWithMargin = (el: HTMLElement): number => {
      const mb = parseFloat(getComputedStyle(el).marginBottom) || 0;
      return docTop(el) + el.getBoundingClientRect().height + mb;
    };

    const frameTextBlock = (
      topEl: HTMLElement,
      bottomEl: HTMLElement,
      bottomPeek = 0
    ): number => {
      const top = blockTopWithMargin(topEl);
      const bottom = blockBottomWithMargin(bottomEl) + bottomPeek;
      const blockH = bottom - top;
      const pad = 24;
      const avail = vh - ho - pad;
      if (blockH <= avail) {
        const surplus = Math.max(0, avail - blockH);
        return clamp(top - ho - surplus * 0.38);
      }
      return clamp(top - ho + Math.min(bottomPeek, 48));
    };

    const centerInFullViewport = (el: HTMLElement, withMargins = false): number => {
      let top = docTop(el);
      let h = el.getBoundingClientRect().height;
      if (withMargins) {
        const st = getComputedStyle(el);
        const mt = parseFloat(st.marginTop) || 0;
        const mb = parseFloat(st.marginBottom) || 0;
        top -= mt;
        h += mt + mb;
      }
      return clamp(top + h / 2 - vh / 2);
    };

    switch (step) {
      case 0:
        return 0;

      case 1: {
        if (h3s1) return centerBlock(h3s1);
        return clamp(vh * 0.85);
      }

      case 2: {
        const bloqueHistoria = historiaWrap ?? historia;
        if (bloqueHistoria) {
          const top = blockTopWithMargin(bloqueHistoria);
          const bottom = blockBottomWithMargin(bloqueHistoria);
          const blockH = bottom - top;
          const pad = 20;
          const avail = vh - pad;
          if (blockH <= avail) {
            return clamp(top + blockH / 2 - avail / 2);
          }
          return clamp(top + blockH / 2 - vh / 2);
        }
        return clamp(vh * 1.1);
      }

      case 3: {
        if (p1) return centerBlock(p1);
        return clamp(vh * 1.35);
      }

      case 4: {
        if (h3s2) return centerBlock(h3s2);
        return clamp(vh * 1.75);
      }

      case 5: {
        if (evolucionWrap) return centerInFullViewport(evolucionWrap, true);
        return clamp(vh * 2.2);
      }

      case 6: {
        const peekParrafo = 72;
        if (h2s3 && p3) return frameTextBlock(h2s3, p3, peekParrafo);
        if (h2s3 && h3s3) return frameTextBlock(h2s3, h3s3, peekParrafo);
        if (h3s3 && p3) return frameTextBlock(h3s3, p3, peekParrafo);
        if (h2s3) return centerBlock(h2s3);
        return clamp(vh * 3);
      }

      case 7: {
        if (multimediaShell) return centerInFullViewport(multimediaShell, true);
        return clamp(vh * 3.4);
      }

      case 8: {
        if (ventanita) return centerInFullViewport(ventanita, true);
        return clamp(vh * 3.8);
      }

      case 9: {
        if (pie) {
          const pieBottom = docTop(pie) + pie.getBoundingClientRect().height;
          return clamp(pieBottom - vh + 16);
        }
        return lim;
      }

      default:
        return 0;
    }
  }

  private computeTextoPageScrollY(step: number): number | null {
    const host = document.querySelector('app-texto') as HTMLElement | null;
    if (!host) return null;

    const L = this.lenis;
    const scroll = L?.animatedScroll ?? window.scrollY;
    const vh = window.innerHeight;
    const ho = this.principalVoiceHeaderOffset;

    const docTop = (el: Element) => el.getBoundingClientRect().top + scroll;
    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - vh);
    const clamp = (y: number) => Math.max(0, Math.min(y, lim));

    const seccion1 = host.querySelector<HTMLElement>('#seccion1');
    const h2s1 = seccion1?.querySelector<HTMLElement>('h2');
    const bloc = host.querySelector<HTMLElement>('app-bloc-notas');
    const seccion2 = host.querySelector<HTMLElement>('#seccion2');
    const h2s2 = seccion2?.querySelector<HTMLElement>('h2');
    const btnCarrusel = seccion2?.querySelector<HTMLElement>('.btn-carrusel');
    const p2 = seccion2?.querySelector<HTMLElement>('p');
    const ventanita = seccion2?.querySelector<HTMLElement>('.ventanita');
    const btnSig = seccion2?.querySelector<HTMLElement>('.siguiente');
    const pie = document.querySelector<HTMLElement>('app-pie-pagina');

    switch (step) {
      case 0:
        return 0;

      case 1: {
        const anchor = h2s1 ?? seccion1;
        if (anchor) return clamp(docTop(anchor) - ho);
        return clamp(vh * 0.85);
      }

      case 2: {
        if (!bloc) {
          if (seccion1) return clamp(docTop(seccion1) + seccion1.getBoundingClientRect().height * 0.55 - ho);
          return clamp(vh * 1.4);
        }
        const blocH = bloc.getBoundingClientRect().height;
        const avail = vh - ho - 20;
        const top = docTop(bloc);
        if (blocH <= avail) {
          return clamp(top - ho - Math.max(0, (avail - blocH) / 2));
        }
        return clamp(top - ho);
      }

      case 3: {
        if (h2s2 && btnCarrusel) {
          const topY = docTop(h2s2) - ho;
          const blockBottom = docTop(btnCarrusel) + btnCarrusel.getBoundingClientRect().height;
          const blockH = blockBottom - docTop(h2s2);
          if (blockH <= vh - ho - 24) return clamp(topY);
          return clamp(topY);
        }
        const anchor = h2s2 ?? btnCarrusel ?? seccion2;
        if (anchor) return clamp(docTop(anchor) - ho);
        return clamp(vh * 2);
      }

      case 4: {
        if (p2) {
          const pTop = docTop(p2);
          const pH = p2.getBoundingClientRect().height;
          const pad = 24;
          if (pH <= vh - pad) {
            return clamp(pTop + pH / 2 - vh / 2);
          }
          return clamp(pTop - ho);
        }
        return clamp(vh * 2.6);
      }

      case 5: {
        if (ventanita) {
          const vTop = docTop(ventanita);
          const vH = ventanita.getBoundingClientRect().height;
          const pad = 24;
          if (vH <= vh - pad) {
            return clamp(vTop + vH / 2 - vh / 2);
          }
          return clamp(vTop - ho);
        }
        return clamp(vh * 3);
      }

      case 6: {
        const anchor = btnSig ?? pie;
        if (anchor) {
          const y = docTop(anchor) - ho;
          if (pie) {
            const pieTop = docTop(pie) - vh + 60;
            return clamp(Math.max(y, Math.min(pieTop, lim)));
          }
          return clamp(y);
        }
        return lim;
      }

      default:
        return 0;
    }
  }

  private computeAudioPageScrollY(step: number): number | null {
    const host = document.querySelector('app-audio') as HTMLElement | null;
    if (!host) return null;

    const L = this.lenis;
    const scroll = L?.animatedScroll ?? window.scrollY;
    const vh = window.innerHeight;
    const ho = this.principalVoiceHeaderOffset;

    const docTop = (el: Element) => el.getBoundingClientRect().top + scroll;
    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - vh);
    const clamp = (y: number) => Math.max(0, Math.min(y, lim));

    const seccion1 = host.querySelector<HTMLElement>('#seccion1');
    const h3s1 = seccion1?.querySelector<HTMLElement>(':scope > h3');
    const imgOnda = seccion1?.querySelector<HTMLElement>('.seccion1-onda');
    const p1 = seccion1?.querySelector<HTMLElement>(':scope > p');
    const seccion2 = host.querySelector<HTMLElement>('#seccion2');
    const h2s2 = seccion2?.querySelector<HTMLElement>(':scope > h2');
    const carrusel = seccion2?.querySelector<HTMLElement>('app-carrusel-audio');
    const h3s2 = seccion2?.querySelector<HTMLElement>(':scope > h3');
    const p2 = seccion2?.querySelector<HTMLElement>(':scope > p');
    const seccion3 = host.querySelector<HTMLElement>('#seccion3');
    const h2s3 = seccion3?.querySelector<HTMLElement>(':scope > h2');
    const h3s3 = seccion3?.querySelector<HTMLElement>(':scope > h3');
    const p3 = seccion3?.querySelector<HTMLElement>('.columna-contenido p, .seccion3-grid p');
    const cierreS3 = seccion3?.querySelector<HTMLElement>('.seccion3-cierre');
    const btnExplorarWrap = cierreS3?.querySelector<HTMLElement>('.boton-con-lector:not(.siguiente-wrap)');
    const btnExplorar = btnExplorarWrap?.querySelector<HTMLElement>('.btn-audio') ?? cierreS3?.querySelector<HTMLElement>('.btn-audio:not(.btn-siguiente)');
    const ventanita = seccion3?.querySelector<HTMLElement>('.ventanita');
    const btnSigWrap = cierreS3?.querySelector<HTMLElement>('.siguiente-wrap');
    const btnSig = seccion3?.querySelector<HTMLElement>('.btn-siguiente');
    const pie = document.querySelector<HTMLElement>('app-pie-pagina');

    const centerBlock = (el: HTMLElement): number => {
      const top = docTop(el);
      const h = el.getBoundingClientRect().height;
      const pad = 24;
      if (h <= vh - pad) return clamp(top + h / 2 - vh / 2);
      return clamp(top - ho);
    };

    const frameBlock = (topEl: HTMLElement, bottomEl: HTMLElement): number => {
      const top = docTop(topEl);
      const bottom = docTop(bottomEl) + bottomEl.getBoundingClientRect().height;
      const blockH = bottom - top;
      const pad = 24;
      const avail = vh - ho - pad;
      if (blockH <= avail) {
        return clamp(top - ho - Math.max(0, (avail - blockH) / 2));
      }
      const yCenter = top + blockH / 2 - vh / 2;
      const yBottom = bottom - vh + pad;
      const yTop = top - ho;
      if (yTop >= yBottom) {
        return clamp(Math.max(yBottom, Math.min(yTop, yCenter)));
      }
      return clamp(yBottom);
    };

    switch (step) {
      case 0:
        return 0;

      case 1: {
        if (h3s1 && imgOnda) return frameBlock(h3s1, imgOnda);
        if (imgOnda) return centerBlock(imgOnda);
        if (h3s1) return centerBlock(h3s1);
        return clamp(vh * 0.85);
      }

      case 2: {
        if (p1) return centerBlock(p1);
        return clamp(vh * 1.2);
      }

      case 3: {
        if (h2s2 && carrusel) {
          const carruselEl = carrusel.querySelector<HTMLElement>('.carrusel') ?? carrusel;
          return frameBlock(h2s2, carruselEl);
        }
        if (carrusel) return centerBlock(carrusel);
        if (h2s2) return clamp(docTop(h2s2) - ho);
        return clamp(vh * 1.8);
      }

      case 4: {
        if (h3s2 && h2s3) return frameBlock(h3s2, h2s3);
        if (h3s2 && p2) return frameBlock(h3s2, p2);
        if (p2) return centerBlock(p2);
        if (h3s2) return centerBlock(h3s2);
        return clamp(vh * 2.4);
      }

      case 5: {
        if (h3s3 && p3) return frameBlock(h3s3, p3);
        if (p3) return centerBlock(p3);
        if (h3s3) return centerBlock(h3s3);
        return clamp(vh * 2.8);
      }

      case 6: {
        const topExplorar = btnExplorarWrap ?? btnExplorar;
        if (topExplorar && ventanita) return frameBlock(topExplorar, ventanita);
        if (ventanita) return centerBlock(ventanita);
        if (topExplorar) return clamp(docTop(topExplorar) - ho);
        return clamp(vh * 3.2);
      }

      case 7: {
        const topSig = btnSigWrap ?? btnSig;
        if (topSig && pie) {
          const top = docTop(topSig);
          const bottom = docTop(pie) + pie.getBoundingClientRect().height;
          const blockH = bottom - top;
          const pad = 24;
          const avail = vh - ho - pad;
          if (blockH <= avail) {
            return clamp(top - ho - Math.max(0, (avail - blockH) / 2));
          }
          return clamp(bottom - vh + pad);
        }
        if (btnSig) return clamp(docTop(btnSig) - ho);
        if (pie) return clamp(docTop(pie) - vh + 60);
        return lim;
      }

      default:
        return 0;
    }
  }

  private computeVideoPageScrollY(step: number): number | null {
    const host = document.querySelector('app-video') as HTMLElement | null;
    if (!host) return null;

    const L = this.lenis;
    const scroll = L?.animatedScroll ?? window.scrollY;
    const vh = window.innerHeight;
    const ho = this.principalVoiceHeaderOffset;

    const docTop = (el: Element) => el.getBoundingClientRect().top + scroll;
    const lim = L?.limit ?? Math.max(0, document.documentElement.scrollHeight - vh);
    const clamp = (y: number) => Math.max(0, Math.min(y, lim));

    const seccion1 = host.querySelector<HTMLElement>('#seccion1');
    const h2s1 = seccion1?.querySelector<HTMLElement>(':scope > h2');
    const h3s1 = seccion1?.querySelector<HTMLElement>(':scope > h3');
    const reproductores = seccion1?.querySelector<HTMLElement>('app-reproductores');
    const p1 = seccion1?.querySelector<HTMLElement>(':scope > p');
    const seccion2 = host.querySelector<HTMLElement>('#seccion2');
    const p2 = seccion2?.querySelector<HTMLElement>(':scope > p');
    const mediaDeck = seccion2?.querySelector<HTMLElement>('app-media-deck');
    const seccion3 = host.querySelector<HTMLElement>('#seccion3');
    const h3s3 = seccion3?.querySelector<HTMLElement>(':scope > h3');
    const inmersivo = seccion3?.querySelector<HTMLElement>('app-video-inmersivo');
    const ventanita = seccion3?.querySelector<HTMLElement>('.ventanita');
    const pie = document.querySelector<HTMLElement>('app-pie-pagina');

    const centerBlock = (el: HTMLElement): number => {
      const top = docTop(el);
      const h = el.getBoundingClientRect().height;
      const pad = 24;
      if (h <= vh - pad) return clamp(top + h / 2 - vh / 2);
      return clamp(top - ho);
    };

    const frameBlock = (topEl: HTMLElement, bottomEl: HTMLElement): number => {
      const top = docTop(topEl);
      const bottom = docTop(bottomEl) + bottomEl.getBoundingClientRect().height;
      const blockH = bottom - top;
      const pad = 24;
      const avail = vh - ho - pad;
      if (blockH <= avail) {
        return clamp(top - ho - Math.max(0, (avail - blockH) / 2));
      }
      const yCenter = top + blockH / 2 - vh / 2;
      const yBottom = bottom - vh + pad;
      const yTop = top - ho;
      if (yTop >= yBottom) {
        return clamp(Math.max(yBottom, Math.min(yTop, yCenter)));
      }
      return clamp(yBottom);
    };

    switch (step) {
      case 0:
        return 0;

      case 1: {
        if (h2s1 && reproductores) return frameBlock(h2s1, reproductores);
        if (h2s1 && h3s1) return frameBlock(h2s1, h3s1);
        if (reproductores) return centerBlock(reproductores);
        if (h2s1) return clamp(docTop(h2s1) - ho);
        return clamp(vh * 0.85);
      }

      case 2: {
        if (p1) return centerBlock(p1);
        return clamp(vh * 1.2);
      }

      case 3: {
        if (p2) return centerBlock(p2);
        return clamp(vh * 1.6);
      }

      case 4: {
        if (mediaDeck) return centerBlock(mediaDeck);
        return clamp(vh * 2);
      }

      case 5: {
        if (h3s3) return centerBlock(h3s3);
        return clamp(vh * 2.4);
      }

      case 6: {
        if (inmersivo) return centerBlock(inmersivo);
        return clamp(vh * 2.8);
      }

      case 7: {
        if (ventanita) return centerBlock(ventanita);
        return clamp(vh * 3.2);
      }

      case 8: {
        if (pie) {
          const pieTop = docTop(pie);
          const pieH = pie.getBoundingClientRect().height;
          const pieBottom = pieTop + pieH;
          const y = pieBottom - vh + 16;
          return clamp(Math.max(y, 0));
        }
        return lim;
      }

      default:
        return 0;
    }
  }

  private scrollVoiceReadingBlockToCenter(el: HTMLElement): void {
    const L = this.lenis;
    if (!L) {
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
      return;
    }
    const r = el.getBoundingClientRect();
    const topDoc = r.top + L.animatedScroll;
    const y = topDoc + r.height / 2 - window.innerHeight / 2;
    const clamped = Math.max(0, Math.min(y, L.limit));
    L.scrollTo(clamped, { programmatic: true });
  }

  keyboardZone: 'general' | 'nav' | 'accessibility' | 'lateral' = 'general';
  keyboardZoneLabel(): string {
    const activeMenu = this.ui.activeMenu();
    const zone = this.keyboardZone === 'general' && activeMenu ? activeMenu : this.keyboardZone;
    switch (zone) {
      case 'nav':
        return 'NAVEGACION';
      case 'accessibility':
        return 'ACCESIBILIDAD';
      case 'lateral':
        return 'LATERAL';
      default:
        return 'GENERAL';
    }
  }
  private lastVoiceSnapIndex: number | null = null;
  private lastVoiceSnapEl: HTMLElement | null = null;
  private lastVoiceSnapAt = 0;
  private readonly voiceReadingSnapStack: HTMLElement[] = [];
  private zoneIndex = 0;
  private lastArrowKey: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | null = null;
  private lastArrowAt = 0;
  private lastArrowCount = 0;
  private readonly menuComboWindowMs = 3500;
  private readonly lateralCommandGraceMs = 420;
  private pendingLeftFocusTimer: number | null = null;

  private editingSlider: HTMLInputElement | null = null;
  private mesaKeyboardEntered = false;
  private multimediaKeyboardEntered = false;

  private isRangeElement(el: EventTarget | null): el is HTMLInputElement {
    return el instanceof HTMLInputElement && el.type === 'range';
  }

  private adjustRangeByKeyboard(input: HTMLInputElement, direction: 1 | -1): void {
    try {
      if (direction > 0) input.stepUp(1);
      else input.stepDown(1);
    } catch {
      const stepRaw = Number(input.step);
      const step = Number.isFinite(stepRaw) && stepRaw > 0 ? stepRaw : 1;
      const min = input.min === '' ? -Infinity : Number(input.min);
      const max = input.max === '' ? Infinity : Number(input.max);
      const curr = Number(input.value);
      const base = Number.isFinite(curr) ? curr : 0;
      const next = Math.max(min, Math.min(max, base + step * direction));
      input.value = String(next);
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  private scrollFromRangeArrow(direction: 1 | -1): void {
    const delta = Math.max(80, Math.round(window.innerHeight * 0.12)) * direction;
    if (this.lenis) {
      const next = Math.max(0, Math.min(this.lenis.animatedScroll + delta, this.lenis.limit));
      this.lenis.scrollTo(next, { programmatic: true });
      window.dispatchEvent(new CustomEvent('app:refresh-scroll'));
      return;
    }
    window.scrollBy({ top: delta, behavior: 'smooth' });
  }

  private setSliderEditing(input: HTMLInputElement | null) {
    if (this.editingSlider && this.editingSlider !== input) {
      this.editingSlider.classList.remove('slider-editing');
    }
    this.editingSlider = input;
    if (input) input.classList.add('slider-editing');
  }

  private setMesaKeyboardEntered(value: boolean): void {
    this.mesaKeyboardEntered = value;
    const mesaRoot = document.querySelector<HTMLElement>('app-mesa-mezclas [data-mm-role="root"]');
    mesaRoot?.classList.toggle('mm-entered', value);
  }

  private setMultimediaKeyboardEntered(value: boolean): void {
    this.multimediaKeyboardEntered = value;
    const multimediaRoot = document.querySelector<HTMLElement>('app-multimedia [data-mu-role="root"]');
    multimediaRoot?.classList.toggle('mu-entered', value);
  }

  infoTheme = computed(() => {
    const modo = this.colorService.colorActivo();

    if (modo === 'original') {
      return {
        overlayBg: 'rgba(0,0,0,0.85)',
        panelBg: '#90a8ed',
        panelText: 'black',
        borderColor: '#4f68b2',
        insetLight: '#ffffff',
        insetDark: '#2c4baa',
        titlebarBg: '#4c66b4',
        titlebarText: 'white',
        titlebarDivider: '#808080',
        closeBg: '#afc3ff',
      };
    }

    return this.popupThemes[modo];
  });

  ngAfterViewInit() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      prevent: (node: Element) => {
        return node.closest('app-popup') !== null;
      },
    });

    const raf = (time: number) => {
      this.lenis?.raf(time);
      this.rafId = requestAnimationFrame(raf);
    };
    this.rafId = requestAnimationFrame(raf);

    this.resizeObserver = new ResizeObserver(() => {
      this.lenis?.resize();
    });
    this.resizeObserver.observe(document.body);

    window.addEventListener('app:refresh-scroll', this.onRefreshScroll);
    window.addEventListener('keydown', this.onGlobalKeydown, true);

    window.addEventListener(VOICE_MENU_ZONE_EVENT, this.onVoiceMenuZone);
    window.addEventListener(VOICE_SNAP_TEXT_EVENT, this.onVoiceSnapText);
    window.addEventListener(VOICE_EXIT_EVENT, this.onVoiceExit);
    this.voiceMenuBridge.connect(this.tryVoiceMenuPick);
    this.voiceNav.bindUserGesture();
  }

  ngOnDestroy(): void {
    window.removeEventListener('app:refresh-scroll', this.onRefreshScroll);
    window.removeEventListener('keydown', this.onGlobalKeydown, true);
    window.removeEventListener(VOICE_MENU_ZONE_EVENT, this.onVoiceMenuZone);
    window.removeEventListener(VOICE_SNAP_TEXT_EVENT, this.onVoiceSnapText);
    window.removeEventListener(VOICE_EXIT_EVENT, this.onVoiceExit);
    this.voiceMenuBridge.disconnect();
    this.voiceNav.stop();
    this.resizeObserver?.disconnect();
    this.clearPendingLeftFocus();
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
    this.lenis?.destroy();
    this.lenis = undefined;
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el) return false;
    if (el.isContentEditable) return true;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }

  private getFocusableElements(): HTMLElement[] {
    const escucharDetalleTargets = this.getEscucharDetalleKeyboardTargets();
    if (escucharDetalleTargets.length) return escucharDetalleTargets;

    const popupRoot =
      document.querySelector<HTMLElement>('app-popup .modal') ??
      document.querySelector<HTMLElement>('app-popup');

    const mainContent = document.querySelector<HTMLElement>('main.contenido');

    const scope: ParentNode = popupRoot ?? mainContent ?? document;

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[role="button"]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const mesaRoot = document.querySelector<HTMLElement>('app-mesa-mezclas [data-mm-role="root"]');
    const multimediaRoot = document.querySelector<HTMLElement>('app-multimedia [data-mu-role="root"]');

    return Array.from(scope.querySelectorAll<HTMLElement>(selector))
      .filter(el => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const visibleByBox = rect.width > 0 && rect.height > 0;
        const inMesa = !!el.closest('app-mesa-mezclas');
        const isMesaRoot = !!mesaRoot && el === mesaRoot;
        const inMultimedia = !!el.closest('app-multimedia');
        const isMultimediaRoot = !!multimediaRoot && el === multimediaRoot;

        if (inMesa) {
          if (!this.mesaKeyboardEntered) {
            return isMesaRoot;
          }
          if (isMesaRoot) return false;
        }

        if (inMultimedia) {
          if (!this.multimediaKeyboardEntered) {
            return isMultimediaRoot;
          }
          if (isMultimediaRoot) return false;
        }

        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          el.tabIndex >= 0 &&
          visibleByBox
        );
      });
  }

  private isActivableElement(el: HTMLElement): boolean {
    const tag = el.tagName;
    if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT') return true;
    if (el.getAttribute('role') === 'button') return true;
    return el.tabIndex >= 0;
  }

  private getCarruselPopupKeyboardTargets(): HTMLElement[] {
    const popup = document.querySelector('app-carrusel')?.closest('app-popup') as HTMLElement | null;
    if (!popup || popup.classList.contains('popup-host--closed')) return [];
    const selectors = ['.btn-cerrar', '#popup-prev', '#popup-next'];
    const items: HTMLElement[] = [];
    for (const sel of selectors) {
      const el = popup.querySelector<HTMLElement>(sel);
      if (!el) continue;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (rect.width <= 0 || rect.height <= 0) continue;
      items.push(el);
    }
    return items;
  }

  private getEscucharDetalleKeyboardTargets(): HTMLElement[] {
    const overlay = document.querySelector<HTMLElement>('app-escuchar .detalle-overlay');
    if (!overlay) return [];

    const selectors = ['.detalle-ventana .btn-cerrar', '.detalle-ventana .detalle-play-wrap .btn-escuchar'];
    const items: HTMLElement[] = [];

    for (const sel of selectors) {
      const el = overlay.querySelector<HTMLElement>(sel);
      if (!el) continue;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (rect.width <= 0 || rect.height <= 0) continue;
      items.push(el);
    }

    return items;
  }

  private moveCarruselPopupFocus(direction: 1 | -1): boolean {
    const targets = this.getCarruselPopupKeyboardTargets();
    if (!targets.length) return false;
    const active = document.activeElement as HTMLElement | null;
    const idx = active ? targets.indexOf(active) : -1;
    if (idx === -1) {
      targets[0].focus();
      return true;
    }
    const next = (idx + direction + targets.length) % targets.length;
    targets[next].focus();
    return true;
  }

  private nearestFocusableInView(focusables: HTMLElement[]): HTMLElement {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = vw / 2;
    const cy = vh / 2;

    const visible = focusables.filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
    });

    const pool = visible.length ? visible : focusables;
    let best = pool[0];
    let bestDist = Number.POSITIVE_INFINITY;

    for (const el of pool) {
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width / 2;
      const ey = r.top + r.height / 2;
      const dx = ex - cx;
      const dy = ey - cy;
      const d = dx * dx + dy * dy;
      if (d < bestDist) {
        bestDist = d;
        best = el;
      }
    }

    return best;
  }

  private focusWithFallback(primary: HTMLElement, fallback: HTMLElement): void {
    primary.focus();
    if (document.activeElement !== primary) {
      fallback.focus();
    }
  }

  private getPrincipalJuegoButton(): HTMLElement | null {
    if (!this.isHomePathForPrincipalVoice()) return null;
    const btn = document.querySelector<HTMLElement>('app-principal .btn-juego');
    if (!btn) return null;
    const style = getComputedStyle(btn);
    if (style.display === 'none' || style.visibility === 'hidden') return null;
    return btn;
  }

  private shouldPrimeHomeJuegoOnArrowRight(popupOpen: boolean): boolean {
    if (popupOpen) return false;
    const juegoBtn = this.getPrincipalJuegoButton();
    if (!juegoBtn) return false;

    const active = document.activeElement as HTMLElement | null;
    if (!active || active === document.body || active === document.documentElement) return true;
    if (active === juegoBtn) return false;
    if (!active.closest('app-principal')) return true;
    if (!this.isInViewport(active)) return true;
    return false;
  }

  private clearPendingLeftFocus(): void {
    if (this.pendingLeftFocusTimer !== null) {
      clearTimeout(this.pendingLeftFocusTimer);
      this.pendingLeftFocusTimer = null;
    }
  }

  private scheduleLeftFocusFallback(): void {
    this.clearPendingLeftFocus();
    this.pendingLeftFocusTimer = window.setTimeout(() => {
      this.pendingLeftFocusTimer = null;
      if (this.tryMovePrincipalArrow(-1, false)) return;
      this.moveFocus(-1);
    }, this.lateralCommandGraceMs);
  }

  private getPrincipalArrowTargets(): HTMLElement[] {
    if (!this.isHomePathForPrincipalVoice()) return [];
    const host = document.querySelector<HTMLElement>('app-principal');
    if (!host) return [];

    const selectors = [
      '.btn-juego',
      '.carrusel-1 .flecha.izq',
      '.carrusel-1 .carrusel-imagen > img[tabindex]',
      '.carrusel-1 .flecha.der',
      '.carrusel-2 .flecha.izq',
      '.carrusel-2 .carrusel-imagen > img[tabindex]',
      '.carrusel-2 .flecha.der',
      '.siguiente',
    ];

    const targets: HTMLElement[] = [];
    for (const sel of selectors) {
      const el = host.querySelector<HTMLElement>(sel);
      if (!el) continue;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (rect.width <= 0 || rect.height <= 0) continue;
      targets.push(el);
    }
    return targets;
  }

  private tryMovePrincipalArrow(direction: 1 | -1, popupOpen: boolean): boolean {
    if (popupOpen || this.keyboardZone !== 'general') return false;
    const targets = this.getPrincipalArrowTargets();
    if (!targets.length) return false;

    const active = document.activeElement as HTMLElement | null;
    const idx = active ? targets.indexOf(active) : -1;
    if (idx === -1) {
      targets[0].focus();
      return true;
    }

    const next = idx + direction;
    if (next < 0 || next >= targets.length) {
      return true;
    }
    targets[next].focus();
    return true;
  }

  private getImagenMosaicoArrowTargets(): HTMLElement[] {
    if (!this.isImagenPathForVoice()) return [];
    const host = document.querySelector<HTMLElement>('app-imagen app-mosaico');
    if (!host) return [];

    return Array.from(host.querySelectorAll<HTMLElement>('.item-mosaico')).filter(el => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      return rect.width > 0 && rect.height > 0;
    });
  }

  private tryMoveImagenMosaicoArrow(direction: 1 | -1, popupOpen: boolean): boolean {
    if (popupOpen || this.keyboardZone !== 'general') return false;
    const targets = this.getImagenMosaicoArrowTargets();
    if (!targets.length) return false;

    const active = document.activeElement as HTMLElement | null;
    const idx = active ? targets.indexOf(active) : -1;

    if (idx === -1) {
      const isNoUsefulFocus =
        !active || active === document.body || active === document.documentElement;
      if (isNoUsefulFocus && direction === 1) {
        targets[0].focus();
        return true;
      }
      return false;
    }

    const next = idx + direction;
    if (next < 0 || next >= targets.length) return false;
    targets[next].focus();
    return true;
  }

  private getVideoReproductoresArrowTargets(): HTMLElement[] {
    if (!this.isVideoPathForVoice()) return [];
    const host = document.querySelector<HTMLElement>('app-video app-reproductores');
    if (!host) return [];

    return Array.from(host.querySelectorAll<HTMLElement>('.win95-player')).filter(el => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      return rect.width > 0 && rect.height > 0;
    });
  }

  private tryMoveVideoReproductoresArrow(direction: 1 | -1, popupOpen: boolean): boolean {
    if (popupOpen || this.keyboardZone !== 'general') return false;
    const targets = this.getVideoReproductoresArrowTargets();
    if (!targets.length) return false;

    const active = document.activeElement as HTMLElement | null;
    const idx = active ? targets.indexOf(active) : -1;

    if (idx === -1) {
      const isNoUsefulFocus =
        !active || active === document.body || active === document.documentElement;
      if (isNoUsefulFocus && direction === 1) {
        targets[0].focus();
        return true;
      }
      return false;
    }

    const next = idx + direction;
    if (next < 0 || next >= targets.length) return false;
    targets[next].focus();
    return true;
  }

  private getAudiovisualComparacionArrowTargets(): HTMLElement[] {
    if (!this.isAudiovisualPathForVoice()) return [];
    const host = document.querySelector<HTMLElement>('app-audiovisual app-comparacion');
    if (!host) return [];

    const selectors = [
      '[data-mm-role="cmp-play"]',
      '[data-mm-role="cmp-pause"]',
      '[data-mm-role="cmp-duracion"]',
      '[data-mm-role="cmp-volumen"]',
      '[data-mm-role="cmp-mute"]',
      '[data-mm-role="cmp-filtro"]',
    ];

    const targets: HTMLElement[] = [];
    for (const sel of selectors) {
      const el = host.querySelector<HTMLElement>(sel);
      if (!el) continue;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (rect.width <= 0 || rect.height <= 0) continue;
      targets.push(el);
    }
    return targets;
  }

  private tryMoveAudiovisualComparacionArrow(direction: 1 | -1, popupOpen: boolean): boolean {
    if (popupOpen || this.keyboardZone !== 'general') return false;
    const targets = this.getAudiovisualComparacionArrowTargets();
    if (!targets.length) return false;

    const active = document.activeElement as HTMLElement | null;
    const idx = active ? targets.indexOf(active) : -1;

    if (idx === -1 && direction === 1) {
      const isNoUsefulFocus =
        !active || active === document.body || active === document.documentElement;
      if (!isNoUsefulFocus) return false;
      targets[0].focus();
      return true;
    }

    const next = idx + direction;
    if (next < 0 || next >= targets.length) return false;
    targets[next].focus();
    return true;
  }

  private getMusicaInstrumentosArrowTargets(): HTMLElement[] {
    if (!this.isMusicaPathForVoice()) return [];
    const host = document.querySelector<HTMLElement>('app-musica app-instrumentos');
    if (!host) return [];

    return Array.from(host.querySelectorAll<HTMLElement>('.selector-instrumentos .btn-ins')).filter(el => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      return rect.width > 0 && rect.height > 0;
    });
  }

  private tryMoveMusicaInstrumentosArrow(direction: 1 | -1, popupOpen: boolean): boolean {
    if (popupOpen || this.keyboardZone !== 'general') return false;
    const targets = this.getMusicaInstrumentosArrowTargets();
    if (!targets.length) return false;

    const active = document.activeElement as HTMLElement | null;
    const idx = active ? targets.indexOf(active) : -1;

    if (idx === -1 && direction === 1) {
      const isNoUsefulFocus =
        !active || active === document.body || active === document.documentElement;
      if (isNoUsefulFocus) {
        const pianoBtn =
          targets.find(el => el.getAttribute('data-ins-id') === 'piano') ?? targets[0];
        pianoBtn.focus();
        return true;
      }
      return false;
    }

    const next = idx + direction;
    if (next < 0 || next >= targets.length) return false;
    targets[next].focus();
    return true;
  }

  private getInteractividadHistoriaArrowTargets(): HTMLElement[] {
    if (!this.isInteractividadPathForVoice()) return [];
    const host = document.querySelector<HTMLElement>('app-interactividad app-historia-interactiva');
    if (!host) return [];

    const selectors = ['.contenedor .tarjeta', '.boton-pong-row .boton-pong'];
    const targets: HTMLElement[] = [];

    for (const sel of selectors) {
      const list = host.querySelectorAll<HTMLElement>(sel);
      for (const el of Array.from(list)) {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        if (rect.width <= 0 || rect.height <= 0) continue;
        targets.push(el);
      }
    }

    return targets;
  }

  private tryMoveInteractividadHistoriaArrow(direction: 1 | -1, popupOpen: boolean): boolean {
    if (popupOpen || this.keyboardZone !== 'general') return false;
    const targets = this.getInteractividadHistoriaArrowTargets();
    if (!targets.length) return false;

    const active = document.activeElement as HTMLElement | null;
    const idx = active ? targets.indexOf(active) : -1;

    if (idx === -1 && direction === 1) {
      const isNoUsefulFocus =
        !active || active === document.body || active === document.documentElement;
      if (!isNoUsefulFocus) return false;
      targets[0].focus();
      return true;
    }

    const next = idx + direction;
    if (next < 0 || next >= targets.length) return false;
    targets[next].focus();
    return true;
  }

  private isInViewport(el: HTMLElement): boolean {
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
  }

  private moveFocus(direction: 1 | -1) {
    const all = this.getFocusableElements();
    if (!all.length) return;

    const active = document.activeElement as HTMLElement | null;
    const focusables = all;
    const popupOpen = isAnyPopupOpen();

    if (!active || active === document.body || active === document.documentElement) {
      const juegoBtn = this.getPrincipalJuegoButton();
      if (juegoBtn) {
        juegoBtn.focus();
        return;
      }
      const nearest = this.nearestFocusableInView(focusables);
      const edgeFallback = direction === 1 ? focusables[0] : focusables[focusables.length - 1];
      this.focusWithFallback(nearest, edgeFallback);
      return;
    }

    if (!popupOpen && !this.isInViewport(active)) {
      const juegoBtn = this.getPrincipalJuegoButton();
      if (juegoBtn) {
        juegoBtn.focus();
        return;
      }
      const nearest = this.nearestFocusableInView(focusables);
      const edgeFallback = direction === 1 ? focusables[0] : focusables[focusables.length - 1];
      this.focusWithFallback(nearest, edgeFallback);
      return;
    }

    if (active) {
      const blocRoot = active.closest('app-bloc-notas') as HTMLElement | null;
      if (blocRoot) {
        const blocItems = focusables.filter(el => blocRoot.contains(el));
        const blocIndex = blocItems.indexOf(active);
        if (blocItems.length > 0 && blocIndex !== -1) {
          if (direction === 1 && blocIndex === blocItems.length - 1) {
            const nextOutsideBloc = focusables.find(el => {
              const relation = blocRoot.compareDocumentPosition(el);
              return !blocRoot.contains(el) && (relation & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
            });
            if (nextOutsideBloc) {
              nextOutsideBloc.focus();
              return;
            }
          }

          if (direction === -1 && blocIndex === 0) {
            const previousOutsideBloc = [...focusables].reverse().find(el => {
              const relation = blocRoot.compareDocumentPosition(el);
              return !blocRoot.contains(el) && (relation & Node.DOCUMENT_POSITION_PRECEDING) !== 0;
            });
            if (previousOutsideBloc) {
              previousOutsideBloc.focus();
              return;
            }
          }
        }
      }
    }

    const idx = active ? focusables.indexOf(active) : -1;

    if (popupOpen) {
      const base = idx === -1
        ? (direction === 1 ? 0 : focusables.length - 1)
        : idx + direction;
      const next = (base + focusables.length) % focusables.length;
      focusables[next].focus();
      return;
    }

    if (idx === -1) {
      const juegoBtn = this.getPrincipalJuegoButton();
      if (juegoBtn) {
        juegoBtn.focus();
        return;
      }
      const nearest = this.nearestFocusableInView(focusables);
      const edgeFallback = direction === 1 ? focusables[0] : focusables[focusables.length - 1];
      this.focusWithFallback(nearest, edgeFallback);
      return;
    }

    const next = idx + direction;

    if (next < 0 || next >= focusables.length) {
      return;
    }

    focusables[next].focus();
  }

  private getZoneItems(zone: 'nav' | 'accessibility' | 'lateral'): HTMLElement[] {
    let selector = '';
    if (zone === 'nav') {
      selector = 'app-header nav.menuWrap ul li';
    } else if (zone === 'accessibility') {
      selector = 'app-menu-accesibilidad .menu-wrap ul li';
    } else {
      selector = 'app-menu-lateral .menu-wrap img:not(.hidden)';
    }

    return Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter(el => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
  }

  private clearZoneHighlights() {
    Array.from(document.querySelectorAll<HTMLElement>('.keyboard-selected')).forEach(el => {
      el.classList.remove('keyboard-selected');
    });
  }

  private highlightZoneItem(zone: 'nav' | 'accessibility' | 'lateral') {
    const items = this.getZoneItems(zone);
    this.clearZoneHighlights();
    if (!items.length) return;
    const idx = ((this.zoneIndex % items.length) + items.length) % items.length;
    const el = items[idx];
    el.classList.add('keyboard-selected');
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  private enterZone(zone: 'nav' | 'accessibility' | 'lateral') {
    this.clearPendingLeftFocus();
    this.keyboardZone = zone;
    this.zoneIndex = 0;
    this.lastArrowKey = null;
    this.lastArrowAt = 0;
    this.lastArrowCount = 0;
    this.ui.setActiveMenu(zone);
    this.highlightZoneItem(zone);
  }

  private exitZone() {
    this.clearPendingLeftFocus();
    this.keyboardZone = 'general';
    this.zoneIndex = 0;
    this.ui.setActiveMenu(null);
    this.clearZoneHighlights();
    this.lastArrowKey = null;
    this.lastArrowAt = 0;
    this.lastArrowCount = 0;
  }

  private moveZoneSelection(delta: 1 | -1) {
    if (this.keyboardZone === 'general') return;
    const items = this.getZoneItems(this.keyboardZone);
    if (!items.length) return;
    this.zoneIndex = (this.zoneIndex + delta + items.length) % items.length;
    this.highlightZoneItem(this.keyboardZone);
  }

  private activateZoneItem() {
    if (this.keyboardZone === 'general') return;
    const items = this.getZoneItems(this.keyboardZone);
    if (!items.length) return;
    const idx = ((this.zoneIndex % items.length) + items.length) % items.length;
    items[idx].click();
  }

  private handleInstrumentosKeyboard(event: KeyboardEvent, target: HTMLElement): boolean {
    const root = target.closest('app-instrumentos');
    if (!root) return false;

    const playable = target.closest('.ins-playable') as HTMLElement | null;
    const btnIns = target.closest('.btn-ins') as HTMLElement | null;

    if (playable) {
      const playables = Array.from(root.querySelectorAll<HTMLElement>('.ins-playable')).filter(el => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      const idx = playables.indexOf(playable);

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        root.querySelector<HTMLElement>('.btn-ins.activo')?.focus();
        return true;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        if (idx > 0) playables[idx - 1].focus();
        return true;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        event.stopPropagation();
        if (idx >= 0 && idx < playables.length - 1) playables[idx + 1].focus();
        return true;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        playable.click();
        return true;
      }

      return false;
    }

    if (btnIns && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      const id = btnIns.getAttribute('data-ins-id');
      if (id) {
        root.dispatchEvent(
          new CustomEvent('instrumentos-enter-from-selector', {
            bubbles: true,
            composed: true,
            detail: { instrumentId: id },
          })
        );
      }
      return true;
    }

    return false;
  }

  private handleMesaMezclasKeyboard(event: KeyboardEvent, target: HTMLElement): boolean {
    const root = target.closest('app-mesa-mezclas') as HTMLElement | null;
    if (!root) return false;

    const role = target.getAttribute('data-mm-role');
    if (!role) return false;

    const isRange = this.isRangeElement(target);

    if (role === 'root' && event.key === 'Enter') {
      const firstControl = root.querySelector<HTMLElement>('[data-mm-role="deck-play"][data-mm-deck="0"]')
        ?? root.querySelector<HTMLElement>('[data-mm-role]:not([data-mm-role="root"])');
      if (!firstControl) return false;
      event.preventDefault();
      event.stopPropagation();
      this.setMesaKeyboardEntered(true);
      firstControl.focus();
      return true;
    }

    if (role !== 'root' && (event.key === ' ' || event.key === 'Spacebar')) {
      const mesaRoot = root.querySelector<HTMLElement>('[data-mm-role="root"]');
      if (!mesaRoot) return false;
      event.preventDefault();
      event.stopPropagation();
      this.setMesaKeyboardEntered(false);
      mesaRoot.focus();
      return true;
    }

    if (isRange && this.editingSlider === target) return false;

    if (event.key === 'Enter' || event.key === ' ') return false;

    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'ArrowUp' &&
      event.key !== 'ArrowDown'
    ) {
      return false;
    }

    const handled = this.routeMesaArrow(root, target, role, event.key);
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
    return handled;
  }

  private mmFocus(root: HTMLElement, selector: string): boolean {
    const el = root.querySelector(selector) as HTMLElement | null;
    if (!el) return false;
    el.focus();
    return true;
  }

  private routeMesaArrow(
    root: HTMLElement,
    target: HTMLElement,
    role: string,
    key: string
  ): boolean {
    const num = (attr: string) => Number(target.getAttribute(attr));

    if (role === 'deck-play') {
      const deck = num('data-mm-deck');
      if (key === 'ArrowDown') return this.mmFocus(root, `[data-mm-role="deck-tune"][data-mm-deck="${deck}"]`);
      if (key === 'ArrowUp') return true;
      if (key === 'ArrowLeft') {
        if (deck > 0) return this.mmFocus(root, `[data-mm-role="deck-play"][data-mm-deck="${deck - 1}"]`);
        return true;
      }
      if (key === 'ArrowRight') {
        if (deck < 2) return this.mmFocus(root, `[data-mm-role="deck-play"][data-mm-deck="${deck + 1}"]`);
        return this.mmFocus(root, `[data-mm-role="track-vol"][data-mm-track="0"]`);
      }
    }

    if (role === 'deck-tune') {
      const deck = num('data-mm-deck');
      if (key === 'ArrowUp') return this.mmFocus(root, `[data-mm-role="deck-play"][data-mm-deck="${deck}"]`);
      if (key === 'ArrowDown') return this.mmFocus(root, `[data-mm-role="deck-wave"][data-mm-deck="${deck}"][data-mm-wave="0"]`);
      if (key === 'ArrowLeft') {
        if (deck > 0) return this.mmFocus(root, `[data-mm-role="deck-tune"][data-mm-deck="${deck - 1}"]`);
        return true;
      }
      if (key === 'ArrowRight') {
        if (deck < 2) return this.mmFocus(root, `[data-mm-role="deck-tune"][data-mm-deck="${deck + 1}"]`);
        return true;
      }
    }

    if (role === 'deck-wave') {
      const deck = num('data-mm-deck');
      const wave = num('data-mm-wave');
      if (key === 'ArrowUp') return this.mmFocus(root, `[data-mm-role="deck-tune"][data-mm-deck="${deck}"]`);
      if (key === 'ArrowDown') return this.mmFocus(root, `[data-mm-role="track-vol"][data-mm-track="${deck}"]`);
      if (key === 'ArrowLeft') {
        if (wave > 0) return this.mmFocus(root, `[data-mm-role="deck-wave"][data-mm-deck="${deck}"][data-mm-wave="${wave - 1}"]`);
        return true;
      }
      if (key === 'ArrowRight') {
        if (wave < 3) return this.mmFocus(root, `[data-mm-role="deck-wave"][data-mm-deck="${deck}"][data-mm-wave="${wave + 1}"]`);
        return true;
      }
    }

    if (role === 'track-vol') {
      const track = num('data-mm-track');
      if (key === 'ArrowUp') {
        return this.mmFocus(root, `[data-mm-role="deck-wave"][data-mm-deck="${track}"][data-mm-wave="0"]`);
      }
      if (key === 'ArrowDown') {
        return this.mmFocus(root, `[data-mm-role="track-eq"][data-mm-track="${track}"][data-mm-band="bass"]`);
      }
      if (key === 'ArrowLeft') {
        if (track > 0) return this.mmFocus(root, `[data-mm-role="track-vol"][data-mm-track="${track - 1}"]`);
        return true;
      }
      if (key === 'ArrowRight') {
        if (track < 2) return this.mmFocus(root, `[data-mm-role="track-vol"][data-mm-track="${track + 1}"]`);
        return this.mmFocus(root, `[data-mm-role="master-vol"]`);
      }
    }

    if (role === 'track-eq') {
      const track = num('data-mm-track');
      const band = target.getAttribute('data-mm-band') ?? 'bass';
      const order = ['bass', 'mid', 'treble'];
      const idx = order.indexOf(band);
      if (key === 'ArrowUp') {
        return this.mmFocus(root, `[data-mm-role="track-vol"][data-mm-track="${track}"]`);
      }
      if (key === 'ArrowDown') return true;
      if (key === 'ArrowLeft') {
        if (idx > 0) return this.mmFocus(root, `[data-mm-role="track-eq"][data-mm-track="${track}"][data-mm-band="${order[idx - 1]}"]`);
        return true;
      }
      if (key === 'ArrowRight') {
        if (idx < order.length - 1) return this.mmFocus(root, `[data-mm-role="track-eq"][data-mm-track="${track}"][data-mm-band="${order[idx + 1]}"]`);
        return true;
      }
    }

    if (role === 'master-vol') {
      if (key === 'ArrowLeft') return this.mmFocus(root, `[data-mm-role="track-vol"][data-mm-track="2"]`);
      if (key === 'ArrowRight') return this.mmFocus(root, `[data-mm-role="effect-pad"][data-mm-pad="0"]`);
      if (key === 'ArrowUp' || key === 'ArrowDown') return true;
    }

    if (role === 'effect-pad') {
      const pad = num('data-mm-pad');
      const cols = 4;
      const rows = 2;
      const row = Math.floor(pad / cols);
      const col = pad % cols;
      if (key === 'ArrowLeft') {
        if (col > 0) return this.mmFocus(root, `[data-mm-role="effect-pad"][data-mm-pad="${pad - 1}"]`);
        return this.mmFocus(root, `[data-mm-role="master-vol"]`);
      }
      if (key === 'ArrowRight') {
        if (col < cols - 1) return this.mmFocus(root, `[data-mm-role="effect-pad"][data-mm-pad="${pad + 1}"]`);
        return this.mmFocus(root, `[data-mm-role="record"]`);
      }
      if (key === 'ArrowUp') {
        if (row > 0) return this.mmFocus(root, `[data-mm-role="effect-pad"][data-mm-pad="${pad - cols}"]`);
        return true;
      }
      if (key === 'ArrowDown') {
        if (row < rows - 1) return this.mmFocus(root, `[data-mm-role="effect-pad"][data-mm-pad="${pad + cols}"]`);
        return true;
      }
    }

    if (role === 'record') {
      if (key === 'ArrowLeft') return this.mmFocus(root, `[data-mm-role="effect-pad"][data-mm-pad="7"]`);
      if (key === 'ArrowRight') {
        if (this.mmFocus(root, `[data-mm-role="download"]`)) return true;
        this.moveFocus(1);
        return true;
      }
      if (key === 'ArrowUp' || key === 'ArrowDown') return true;
    }

    if (role === 'download') {
      if (key === 'ArrowLeft') return this.mmFocus(root, `[data-mm-role="record"]`);
      if (key === 'ArrowRight') {
        this.moveFocus(1);
        return true;
      }
      if (key === 'ArrowUp' || key === 'ArrowDown') return true;
    }

    return false;
  }

  private handleCollageKeyboard(event: KeyboardEvent, target: HTMLElement): boolean {
    const root = target.closest('app-collage-interactivo') as HTMLElement | null;
    if (!root) return false;

    const cell = target.closest('[data-cl-role="cell"]') as HTMLElement | null;
    if (!cell) return false;

    const key = event.key;
    if (
      key !== 'ArrowLeft' &&
      key !== 'ArrowRight' &&
      key !== 'ArrowUp' &&
      key !== 'ArrowDown'
    ) {
      return false;
    }

    const cols = ['videos', 'audios', 'textos', 'gifs'];
    const col = cell.getAttribute('data-cl-col') ?? '';
    const idx = Number(cell.getAttribute('data-cl-index'));
    const colIdx = cols.indexOf(col);
    if (colIdx < 0 || Number.isNaN(idx)) return false;

    const cellsIn = (c: string) =>
      Array.from(
        root.querySelectorAll<HTMLElement>(`[data-cl-role="cell"][data-cl-col="${c}"]`)
      );

    const focusInColumn = (c: string, wantedIdx: number): boolean => {
      const list = cellsIn(c);
      if (!list.length) return false;
      const clamped = Math.max(0, Math.min(list.length - 1, wantedIdx));
      list[clamped].focus();
      return true;
    };

    if (key === 'ArrowUp' || key === 'ArrowDown') {
      const list = cellsIn(col);
      const next = idx + (key === 'ArrowDown' ? 1 : -1);
      if (next < 0 || next >= list.length) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
      list[next].focus();
      event.preventDefault();
      event.stopPropagation();
      return true;
    }

    if (key === 'ArrowLeft') {
      if (colIdx > 0) {
        focusInColumn(cols[colIdx - 1], idx);
      }
      event.preventDefault();
      event.stopPropagation();
      return true;
    }

    if (colIdx < cols.length - 1) {
      focusInColumn(cols[colIdx + 1], idx);
    } else {
      this.moveFocus(1);
    }
    event.preventDefault();
    event.stopPropagation();
    return true;
  }

  private handleEvolucionInterfacesKeyboard(event: KeyboardEvent, target: HTMLElement): boolean {
    const root = target.closest('app-evolucion-interfaces') as HTMLElement | null;
    if (!root) return false;

    const epocaBtn = target.closest('.epoca-btn') as HTMLElement | null;
    const isCanvasArea = target.classList.contains('canvas-container');

    if (epocaBtn) {
      const allBtns = Array.from(root.querySelectorAll<HTMLElement>('.epoca-btn'));
      const isLast = allBtns.length > 0 && epocaBtn === allBtns[allBtns.length - 1];

      if (isLast && event.key === 'ArrowRight') {
        const firstMultimediaFocusable = document.querySelector<HTMLElement>(
          'app-multimedia button:not([disabled]), app-multimedia [tabindex]:not([tabindex="-1"])'
        );
        if (firstMultimediaFocusable) {
          event.preventDefault();
          event.stopPropagation();
          firstMultimediaFocusable.focus();
          return true;
        }
      }

      if (event.key === 'Enter') {
        const container = root.querySelector<HTMLElement>('.canvas-container');
        if (!container) return false;
        event.preventDefault();
        event.stopPropagation();
        container.focus();
        return true;
      }
    }

    if (isCanvasArea) {
      if (
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'Spacebar' ||
        event.key === 'Escape'
      ) {
        event.preventDefault();
        return true;
      }
    }

    return false;
  }

  private handleMultimediaKeyboard(event: KeyboardEvent, target: HTMLElement): boolean {
    const root = target.closest('app-multimedia') as HTMLElement | null;
    if (!root) return false;

    const roleEl = target.closest('[data-mu-role]') as HTMLElement | null;
    const role = roleEl?.getAttribute('data-mu-role') ?? null;
    if (!role || !roleEl) return false;

    const key = event.key;
    const focusMultimediaRoot = (): boolean => {
      const rootEl = root.querySelector<HTMLElement>('[data-mu-role="root"]');
      if (!rootEl) return false;
      event.preventDefault();
      event.stopPropagation();
      this.setMultimediaKeyboardEntered(false);
      rootEl.focus();
      return true;
    };
    const focusActiveTab = (): boolean => {
      const tabs = Array.from(root.querySelectorAll<HTMLElement>('[data-mu-role="tab"]'));
      const activeTab = tabs.find(t => t.classList.contains('active')) ?? tabs[0];
      if (activeTab) {
        event.preventDefault();
        event.stopPropagation();
        activeTab.focus();
        return true;
      }
      return false;
    };

    if (role === 'root' && roleEl === target && key === 'Enter') {
      const firstControl =
        root.querySelector<HTMLElement>('[data-mu-role="tab"].active') ??
        root.querySelector<HTMLElement>('[data-mu-role="tab"], [data-mu-role="tool"], [data-mu-role="audio"], [data-mu-role="data"]');
      if (!firstControl) return false;
      event.preventDefault();
      event.stopPropagation();
      this.setMultimediaKeyboardEntered(true);
      firstControl.focus();
      return true;
    }

    if (role !== 'root' && roleEl === target && (key === ' ' || key === 'Spacebar')) {
      return focusMultimediaRoot();
    }

    if (role === 'tab') {
      if (key === 'ArrowDown') {
        event.preventDefault();
        event.stopPropagation();
        if (!roleEl.classList.contains('active')) {
          roleEl.click();
        }
        setTimeout(() => {
          const panel = root.querySelector<HTMLElement>('.tab-panel');
          const first = panel?.querySelector<HTMLElement>(
            '[data-mu-role="tool"], [data-mu-role="audio"], [data-mu-role="data"]'
          );
          first?.focus();
        }, 80);
        return true;
      }
      return false;
    }

    if ((role === 'tool' || role === 'audio' || role === 'data') && key === 'ArrowUp') {
      return focusActiveTab();
    }

    if (role === 'tool') {
      if (key === 'ArrowDown') {
        const wrap = root.querySelector<HTMLElement>('[data-mu-role="canvas-wrap"]');
        if (wrap) {
          event.preventDefault();
          event.stopPropagation();
          wrap.focus();
          return true;
        }
      }
      return false;
    }

    if (role === 'canvas-wrap') {
      if (
        key === 'ArrowUp' || key === 'ArrowDown' ||
        key === 'ArrowLeft' || key === 'ArrowRight' ||
        key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 'Escape'
      ) {
        event.preventDefault();
        return true;
      }
      return false;
    }

    return false;
  }

  private onGlobalKeydown = (event: KeyboardEvent) => {
    if (!this.keyboardNav.enabled()) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const target = event.target as HTMLElement | null;
    if (this.mesaKeyboardEntered && !target?.closest('app-mesa-mezclas')) {
      this.setMesaKeyboardEntered(false);
    }
    if (this.multimediaKeyboardEntered && !target?.closest('app-multimedia')) {
      this.setMultimediaKeyboardEntered(false);
    }
    const inVideoInmersivo = !!target?.closest('app-video-inmersivo');
    const isTextareaTarget = target?.tagName === 'TEXTAREA';
    const inBlocNotas = !!target?.closest('app-bloc-notas');

    if (inVideoInmersivo && event.key === 'Enter') {
      return;
    }

    if (target && this.handleInstrumentosKeyboard(event, target)) {
      return;
    }

    if (target && this.handleMesaMezclasKeyboard(event, target)) {
      return;
    }

    if (target && this.handleCollageKeyboard(event, target)) {
      return;
    }

    if (target && this.handleEvolucionInterfacesKeyboard(event, target)) {
      return;
    }

    if (target && this.handleMultimediaKeyboard(event, target)) {
      return;
    }

    if (isJuegoPopupOpen()) {
      if (
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'Spacebar'
      ) {
        return;
      }
    }

    if (isCarruselPopupOpen()) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        event.stopPropagation();
        if (!this.moveCarruselPopupFocus(-1)) {
          this.moveFocus(-1);
        }
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        event.stopPropagation();
        if (!this.moveCarruselPopupFocus(1)) {
          this.moveFocus(1);
        }
        return;
      }
    }

    if (document.querySelector('app-historia-interactiva app-popup')) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        return;
      }
    }

    if (isTextareaTarget && inBlocNotas) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.moveFocus(1);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.moveFocus(-1);
        return;
      }
    }

    if (!isTextareaTarget && inBlocNotas) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        this.moveFocus(1);
        return;
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        this.moveFocus(-1);
        return;
      }
    }

    if (this.editingSlider && this.editingSlider !== document.activeElement) {
      this.setSliderEditing(null);
    }

    if (this.isRangeElement(target)) {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        if (this.editingSlider === target) {
          this.setSliderEditing(null);
        } else {
          this.setSliderEditing(target);
        }
        return;
      }

      if (this.editingSlider === target) {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          this.setSliderEditing(null);
          return;
        }
        if (
          event.key === 'ArrowRight' ||
          event.key === 'ArrowUp' ||
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowDown'
        ) {
          event.preventDefault();
          event.stopPropagation();
          const direction = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : -1;
          this.adjustRangeByKeyboard(target, direction);
          return;
        }
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.moveFocus(-1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.moveFocus(1);
        return;
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        this.scrollFromRangeArrow(direction);
        return;
      }

      return;
    }

    if (this.isTypingTarget(event.target)) return;

    const popupOpen = isAnyPopupOpen();

    if (event.key === 'Escape') {
      this.clearPendingLeftFocus();
      if (popupOpen) {
        return;
      }
      event.preventDefault();
      this.exitZone();
      return;
    }

    if (popupOpen) {
      this.keyboardZone = 'general';
    }

    if (!popupOpen && this.keyboardZone !== 'general') {
      if (this.keyboardZone === 'nav' || this.keyboardZone === 'accessibility') {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          this.moveZoneSelection(-1);
          return;
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          this.moveZoneSelection(1);
          return;
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault();
          this.exitZone();
          return;
        }
      }

      if (this.keyboardZone === 'lateral') {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          this.moveZoneSelection(-1);
          return;
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          this.moveZoneSelection(1);
          return;
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          this.exitZone();
          return;
        }
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        this.activateZoneItem();
        return;
      }
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const now = Date.now();
      if (this.lastArrowKey === event.key && now - this.lastArrowAt < this.menuComboWindowMs) {
        this.lastArrowCount += 1;
      } else {
        this.lastArrowCount = 1;
      }
      this.lastArrowKey = event.key;
      this.lastArrowAt = now;
      if (event.key !== 'ArrowLeft') {
        this.clearPendingLeftFocus();
      }
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.clearPendingLeftFocus();
      if (this.tryMoveInteractividadHistoriaArrow(-1, popupOpen)) {
        return;
      }
      if (this.tryMoveAudiovisualComparacionArrow(-1, popupOpen)) {
        return;
      }
      if (this.tryMoveMusicaInstrumentosArrow(-1, popupOpen)) {
        return;
      }
      if (this.tryMoveVideoReproductoresArrow(-1, popupOpen)) {
        return;
      }
      if (this.tryMoveImagenMosaicoArrow(-1, popupOpen)) {
        return;
      }
      if (this.tryMovePrincipalArrow(-1, popupOpen)) {
        return;
      }
      this.moveFocus(-1);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.clearPendingLeftFocus();
      if (this.tryMoveInteractividadHistoriaArrow(1, popupOpen)) {
        return;
      }
      if (this.tryMoveAudiovisualComparacionArrow(1, popupOpen)) {
        return;
      }
      if (this.tryMoveMusicaInstrumentosArrow(1, popupOpen)) {
        return;
      }
      if (this.tryMoveVideoReproductoresArrow(1, popupOpen)) {
        return;
      }
      if (this.tryMoveImagenMosaicoArrow(1, popupOpen)) {
        return;
      }
      if (this.tryMovePrincipalArrow(1, popupOpen)) {
        return;
      }
      const juegoBtn = this.getPrincipalJuegoButton();
      if (juegoBtn && this.shouldPrimeHomeJuegoOnArrowRight(popupOpen)) {
        juegoBtn.focus();
        return;
      }
      this.moveFocus(1);
      return;
    }

    if (event.key === 'Enter') {
      this.clearPendingLeftFocus();
      const recentArrow = Date.now() - this.lastArrowAt < this.menuComboWindowMs ? this.lastArrowKey : null;
      const hasDoubleArrow = !!recentArrow && this.lastArrowCount >= 2;
      if (!popupOpen) {
        if (hasDoubleArrow && recentArrow === 'ArrowUp') {
          event.preventDefault();
          event.stopPropagation();
          this.enterZone('nav');
          return;
        }
        if (hasDoubleArrow && recentArrow === 'ArrowDown') {
          event.preventDefault();
          event.stopPropagation();
          this.enterZone('accessibility');
          return;
        }
        if (hasDoubleArrow && recentArrow === 'ArrowLeft') {
          event.preventDefault();
          event.stopPropagation();
          this.enterZone('lateral');
          return;
        }
      }

      const active = document.activeElement as HTMLElement | null;
      if (!active) return;
      if (active.closest('app-multimedia [data-mu-role="audio"][data-mu-note-idx]')) {
        return;
      }
      if (this.isActivableElement(active)) {
        event.preventDefault();
        active.click();
      }
      return;
    }

    if (event.key === ' ') {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return;
      if (this.isActivableElement(active)) {
        event.preventDefault();
        active.click();
      }
      return;
    }
  };
}
