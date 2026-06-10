import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  AfterViewInit,
  AfterViewChecked,
  HostListener,
  OnDestroy,
  NgZone,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStateService } from '../../../services/ui-state.service';
import { ExplicacionService } from '../../../services/explicacion.service';
import { explicacionesEvolucion } from '../data/explicaciones-evolucion';
import { SpeakableDirective } from '../../../directives/app-speakable';
import { VOICE_EVOLUCION_INTERFACES_ACTION_EVENT } from '../../../utils/interactividad-voice-dom';
import {
  VoiceNavigationService,
  type EvolucionInterfacesVoiceDetail,
} from '../../../services/voice-navigation.service';
import { EvolucionInterfacesVoiceBridgeService } from '../../../services/evolucion-interfaces-voice-bridge.service';
import { KeyboardNavService } from '../../../services/keyboard-nav.service';
import {
  evolucionInterfazEpocaHintLabel,
  evolucionInterfazZonaClickCoords,
  type EvolucionInterfazDireccion,
  type EvolucionInterfazEpocaId,
} from '../../../utils/evolucion-interfaces-voice';

interface Epoca {
  id: number;
  clave: string;
  nombre: string;
  icon: string;
  color: string;
  borderColor: string;
  interactionType: 'click' | 'multi-touch' | 'analog' | 'motion' | 'spatial';
  particleColor: string;
  descripcion: string;
}

