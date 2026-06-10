import { Component, OnInit, OnDestroy, AfterViewInit, NgZone, ChangeDetectorRef, ElementRef, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription, Subject } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { ExplicacionService } from '../../../services/explicacion.service';
import { getSlides, SlidesItem } from '../data/diapositivas';
import { UiStateService } from '../../../services/ui-state.service';
import { SpeakableDirective } from '../../../directives/app-speakable';
import {
  VOICE_AUDIO_ACTION_EVENT,
  VoiceNavigationService,
  type AudioVoiceDetail,
} from '../../../services/voice-navigation.service';
import { voiceHintDisplay } from '../../../utils/voice-hint-display';

@Component({
  selector: 'app-carrusel-audio',
  standalone: true,
  imports: [CommonModule, SpeakableDirective],
  templateUrl: './carrusel-audio.html',
  styleUrls: ['./carrusel-audio.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarruselAudio implements OnInit, OnDestroy, AfterViewInit {

  explicacionService = inject(ExplicacionService);
  ui = inject(UiStateService);
  readonly voiceNav = inject(VoiceNavigationService);
  private host = inject(ElementRef<HTMLElement>);
  private cdr = inject(ChangeDetectorRef);

  readonly hintVer = voiceHintDisplay('ver');
  readonly hintOcultar = voiceHintDisplay('ocultar');
  readonly hintIzquierda = voiceHintDisplay('izquierda');
  readonly hintDerecha = voiceHintDisplay('derecha');

  diapositivas = computed(() => getSlides(this.explicacionService.nivelActivo()));

  indiceActual = signal(0);
  indiceSaliente = signal(-1);

  puntoEnfocado = signal(false);
  infoPorVoz = signal(false);
  hoverRatonEnActiva = signal(false);

  readonly DURACION = 6000;

  private reiniciar$ = new Subject<void>();
  private sub = new Subscription();

  pausado = false;

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    const auto$ = this.reiniciar$.pipe(
      startWith(null),
      switchMap(() => interval(this.DURACION))
    );

    this.sub = auto$.subscribe(() => {
      this.avanzar();
    });
  }

  private focusPollIntervalId?: number;
  private lastFocusedPunto: HTMLElement | null = null;

  hoverSlideActivo(i: number): boolean {
    return i === this.indiceActual() && (this.infoPorVoz() || this.hoverRatonEnActiva());
  }

  mostrarInfoEnSlide(i: number): boolean {
    return this.hoverSlideActivo(i) || (i === this.indiceActual() && this.puntoEnfocado());
  }

  onSlideHover(i: number, activo: boolean): void {
    if (i !== this.indiceActual()) return;
    this.hoverRatonEnActiva.set(activo);
    if (activo) {
      this.pausar();
    } else {
      this.reanudar();
    }
    this.cdr.markForCheck();
  }

  mostrarInfoPorVoz(): void {
    if (this.infoPorVoz()) return;
    this.infoPorVoz.set(true);
    this.pausar();
    this.cdr.markForCheck();
  }

  ocultarInfoPorVoz(): void {
    if (!this.infoPorVoz()) return;
    this.infoPorVoz.set(false);
    this.reanudar();
    this.cdr.markForCheck();
  }

  private readonly onAudioVoiceForCarrusel = ((ev: Event) => {
    const detail = (ev as CustomEvent<AudioVoiceDetail>).detail;
    if (!detail?.action) return;
    this.ngZone.run(() => {
      switch (detail.action) {
        case 'carruselVer':
          this.mostrarInfoPorVoz();
          break;
        case 'carruselOcultar':
          this.ocultarInfoPorVoz();
          break;
        case 'carruselIzquierda':
          this.irAPuntoRelativo(-1);
          break;
        case 'carruselDerecha':
          this.irAPuntoRelativo(1);
          break;
      }
    });
  }) as EventListener;

  ngAfterViewInit(): void {
    window.addEventListener(VOICE_AUDIO_ACTION_EVENT, this.onAudioVoiceForCarrusel);
    this.ngZone.runOutsideAngular(() => {
      this.focusPollIntervalId = window.setInterval(() => {
        const active = document.activeElement as HTMLElement | null;
        if (active === this.lastFocusedPunto) return;

        const root = this.host.nativeElement as HTMLElement;
        const puntos = root.querySelector<HTMLElement>('.puntos');
        const isPuntoOfThisCarrusel =
          !!active && !!puntos && puntos.contains(active) && active.dataset?.['index'] !== undefined;

        if (isPuntoOfThisCarrusel) {
          const i = Number(active!.dataset!['index']);
          if (!Number.isNaN(i)) {
            this.lastFocusedPunto = active;
            this.handlePuntoFocused(i);
          }
        } else {
          if (this.lastFocusedPunto) {
            this.lastFocusedPunto = null;
            this.handlePuntoBlurred();
          }
        }
      }, 80);
    });
  }

  private handlePuntoFocused(i: number): void {
    this.ngZone.run(() => {
      this.puntoEnfocado.set(true);
      this.pausar();
      if (i !== this.indiceActual()) {
        this.cambiarA(i);
      }
      this.cdr.markForCheck();
    });
  }

  private handlePuntoBlurred(): void {
    this.ngZone.run(() => {
      this.puntoEnfocado.set(false);
      this.reanudar();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener(VOICE_AUDIO_ACTION_EVENT, this.onAudioVoiceForCarrusel);
    this.sub.unsubscribe();
    if (this.focusPollIntervalId !== undefined) {
      clearInterval(this.focusPollIntervalId);
      this.focusPollIntervalId = undefined;
    }
  }

  irA(indice: number): void {
    this.ngZone.run(() => {
      this.cambiarA(indice);
      this.reiniciar$.next();
      this.cdr.markForCheck();
    });
  }

  irAPuntoRelativo(delta: -1 | 1): void {
    const total = this.diapositivas().length;
    if (total === 0) return;
    const destino = (this.indiceActual() + delta + total) % total;
    this.irA(destino);
  }

  private avanzar(): void {
    if (this.pausado) return;
    this.cambiarA((this.indiceActual() + 1) % this.diapositivas().length);
    this.cdr.markForCheck();
  }

  private cambiarA(nuevoIndice: number): void {
    if (nuevoIndice !== this.indiceActual()) {
      this.infoPorVoz.set(false);
      this.hoverRatonEnActiva.set(false);
    }
    this.indiceSaliente.set(this.indiceActual());
    this.indiceActual.set(nuevoIndice);
    setTimeout(() => this.indiceSaliente.set(-1), 500);
  }

  pausar() { this.pausado = true; }

  reanudar() {
    if (this.puntoEnfocado() || this.infoPorVoz()) return;
    this.pausado = false;
    this.reiniciar$.next();
  }

  slideSrc(slide: SlidesItem, i: number): string {
    const hover = this.hoverSlideActivo(i) || (i === this.indiceActual() && this.ui.isHovering());
    const base = `assets/imagenes/audio/${slide.baseName}`;
    return hover ? `${base}Hover.${slide.ext}` : `${base}.${slide.ext}`;
  }
}
