import {
  Component,
  signal,
  computed,
  effect,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  PLATFORM_ID,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiStateService } from '../../../services/ui-state.service';
import { ColorService } from '../../../services/color.service';
import { KeyboardNavService } from '../../../services/keyboard-nav.service';
import { SpeakableDirective } from '../../../directives/app-speakable';
import { VoiceNavigationService } from '../../../services/voice-navigation.service';
import { MultimediaVoiceBridgeService } from '../../../services/multimedia-voice-bridge.service';
import { VOICE_MULTIMEDIA_ACTION_EVENT } from '../../../utils/interactividad-voice-dom';
import {
  multimediaTabHint,
  multimediaNoteHint,
  multimediaBrushModeHint,
  setMultimediaVoicePaintActive,
  type MultimediaVoiceCommand,
  type MultimediaTabId,
  type MultimediaBrushModeId,
  type MultimediaPaintDirection,
} from '../../../utils/multimedia-voice';

type Tab = 'canvas' | 'audio' | 'data';
type BrushMode = 'particles' | 'waves' | 'ink';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  alpha: number;
  life: number;
  color?: string;
}

interface WeatherPoint {
  city: string;
  temp: number;
  humidity: number;
  icon: string;
  color: string;
}

type BrushColor = { label: string; hue: number; color: string };

const BRUSH_COLORS: BrushColor[] = [
  { label: 'Rojo',     hue: 0,   color: '#ff4d4d' },
  { label: 'Naranja',  hue: 30,  color: '#ff944d' },
  { label: 'Amarillo', hue: 55,  color: '#ffd84d' },
  { label: 'Verde',    hue: 120, color: '#4dff88' },
  { label: 'Cian',     hue: 185, color: '#4de6ff' },
  { label: 'Azul',     hue: 220, color: '#4d79ff' },
  { label: 'Violeta',  hue: 270, color: '#9a4dff' },
  { label: 'Rosa',     hue: 320, color: '#ff4dc4' },
];

