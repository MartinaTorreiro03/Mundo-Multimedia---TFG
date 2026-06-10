// Implementacion del modulo.
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, effect, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { ColorService } from '../../../services/color.service';
import { PopupThemeService } from '../../../services/popup-theme';
import { applyPopupCssVars, juegoThemeForMode } from '../../../services/popup-theme-vars';
import { NgFor, NgIf } from '@angular/common';
import { SpeakableDirective } from '../../../directives/app-speakable';
import { KeyboardNavService } from '../../../services/keyboard-nav.service';
import { VoiceNavigationService, VOICE_JUEGO_ACTION_EVENT } from '../../../services/voice-navigation.service';
import { JuegoVoiceBridgeService } from '../../../services/juego-voice-bridge.service';
import type { JuegoVoiceDetail } from '../../../utils/juego-voice';

type Tipo = 'lineal' | 'hipermedia' | 'interactiva';
type FocusKind = 'popupClose' | 'poolDevice' | 'categoryDevice' | 'poolZone' | 'category' | 'comprobar' | 'resultOk' | 'resultClose';

interface Dispositivo {
  id: string;
  tipo: Tipo;
  img: string;
  alt: string;
  label: string;
}

interface Categoria {
  id: Tipo;
  titulo: string;
  dispositivos: Dispositivo[];
  dragOver: boolean;
}

interface FocusTarget {
  kind: FocusKind;
  id?: string;
}

