import {

  Component,

  ElementRef,

  ViewChild,

  HostListener,

  OnInit,

  OnDestroy,

  AfterViewInit,

  inject,

  NgZone,

  ChangeDetectorRef,

} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Popup, ModalTheme, ModalSize } from '../../../componentes/popup/popup';

import { UiStateService } from '../../../services/ui-state.service';

import { ExplicacionService } from '../../../services/explicacion.service';

import { explicacionesHistoria } from '../data/explicaciones-historia';

import { SpeakableDirective } from '../../../directives/app-speakable';

import {

  VOICE_HISTORIA_INTERACTIVA_ACTION_EVENT,

} from '../../../utils/interactividad-voice-dom';

import {

  VoiceNavigationService,

  type HistoriaInteractivaVoiceDetail,

} from '../../../services/voice-navigation.service';

import { HistoriaInteractivaVoiceBridgeService } from '../../../services/historia-interactiva-voice-bridge.service';

import {

  PONG_PALETA_ZONAS,

  historiaTarjetaHintLabel,

  type HistoriaTarjetaId,

} from '../../../utils/historia-interactiva-voice';

interface Tarjeta {

  id: HistoriaTarjetaId;

  clave: string;

  tipo: 'procesando' | 'video' | 'audio';

  titulo: string;

  img: string;

  imgHover: string;

  isHovered: boolean;

  videoSrc?: string;

  audioSrc?: string;

}

@Component({

  selector: 'app-historia-interactiva',

  standalone: true,

  imports: [CommonModule, Popup, SpeakableDirective],

  templateUrl: './historia-interactiva.html',

  styleUrls: ['./historia-interactiva.scss'],

})

export class HistoriaInteractiva implements OnInit, AfterViewInit, OnDestroy {

  ui = inject(UiStateService);

  private explicacionService = inject(ExplicacionService);

  readonly voiceNav = inject(VoiceNavigationService);

  private historiaVoiceBridge = inject(HistoriaInteractivaVoiceBridgeService);

  private ngZone = inject(NgZone);

  private cdr = inject(ChangeDetectorRef);

  private readonly explicaciones = explicacionesHistoria;

  readonly paletaZonas = PONG_PALETA_ZONAS;

  @ViewChild('pongCanvas') set canvasContent(content: ElementRef<HTMLCanvasElement>) {

    if (content) {

      this.canvasRef = content;

      this.initPong();

    }

  }

  private canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;

  mostrarModal = false;

  jugando = false;

  paletaZonaActiva: number | null = null;

  private esperandoComandoPaleta = false;
  private viajeDesdeDerecha = false;
  private yCongeladaEnCentro = 275;
  private ballVelGuardada = { dx: -1.35, dy: 0 };
  private readonly LINEA_VOZ_X = 195;

  textoTarjeta(clave: string): string {

    const nivel = this.explicacionService.nivelActivo();

    return this.explicaciones[clave][nivel];

  }

  private readonly CANVAS_H = 550;

  private readonly PADDLE_H = 90;

  private readonly PADDLE_MAX_Y = this.CANVAS_H - this.PADDLE_H;

  private readonly MAX_BALL_SPEED_NORMAL = 11;

  private readonly MAX_BALL_SPEED_VOZ = 3.2;

  private readonly AI_REACTION_NORMAL = 0.065;

  private readonly AI_REACTION_VOZ = 0.016;

  private readonly BALL_ACCEL_NORMAL = 1.04;

  private readonly BALL_ACCEL_VOZ = 1.008;

  private readonly BALL_SPEED_NORMAL = 4;

  private readonly BALL_SPEED_VOZ = 1.35;

  ball = { x: 390, y: 275, dx: 4, dy: 4 };

  paddle = { y: 225, h: this.PADDLE_H };

  ai = { y: 225, h: this.PADDLE_H };

  puntosJugador = 0;

  puntosAI = 0;

  pongSize: ModalSize = { w: 820 };

  pongTheme: ModalTheme = {

    panelBg: '#ced4da',

    borderColor: '#b20000',

    insetLight: '#ffffff',

    insetDark: '#808080',

    titlebarBg: '#b20000',

    titlebarText: 'white',

    titlebarDivider: '#ff0000',

    closeBg: '#ff4848',

  };