@Component({
  selector: 'app-multimedia',
  standalone: true,
  imports: [CommonModule, FormsModule, SpeakableDirective],
  templateUrl: './multimedia.html',
  styleUrls: ['./multimedia.scss'],
})
export class Multimedia implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private hostRef = inject(ElementRef) as ElementRef<HTMLElement>;
  ui = inject(UiStateService);
  readonly keyboardNav = inject(KeyboardNavService);
  readonly voiceNav = inject(VoiceNavigationService);
  color = inject(ColorService);
  private readonly multimediaVoiceBridge = inject(MultimediaVoiceBridgeService);
  private cdr = inject(ChangeDetectorRef);

  activeTab = signal<Tab>('canvas');
  tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'canvas', label: 'Lienzo generativo', icon: '✦' },
    { id: 'audio',  label: 'Audio reactivo',    icon: '◎' },
    { id: 'data',   label: 'Datos en vivo',     icon: '◈' },
  ];

  voicePaintMode = signal(false);
  direccionPinturaVoz = signal<MultimediaPaintDirection | null>(null);

  private readonly VOZ_PINTURA_PASO = 50;
  private noteVoiceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly NOTE_VOICE_HOLD_MS = 2000;

  constructor() {
    effect(() => {
      this.activeTab();
      this.voicePaintMode();
      if (isPlatformBrowser(this.platformId)) {
        this.syncVoiceDomState();
      }
    });
  }

  tabVoiceHint(tab: MultimediaTabId): string {
    return multimediaTabHint(tab);
  }

  noteVoiceHint(index: number): string {
    return multimediaNoteHint(index);
  }

  brushModeVoiceHint(mode: BrushMode): string {
    return multimediaBrushModeHint(mode);
  }

  cityVoiceHint(city: string): string {
    return city.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  }

  setTab(tab: Tab) {
    this.voicePaintMode.set(false);
    this.direccionPinturaVoz.set(null);
    this.stopKbPaint();
    if (tab !== 'canvas') {
      this.releaseCanvasContext();
      this.particles = [];
    }
    this.activeTab.set(tab);
    if (tab === 'canvas') setTimeout(() => this.initCanvas(), 50);
    if (tab === 'audio') this.stopAudio();
    if (tab === 'data') this.loadWeather();
    this.syncVoiceDomState();
  }

  private syncVoiceDomState(): void {
    const paint = this.voicePaintMode();
    setMultimediaVoicePaintActive(paint);
    const el = this.hostRef.nativeElement;
    el.setAttribute('data-mm-voice-tab', this.activeTab());
    el.setAttribute('data-mm-voice-paint', paint ? '1' : '0');
  }

  @ViewChild('canvasEl') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasWrap') canvasWrapRef!: ElementRef<HTMLElement>;

  readonly brushModes: { id: BrushMode; label: string }[] = [
    { id: 'particles', label: 'Partículas' },
    { id: 'waves', label: 'Ondas' },
    { id: 'ink', label: 'Tinta' },
  ];

  brushMode   = signal<BrushMode>('particles');
  brushSize   = signal(18);

  readonly brushColors = computed<BrushColor[]>(() => {
    const mode = this.color.colorActivo();
    if (mode === 'daltonismo1') {
      return [
        { label: 'Blanco',  hue: 0,   color: '#ffffff' },
        { label: 'Amarillo',hue: 45,  color: '#ffb000' },
        { label: 'Naranja', hue: 24,  color: '#fe6100' },
        { label: 'Fucsia',  hue: 330, color: '#dc267f' },
        { label: 'Violeta', hue: 255, color: '#785ef0' },
        { label: 'Azul',    hue: 220, color: '#648fff' },
      ];
    }
    if (mode === 'daltonismo2') {
      return [
        { label: 'Blanco',      hue: 0, color: '#ffffff' },
        { label: 'Gris claro',  hue: 0, color: '#d9d9d9' },
        { label: 'Gris medio',  hue: 0, color: '#b3b3b3' },
        { label: 'Gris',        hue: 0, color: '#8c8c8c' },
        { label: 'Gris oscuro', hue: 0, color: '#666666' },
        { label: 'Negro',       hue: 0, color: '#333333' },
      ];
    }
    return BRUSH_COLORS;
  });
  selectedColorIdx = signal(0);

  get currentHue(): number {
    return this.brushColors()[this.selectedColorIdx()]?.hue ?? 0;
  }

  get currentColorHex(): string {
    return this.brushColors()[this.selectedColorIdx()]?.color ?? '#ffffff';
  }

  private static readonly CANVAS_BG = '#0a0a0f';

  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  public isDrawing = false;
  private rafId = 0;
  private lastX = 0;
  private lastY = 0;
  private hueAnim = 0;
  private canvasCssW = 0;
  private canvasCssH = 0;
  private dpr = 1;

  private releaseCanvasContext(): void {
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.ctx = null;
    this.canvasCssW = 0;
    this.canvasCssH = 0;
  }

  private isCanvasContextValid(): boolean {
    const canvas = this.canvasRef?.nativeElement;
    return !!(
      this.ctx &&
      canvas &&
      this.ctx.canvas === canvas &&
      this.canvasCssW > 0 &&
      this.canvasCssH > 0
    );
  }

  private fillCanvasBackground(): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = Multimedia.CANVAS_BG;
    this.ctx.fillRect(0, 0, this.canvasCssW, this.canvasCssH);
  }

  private startCanvasLoop(): void {
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.ngZone.runOutsideAngular(() => this.animateCanvas());
  }

  private setupCanvasContext(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;

    this.canvasCssW = rect.width;
    this.canvasCssH = rect.height;
    this.dpr = Math.max(1, Math.floor((window.devicePixelRatio || 1) * 100) / 100);

    canvas.width = Math.round(this.canvasCssW * this.dpr);
    canvas.height = Math.round(this.canvasCssH * this.dpr);

    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return false;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.fillCanvasBackground();
    this.startCanvasLoop();
    return true;
  }

  initCanvas() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.setupCanvasContext()) return;
    requestAnimationFrame(() => this.initCanvas());
  }

  animateCanvas() {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    this.hueAnim += 0.3;

    if (this.brushMode() !== 'ink') {
      this.ctx.fillStyle = 'rgba(10,10,15,0.08)';
      this.ctx.fillRect(0, 0, this.canvasCssW, this.canvasCssH);
    }

    const newParticles: Particle[] = [];
    for (const p of this.particles) {
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += 0.04;
      p.vx   *= 0.995;
      p.life -= 1.2;

      if (p.life > 0) {
        p.alpha = Math.max(0, p.life / 120);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius * (p.life / 120), 0, Math.PI * 2);
        this.ctx.fillStyle = p.color ?? `hsla(${p.hue},90%,65%,${p.alpha})`;
        this.ctx.fill();
        newParticles.push(p);
      }
    }
    this.particles = newParticles;

    this.rafId = requestAnimationFrame(() => this.animateCanvas());
  }

  private canvasPointFromClient(clientX: number, clientY: number) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  onCanvasMouseMove(e: MouseEvent) {
    if (!this.isDrawing) return;
    const { x, y } = this.canvasPointFromClient(e.clientX, e.clientY);
    const speed = Math.hypot(x - this.lastX, y - this.lastY);
    this.spawnAt(x, y, speed);
    this.lastX = x;
    this.lastY = y;
  }

  onCanvasTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (!this.isDrawing) return;
    const t     = e.touches[0];
    const { x, y } = this.canvasPointFromClient(t.clientX, t.clientY);
    this.spawnAt(x, y, 10);
    this.lastX = x;
    this.lastY = y;
  }

  startDraw(e: MouseEvent) {
    this.isDrawing = true;
    const { x, y } = this.canvasPointFromClient(e.clientX, e.clientY);
    this.lastX = x;
    this.lastY = y;
  }

  startDrawTouch(e: TouchEvent) {
    e.preventDefault();
    this.isDrawing = true;
    const t = e.touches[0];
    if (!t) return;
    const { x, y } = this.canvasPointFromClient(t.clientX, t.clientY);
    this.lastX = x;
    this.lastY = y;
  }

  stopDraw() { this.isDrawing = false; }

  private ensureCanvasReady(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    if (!this.canvasRef?.nativeElement) return false;

    if (!this.isCanvasContextValid()) {
      this.releaseCanvasContext();
      if (!this.setupCanvasContext()) {
        this.initCanvas();
      }
    } else if (!this.rafId) {
      this.startCanvasLoop();
    }

    return this.isCanvasContextValid();
  }

  private spawnAt(x: number, y: number, speed: number) {
    if (!this.ctx) return;
    const size = this.brushSize();
    const hue  = this.currentHue;
    const baseColor = this.currentColorHex;

    const MAX_PARTICLES = 1000;
    if (this.particles.length > MAX_PARTICLES) {
      this.particles.splice(0, this.particles.length - MAX_PARTICLES);
    }

    if (this.brushMode() === 'particles') {
      const count = Math.max(4, Math.floor(speed * 0.6) + 2);
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x, y,
          vx:     (Math.random() - 0.5) * speed * 0.25,
          vy:     (Math.random() - 0.5) * speed * 0.25 - 1.5,
          radius: Math.random() * size * 0.5 + 2,
          hue:    hue + Math.random() * 30 - 15,
          alpha:  1,
          life:   80 + Math.random() * 40,
          color:  this.hexToRgba(baseColor, 1),
        });
      }
    } else if (this.brushMode() === 'waves') {
      const wavesCount = 8;
      for (let j = 0; j < wavesCount; j++) {
        const angle = (j / wavesCount) * Math.PI * 2;
        const dist  = 18 + Math.random() * size * 1.2;
        this.particles.push({
          x: x + Math.cos(angle) * dist,
          y: y + Math.sin(angle) * dist,
          vx: Math.cos(angle) * 0.5,
          vy: Math.sin(angle) * 0.5,
          radius: size * (0.25 + Math.random() * 0.4),
          hue:    hue + j * (360 / wavesCount),
          alpha:  0.9,
          life:   60 + Math.random() * 30,
          color:  this.hexToRgba(baseColor, 0.9),
        });
      }
    } else {
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.strokeStyle = this.hexToRgba(baseColor, 0.92);
      this.ctx.lineWidth   = size * 0.4;
      this.ctx.lineCap     = 'round';
      this.ctx.lineJoin    = 'round';
      this.ctx.stroke();
    }
  }

  private hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3
      ? normalized.split('').map(ch => ch + ch).join('')
      : normalized;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  clearCanvas() {
    if (!this.ctx) return;
    this.particles = [];
    this.fillCanvasBackground();
  }

  audioCtx: AudioContext | null = null;

  analyserViz: AnalyserNode | null = null;
  analyserPitch: AnalyserNode | null = null;

  micStream: MediaStream | null = null;
  isListening = signal(false);
  audioError  = signal('');
  freqBars    = signal<number[]>(Array(32).fill(0));
  volume      = signal(0);
  dominantHz  = signal(0);
  private audioRaf = 0;

  readonly NOTE_NAMES = ['Do','Do#','Re','Re#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si'];

  dominantNote = computed(() => {
    const hz = this.dominantHz();
    if (hz < 20) return '—';
    const semitones = Math.round(12 * Math.log2(hz / 440)) + 69;
    const idx = ((semitones % 12) + 12) % 12;
    return this.NOTE_NAMES[idx];
  });

  async toggleMic() {
    if (this.isListening()) { this.stopAudio(); return; }
    try {
      this.audioError.set('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micStream = stream;
      this.audioCtx  = new AudioContext();
      const src = this.audioCtx.createMediaStreamSource(stream);

      this.analyserViz = this.audioCtx.createAnalyser();
      this.analyserViz.fftSize = 64;
      src.connect(this.analyserViz);

      this.analyserPitch = this.audioCtx.createAnalyser();
      this.analyserPitch.fftSize = 2048;
      this.analyserPitch.smoothingTimeConstant = 0.85;
      src.connect(this.analyserPitch);

      this.isListening.set(true);
      this.ngZone.runOutsideAngular(() => this.readAudio());
    } catch {
      this.audioError.set('Permiso de micrófono denegado o no disponible.');
    }
  }

  private readAudio() {
    if (!this.analyserViz || !this.analyserPitch || !this.isListening()) return;

    const vizData = new Uint8Array(this.analyserViz.frequencyBinCount);
    this.analyserViz.getByteFrequencyData(vizData);
    const bars = Array.from(vizData).map(v => v / 255);
    const vol  = bars.reduce((a, b) => a + b, 0) / bars.length;

    const pitchData = new Float32Array(this.analyserPitch.frequencyBinCount);
    this.analyserPitch.getFloatFrequencyData(pitchData);

    const sampleRate = this.audioCtx!.sampleRate;
    const binHz = sampleRate / this.analyserPitch.fftSize;
    const minBin = Math.floor(80  / binHz);
    const maxBin = Math.ceil(1100 / binHz);

    let maxVal = -Infinity;
    let maxIdx = minBin;
    for (let i = minBin; i <= maxBin && i < pitchData.length; i++) {
      if (pitchData[i] > maxVal) {
        maxVal = pitchData[i];
        maxIdx = i;
      }
    }

    const hz = maxVal > -60 ? Math.round(maxIdx * binHz) : 0;

    this.ngZone.run(() => {
      this.freqBars.set(bars);
      this.volume.set(Math.round(vol * 100));
      this.dominantHz.set(hz);
    });

    this.audioRaf = requestAnimationFrame(() => this.readAudio());
  }

  stopAudio() {
    cancelAnimationFrame(this.audioRaf);
    this.micStream?.getTracks().forEach(t => t.stop());
    this.audioCtx?.close();
    this.analyserViz   = null;
    this.analyserPitch = null;
    this.isListening.set(false);
    this.freqBars.set(Array(32).fill(0));
    this.volume.set(0);
    this.dominantHz.set(0);
  }

  synthNotes = [
    { label: 'Do',  hz: 261.63 },
    { label: 'Re',  hz: 293.66 },
    { label: 'Mi',  hz: 329.63 },
    { label: 'Fa',  hz: 349.23 },
    { label: 'Sol', hz: 392.00 },
    { label: 'La',  hz: 440.00 },
    { label: 'Si',  hz: 493.88 },
    { label: 'Do₂', hz: 523.25 },
  ];
  activeNote = signal<number | null>(null);
  private oscNode:  OscillatorNode | null = null;
  private gainNode: GainNode       | null = null;

  playNote(hz: number, idx: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    this.stopNote();
    if (!this.audioCtx) this.audioCtx = new AudioContext();
    if (this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }
    this.oscNode  = this.audioCtx.createOscillator();
    this.gainNode = this.audioCtx.createGain();
    this.oscNode.type = 'sine';
    this.oscNode.frequency.setValueAtTime(hz, this.audioCtx.currentTime);
    this.gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    this.oscNode.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
    this.oscNode.start();
    this.activeNote.set(idx);
  }

  stopNote() {
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    }
    this.oscNode?.stop();
    this.oscNode  = null;
    this.gainNode = null;
    this.activeNote.set(null);
  }

  weatherData  = signal<WeatherPoint[]>([]);
  weatherLoad  = signal(false);
  weatherError = signal('');
  selectedCity = signal<WeatherPoint | null>(null);

  private readonly CITIES = [
    { name: 'Madrid',    lat: 40.4,  lon: -3.7  },
    { name: 'Barcelona', lat: 41.4,  lon: 2.2   },
    { name: 'Valencia',  lat: 39.5,  lon: -0.4  },
    { name: 'Sevilla',   lat: 37.4,  lon: -6.0  },
    { name: 'Bilbao',    lat: 43.3,  lon: -2.9  },
    { name: 'Málaga',    lat: 36.7,  lon: -4.4  },
  ];

  async loadWeather() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.weatherLoad.set(true);
    this.weatherError.set('');
    try {
      const results = await Promise.all(
        this.CITIES.map(c =>
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
          )
            .then(r => r.json())
        )
      );
      const points: WeatherPoint[] = results.map((r, i) => {
        const temp = Math.round(r.current.temperature_2m);
        return {
          city:     this.CITIES[i].name,
          temp,
          humidity: r.current.relative_humidity_2m,
          icon:     this.weatherIcon(r.current.weather_code),
          color:    this.tempColor(temp),
        };
      });
      this.weatherData.set(points);
    } catch {
      this.weatherError.set('No se pudo cargar la API meteorológica.');
    } finally {
      this.weatherLoad.set(false);
    }
  }

  private weatherIcon(code: number): string {
    if (code === 0)  return '☀️';
    if (code <= 3)   return '⛅';
    if (code <= 48)  return '🌫️';
    if (code <= 67)  return '🌧️';
    if (code <= 77)  return '❄️';
    if (code <= 82)  return '🌦️';
    return '⛈️';
  }

  private tempColor(t: number): string {
    const mode = this.color.colorActivo();

    if (mode === 'daltonismo2') {
      if (t <= 5)  return '#1f1f1f';
      if (t <= 15) return '#333333';
      if (t <= 25) return '#4d4d4d';
      return '#666666';
    }

    if (mode === 'daltonismo1') {
      if (t <= 5)  return '#1b3a8a';
      if (t <= 15) return '#3b4cc0';
      if (t <= 25) return '#5e3a9e';
      return '#7a1f6a';
    }

    if (t <= 5)  return '#60a5fa';
    if (t <= 15) return '#34d399';
    if (t <= 25) return '#fbbf24';
    return '#f87171';
  }

  selectCity(c: WeatherPoint) {
    this.selectedCity.set(this.selectedCity()?.city === c.city ? null : c);
  }

  maxTemp = computed(() =>
    this.weatherData().length
      ? Math.max(...this.weatherData().map(d => d.temp))
      : 40
  );

  private kbX = 0;
  private kbY = 0;
  private kbDir: { dx: -1 | 0 | 1; dy: -1 | 0 | 1 } = { dx: 0, dy: 0 };
  private kbTimer: ReturnType<typeof setInterval> | null = null;
  private readonly KB_STEP = 8;
  private readonly KB_TICK_MS = 16;

  private isCanvasWrapFocused(): boolean {
    return !!this.canvasWrapRef && document.activeElement === this.canvasWrapRef.nativeElement;
  }

  private readonly onCanvasWrapKeyDown = (e: KeyboardEvent) => {
    if (!this.isCanvasWrapFocused()) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      this.exitCanvasPaintMode();
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      if (e.repeat) return;

      this.kbDir = {
        dx: e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0,
        dy: e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0,
      };
      this.startKbPaint();
      return;
    }
  };

  private readonly onCanvasWrapKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && this.kbDir.dx === -1) this.kbDir.dx = 0;
    if (e.key === 'ArrowRight' && this.kbDir.dx === 1) this.kbDir.dx = 0;
    if (e.key === 'ArrowUp' && this.kbDir.dy === -1) this.kbDir.dy = 0;
    if (e.key === 'ArrowDown' && this.kbDir.dy === 1) this.kbDir.dy = 0;
    if (this.kbDir.dx === 0 && this.kbDir.dy === 0) this.stopKbPaint();
  };

  private startKbPaint() {
    if (this.kbTimer !== null) return;
    if (this.canvasCssW === 0 || this.canvasCssH === 0) {
      this.initCanvas();
    }

    if (this.kbX === 0 && this.kbY === 0 && this.canvasCssW > 0) {
      this.kbX = this.canvasCssW / 2;
      this.kbY = this.canvasCssH / 2;
    }
    this.lastX = this.kbX;
    this.lastY = this.kbY;
    this.isDrawing = true;

    this.kbTimer = setInterval(() => {
      if (!this.isCanvasWrapFocused()) {
        this.stopKbPaint();
        return;
      }
      const newX = Math.max(0, Math.min(this.canvasCssW, this.kbX + this.kbDir.dx * this.KB_STEP));
      const newY = Math.max(0, Math.min(this.canvasCssH, this.kbY + this.kbDir.dy * this.KB_STEP));
      const speed = Math.hypot(newX - this.kbX, newY - this.kbY);
      this.kbX = newX;
      this.kbY = newY;
      if (speed > 0) {
        this.spawnAt(this.kbX, this.kbY, speed * 4);
        this.lastX = this.kbX;
        this.lastY = this.kbY;
      }
    }, this.KB_TICK_MS);
  }

  private stopKbPaint() {
    this.kbDir = { dx: 0, dy: 0 };
    this.isDrawing = false;
    if (this.kbTimer !== null) {
      clearInterval(this.kbTimer);
      this.kbTimer = null;
    }
  }

  private exitCanvasPaintMode() {
    this.stopKbPaint();
    const root = this.hostRef.nativeElement;
    const firstTool = root.querySelector<HTMLElement>('[data-mu-role="tool"]');
    firstTool?.focus();
  }

  onKeyNoteDown(hz: number, idx: number, e: Event): void {
    const ke = e as KeyboardEvent;
    ke.preventDefault();
    ke.stopPropagation();
    if (ke.repeat) return;
    if (this.activeNote() === idx) return;
    this.playNote(hz, idx);
  }

  onKeyNoteUp(e: Event): void {
    const ke = e as KeyboardEvent;
    ke.preventDefault();
    ke.stopPropagation();
    this.stopNote();
  }

  activarPinturaVoz(): void {
    if (this.activeTab() !== 'canvas') return;
    this.voicePaintMode.set(true);
    this.syncVoiceDomState();

    if (!this.ensureCanvasReady()) {
      setTimeout(() => this.colocarPincelCentroVoz(), 120);
      return;
    }
    this.colocarPincelCentroVoz();
  }

  private colocarPincelCentroVoz(): void {
    if (!this.voicePaintMode() || !this.ensureCanvasReady()) return;
    this.kbX = this.canvasCssW / 2;
    this.kbY = this.canvasCssH / 2;
    this.lastX = this.kbX;
    this.lastY = this.kbY;
    this.isDrawing = true;
    this.spawnAt(this.kbX, this.kbY, 14);
    this.cdr.markForCheck();
  }

  salirPinturaVoz(): void {
    this.voicePaintMode.set(false);
    this.direccionPinturaVoz.set(null);
    this.isDrawing = false;
    this.syncVoiceDomState();
    this.cdr.markForCheck();
  }

  private moverPinturaVoz(direccion: MultimediaPaintDirection, reintento = 0): void {
    if (!this.voicePaintMode()) return;
    if (!this.ensureCanvasReady()) {
      if (reintento < 6) {
        setTimeout(() => this.moverPinturaVoz(direccion, reintento + 1), 100);
      }
      return;
    }

    this.direccionPinturaVoz.set(direccion);
    const prevX = this.kbX;
    const prevY = this.kbY;
    switch (direccion) {
      case 1:
        this.kbX -= this.VOZ_PINTURA_PASO;
        break;
      case 2:
        this.kbY -= this.VOZ_PINTURA_PASO;
        break;
      case 3:
        this.kbX += this.VOZ_PINTURA_PASO;
        break;
      case 4:
        this.kbY += this.VOZ_PINTURA_PASO;
        break;
    }
    this.kbX = Math.max(0, Math.min(this.canvasCssW, this.kbX));
    this.kbY = Math.max(0, Math.min(this.canvasCssH, this.kbY));
    const speed = Math.max(8, Math.hypot(this.kbX - prevX, this.kbY - prevY));
    this.isDrawing = true;
    this.spawnAt(this.kbX, this.kbY, speed * 4);
    this.lastX = this.kbX;
    this.lastY = this.kbY;
    this.cdr.markForCheck();
  }

  private ajustarTamanoVoz(delta: number): void {
    this.brushSize.set(Math.max(5, Math.min(50, this.brushSize() + delta)));
  }

  private tocarNotaVoz(index: number): void {
    const note = this.synthNotes[index];
    if (!note) return;
    if (this.noteVoiceTimer) clearTimeout(this.noteVoiceTimer);
    this.playNote(note.hz, index);
    this.noteVoiceTimer = setTimeout(() => {
      this.stopNote();
      this.noteVoiceTimer = null;
      this.cdr.markForCheck();
    }, this.NOTE_VOICE_HOLD_MS);
  }

  private seleccionarColorVoz(index1Based: number): void {
    const max = this.brushColors().length;
    const idx = Math.max(1, Math.min(max, index1Based)) - 1;
    this.selectedColorIdx.set(idx);
    this.cdr.markForCheck();
  }

  private readonly handleMultimediaVoice = (cmd: MultimediaVoiceCommand): void => {
    switch (cmd.action) {
      case 'tab':
        this.setTab(cmd.tab);
        break;
      case 'brushMode':
        this.brushMode.set(cmd.mode);
        break;
      case 'color':
        this.seleccionarColorVoz(cmd.index);
        break;
      case 'brushSize':
        this.ajustarTamanoVoz(cmd.delta);
        break;
      case 'clear':
        if (this.ctx) this.clearCanvas();
        break;
      case 'paintStart':
        this.activarPinturaVoz();
        break;
      case 'paintExit':
        this.salirPinturaVoz();
        break;
      case 'paintMove':
        this.moverPinturaVoz(cmd.direction);
        break;
      case 'micToggle':
        void this.toggleMic();
        break;
      case 'note': {
        this.tocarNotaVoz(cmd.index);
        break;
      }
      case 'refreshWeather':
        void this.loadWeather();
        break;
      case 'city': {
        const point = this.weatherData().find(
          w => w.city.toLowerCase() === cmd.city.toLowerCase()
        );
        if (point) this.selectCity(point);
        break;
      }
    }
    this.cdr.markForCheck();
  };

  private readonly onMultimediaVoiceEvent = (ev: Event): void => {
    const detail = (ev as CustomEvent<MultimediaVoiceCommand>).detail;
    if (detail) this.ngZone.run(() => this.handleMultimediaVoice(detail));
  };

  ngAfterViewInit() {
    this.syncVoiceDomState();
    this.multimediaVoiceBridge.connect(cmd =>
      this.ngZone.run(() => this.handleMultimediaVoice(cmd))
    );
    window.addEventListener(VOICE_MULTIMEDIA_ACTION_EVENT, this.onMultimediaVoiceEvent);

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initCanvas(), 80);
      this.ngZone.runOutsideAngular(() => {
        window.addEventListener('keydown', this.onCanvasWrapKeyDown, true);
        window.addEventListener('keyup', this.onCanvasWrapKeyUp, true);
      });
    }
  }

  ngOnDestroy() {
    if (this.noteVoiceTimer) clearTimeout(this.noteVoiceTimer);
    this.multimediaVoiceBridge.disconnect();
    window.removeEventListener(VOICE_MULTIMEDIA_ACTION_EVENT, this.onMultimediaVoiceEvent);
    this.releaseCanvasContext();
    this.stopAudio();
    this.stopNote();
    this.stopKbPaint();
    window.removeEventListener('keydown', this.onCanvasWrapKeyDown, true);
    window.removeEventListener('keyup', this.onCanvasWrapKeyUp, true);
  }
}
