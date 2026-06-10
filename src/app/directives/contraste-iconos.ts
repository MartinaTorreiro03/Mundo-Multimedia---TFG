// Implementacion del modulo.
import { Directive, ElementRef, HostBinding, AfterViewInit, OnDestroy, NgZone, Output, EventEmitter, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

type Surface = 'light' | 'dark';

@Directive({
  selector: '[appContrasteIconos]',
  standalone: true
})
export class ContrasteIconosDirective implements AfterViewInit, OnDestroy {
  @HostBinding('class.is-dark') isDark = false;
  @Output() surfaceChange = new EventEmitter<Surface>();

  private router = inject(Router);

  private rafId: number | null = null;
  private lastSurface: Surface | null = null;

  private surfaces: HTMLElement[] = [];

  private onAnyScroll = () => this.schedulePick();
  private onResize = () => this.schedulePick();

  constructor(private el: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.refreshSurfaces();

      document.addEventListener('scroll', this.onAnyScroll, true);
      window.addEventListener('resize', this.onResize, { passive: true });

      this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => {
          requestAnimationFrame(() => {
            this.refreshSurfaces();
            this.schedulePick();
          });
        });

      this.schedulePick();
    });
  }

  ngOnDestroy() {
    document.removeEventListener('scroll', this.onAnyScroll, true);
    window.removeEventListener('resize', this.onResize);

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private refreshSurfaces() {
    this.surfaces = Array.from(document.querySelectorAll<HTMLElement>('[data-surface]'));
  }

  private schedulePick() {
    if (this.rafId) return;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;

      const surface = this.getSurfaceNearHost();
      if (surface) {
        this.emitIfChanged(surface);
        return;
      }

      const fallback = this.getSurfaceByPositionFallback();
      if (fallback) this.emitIfChanged(fallback);
    });
  }

  private getSurfaceNearHost(): Surface | null {
    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();

    const distTop = rect.top;
    const distBottom = window.innerHeight - rect.bottom;
    const distLeft = rect.left;
    const distRight = window.innerWidth - rect.right;

    const min = Math.min(distTop, distBottom, distLeft, distRight);
    const OFFSET = 2;

    let x = rect.left + rect.width / 2;
    let y = rect.top + rect.height / 2;

    if (min === distTop) {
      y = rect.bottom + OFFSET;
    } else if (min === distBottom) {
      y = rect.top - OFFSET;
    } else if (min === distLeft) {
      x = rect.right + OFFSET;
    } else {
      x = rect.left - OFFSET;
    }

    x = Math.round(x);
    y = Math.round(y);

    if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) return null;

    const stack = document.elementsFromPoint(x, y) as HTMLElement[];

    let target: HTMLElement | null = null;
    for (const node of stack) {
      if (!host.contains(node)) {
        target = node;
        break;
      }
    }
    if (!target) return null;

    let el: HTMLElement | null = target;
    while (el) {
      const s = el.getAttribute?.('data-surface');
      if (s === 'dark' || s === 'light') return s;
      el = el.parentElement;
    }

    return null;
  }

  private getSurfaceByPositionFallback(): Surface | null {
    if (!this.surfaces.length) return null;

    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();

    const distTop = rect.top;
    const distBottom = window.innerHeight - rect.bottom;
    const distLeft = rect.left;
    const distRight = window.innerWidth - rect.right;

    const min = Math.min(distTop, distBottom, distLeft, distRight);
    const OFFSET = 2;

    let yLine = rect.top + rect.height / 2;

    if (min === distTop) yLine = rect.bottom + OFFSET;
    else if (min === distBottom) yLine = rect.top - OFFSET;
    else yLine = rect.top + rect.height / 2;

    const ordered = this.surfaces
      .map(el => ({ el, top: el.getBoundingClientRect().top }))
      .sort((a, b) => a.top - b.top);

    let active = ordered[0]?.el ?? null;
    for (const c of ordered) {
      if (c.top <= yLine) active = c.el;
      else break;
    }

    if (!active) return null;

    const s = active.getAttribute('data-surface');
    return (s === 'dark' || s === 'light') ? s : null;
  }

  private emitIfChanged(surface: Surface) {
    if (surface === this.lastSurface) return;
    this.lastSurface = surface;

    this.zone.run(() => {
      this.isDark = surface === 'dark';
      this.surfaceChange.emit(surface);
    });
  }
}