  tarjetas: Tarjeta[] = [

    {

      id: 1,

      clave: 'tarjetaOrdenadores',

      tipo: 'procesando',

      titulo: 'Primeros ordenadores',

      img: 'assets/imagenes/interactividad/ordenador.jpg',

      imgHover: 'assets/imagenes/interactividad/ordenadorHover.jpg',

      isHovered: false,

    },

    {

      id: 2,

      clave: 'tarjetaConsolas',

      tipo: 'video',

      titulo: 'Primeras consolas',

      img: 'assets/imagenes/interactividad/consola.jpg',

      imgHover: 'assets/imagenes/interactividad/consolaHover.jpg',

      videoSrc: 'assets/videos/interactividad/pongGameplay.mp4',

      isHovered: false,

    },

    {

      id: 3,

      clave: 'tarjetaArcade',

      tipo: 'audio',

      titulo: 'Máquinas arcade',

      img: 'assets/imagenes/interactividad/arcade.jpg',

      imgHover: 'assets/imagenes/interactividad/arcadeHover.jpg',

      audioSrc: 'assets/audio/interactividad/monedaArcade.mp3',

      isHovered: false,

    },

  ];

  private readonly onHistoriaVoiceEvent = (e: Event) => {

    const ce = e as CustomEvent<HistoriaInteractivaVoiceDetail>;

    if (ce.detail) this.handleHistoriaVoice(ce.detail);

  };

  private readonly handleHistoriaVoice = (detail: HistoriaInteractivaVoiceDetail) => {

    this.ngZone.run(() => {

      switch (detail.action) {

        case 'tarjetaHover':

          this.activarTarjetaVoz(detail.tarjetaId);

          break;

        case 'abrirPong':

          this.abrirJuego();

          break;

        case 'paletaZona':

          if (this.mostrarModal && this.jugando) {

            this.responderPaletaVoz(detail.zona);

          }

          break;

        case 'cerrarPong':

          this.cerrarJuego();

          break;

      }

      this.cdr.markForCheck();

    });

  };

  onMouseEnter(t: Tarjeta) {

    t.isHovered = true;

    if (t.tipo === 'audio' && t.audioSrc) {

      const audio = new Audio(t.audioSrc);

      audio.volume = 0.4;

      audio.play().catch(() => {});

    }

  }

  onMouseLeave(t: Tarjeta) {

    t.isHovered = false;

  }

  get algunHoverActivo(): boolean {

    return this.tarjetas.some(t => t.isHovered);

  }

  getImagenTarjeta(t: Tarjeta): string {

    return t.isHovered || this.ui.isHovering() ? t.imgHover : t.img;

  }

  activarTarjetaVoz(id: HistoriaTarjetaId) {

    this.tarjetas.forEach(t => {

      t.isHovered = false;

    });

    const t = this.tarjetas.find(x => x.id === id);

    if (t) this.onMouseEnter(t);

  }

  tarjetaHint(id: HistoriaTarjetaId): string {

    return historiaTarjetaHintLabel(id);

  }

  abrirJuego() {

    this.mostrarModal = true;

  }

  cerrarJuego() {

    this.stopPaddleKeyboard();

    this.esperandoComandoPaleta = false;

    this.viajeDesdeDerecha = false;

    this.mostrarModal = false;

    this.jugando = false;

    this.paletaZonaActiva = null;

  }

  moverPaletaAZona(zona: number) {
    const z = Math.max(1, Math.min(PONG_PALETA_ZONAS, Math.round(zona)));
    this.paletaZonaActiva = z;
    const zoneH = this.CANVAS_H / PONG_PALETA_ZONAS;
    const centerY = (z - 0.5) * zoneH;
    this.paddle.y = Math.round(
      Math.max(0, Math.min(this.PADDLE_MAX_Y, centerY - this.paddle.h / 2))
    );
  }

  private yEnLineaCentro(
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): number {
    const dx = x1 - x0;
    if (Math.abs(dx) < 0.001) return y0;
    const t = (this.LINEA_VOZ_X - x0) / dx;
    const y = y0 + (y1 - y0) * t;
    return Math.max(12, Math.min(538, y));
  }

  private iniciarEsperaEnCentro(yEnCentro: number): void {
    this.yCongeladaEnCentro = yEnCentro;
    this.ballVelGuardada = {
      dx: this.ball.dx < 0 ? this.ball.dx : -this.ballStartSpeed(),
      dy: this.ball.dy,
    };
    this.esperandoComandoPaleta = true;
    this.viajeDesdeDerecha = false;
    this.ball.x = this.LINEA_VOZ_X;
    this.ball.y = this.yCongeladaEnCentro;
    this.ball.dx = 0;
    this.ball.dy = 0;
  }

