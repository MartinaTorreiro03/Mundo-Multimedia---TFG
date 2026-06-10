import { Injectable, signal, computed, Signal, effect, inject } from '@angular/core';
import { ColorService } from './color.service';

type ActiveMenu = 'nav' | 'accessibility' | 'lateral' | null;

@Injectable({ providedIn: 'root' })
export class UiStateService {

  private colorService = inject(ColorService);

  activeMenu = signal<ActiveMenu>(null);

  setActiveMenu(menu: ActiveMenu) {
    this.activeMenu.set(menu);
  }

  get colorActivo() {
    return this.colorService.colorActivo();
  }

  isHovering = computed(() => this.activeMenu() !== null);

  private baseAccent = computed(() => {
    const modo = this.colorService.colorActivo();

    switch (modo) {
      case 'original': return '#ff90e8';
      case 'daltonismo1': return '#dc267f';
      case 'daltonismo2': return '#777777';
    }
  });

  accentColor(tag: 'h1' | 'h2' | 'h3' | 'menus', h1Colors?: { daltonismo1?: string; daltonismo2?: string }) {
    const modo = this.colorService.colorActivo();
    const menu = this.activeMenu();
    

    if (tag === 'menus') {
      switch (modo) {
        case 'original':
          switch (menu) {
            case 'nav': return '#ff90e8';
            case 'accessibility': return '#ff6400';
            case 'lateral': return '#90a8ed';
          }
          break;
        case 'daltonismo1':
          switch (menu) {
            case 'nav': return '#dc267f';
            case 'accessibility': return '#fe6100';
            case 'lateral': return '#ffb000';
          }
          break;
        case 'daltonismo2':
          switch (menu) {
            case 'nav': return '#b9b9b9';
            case 'accessibility': return '#b9b9b9';
          }
          break;
      }
    }

    if ((tag === 'h1' || tag === 'h2') && menu) {
      switch (modo) {
        case 'original':
          switch (menu) {
            case 'nav': return '#ff90e8';
            case 'accessibility': return '#ff6400';
            case 'lateral': return '#90a8ed';
          }
        case 'daltonismo1':
          switch (menu) {
            case 'nav': return '#dc267f';
            case 'accessibility': return '#fe6100';
            case 'lateral': return '#ffb000';
          }
          break;
        case 'daltonismo2':
          switch (menu) {
            case 'nav': return '#b9b9b9';
            case 'accessibility': return '#b9b9b9';
            case 'lateral': return '#b9b9b9';
          }
          break;
      }
    }

    if (!menu) {
      if (modo === 'daltonismo1') {
        switch (tag) {
          case 'h1': return h1Colors?.daltonismo2 ?? '#fff';
          case 'h2': return '#785ef0';
          case 'h3': return '#648fff';
        }
      } else if (modo === 'daltonismo2') {
        switch (tag) {
          case 'h1': return h1Colors?.daltonismo2 ?? '#dddddd';
          case 'h2': return '#363636';
          case 'h3': return '#5c5c5c';
        }
      }
    }

    return undefined;
  }

  accentColorParrafo = computed(() =>
    this.isHovering() ? '#fff' : '#000'
  );

  hoverSwap(normal: string, hover: string): Signal<string> {
    return computed(() =>
      this.activeMenu() ? hover : normal
    );
  }

  isVisible(menu: ActiveMenu): Signal<boolean> {
    return computed(() => {
      const active = this.activeMenu();

      if (active === null) return true;

      return active === menu;
    });
  }

