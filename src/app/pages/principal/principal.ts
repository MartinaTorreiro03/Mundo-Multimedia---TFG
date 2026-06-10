import {
  Component,
  inject,
  computed,
  signal,
  AfterViewInit,
  OnDestroy,
  Injector,
  ChangeDetectorRef,
  afterNextRender,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { UiStateService } from '../../services/ui-state.service';

import { Popup } from '../../componentes/popup/popup';
import { Juego } from './juego/juego';
import { Carrusel } from './carrusel/carrusel';

import { ColorService } from '../../services/color.service';
import { PopupThemeService } from '../../services/popup-theme';
import { JUEGO_ORIGINAL_THEME, juegoThemeForMode } from '../../services/popup-theme-vars';

import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

import { explicaciones } from '../../pages/principal/data/explicaciones';
import { ExplicacionService } from '../../services/explicacion.service';
import { getCarrusel1Popup } from './data/carruseles';
import { getCarrusel2Popup } from './data/carruseles';
import { SpeakableDirective } from "../../directives/app-speakable";
import {
  VOICE_PRINCIPAL_ACTION_EVENT,
  VOICE_CARRUSEL_STEP_EVENT,
  VoiceNavigationService,
  type PrincipalVoiceAction,
  type PrincipalVoiceDetail,
} from '../../services/voice-navigation.service';
import { PrincipalVoiceBridgeService } from '../../services/principal-voice-bridge.service';
import { JUEGO_FOCUS_FIRST_EVENT, JUEGO_RESET_EVENT } from './juego/juego-focus.events';
import { KeyboardNavService } from '../../services/keyboard-nav.service';

type PopupId = 'juego' | 'carrusel' | null;

type CarouselItem = {
  src: string;
  hover?: string;
  title?: string;
};

type CarouselItemPopup = {
  src: string;
  title: string;
  text: string;
};

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [NgIf, Popup, Juego, Carrusel, ScrollRevealDirective, SpeakableDirective],
  templateUrl: './principal.html',
  styleUrl: './principal.scss'
})
export class Principal implements AfterViewInit, OnDestroy {
  ui = inject(UiStateService);
  voiceNav = inject(VoiceNavigationService);
  keyboardNav = inject(KeyboardNavService);
  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);
  private principalVoiceBridge = inject(PrincipalVoiceBridgeService);

  readonly juegoShellMounted = signal(false);
  readonly juegoOpen = signal(false);
  readonly activePopup = signal<PopupId>(null);

  imagenPortada = this.ui.hoverSwap(
    'assets/imagenes/principal/portadaPrincipal.jpg',
    'assets/imagenes/principal/portadaPrincipalHover.jpg'
  );

  imagenSeccion1 = this.ui.hoverSwap(
    'assets/imagenes/principal/cd.png',
    'assets/imagenes/principal/cdHover.png'
  );
  
  i1 = 0;
  i2 = 0;

  carrusel1: CarouselItem[] = [
    { src: 'assets/imagenes/principal/linternaMagica.png', 
      hover: 'assets/imagenes/principal/linternaMagicaHover.png',
      title: 'Linterna mágica - siglo XVII / XIX' },
    { src: 'assets/imagenes/principal/fonoautografo.jpg',
      hover: 'assets/imagenes/principal/fonoautografoHover.jpg',
      title: 'Fonoautógrafo - 1857' },
    { src: 'assets/imagenes/principal/fonografo.png',
      hover: 'assets/imagenes/principal/fonografoHover.png',
      title: 'Fonógrafo - 1877' },
    { src: 'assets/imagenes/principal/gramofono.png', 
      hover: 'assets/imagenes/principal/gramofonoHover.png',
      title: 'Gramófono - 1887' },
    { src: 'assets/imagenes/principal/cinematografo.jpg', 
      hover: 'assets/imagenes/principal/cinematografoHover.jpg',
      title: 'Cinematógrafo - 1895' },
    { src: 'assets/imagenes/principal/cineSonoro.jpg',
      hover: 'assets/imagenes/principal/cineSonoroHover.jpg',
      title: 'Cine Sonoro - 1927' },
    { src: 'assets/imagenes/principal/sensorama.jpg', 
      hover: 'assets/imagenes/principal/sensoramaHover.jpg',
      title: 'Sensorama - 1962' }
  ];

  carrusel2: CarouselItem[] = [
    { src: 'assets/imagenes/principal/altair8800.png', 
      hover: 'assets/imagenes/principal/altair8800Hover.png', 
      title: 'Altair 8800 - años 70' },
    { src: 'assets/imagenes/principal/appleII.png',
      hover: 'assets/imagenes/principal/appleIIHover.png',
      title: 'Apple II - años 70' },
    { src: 'assets/imagenes/principal/vinilo.png', 
      hover: 'assets/imagenes/principal/viniloHover.png',
      title: 'CD - años 70' },
    { src: 'assets/imagenes/principal/pantallaWindows.png', 
      hover: 'assets/imagenes/principal/pantallaWindowsHover.jpg',
      title: 'Windows 1.0 - años 80' },
    { src: 'assets/imagenes/principal/macOSClasico.png', 
      hover: 'assets/imagenes/principal/macOSClasicoHover.png',
      title: 'MacOS Clásico - años 80' },
    { src: 'assets/imagenes/principal/netscape.png', 
      hover: 'assets/imagenes/principal/netscapeHover.png',
      title: 'Netscape - años 90' },
    { src: 'assets/imagenes/principal/primeraWeb.png', 
      hover: 'assets/imagenes/principal/primeraWebHover.png',
      title: 'Primera página web - años 90' },
    { src: 'assets/imagenes/principal/walkman.jpg', 
      hover: 'assets/imagenes/principal/walkmanHover.png',
      title: 'Walkman - años 90' },
    { src: 'assets/imagenes/principal/primerIPhone.png', 
      hover: 'assets/imagenes/principal/primerIPhoneHover.png',
      title: 'IPhone 1 - años 2000' },
    { src: 'assets/imagenes/principal/primeraTablet.png', 
      hover: 'assets/imagenes/principal/primeraTabletHover.png',
      title: 'Primera tablet - años 2000' }
  ];

  prev(id: 1 | 2, ev?: Event) {
    ev?.stopPropagation();
    const arr = id === 1 ? this.carrusel1 : this.carrusel2;
    if (!arr.length) return;

    if (id === 1) this.i1 = (this.i1 - 1 + arr.length) % arr.length;
    else this.i2 = (this.i2 - 1 + arr.length) % arr.length;
  }

  next(id: 1 | 2, ev?: Event) {
    ev?.stopPropagation();
    const arr = id === 1 ? this.carrusel1 : this.carrusel2;
    if (!arr.length) return;

    if (id === 1) this.i1 = (this.i1 + 1) % arr.length;
    else this.i2 = (this.i2 + 1) % arr.length;
  }

  private createTheme = (id: keyof typeof this.originalThemes) =>
  computed(() => {

    const modo = this.colorService.colorActivo();

    if (modo === 'original') {
      return this.originalThemes[id];
    }

    return this.popupThemes[modo];
  });

  private colorService = inject(ColorService);
  private popupThemes = inject(PopupThemeService);

  private originalThemes = {
    juego: JUEGO_ORIGINAL_THEME,

    carrusel: {
      overlayBg: 'rgba(0,0,0,0.85)',
      panelBg: '#00b6a7',
      panelText: '#000000',
      borderColor: '#176a62',
      insetLight: '#ffffff',
      insetDark: '#0f443e',
      titlebarBg: '#1a6b62',
      titlebarText: 'white',
      titlebarDivider: '#808080',
      closeBg: '#23a094',
      buttonBg: '#00b6a7',
      buttonBorderTop: '#fff',
      buttonBorderLeft: '#fff',
      buttonBorderBottom: '#176a62',
      buttonBorderRight: '#176a62',
      buttonActiveBg: '#00b6a7',
      buttonActiveBorderTop: '#176a62',
      buttonActiveBorderLeft: '#176a62',
      buttonActiveBorderBottom: '#fff',
      buttonActiveBorderRight: '#fff',
    }
  } as const;

  juegoTheme = computed(() =>
    juegoThemeForMode(
      this.colorService.colorActivo(),
      this.popupThemes.daltonismo1,
      this.popupThemes.daltonismo2
    )
  );
  carruselTheme = this.createTheme('carrusel');

  openJuego(): void {
    if (!this.juegoShellMounted()) {
      this.juegoShellMounted.set(true);
      afterNextRender(() => this.juegoOpen.set(true), { injector: this.injector });
      return;
    }
    this.juegoOpen.set(true);
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent(JUEGO_RESET_EVENT));
      window.dispatchEvent(new CustomEvent(JUEGO_FOCUS_FIRST_EVENT));
    });
  }

  closeJuego(): void {
    this.juegoOpen.set(false);
  }

  openPopup(id: Exclude<PopupId, null>): void {
    if (id === 'juego') {
      this.openJuego();
      return;
    }
    this.activePopup.set(id);
  }

  closePopup(): void {
    this.juegoOpen.set(false);
    this.activePopup.set(null);
  }

  popupCarouselItems: CarouselItemPopup[] = [];
  popupCarouselIndex = 0;
  popupCarouselId: 1 | 2 = 1;
  private voiceCarouselTarget: 1 | 2 = 1;

  openCarouselPopup(id: 1 | 2) {
    this.popupCarouselId = id;

    this.popupCarouselItems = id === 1 ? this.carrusel1Popup : this.carrusel2Popup;
    this.popupCarouselIndex = id === 1 ? this.i1 : this.i2;

    this.openPopup('carrusel');
  }

  onPopupCarouselIndexChange(newIndex: number) {
    this.popupCarouselIndex = newIndex;

    if (this.popupCarouselId === 1) this.i1 = newIndex;
    else this.i2 = newIndex;
  }

  get carrusel1Popup() {
    return getCarrusel1Popup(this.explicacionService.nivelActivo());
  }

  get carrusel2Popup() {
    return getCarrusel2Popup(this.explicacionService.nivelActivo());
  }

  constructor(private router: Router) {
    afterNextRender(() => {
      const mount = () => this.juegoShellMounted.set(true);
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(mount, { timeout: 1200 });
      } else {
        setTimeout(mount, 400);
      }
    }, { injector: this.injector });
  }

  siguientePagina() {
    this.router.navigate(['/texto']);
  }

  explicacionService = inject(ExplicacionService);
  explicaciones = explicaciones;

  texto(clave: string) {
    return this.explicaciones[clave][this.explicacionService.nivelActivo()];
  }

  private readonly handlePrincipalVoiceDetail = (detail: PrincipalVoiceDetail): void => {
    const action = detail?.action;
    const steps = Math.min(8, Math.max(1, detail?.steps ?? 1));

    if (action === 'carruselIzquierda' || action === 'carruselDerecha') {
      for (let s = 0; s < steps; s++) {
        this.applyCarouselInlineStep(action);
      }
      this.cdr.markForCheck();
      return;
    }

    afterNextRender(() => this.applyPrincipalVoiceAction(action), { injector: this.injector });
  };

  private readonly onPrincipalVoice = ((ev: Event) => {
    const detail = (ev as CustomEvent<PrincipalVoiceDetail>).detail;
    if (detail?.action) this.handlePrincipalVoiceDetail(detail);
  }) as EventListener;

  private applyCarouselInlineStep(action: 'carruselIzquierda' | 'carruselDerecha'): void {
    if (this.juegoOpen()) return;
    if (this.activePopup() === 'carrusel') {
      const direction = action === 'carruselIzquierda' ? -1 : 1;
      window.dispatchEvent(new CustomEvent(VOICE_CARRUSEL_STEP_EVENT, { detail: { direction, steps: 1 } }));
      return;
    }
    const id = this.pickVisibleCarouselId();
    this.voiceCarouselTarget = id;
    if (action === 'carruselIzquierda') this.prev(id);
    else this.next(id);
  }

  private pickVisibleCarouselId(): 1 | 2 {
    const score = (el: Element | null): number => {
      if (!(el instanceof HTMLElement)) return -1;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const vmid = vh * 0.5;
      const mid = r.top + r.height / 2;
      const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if (visible < 40) return -1;
      return visible - Math.abs(mid - vmid);
    };
    const s1 = score(document.querySelector('[data-carousel-id="1"]'));
    const s2 = score(document.querySelector('[data-carousel-id="2"]'));
    if (s1 < 0 && s2 < 0) return this.voiceCarouselTarget;
    if (s2 > s1) return 2;
    return 1;
  }

  private applyPrincipalVoiceAction(action: PrincipalVoiceAction | undefined): void {
    if (action === 'juguemos') {
      this.openJuego();
      return;
    }
    if (action === 'cerrar') {
      this.closePopup();
      return;
    }
    if (action === 'carruselAbrir') {
      const id = this.pickVisibleCarouselId();
      this.voiceCarouselTarget = id;
      this.openCarouselPopup(id);
      return;
    }
    if (action === 'siguientePagina') {
      this.siguientePagina();
    }
  }

  ngAfterViewInit(): void {
    this.principalVoiceBridge.connect(this.handlePrincipalVoiceDetail);
    window.addEventListener(VOICE_PRINCIPAL_ACTION_EVENT, this.onPrincipalVoice);
  }

  ngOnDestroy(): void {
    this.principalVoiceBridge.disconnect();
    window.removeEventListener(VOICE_PRINCIPAL_ACTION_EVENT, this.onPrincipalVoice);
  }
}