  responderPaletaVoz(zona: number) {
    const z = Math.max(1, Math.min(PONG_PALETA_ZONAS, Math.round(zona)));
    if (!this.modoVozPong()) {
      this.moverPaletaAZona(z);
      return;
    }
    if (!this.esperandoComandoPaleta) return;

    this.moverPaletaAZona(z);
    this.esperandoComandoPaleta = false;
    this.ball.x = this.LINEA_VOZ_X;
    this.ball.y = this.yCongeladaEnCentro;
    const v = this.ballStartSpeed();
    this.ball.dx = this.ballVelGuardada.dx < 0 ? this.ballVelGuardada.dx : -v;
    this.ball.dy =
      this.ballVelGuardada.dy !== 0
        ? this.ballVelGuardada.dy
        : (Math.random() > 0.5 ? 1 : -1) * v * 0.5;
  }

  private modoVozPong(): boolean {

    return this.voiceNav.enabled();

  }

  private maxBallSpeed(): number {

    return this.modoVozPong() ? this.MAX_BALL_SPEED_VOZ : this.MAX_BALL_SPEED_NORMAL;

  }

  private aiReaction(): number {

    return this.modoVozPong() ? this.AI_REACTION_VOZ : this.AI_REACTION_NORMAL;

  }

  private ballAccel(): number {

    return this.modoVozPong() ? this.BALL_ACCEL_VOZ : this.BALL_ACCEL_NORMAL;

  }

  private ballStartSpeed(): number {

    return this.modoVozPong() ? this.BALL_SPEED_VOZ : this.BALL_SPEED_NORMAL;

  }

  private paddleKeyDir: -1 | 0 | 1 = 0;

  private paddleKeyTimer: ReturnType<typeof setInterval> | null = null;

  private readonly PADDLE_KEY_STEP = 14;

  private readonly PADDLE_KEY_TICK_MS = 16;

  private readonly onPongKeyDown = (e: KeyboardEvent) => {

    if (!this.mostrarModal || !this.jugando) return;

    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

    e.preventDefault();

    if (e.repeat) return;

    this.paddleKeyDir = e.key === 'ArrowUp' ? -1 : 1;

    this.startPaddleKeyboard();

  };

  private readonly onPongKeyUp = (e: KeyboardEvent) => {

    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

    if (this.paddleKeyDir === 0) return;

    if (

      (e.key === 'ArrowUp' && this.paddleKeyDir === -1) ||

      (e.key === 'ArrowDown' && this.paddleKeyDir === 1)

    ) {

      this.stopPaddleKeyboard();

    }

  };

  ngOnInit(): void {

    window.addEventListener('keydown', this.onPongKeyDown, true);

    window.addEventListener('keyup', this.onPongKeyUp, true);

  }

  ngAfterViewInit(): void {

    this.historiaVoiceBridge.connect(this.handleHistoriaVoice);

    window.addEventListener(VOICE_HISTORIA_INTERACTIVA_ACTION_EVENT, this.onHistoriaVoiceEvent);

  }

  private startPaddleKeyboard() {

    if (this.paddleKeyTimer !== null) return;

    this.paddleKeyTimer = setInterval(() => {

      if (!this.jugando) {

        this.stopPaddleKeyboard();

        return;

      }

      this.paddle.y += this.paddleKeyDir * this.PADDLE_KEY_STEP;

      this.paddle.y = Math.max(0, Math.min(this.PADDLE_MAX_Y, this.paddle.y));

      this.paletaZonaActiva = null;

    }, this.PADDLE_KEY_TICK_MS);

  }

  private stopPaddleKeyboard() {

    this.paddleKeyDir = 0;

    if (this.paddleKeyTimer !== null) {

      clearInterval(this.paddleKeyTimer);

      this.paddleKeyTimer = null;

    }

  }

  ngOnDestroy(): void {

    this.stopPaddleKeyboard();

    window.removeEventListener('keydown', this.onPongKeyDown, true);

    window.removeEventListener('keyup', this.onPongKeyUp, true);

    this.historiaVoiceBridge.disconnect();

    window.removeEventListener(VOICE_HISTORIA_INTERACTIVA_ACTION_EVENT, this.onHistoriaVoiceEvent);

  }

  private initPong() {

    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;

    this.puntosJugador = 0;

    this.puntosAI = 0;

    this.paletaZonaActiva = null;

    this.esperandoComandoPaleta = false;

    this.viajeDesdeDerecha = false;

    this.reiniciarPelota();

    this.jugando = true;

    this.gameLoop();

  }