import { JUEGO_FOCUS_FIRST_EVENT, JUEGO_RESET_EVENT } from './juego-focus.events';

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [NgFor, NgIf, SpeakableDirective],
  templateUrl: './juego.html',
  styleUrl: './juego.scss',
})
export class Juego implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameContainer') gameContainerRef!: ElementRef<HTMLDivElement>;
  private readonly keyboardNav = inject(KeyboardNavService);
  readonly voiceNav = inject(VoiceNavigationService);
  private readonly juegoVoiceBridge = inject(JuegoVoiceBridgeService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly colorService = inject(ColorService);
  private readonly popupThemes = inject(PopupThemeService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  constructor() {
    effect(() => {
      this.colorService.colorActivo();
      this.syncJuegoPopupTheme();
    });
  }

  private syncJuegoPopupTheme(): void {
    const theme = juegoThemeForMode(
      this.colorService.colorActivo(),
      this.popupThemes.daltonismo1,
      this.popupThemes.daltonismo2
    );
    applyPopupCssVars(this.hostEl.nativeElement, theme);
    const popupHost = this.getPopupHost();
    if (popupHost) {
      applyPopupCssVars(popupHost, theme);
    }
  }

  private readonly initialDispositivos: Dispositivo[] = [
    { id: 'cd',  tipo: 'lineal',      img: 'assets/imagenes/principal/cdRom.jpg', alt: 'CD-ROM', label: 'CD-ROM enciclopédico' },
    { id: 'vhs', tipo: 'lineal',      img: 'assets/imagenes/principal/vhs.jpg',   alt: 'VHS',   label: 'Reproductor VHS' },
    { id: 'web', tipo: 'hipermedia',  img: 'assets/imagenes/principal/webLego90.jpg', alt: 'Web años 90', label: 'Web de los años 90' },
    { id: 'pre', tipo: 'hipermedia',  img: 'assets/imagenes/principal/presentacionInteractiva.jpg', alt: 'Presentación interactiva', label: 'Presentación con hipervínculos' },
    { id: 'vid', tipo: 'interactiva', img: 'assets/imagenes/principal/videojuego.jpg', alt: 'Videojuego', label: 'Videojuego educativo' },
    { id: 'vr',  tipo: 'interactiva', img: 'assets/imagenes/principal/rv.jpg', alt: 'Realidad virtual', label: 'Simulador VR' },
  ];
  dispositivos: Dispositivo[] = [];

  private readonly initialCategorias: Categoria[] = [
    { id: 'lineal',      titulo: 'Multimedia lineal',        dispositivos: [], dragOver: false },
    { id: 'hipermedia',  titulo: 'Hipermedia',               dispositivos: [], dragOver: false },
    { id: 'interactiva', titulo: 'Hipermedia interactiva',   dispositivos: [], dragOver: false },
  ];
  categorias: Categoria[] = [];

  resultado = '';
  victoria = false;
  private draggedId: string | null = null;

  activeTarget: FocusTarget = { kind: 'poolDevice' };
  private focusOrder: FocusTarget[] = [];
  selectedDeviceId: string | null = null;

  readonly MAX_POR_CATEGORIA = 2;

  toast = '';
  private toastTimer: any = null;

  resultVisible = false;
  resultKind: 'fail' | 'near' | 'win' = 'fail';
  resultTitle = '';
  resultSubtitle = '';
  aciertos = 0;
  total = 0;

  ngOnInit(): void {
    this.resetGameState();
  }

  private readonly onFocusFirstRequest = () => {
    requestAnimationFrame(() => this.focusFirstPoolDevice());
  };

  private readonly onResetRequest = () => {
    this.resetGameState();
  };

  ngAfterViewInit(): void {
    this.syncJuegoPopupTheme();
    this.juegoVoiceBridge.connect(this.handleJuegoVoice);
    window.addEventListener(JUEGO_FOCUS_FIRST_EVENT, this.onFocusFirstRequest);
    window.addEventListener(JUEGO_RESET_EVENT, this.onResetRequest);
    window.addEventListener(VOICE_JUEGO_ACTION_EVENT, this.onJuegoVoiceEvent);
    requestAnimationFrame(() => this.focusFirstPoolDevice());
  }

  focusFirstPoolDevice(): void {
    const first = this.dispositivos[0];
    if (!first) return;
    this.activeTarget = { kind: 'poolDevice', id: first.id };
    this.ensureValidFocus();
    const tile = this.getPoolDeviceElement(first.id);
    tile?.focus({ preventScroll: true });
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(ev: KeyboardEvent): void {
    const key = ev.key;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(key)) {
      return;
    }

    const popupHost = this.getPopupHost();
    if (!popupHost) return;
    const target = ev.target as Node | null;
    const insideTarget = !!target && popupHost.contains(target);
    const insideFocus = popupHost.contains(document.activeElement as Node | null);
    if (!insideTarget && !insideFocus) return;

    this.onGameKeydown(ev);
  }

  private showToast(msg: string): void {
    this.toast = msg;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toast = ''), 1200);
  }

  onDragStart(id: string): void {
    this.draggedId = id;
  }

  onDragEnd(): void {
    this.draggedId = null;
    this.categorias.forEach(c => (c.dragOver = false));
  }

  onGameKeydown(ev: KeyboardEvent): void {
    const key = ev.key;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(key)) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    if (key === 'Enter' || key === ' ') {
      this.handlePrimaryAction();
      return;
    }

    this.moveFocusByArrow(key);
  }

  onDragOverCategoria(cat: Categoria, ev: DragEvent): void {
    if (cat.dispositivos.length >= this.MAX_POR_CATEGORIA) {
      cat.dragOver = false;
      return;
    }
    ev.preventDefault();
    cat.dragOver = true;
  }

  onDragLeaveCategoria(cat: Categoria): void {
    cat.dragOver = false;
  }

  dropOnCategoria(cat: Categoria, ev: DragEvent): void {
    ev.preventDefault();
    cat.dragOver = false;
    if (!this.draggedId) return;

    if (cat.dispositivos.length >= this.MAX_POR_CATEGORIA) {
      this.showToast('Máximo 2 dispositivos por categoría');
      this.draggedId = null;
      return;
    }

    const disp = this.takeDeviceFromAnywhere(this.draggedId);
    if (!disp) return;

    cat.dispositivos.push(disp);
    this.draggedId = null;
    this.ensureValidFocus();
  }

  onDragOverPool(ev: DragEvent): void {
    ev.preventDefault();
  }

  dropOnPool(ev: DragEvent): void {
    ev.preventDefault();
    if (!this.draggedId) return;

    const disp = this.takeDeviceFromAnywhere(this.draggedId);
    if (!disp) return;

    this.dispositivos.push(disp);
    this.draggedId = null;
    this.ensureValidFocus();
  }

  comprobar(): void {
    let aciertos = 0;
    const total = this.totalDispositivos();

    this.categorias.forEach(cat => {
      cat.dispositivos.forEach(d => {
        if (d.tipo === cat.id) aciertos++;
      });
    });

    this.aciertos = aciertos;
    this.total = total;

    if (aciertos === total) {
      this.resultKind = 'win';
      this.resultTitle = `¡Perfecto!`;
      this.resultSubtitle = '¡Victoria total!';
    } else if (aciertos >= total - 1) {
      this.resultKind = 'near';
      this.resultTitle = `¡Casi!`;
      this.resultSubtitle = 'Te falta poquísimo';
    } else if (aciertos >= Math.ceil(total / 2)) {
      this.resultKind = 'near';
      this.resultTitle = `¡Vas muy bien!`;
      this.resultSubtitle = 'Sigue así, lo tienes cerca!';
    } else {
      this.resultKind = 'fail';
      this.resultTitle = `¡Inténtalo de nuevo!`;
      this.resultSubtitle = '¡Buen inicio! Prueba a recolocar alguna ficha';
    }

    this.resultVisible = false;
    queueMicrotask(() => {
      this.resultVisible = true;
      this.ensureValidFocus();
    });
  }

  isFocusTarget(kind: FocusKind, id?: string): boolean {
    return this.keyboardNav.enabled() && this.activeTarget.kind === kind && this.activeTarget.id === id;
  }

  private handlePrimaryAction(): void {
    this.ensureValidFocus();
    const target = this.activeTarget;

    if (target.kind === 'popupClose') return this.getPopupCloseButton()?.click();
    if (target.kind === 'resultClose') return this.getResultCloseButton()?.click();
    if (target.kind === 'resultOk') return this.getResultOkButton()?.click();

    if ((target.kind === 'poolDevice' || target.kind === 'categoryDevice') && target.id) {
      this.togglePickDevice(target.id);
      return;
    }
    if (target.kind === 'poolZone') {
      this.dropSelectedToPool();
      return;
    }
    if (target.kind === 'category' && target.id) {
      this.dropSelectedToCategory(target.id as Tipo);
      return;
    }
    if (target.kind === 'comprobar') this.comprobar();
  }

  private moveFocusByArrow(key: string): void {
    this.ensureValidFocus();
    if (!this.focusOrder.length) return;

    if (this.selectedDeviceId && this.moveDropTargetByArrow(key)) {
      this.syncDomFocusForButtons();
      return;
    }

    if (key !== 'ArrowLeft' && key !== 'ArrowRight') {
      return;
    }

    const currentIdx = this.findActiveTargetIndex();
    if (currentIdx === -1) return;
    const delta = key === 'ArrowLeft' ? -1 : 1;
    const nextIdx = (currentIdx + delta + this.focusOrder.length) % this.focusOrder.length;
    this.activeTarget = this.focusOrder[nextIdx];
    this.syncDomFocusForButtons();
  }

  private moveDropTargetByArrow(key: string): boolean {
    const dropTargets: FocusTarget[] = [
      { kind: 'category', id: 'lineal' },
      { kind: 'category', id: 'hipermedia' },
      { kind: 'category', id: 'interactiva' },
      { kind: 'poolZone' },
    ];

    const delta =
      key === 'ArrowLeft' || key === 'ArrowUp'
        ? -1
        : key === 'ArrowRight' || key === 'ArrowDown'
          ? 1
          : 0;
    if (delta === 0) return true;

    const currentIdx = dropTargets.findIndex(t => this.sameTarget(t, this.activeTarget));
    const baseIdx = currentIdx === -1 ? 0 : currentIdx;
    const nextIdx = (baseIdx + delta + dropTargets.length) % dropTargets.length;
    this.activeTarget = dropTargets[nextIdx];
    return true;
  }

  private movePoolGridFocus(key: string, currentId: string): boolean {
    const idx = this.dispositivos.findIndex(d => d.id === currentId);
    if (idx < 0) return false;

    const cols = 2;
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const totalRows = Math.ceil(this.dispositivos.length / cols);

    let nextRow = row;
    let nextCol = col;

    if (key === 'ArrowLeft') nextCol = col - 1;
    if (key === 'ArrowRight') nextCol = col + 1;
    if (key === 'ArrowUp') nextRow = row - 1;
    if (key === 'ArrowDown') nextRow = row + 1;

    if (nextCol < 0 || nextCol >= cols || nextRow < 0 || nextRow >= totalRows) {
      return true;
    }

    const nextIdx = nextRow * cols + nextCol;
    if (nextIdx < 0 || nextIdx >= this.dispositivos.length) {
      return true;
    }

    this.activeTarget = { kind: 'poolDevice', id: this.dispositivos[nextIdx].id };
    return true;
  }

  private togglePickDevice(id: string): void {
    if (!this.deviceExistsAnywhere(id)) {
      this.clearKeyboardSelection();
      return;
    }

    if (this.selectedDeviceId === id) {
      return;
    }

    this.selectedDeviceId = id;
    this.onDragStart(id);
    if (this.dispositivos.some(d => d.id === id)) {
      this.activeTarget = { kind: 'poolDevice', id };
      return;
    }
    this.activeTarget = { kind: 'categoryDevice', id };
  }

  private dropSelectedToCategory(catId: Tipo): void {
    if (!this.selectedDeviceId) return;
    const cat = this.categorias.find(c => c.id === catId);
    if (!cat) return;
    if (cat.dispositivos.length >= this.MAX_POR_CATEGORIA) {
      this.showToast('Máximo 2 dispositivos por categoría');
      return;
    }

    const disp = this.takeDeviceFromAnywhere(this.selectedDeviceId);
    if (!disp) return this.clearKeyboardSelection();

    cat.dispositivos.push(disp);
    this.clearKeyboardSelection();
    this.activeTarget = { kind: 'categoryDevice', id: disp.id };
    this.ensureValidFocus();
  }

  private dropSelectedToPool(): void {
    if (!this.selectedDeviceId) return;
    const disp = this.takeDeviceFromAnywhere(this.selectedDeviceId);
    if (!disp) return this.clearKeyboardSelection();

    this.dispositivos.push(disp);
    this.clearKeyboardSelection();
    this.activeTarget = { kind: 'poolDevice', id: disp.id };
    this.ensureValidFocus();
  }

  private buildFocusOrder(): FocusTarget[] {
    if (this.resultVisible) {
      return [{ kind: 'resultClose' }, { kind: 'resultOk' }, { kind: 'popupClose' }];
    }

    const order: FocusTarget[] = [];
    order.push({ kind: 'popupClose' });
    this.categorias.forEach(c => order.push({ kind: 'category', id: c.id }));
    order.push({ kind: 'poolZone' });
    this.dispositivos.forEach(d => order.push({ kind: 'poolDevice', id: d.id }));
    this.categorias.forEach(c => c.dispositivos.forEach(d => order.push({ kind: 'categoryDevice', id: d.id })));
    order.push({ kind: 'comprobar' });
    return order;
  }

  private ensureValidFocus(): void {
    this.focusOrder = this.buildFocusOrder();
    if (!this.focusOrder.length) return;

    const exists = this.focusOrder.some(t => this.sameTarget(t, this.activeTarget));
    if (!exists) {
      const preferred =
        this.focusOrder.find(t => t.kind === 'comprobar') ??
        this.focusOrder.find(t => t.kind === 'category') ??
        this.focusOrder.find(t => t.kind === 'poolDevice' || t.kind === 'categoryDevice') ??
        this.focusOrder[0];
      this.activeTarget = preferred;
    }
    this.syncDomFocusForButtons();
  }

  private findActiveTargetIndex(): number {
    return this.focusOrder.findIndex(t => this.sameTarget(t, this.activeTarget));
  }

  private sameTarget(a: FocusTarget, b: FocusTarget): boolean {
    return a.kind === b.kind && a.id === b.id;
  }

  private syncDomFocusForButtons(): void {
    const popupClose = this.getPopupCloseButton();
    popupClose?.classList.toggle('kb-focus', this.activeTarget.kind === 'popupClose');
    const resultClose = this.getResultCloseButton();
    resultClose?.classList.toggle('kb-focus', this.activeTarget.kind === 'resultClose');
    const resultOk = this.getResultOkButton();
    resultOk?.classList.toggle('kb-focus', this.activeTarget.kind === 'resultOk');

    if (this.activeTarget.kind === 'popupClose') return this.getPopupCloseButton()?.focus();
    if (this.activeTarget.kind === 'resultClose') return this.getResultCloseButton()?.focus();
    if (this.activeTarget.kind === 'resultOk') return this.getResultOkButton()?.focus();
    if (this.activeTarget.kind === 'category' && this.activeTarget.id) {
      return this.getCategoryElement(this.activeTarget.id as Tipo)?.focus();
    }
    if (this.activeTarget.kind === 'poolZone') return this.getPoolZoneElement()?.focus();
    if (this.activeTarget.kind === 'comprobar') return this.getComprobarButton()?.focus();
    if (this.activeTarget.kind === 'poolDevice' && this.activeTarget.id) {
      const tile = this.getPoolDeviceElement(this.activeTarget.id);
      if (tile) {
        tile.focus({ preventScroll: true });
        return;
      }
    }
    if (this.activeTarget.kind === 'categoryDevice' && this.activeTarget.id) {
      const tile = this.getCategoryDeviceElement(this.activeTarget.id);
      if (tile) {
        tile.focus({ preventScroll: true });
        return;
      }
    }
    this.gameContainerRef?.nativeElement.focus();
  }

  private getPoolDeviceElement(id: string): HTMLElement | null {
    const root = this.gameContainerRef?.nativeElement;
    if (!root) return null;
    return root.querySelector<HTMLElement>(`.columna-dispositivos .dispositivo[data-device-id="${id}"]`);
  }

  private getPoolZoneElement(): HTMLElement | null {
    return this.gameContainerRef?.nativeElement.querySelector<HTMLElement>('.pool-drop-zone') ?? null;
  }

  private getCategoryDeviceElement(id: string): HTMLElement | null {
    const root = this.gameContainerRef?.nativeElement;
    if (!root) return null;
    return root.querySelector<HTMLElement>(`.columna-categorias .dispositivo.pequeno[data-device-id="${id}"]`);
  }

  private getCategoryElement(id: Tipo): HTMLElement | null {
    return this.gameContainerRef?.nativeElement.querySelector<HTMLElement>(`.categoria[data-tipo="${id}"]`) ?? null;
  }

  private getComprobarButton(): HTMLButtonElement | null {
    return this.gameContainerRef?.nativeElement.querySelector<HTMLButtonElement>('#comprobar-unir') ?? null;
  }

  private deviceExistsAnywhere(id: string): boolean {
    if (this.dispositivos.some(d => d.id === id)) return true;
    return this.categorias.some(c => c.dispositivos.some(d => d.id === id));
  }

  private getPopupCloseButton(): HTMLButtonElement | null {
    const popupHost = this.getPopupHost();
    if (!popupHost) return null;
    return popupHost.querySelector<HTMLButtonElement>('.btn-cerrar');
  }

  private getPopupHost(): HTMLElement | null {
    const gameHost = this.gameContainerRef?.nativeElement;
    return gameHost?.closest('app-popup') as HTMLElement | null;
  }

  private getResultCloseButton(): HTMLButtonElement | null {
    return this.gameContainerRef?.nativeElement.querySelector<HTMLButtonElement>('.resultado-close') ?? null;
  }

  private getResultOkButton(): HTMLButtonElement | null {
    return this.gameContainerRef?.nativeElement.querySelector<HTMLButtonElement>('.btn-win95') ?? null;
  }

  private clearKeyboardSelection(): void {
    this.selectedDeviceId = null;
    this.onDragEnd();
  }

  private totalDispositivos(): number {
    return (
      this.dispositivos.length +
      this.categorias.reduce((acc, c) => acc + c.dispositivos.length, 0)
    );
  }

  private takeDeviceFromAnywhere(id: string): Dispositivo | null {
    const idxPool = this.dispositivos.findIndex(d => d.id === id);
    if (idxPool >= 0) return this.dispositivos.splice(idxPool, 1)[0];

    for (const cat of this.categorias) {
      const idx = cat.dispositivos.findIndex(d => d.id === id);
      if (idx >= 0) return cat.dispositivos.splice(idx, 1)[0];
    }
    return null;
  }

  private shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  deviceVoiceKeyword(id: string): string {
    switch (id) {
      case 'vid':
        return 'videojuego';
      case 'vr':
        return 'simulador';
      case 'vhs':
        return 'reproductor';
      case 'pre':
        return 'presentación';
      case 'web':
        return 'web';
      case 'cd':
        return 'disco';
      default:
        return '';
    }
  }

  ngOnDestroy(): void {
    this.juegoVoiceBridge.disconnect();
    window.removeEventListener(JUEGO_FOCUS_FIRST_EVENT, this.onFocusFirstRequest);
    window.removeEventListener(JUEGO_RESET_EVENT, this.onResetRequest);
    window.removeEventListener(VOICE_JUEGO_ACTION_EVENT, this.onJuegoVoiceEvent);
    clearTimeout(this.toastTimer);
  }

  private readonly handleJuegoVoice = (detail: JuegoVoiceDetail): void => {
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'moverArea':
          this.placeDeviceToCategoryByVoice(detail.deviceId, detail.areaId);
          break;
        case 'devolver':
          this.placeDeviceToPoolByVoice(detail.deviceId);
          break;
        case 'comprobar':
          this.comprobar();
          break;
        case 'aceptar':
          this.closeResultPopup();
          break;
        case 'cerrar':
          if (this.resultVisible) {
            this.closeResultPopup();
          } else {
            this.getPopupCloseButton()?.click();
          }
          break;
      }
      this.cdr.markForCheck();
    });
  };

  private readonly onJuegoVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<JuegoVoiceDetail>).detail;
    if (detail) this.handleJuegoVoice(detail);
  }) as EventListener;

  private placeDeviceToCategoryByVoice(id: string, catId: Tipo): void {
    const cat = this.categorias.find(c => c.id === catId);
    if (!cat) return;
    if (cat.dispositivos.length >= this.MAX_POR_CATEGORIA) {
      this.showToast('Máximo 2 dispositivos por categoría');
      return;
    }
    const disp = this.takeDeviceFromAnywhere(id);
    if (!disp) return;
    cat.dispositivos.push(disp);
    this.clearKeyboardSelection();
    this.activeTarget = { kind: 'categoryDevice', id: disp.id };
    this.ensureValidFocus();
  }

  private placeDeviceToPoolByVoice(id: string): void {
    if (this.dispositivos.some(d => d.id === id)) return;
    const disp = this.takeDeviceFromAnywhere(id);
    if (!disp) return;
    this.dispositivos.push(disp);
    this.clearKeyboardSelection();
    this.activeTarget = { kind: 'poolDevice', id: disp.id };
    this.ensureValidFocus();
  }

  private closeResultPopup(): void {
    if (!this.resultVisible) return;
    this.resultVisible = false;
    this.ensureValidFocus();
  }

  private resetGameState(): void {
    this.dispositivos = this.initialDispositivos.map(d => ({ ...d }));
    this.shuffle(this.dispositivos);
    this.categorias = this.initialCategorias.map(c => ({ ...c, dispositivos: [] }));

    this.resultado = '';
    this.victoria = false;
    this.draggedId = null;
    this.selectedDeviceId = null;
    this.toast = '';
    clearTimeout(this.toastTimer);
    this.toastTimer = null;

    this.resultVisible = false;
    this.resultKind = 'fail';
    this.resultTitle = '';
    this.resultSubtitle = '';
    this.aciertos = 0;
    this.total = 0;

    this.activeTarget = { kind: 'poolDevice' };
    this.focusOrder = [];
    this.ensureValidFocus();
    requestAnimationFrame(() => this.focusFirstPoolDevice());
  }
}