@Component({
  selector: 'app-evolucion-interfaces',
  standalone: true,
  imports: [CommonModule, SpeakableDirective],
  templateUrl: './evolucion-interfaces.html',
  styleUrls: ['./evolucion-interfaces.scss']
})
export class EvolucionInterfaces implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('matrizCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer') containerRef!: ElementRef<HTMLDivElement>;
  ui = inject(UiStateService);
  readonly keyboardNav = inject(KeyboardNavService);
  readonly voiceNav = inject(VoiceNavigationService);
  private explicacionService = inject(ExplicacionService);
  private readonly explicaciones = explicacionesEvolucion;
  private readonly evolucionVoiceBridge = inject(EvolucionInterfacesVoiceBridgeService);
  private host = inject(ElementRef) as ElementRef<HTMLElement>;
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private animationId: number | null = null;
  private readonly MATRIZ_ROWS = 18;
  private readonly MATRIZ_COLS = 25;

  epocas: Epoca[] = [
    { id: 0, clave: 'epocaRatonTeclado',  nombre: 'Ratón & Teclado',         icon: '🖱️', color: '#00cea8', borderColor: '#008c72', interactionType: 'click',       particleColor: '#00cea8', descripcion: 'Entrada puntual y precisa' },
    { id: 1, clave: 'epocaTactil',        nombre: 'Pantallas Táctiles',      icon: '👆', color: '#00cea8', borderColor: '#ffffff', interactionType: 'multi-touch', particleColor: '#00ffff', descripcion: 'Múltiples puntos simultáneos' },
    { id: 2, clave: 'epocaMandos',        nombre: 'Mandos',                  icon: '🎮', color: '#ced4da', borderColor: '#808080', interactionType: 'analog',      particleColor: '#00ff00', descripcion: 'Control analógico direccional' },
    { id: 3, clave: 'epocaMovimiento',    nombre: 'Sensores de Movimiento',  icon: '📱', color: '#008c72', borderColor: '#00cea8', interactionType: 'motion',      particleColor: '#ffff00', descripcion: 'Estela de movimiento suave' },
    { id: 4, clave: 'epocaVR',            nombre: 'Realidad Virtual',        icon: '🥽', color: '#1a1a2e', borderColor: '#00cea8', interactionType: 'spatial',     particleColor: '#ff00ff', descripcion: 'Inmersión y foco de profundidad' }
  ];

  textoEpoca(clave: string): string {
    return this.explicaciones[clave][this.explicacionService.nivelActivo()];
  }

  epocaActual: Epoca = this.epocas[0];
  matrizGrilla: boolean[][] = [];
  deformacion: number[][] = [];
  
  mouseX = 400;
  mouseY = 300;
  ultimosClicks: { x: number; y: number; timestamp: number }[] = [];

  direccionVozActiva: EvolucionInterfazDireccion | null = null;

  epocaPulsadaId: number | null = null;
  private epocaPulsadaTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly VOZ_PASO_PX = 50;
  private readonly CANVAS_W = 800;
  private readonly CANVAS_H = 600;

  ngOnInit() {
    this.asegurarMatriz();
  }

  ngAfterViewInit() {
    this.asegurarMatriz();
    this.iniciarAnimacion();
    this.evolucionVoiceBridge.connect(this.handleEvolucionVoice);
    window.addEventListener(VOICE_EVOLUCION_INTERFACES_ACTION_EVENT, this.onEvolucionVoiceEvent);

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('keydown', this.onCanvasKeyDown, true);
      window.addEventListener('keyup', this.onCanvasKeyUp, true);
    });
  }

  ngAfterViewChecked() {
    this.asegurarAnimacion();
  }

  private asegurarMatriz(): void {
    const { MATRIZ_ROWS: rows, MATRIZ_COLS: cols } = this;
    if (
      this.matrizGrilla.length === rows &&
      this.deformacion.length === rows &&
      this.matrizGrilla[0]?.length === cols
    ) {
      return;
    }
    this.generarMatriz();
  }

  private generarMatriz() {
    const { MATRIZ_ROWS: rows, MATRIZ_COLS: cols } = this;
    this.matrizGrilla = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random() > 0.4)
    );
    this.deformacion = Array.from({ length: rows }, () => Array(cols).fill(0));
  }

  private asegurarAnimacion(): void {
    if (this.animationId === null && this.canvasRef?.nativeElement) {
      this.iniciarAnimacion();
    }
  }

  private obtenerContexto(): CanvasRenderingContext2D | null {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (this.epocaActual.interactionType === 'multi-touch') return;
    if (this.voiceNav.enabled() && !this.isCanvasFocused()) return;
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    this.mouseX = (e.clientX - rect.left) * scaleX;
    this.mouseY = (e.clientY - rect.top) * scaleY;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    if (this.voiceNav.enabled() && !this.isCanvasFocused()) return;
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    this.registrarToque(x, y);
  }

  private registrarToque(x: number, y: number): void {
    this.ultimosClicks.push({ x, y, timestamp: Date.now() });
    if (this.ultimosClicks.length > 5) this.ultimosClicks.shift();
  }

  seleccionarEpoca(epoca: Epoca, pulsarVisual = false) {
    this.asegurarMatriz();
    this.epocaActual = epoca;
    this.ultimosClicks = [];
    for (const row of this.deformacion) {
      row.fill(0);
    }
    if (pulsarVisual) this.mostrarPulsoEpoca(epoca.id);
  }

  private mostrarPulsoEpoca(id: number): void {
    this.epocaPulsadaId = id;
    if (this.epocaPulsadaTimer !== null) clearTimeout(this.epocaPulsadaTimer);
    this.epocaPulsadaTimer = setTimeout(() => {
      this.epocaPulsadaId = null;
      this.epocaPulsadaTimer = null;
      this.cdr.markForCheck();
    }, 220);
    this.cdr.markForCheck();
  }

  epocaVozHint(id: number): string {
    return evolucionInterfazEpocaHintLabel(id as EvolucionInterfazEpocaId);
  }

  aplicarComandoDireccionVoz(direccion: EvolucionInterfazDireccion): void {
    if (this.epocaActual.interactionType === 'multi-touch') {
      this.aplicarToqueTactilVoz(direccion);
      return;
    }
    this.moverCursorVoz(direccion);
  }

  private aplicarToqueTactilVoz(direccion: EvolucionInterfazDireccion): void {
    const { x, y } = evolucionInterfazZonaClickCoords(direccion);
    this.registrarToque(x, y);
    this.direccionVozActiva = direccion;
  }

  private moverCursorVoz(direccion: EvolucionInterfazDireccion): void {
    this.direccionVozActiva = direccion;
    switch (direccion) {
      case 1:
        this.mouseX -= this.VOZ_PASO_PX;
        break;
      case 2:
        this.mouseY -= this.VOZ_PASO_PX;
        break;
      case 3:
        this.mouseX += this.VOZ_PASO_PX;
        break;
      case 4:
        this.mouseY += this.VOZ_PASO_PX;
        break;
    }
    this.mouseX = Math.max(0, Math.min(this.CANVAS_W, this.mouseX));
    this.mouseY = Math.max(0, Math.min(this.CANVAS_H, this.mouseY));
  }

  private actualizarLogica() {
    this.asegurarMatriz();
    const rows = this.MATRIZ_ROWS;
    const cols = this.MATRIZ_COLS;
    const cw = this.CANVAS_W / cols;
    const ch = this.CANVAS_H / rows;
    const ahora = Date.now();

    this.ultimosClicks = this.ultimosClicks.filter(c => ahora - c.timestamp < 2000);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const xCentro = (c + 0.5) * cw;
        const yCentro = (r + 0.5) * ch;
        const distMouse = Math.hypot(this.mouseX - xCentro, this.mouseY - yCentro);
        
        let metaDeform = 0;

        switch (this.epocaActual.interactionType) {
          case 'click':
            metaDeform = Math.max(0, 1 - distMouse / 120);
            break;

          case 'multi-touch':
            this.ultimosClicks.forEach(click => {
              const dC = Math.hypot(click.x - xCentro, click.y - yCentro);
              const vida = 1 - (ahora - click.timestamp) / 2000;
              metaDeform += Math.max(0, 1 - dC / 130) * vida;
            });
            break;

          case 'analog':
            const oscilacion = Math.sin(ahora * 0.01) * 0.05;
            metaDeform = Math.max(0, 1 - distMouse / 200) + oscilacion;
            break;

          case 'motion': 
            if (distMouse < 100) metaDeform = 1;
            else metaDeform = this.deformacion[r][c] * 0.96; 
            break;

          case 'spatial':
            metaDeform = Math.max(0, 1 - distMouse / 250);
            break;
        }

        if (this.epocaActual.interactionType === 'motion') {
          this.deformacion[r][c] = metaDeform;
        } else {
          const suavizado = this.epocaActual.interactionType === 'analog' ? 0.08 : 0.15;
          this.deformacion[r][c] += (metaDeform - this.deformacion[r][c]) * suavizado;
        }
      }
    }
  }

  private dibujar() {
    const ctx = this.obtenerContexto();
    const canvas = this.canvasRef?.nativeElement;
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rows = this.MATRIZ_ROWS;
    const cols = this.MATRIZ_COLS;
    const cw = canvas.width / cols;
    const ch = canvas.height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!this.matrizGrilla[r]?.[c]) continue;

        const s = Math.min(this.deformacion[r][c], 2);
        let x = (c + 0.5) * cw;
        let y = (r + 0.5) * ch;
        const alphaBase = 0.5;
        const alpha = Math.min(alphaBase + s * 0.5, 1);

        if (this.epocaActual.interactionType === 'spatial') {
          x += (this.mouseX - x) * (s * 0.2);
          y += (this.mouseY - y) * (s * 0.2);
          ctx.fillStyle = `rgba(255, 0, 255, ${alpha})`;
        } else if (this.epocaActual.interactionType === 'multi-touch') {
          ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
        } else if (this.epocaActual.interactionType === 'analog') {
          ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
        } else if (this.epocaActual.interactionType === 'motion') {
          ctx.fillStyle = `rgba(0, 206, 168, ${alpha})`;
        } else {
          ctx.fillStyle = this.colorParticulaClick(alpha);
        }

        const size = (cw * 0.5) * (1 + s * 0.5);
        ctx.globalAlpha = 1;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
    }

    ctx.globalAlpha = 1;
    ctx.strokeStyle = this.epocaActual.borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    if (this.epocaActual.interactionType === 'multi-touch') {
      this.dibujarToquesTactiles(ctx);
    } else if (this.voiceNav.enabled() && this.direccionVozActiva !== null) {
      this.dibujarIndicadorCursor(ctx);
    }
  }

  private dibujarToquesTactiles(ctx: CanvasRenderingContext2D): void {
    const ahora = Date.now();
    for (const toque of this.ultimosClicks) {
      const vida = 1 - (ahora - toque.timestamp) / 2000;
      if (vida <= 0) continue;
      ctx.save();
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.35 + vida * 0.65})`;
      ctx.fillStyle = `rgba(0, 255, 255, ${0.15 + vida * 0.35})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(toque.x, toque.y, 10 + vida * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private colorParticulaClick(alpha: number): string {
    const hex = this.epocaActual.particleColor;
    if (hex === '#1a1a2e') {
      return `rgba(180, 80, 255, ${alpha})`;
    }
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return `rgba(0, 206, 168, ${alpha})`;
    return `rgba(${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}, ${alpha})`;
  }

  private dibujarIndicadorCursor(ctx: CanvasRenderingContext2D): void {
    const x = this.mouseX;
    const y = this.mouseY;
    ctx.save();
    ctx.strokeStyle = '#00cea8';
    ctx.fillStyle = 'rgba(0, 206, 168, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private iniciarAnimacion = () => {
    this.actualizarLogica();
    this.dibujar();
    this.animationId = requestAnimationFrame(this.iniciarAnimacion);
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.epocaPulsadaTimer !== null) clearTimeout(this.epocaPulsadaTimer);
    this.stopVirtualPointer();
    this.evolucionVoiceBridge.disconnect();
    window.removeEventListener(VOICE_EVOLUCION_INTERFACES_ACTION_EVENT, this.onEvolucionVoiceEvent);
    window.removeEventListener('keydown', this.onCanvasKeyDown, true);
    window.removeEventListener('keyup', this.onCanvasKeyUp, true);
  }

  private readonly handleEvolucionVoice = (detail: EvolucionInterfacesVoiceDetail): void => {
    if (detail.action === 'mover') {
      this.aplicarComandoDireccionVoz(detail.direccion);
      this.cdr.markForCheck();
      return;
    }
    if (detail.action === 'epoca') {
      const epoca = this.epocas.find(e => e.id === detail.epocaId);
      if (!epoca) return;
      this.seleccionarEpoca(epoca, true);
      this.cdr.markForCheck();
    }
  };

  private readonly onEvolucionVoiceEvent = (ev: Event): void => {
    const detail = (ev as CustomEvent<EvolucionInterfacesVoiceDetail>).detail;
    if (detail) this.handleEvolucionVoice(detail);
  };

  private readonly VP_STEP = 18;
  private readonly VP_TICK_MS = 16;
  private vpDir: { dx: -1 | 0 | 1; dy: -1 | 0 | 1 } = { dx: 0, dy: 0 };
  private vpTimer: ReturnType<typeof setInterval> | null = null;
  private keyClickTimer: ReturnType<typeof setInterval> | null = null;
  private readonly KEY_CLICK_TICK_MS = 90;

  private isCanvasFocused(): boolean {
    return !!this.containerRef && document.activeElement === this.containerRef.nativeElement;
  }

  enterCanvasFromTimeline(): void {
    if (!this.containerRef) return;
    this.mouseX = 400;
    this.mouseY = 300;
    this.containerRef.nativeElement.focus();
  }

  private exitCanvas(): void {
    const activa = this.host.nativeElement.querySelector<HTMLElement>('.epoca-btn.activa');
    const cualquiera = this.host.nativeElement.querySelector<HTMLElement>('.epoca-btn');
    (activa ?? cualquiera)?.focus();
    this.mouseX = 400;
    this.mouseY = 300;
    this.direccionVozActiva = null;
    this.stopVirtualPointer();
    this.stopKeyClick();
  }

  private readonly onCanvasKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    const epocaBtn = target?.closest('.epoca-btn') as HTMLElement | null;

    if (epocaBtn && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const epocaId = Number(epocaBtn.getAttribute('data-epoca-id'));
      const epoca = this.epocas.find(item => item.id === epocaId);
      if (epoca && this.epocaActual.id !== epoca.id) {
        this.ngZone.run(() => {
          this.seleccionarEpoca(epoca);
          this.cdr.markForCheck();
        });
      }
      this.enterCanvasFromTimeline();
      return;
    }

    if (!this.isCanvasFocused()) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight': {
        e.preventDefault();
        e.stopPropagation();
        this.vpDir = {
          dx: e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0,
          dy: e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0
        };
        this.startVirtualPointer();
        return;
      }
      case 'Enter': {
        e.preventDefault();
        e.stopPropagation();
        this.exitCanvas();
        return;
      }
      case ' ':
      case 'Spacebar':
      {
        e.preventDefault();
        e.stopPropagation();
        if (e.repeat) return;
        this.simulateClickAtPointer();
        this.startKeyClick();
        return;
      }
      case 'Escape': {
        e.preventDefault();
        e.stopPropagation();
        this.exitCanvas();
        return;
      }
    }
  };

  private readonly onCanvasKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && this.vpDir.dx === -1) this.vpDir.dx = 0;
    if (e.key === 'ArrowRight' && this.vpDir.dx === 1) this.vpDir.dx = 0;
    if (e.key === 'ArrowUp' && this.vpDir.dy === -1) this.vpDir.dy = 0;
    if (e.key === 'ArrowDown' && this.vpDir.dy === 1) this.vpDir.dy = 0;
    if (this.vpDir.dx === 0 && this.vpDir.dy === 0) this.stopVirtualPointer();

    if (e.key === ' ' || e.key === 'Spacebar') this.stopKeyClick();
  };

  private startVirtualPointer() {
    if (this.vpTimer !== null) return;
    this.vpTimer = setInterval(() => {
      if (!this.isCanvasFocused()) {
        this.stopVirtualPointer();
        return;
      }
      const W = this.canvasRef.nativeElement.width;
      const H = this.canvasRef.nativeElement.height;
      this.mouseX = Math.max(0, Math.min(W, this.mouseX + this.vpDir.dx * this.VP_STEP));
      this.mouseY = Math.max(0, Math.min(H, this.mouseY + this.vpDir.dy * this.VP_STEP));
    }, this.VP_TICK_MS);
  }

  private stopVirtualPointer() {
    this.vpDir = { dx: 0, dy: 0 };
    if (this.vpTimer !== null) {
      clearInterval(this.vpTimer);
      this.vpTimer = null;
    }
  }

  private simulateClickAtPointer() {
    if (this.epocaActual.interactionType === 'multi-touch') {
      this.registrarToque(this.mouseX, this.mouseY);
      return;
    }
  }

  private startKeyClick() {
    if (this.keyClickTimer !== null) return;
    this.keyClickTimer = setInterval(() => {
      if (!this.isCanvasFocused()) {
        this.stopKeyClick();
        return;
      }
      this.simulateClickAtPointer();
    }, this.KEY_CLICK_TICK_MS);
  }

  private stopKeyClick() {
    if (this.keyClickTimer !== null) {
      clearInterval(this.keyClickTimer);
      this.keyClickTimer = null;
    }
  }
}