  @HostListener('mousemove', ['$event'])

  onMouseMove(e: MouseEvent) {

    if (this.jugando && this.canvasRef) {
      this.updatePaddleFromClientY(e.clientY);
    }

  }

  onTouchMove(e: TouchEvent): void {
    if (!this.jugando || !this.canvasRef) return;
    const touch = e.touches[0];
    if (!touch) return;
    e.preventDefault();
    this.updatePaddleFromClientY(touch.clientY);
  }

  private updatePaddleFromClientY(clientY: number): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    if (!rect.height) return;
    const yInElement = clientY - rect.top;
    const scaleY = canvas.height / rect.height;
    const mouseY = yInElement * scaleY;
    this.paddle.y = mouseY - this.paddle.h / 2;
    this.paddle.y = Math.max(0, Math.min(this.PADDLE_MAX_Y, this.paddle.y));
    this.paletaZonaActiva = null;
  }

  private gameLoop = () => {

    if (!this.jugando) return;

    this.update();

    this.draw();

    requestAnimationFrame(this.gameLoop);

  };

  private reiniciarPelota() {
    const v = this.ballStartSpeed();
    this.viajeDesdeDerecha = false;
    this.esperandoComandoPaleta = false;
    this.ball.x = this.LINEA_VOZ_X;
    this.ball.y = 160 + Math.random() * 230;
    this.ball.dx = Math.abs(v);
    this.ball.dy = (Math.random() * (v * 0.75)) * (Math.random() > 0.5 ? 1 : -1);
  }

  private update() {
    if (this.esperandoComandoPaleta) {
      this.ball.x = this.LINEA_VOZ_X;
      this.ball.y = this.yCongeladaEnCentro;
      this.ball.dx = 0;
      this.ball.dy = 0;
      return;
    }

    if (this.modoVozPong()) {
      const nextX = this.ball.x + this.ball.dx;
      const nextY = this.ball.y + this.ball.dy;

      if (this.ball.dx < 0 && this.ball.x > this.LINEA_VOZ_X) {
        this.viajeDesdeDerecha = true;
      }
      if (this.ball.dx > 0) {
        this.viajeDesdeDerecha = false;
      }

      if (
        this.viajeDesdeDerecha &&
        this.ball.dx < 0 &&
        this.ball.x > this.LINEA_VOZ_X &&
        nextX <= this.LINEA_VOZ_X
      ) {
        const yHit = this.yEnLineaCentro(this.ball.x, this.ball.y, nextX, nextY);
        this.iniciarEsperaEnCentro(yHit);
        return;
      }
    }

    this.ball.x += this.ball.dx;

    this.ball.y += this.ball.dy;

    if (this.ball.y < 10 || this.ball.y > 540) this.ball.dy *= -1;

    if (this.ball.x < 30 && this.ball.y > this.paddle.y && this.ball.y < this.paddle.y + this.paddle.h) {

      const impact = (this.ball.y - (this.paddle.y + this.paddle.h / 2)) / (this.paddle.h / 2);

      this.ball.dx = Math.min(Math.abs(this.ball.dx) * this.ballAccel(), this.maxBallSpeed());

      this.ball.dy = impact * (this.modoVozPong() ? 3.2 : 8);

      this.ball.x = 30;

    }

    if (this.ball.x > 750 && this.ball.y > this.ai.y && this.ball.y < this.ai.y + this.ai.h) {

      const impact = (this.ball.y - (this.ai.y + this.ai.h / 2)) / (this.ai.h / 2);

      this.ball.dx = -Math.min(Math.abs(this.ball.dx) * this.ballAccel(), this.maxBallSpeed());

      this.ball.dy = impact * (this.modoVozPong() ? 3.2 : 8);

      this.ball.x = 750;

    }

    if (this.ball.dx > 0 && this.ball.x > 780 / 2.5) {

      const targetY = this.ball.y - this.ai.h / 2;

      this.ai.y += (targetY - this.ai.y) * this.aiReaction();

    } else {

      this.ai.y += (225 - this.ai.y) * (this.modoVozPong() ? 0.008 : 0.02);

    }

    this.ai.y = Math.max(0, Math.min(this.PADDLE_MAX_Y, this.ai.y));

    if (this.ball.x < 0) {

      this.puntosAI++;

      this.reiniciarPelota();

    } else if (this.ball.x > 780) {

      this.puntosJugador++;

      this.reiniciarPelota();

    }

    if (this.puntosJugador >= 5 || this.puntosAI >= 5) this.jugando = false;

  }

  private drawPaletaGuia(canvas: HTMLCanvasElement) {
    const trackH = this.CANVAS_H;
    const zoneH = trackH / PONG_PALETA_ZONAS;
    const xLine = 26;
    const xNum = 8;
    const paddleCenterY = this.paddle.y + this.paddle.h / 2;

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(0, 206, 168, 0.55)';
    this.ctx.fillStyle = 'rgba(0, 206, 168, 0.85)';
    this.ctx.lineWidth = 1;
    this.ctx.font = 'bold 11px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    this.ctx.beginPath();
    this.ctx.moveTo(xLine, 0);
    this.ctx.lineTo(xLine, trackH);
    this.ctx.stroke();

    for (let i = 0; i <= PONG_PALETA_ZONAS; i++) {
      const y = i * zoneH;
      this.ctx.beginPath();
      this.ctx.moveTo(xLine - 4, y);
      this.ctx.lineTo(xLine + 4, y);
      this.ctx.stroke();
    }

    for (let z = 1; z <= PONG_PALETA_ZONAS; z++) {
      const yTop = (z - 1) * zoneH;
      const yCenter = yTop + zoneH / 2;
      const activa = this.paletaZonaActiva === z;
      if (activa) {
        this.ctx.fillStyle = 'rgba(0, 206, 168, 0.35)';
        this.ctx.fillRect(0, yTop, 36, zoneH);
        this.ctx.fillStyle = '#ffffff';
      } else {
        this.ctx.fillStyle = 'rgba(0, 206, 168, 0.85)';
      }
      this.ctx.fillText(String(z), xNum + 6, yCenter);
    }

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.beginPath();
    this.ctx.moveTo(xLine + 6, paddleCenterY);
    this.ctx.lineTo(36, paddleCenterY);
    this.ctx.stroke();

    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = 'rgba(0, 206, 168, 0.9)';
    this.ctx.fillText(
      this.esperandoComandoPaleta
        ? `Di un número del 1 al ${PONG_PALETA_ZONAS}`
        : `Paleta 1–${PONG_PALETA_ZONAS} · parada · cerrar`,
      canvas.width / 2,
      canvas.height - 14
    );

    this.ctx.restore();
  }

  private draw() {

    if (!this.ctx) return;

    const canvas = this.canvasRef.nativeElement;

    this.ctx.fillStyle = '#051a16';

    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (this.modoVozPong()) {

      this.drawPaletaGuia(canvas);

    }

    this.ctx.strokeStyle = 'rgba(0, 206, 168, 0.2)';

    this.ctx.setLineDash([10, 10]);

    this.ctx.beginPath();

    this.ctx.moveTo(canvas.width / 2, 0);

    this.ctx.lineTo(canvas.width / 2, canvas.height);

    this.ctx.stroke();

    this.ctx.setLineDash([]);

    this.ctx.fillStyle = '#00cea8';

    this.ctx.fillRect(10, this.paddle.y, 15, this.paddle.h);

    this.ctx.fillRect(canvas.width - 25, this.ai.y, 15, this.ai.h);

    this.ctx.beginPath();

    this.ctx.arc(this.ball.x, this.ball.y, 8, 0, Math.PI * 2);

    this.ctx.fill();

    if (this.esperandoComandoPaleta && this.modoVozPong()) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.ball.x, this.ball.y, 16, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.setLineDash([6, 6]);
      this.ctx.strokeStyle = 'rgba(0, 206, 168, 0.35)';
      this.ctx.beginPath();
      this.ctx.moveTo(this.LINEA_VOZ_X, 12);
      this.ctx.lineTo(this.LINEA_VOZ_X, 538);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    this.ctx.font = 'bold 40px monospace';

    this.ctx.textAlign = 'left';

    this.ctx.fillText(`${this.puntosJugador}`, canvas.width * 0.25, 60);

    this.ctx.fillText(`${this.puntosAI}`, canvas.width * 0.75, 60);

    if (!this.jugando) {

      this.ctx.fillStyle = 'rgba(0,0,0,0.85)';

      this.ctx.fillRect(0, 0, canvas.width, canvas.height);

      this.ctx.fillStyle = this.puntosJugador >= 5 ? '#00cea8' : '#ff4d4d';

      this.ctx.textAlign = 'center';

      this.ctx.fillText(

        this.puntosJugador >= 5 ? '¡VICTORIA!' : 'DERROTA',

        canvas.width / 2,

        canvas.height / 2

      );

    }

  }

}