  constructor() {
    effect(() => {
      const color = this.accentColor('menus');

      if (color) {
        document.documentElement.style
          .setProperty('--accent-color', color);
      } else {
        document.documentElement.style
          .removeProperty('--accent-color');
      }
    });

    effect(() => {
      const modo = this.colorService.colorActivo();

      if (modo === 'daltonismo1') {
        document.documentElement.style.setProperty('--btn-bg', '#dc267f');
        document.documentElement.style.setProperty('--btn-border', '#fc56a6');
        document.documentElement.style.setProperty('--btn-border-lat', '#900c66');
      } else if (modo === 'daltonismo2') {
        document.documentElement.style.setProperty('--btn-bg', '#e1e1e1');
        document.documentElement.style.setProperty('--btn-border', '#7d7d7d');
        document.documentElement.style.setProperty('--btn-border-lat', '#222222');
      } else {
        document.documentElement.style.removeProperty('--btn-bg');
        document.documentElement.style.removeProperty('--btn-border');
        document.documentElement.style.removeProperty('--btn-border-lat');
      }
    });

    effect(() => {
      const modo = this.colorService.colorActivo();

      if (modo === 'daltonismo1') {
        document.documentElement.style.setProperty('--carrusel-bg', '#fe6100');
        document.documentElement.style.setProperty('--carrusel-border', '#ff8e47');
        document.documentElement.style.setProperty('--carrusel-border-lat', '#cb4e00');

        document.documentElement.style.setProperty('--carrusel-elemento-bg', '#ffb000');
        document.documentElement.style.setProperty('--carrusel-elemento-border', '#ffc74e');
        document.documentElement.style.setProperty('--carrusel-elemento-border-lat', '#906200');

      } else if (modo === 'daltonismo2') {
        document.documentElement.style.setProperty('--carrusel-bg', '#363636');
        document.documentElement.style.setProperty('--carrusel-border', '#7d7d7d');
        document.documentElement.style.setProperty('--carrusel-border-lat', '#222222');
        document.documentElement.style.setProperty('--carrusel-shadow-light', '#555555');

        document.documentElement.style.setProperty('--carrusel-elemento-bg', '#fff');
        document.documentElement.style.setProperty('--carrusel-elemento-border', '#e1e1e1');
        document.documentElement.style.setProperty('--carrusel-elemento-border-lat', '#808080');

      } else {
        document.documentElement.style.removeProperty('--carrusel-bg');
        document.documentElement.style.removeProperty('--carrusel-border');
        document.documentElement.style.removeProperty('--carrusel-border-lat');
        document.documentElement.style.removeProperty('--carrusel-shadow-dark');
        document.documentElement.style.removeProperty('--carrusel-shadow-light');

        document.documentElement.style.removeProperty('--carrusel-elemento-bg');
        document.documentElement.style.removeProperty('--carrusel-elemento-border');
        document.documentElement.style.removeProperty('--carrusel-elemento-border-lat');
      }
    });

    effect(() => {
      const modo = this.colorService.colorActivo();

      if (modo === 'daltonismo1') {
        document.documentElement.style.setProperty('--footer-bg', '#785ef0');
      } else if (modo === 'daltonismo2') {
        document.documentElement.style.setProperty('--footer-bg', '#818181');
      } else {
        document.documentElement.style.removeProperty('--footer-bg');
      }
    });

    effect(() => {
      const modo = this.colorService.colorActivo();

      if (modo === 'daltonismo1') {
        document.documentElement.style.setProperty('--bloc-bg', '#ffb000');
        document.documentElement.style.setProperty('--bloc-border', '#cb4e00');
        document.documentElement.style.setProperty('--bloc-titulo', 'linear-gradient(to right, #fe6100, #ff8e47)');
        document.documentElement.style.setProperty('--bloc-area-bg', '#fff3cc');
        document.documentElement.style.setProperty('--bloc-area-color', '#3a1f00');
        document.documentElement.style.setProperty('--bloc-barra-bg', '#fe6100');
        document.documentElement.style.setProperty('--bloc-placeholder', '#cb7a00');
        document.documentElement.style.setProperty('--bloc-contador', '#906200');
      } else if (modo === 'daltonismo2') {
        document.documentElement.style.setProperty('--bloc-bg', '#626262');
        document.documentElement.style.setProperty('--bloc-border', '#222222');
        document.documentElement.style.setProperty('--bloc-titulo', 'linear-gradient(to right, #343434, #7e7e7e)');
        document.documentElement.style.setProperty('--bloc-area-bg', '#1a1a1a');
        document.documentElement.style.setProperty('--bloc-area-color', '#ccc');
        document.documentElement.style.setProperty('--bloc-barra-bg', '#2a2a2a');
        document.documentElement.style.setProperty('--bloc-placeholder', '#555');
        document.documentElement.style.setProperty('--bloc-contador', '#888');
      } else {
        document.documentElement.style.removeProperty('--bloc-bg');
        document.documentElement.style.removeProperty('--bloc-border');
        document.documentElement.style.removeProperty('--bloc-titulo');
        document.documentElement.style.removeProperty('--bloc-area-bg');
        document.documentElement.style.removeProperty('--bloc-area-color');
        document.documentElement.style.removeProperty('--bloc-barra-bg');
        document.documentElement.style.removeProperty('--bloc-placeholder');
        document.documentElement.style.removeProperty('--bloc-contador');
      }
    });
  }
}
