import {
  Component,
  signal,
  computed,
  inject,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { UiStateService } from '../../../services/ui-state.service';
import { SpeakableDirective } from '../../../directives/app-speakable';
import {
  VOICE_FILTROS_ACTION_EVENT,
  VOICE_IMAGEN_FILTROS_COLLAPSE_EVENT,
  VOICE_IMAGEN_FILTROS_DEPLOY_EVENT,
} from '../../../utils/imagen-voice-dom';
import {
  VoiceNavigationService,
  type FiltrosVoiceDetail,
} from '../../../services/voice-navigation.service';
import { FiltrosVoiceBridgeService } from '../../../services/filtros-voice-bridge.service';
import {
  FILTROS_VOICE,
  filtroMeta,
  type FiltroKey,
  type FiltrosVoiceParsed,
} from '../../../utils/imagen-filtros-voice';

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
  grayscale: number;
  invert: number;
  blur: number;
  hueRotate: number;
  opacity: number;
  shadow: number;
  temperature: number;
  pixelate: number;
}

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [SpeakableDirective],
  templateUrl: './filtros.html',
  styleUrls: ['./filtros.scss'],
})
export class Filtros implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly filtrosVoiceBridge = inject(FiltrosVoiceBridgeService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  ui = inject(UiStateService);
  readonly voiceNav = inject(VoiceNavigationService);
  readonly filtrosVozLista = FILTROS_VOICE;

  readonly filtrosSeccionVozActiva = signal(false);
  readonly filtroVozActivo = signal<FiltroKey | null>(null);

  imagenFiltro = this.ui.hoverSwap(
    'assets/imagenes/imagen/aplicacionFiltros.jpg',
    'assets/imagenes/imagen/aplicacionFiltrosHover.jpg'
  );

  filters = signal<ImageFilters>({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    sepia: 0,
    grayscale: 0,
    invert: 0,
    blur: 0,
    hueRotate: 0,
    opacity: 100,
    shadow: 0,
    temperature: 0,
    pixelate: 0,
  });

  pistaFiltro(clave: FiltroKey): string {
    return filtroMeta(clave).hintLabel;
  }

  setFilter(key: FiltroKey, event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.filters.update(f => ({ ...f, [key]: value }));
  }

  private setFilterValue(key: FiltroKey, value: number) {
    const meta = filtroMeta(key);
    const clamped = Math.min(meta.max, Math.max(meta.min, Math.round(value)));
    this.filters.update(f => ({ ...f, [key]: clamped }));
    this.syncSliderDom(key, clamped);
  }

  private sliderInput(key: FiltroKey): HTMLInputElement | null {
    return this.host.nativeElement.querySelector(
      `input[data-filter-key="${key}"]`
    ) as HTMLInputElement | null;
  }

  private syncSliderDom(key: FiltroKey, value: number) {
    const input = this.sliderInput(key);
    if (input) input.value = String(value);
  }

  private focusSlider(key: FiltroKey) {
    const input = this.sliderInput(key);
    if (!input) return;
    input.focus({ preventScroll: true });
    const ranges = this.host.nativeElement.querySelectorAll('input[type="range"]');
    ranges.forEach((el: Element) => {
      (el as HTMLInputElement).classList.remove('slider-editing');
    });
    input.classList.add('slider-editing');
  }

  seleccionarFiltroVoz(clave: FiltroKey) {
    this.filtroVozActivo.set(clave);
    this.focusSlider(clave);
  }

  salirFiltroVoz() {
    const key = this.filtroVozActivo();
    if (key) {
      const input = this.sliderInput(key);
      input?.classList.remove('slider-editing');
      input?.blur();
    }
    this.filtroVozActivo.set(null);
  }

  ajustarFiltroVoz(deltas: number[]) {
    const key = this.filtroVozActivo();
    if (!key || !deltas.length) return;
    let value = this.filters()[key];
    for (const delta of deltas) {
      value += delta;
    }
    this.setFilterValue(key, value);
  }

  private applyVoiceParsed(parsed: FiltrosVoiceParsed) {
    switch (parsed.kind) {
      case 'seleccionar':
        this.seleccionarFiltroVoz(parsed.clave);
        break;
      case 'ajustar':
        this.ajustarFiltroVoz(parsed.deltas);
        break;
      case 'salir':
        this.salirFiltroVoz();
        break;
    }
  }

  imageFilter = computed(() => {
    const f = this.filters();
    const tempSepia = f.temperature > 0 ? f.temperature * 0.3 : 0;
    const tempHue = f.temperature > 0 ? -f.temperature * 0.1 : -f.temperature * 0.15;
    const tempSat = f.temperature < 0 ? 100 + f.temperature * 0.4 : 100;
    const pixelateEffect = f.pixelate > 0 ? `url(#pixelate-filter)` : '';

    return [
      `brightness(${f.brightness}%)`,
      `contrast(${f.contrast}%)`,
      `saturate(${f.saturate * (tempSat / 100)}%)`,
      `sepia(${f.sepia + tempSepia}%)`,
      `grayscale(${f.grayscale}%)`,
      `invert(${f.invert}%)`,
      `blur(${f.blur}px)`,
      `hue-rotate(${f.hueRotate + tempHue}deg)`,
      `opacity(${f.opacity}%)`,
      f.shadow > 0 ? `drop-shadow(0 0 ${f.shadow}px rgba(0,0,0,0.5))` : '',
      pixelateEffect,
    ]
      .filter(Boolean)
      .join(' ');
  });

  private readonly handleFiltrosVoice = (detail: FiltrosVoiceDetail) => {
    this.ngZone.run(() => {
      if (detail.action === 'lote' && detail.comandos?.length) {
        for (const cmd of detail.comandos) this.applyVoiceParsed(cmd);
      } else if (detail.action === 'seleccionar' && detail.clave) {
        this.seleccionarFiltroVoz(detail.clave as FiltroKey);
      } else if (detail.action === 'ajustar') {
        this.ajustarFiltroVoz(detail.deltas);
      } else if (detail.action === 'salir') {
        this.salirFiltroVoz();
      }
      this.cdr.markForCheck();
    });
  };

  private readonly onFiltrosVoiceEvent = ((ev: Event) => {
    const detail = (ev as CustomEvent<FiltrosVoiceDetail>).detail;
    if (detail?.action) this.handleFiltrosVoice(detail);
  }) as EventListener;

  private readonly onVoiceFiltrosDeploy = () => {
    this.ngZone.run(() => {
      this.filtrosSeccionVozActiva.set(true);
      this.cdr.markForCheck();
    });
  };

  private readonly onVoiceFiltrosCollapse = () => {
    this.ngZone.run(() => {
      this.filtrosSeccionVozActiva.set(false);
      this.salirFiltroVoz();
      this.cdr.markForCheck();
    });
  };

  private viewportObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.filtrosVoiceBridge.connect(this.handleFiltrosVoice);
    window.addEventListener(VOICE_FILTROS_ACTION_EVENT, this.onFiltrosVoiceEvent);
    window.addEventListener(VOICE_IMAGEN_FILTROS_DEPLOY_EVENT, this.onVoiceFiltrosDeploy);
    window.addEventListener(VOICE_IMAGEN_FILTROS_COLLAPSE_EVENT, this.onVoiceFiltrosCollapse);

    const editor = this.host.nativeElement.querySelector('.editor-window');
    if (editor && typeof IntersectionObserver !== 'undefined') {
      this.viewportObserver = new IntersectionObserver(
        entries => {
          const visible = entries.some(e => e.isIntersecting && e.intersectionRatio >= 0.35);
          this.ngZone.run(() => {
            this.filtrosSeccionVozActiva.set(visible);
            this.cdr.markForCheck();
          });
        },
        { threshold: [0, 0.35, 0.55] }
      );
      this.viewportObserver.observe(editor);
    }
  }

  ngOnDestroy(): void {
    this.viewportObserver?.disconnect();
    this.filtrosVoiceBridge.disconnect();
    window.removeEventListener(VOICE_FILTROS_ACTION_EVENT, this.onFiltrosVoiceEvent);
    window.removeEventListener(VOICE_IMAGEN_FILTROS_DEPLOY_EVENT, this.onVoiceFiltrosDeploy);
    window.removeEventListener(VOICE_IMAGEN_FILTROS_COLLAPSE_EVENT, this.onVoiceFiltrosCollapse);
  }
}
