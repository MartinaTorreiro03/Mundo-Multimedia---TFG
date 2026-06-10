import { Component, signal, Signal, computed, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { UiStateService } from '../../services/ui-state.service';
import { ContrasteIconosDirective } from '../../directives/contraste-iconos';
import { ColorService } from '../../services/color.service';
import { SpeakableDirective } from '../../directives/app-speakable';
import { VoiceNavigationService } from '../../services/voice-navigation.service';
import { voiceHintForNavLabel } from '../../utils/voice-menu-match';

type Surface = 'light' | 'dark';

interface MenuItem {
  label: string;
  route: string;
}

const MENUS: Record<string, MenuItem[]> = {
  default: [
    { label: 'Texto', route: '/texto' },
    { label: 'Audio', route: '/audio' },
    { label: 'Imagen', route: '/imagen' },
    { label: 'Vídeo', route: '/video' },
    { label: 'Música', route: '/musica' },
    { label: 'Audiovisual', route: '/audiovisual' },
    { label: 'Interactividad', route: '/interactividad' },
  ],
  '/texto': [
    { label: 'Mundo', route: '' },
    { label: 'Audio', route: '/audio' },
    { label: 'Imagen', route: '/imagen' },
    { label: 'Vídeo', route: '/video' },
    { label: 'Música', route: '/musica' },
    { label: 'Audiovisual', route: '/audiovisual' },
    { label: 'Interactividad', route: '/interactividad' },
  ],
  '/audio': [
    { label: 'Mundo', route: '' },
    { label: 'Texto', route: '/texto' },
    { label: 'Imagen', route: '/imagen' },
    { label: 'Vídeo', route: '/video' },
    { label: 'Música', route: '/musica' },
    { label: 'Audiovisual', route: '/audiovisual' },
    { label: 'Interactividad', route: '/interactividad' },
  ],
  '/imagen': [
    { label: 'Mundo', route: '' },
    { label: 'Texto', route: '/texto' },
    { label: 'Audio', route: '/audio' },
    { label: 'Vídeo', route: '/video' },
    { label: 'Música', route: '/musica' },
    { label: 'Audiovisual', route: '/audiovisual' },
    { label: 'Interactividad', route: '/interactividad' },
  ],
  '/video': [
    { label: 'Mundo', route: '' },
    { label: 'Texto', route: '/texto' },
    { label: 'Audio', route: '/audio' },
    { label: 'Imagen', route: '/imagen' },
    { label: 'Música', route: '/musica' },
    { label: 'Audiovisual', route: '/audiovisual' },
    { label: 'Interactividad', route: '/interactividad' },
  ],
  '/musica': [
    { label: 'Mundo', route: '' },
    { label: 'Texto', route: '/texto' },
    { label: 'Audio', route: '/audio' },
    { label: 'Imagen', route: '/imagen' },
    { label: 'Vídeo', route: '/video' },
    { label: 'Audiovisual', route: '/audiovisual' },
    { label: 'Interactividad', route: '/interactividad' },
  ],
  '/audiovisual': [
    { label: 'Mundo', route: '' },
    { label: 'Texto', route: '/texto' },
    { label: 'Audio', route: '/audio' },
    { label: 'Imagen', route: '/imagen' },
    { label: 'Vídeo', route: '/video' },
    { label: 'Música', route: '/musica' },
    { label: 'Interactividad', route: '/interactividad' },
  ],
  '/interactividad': [
    { label: 'Mundo', route: '' },
    { label: 'Texto', route: '/texto' },
    { label: 'Audio', route: '/audio' },
    { label: 'Imagen', route: '/imagen' },
    { label: 'Vídeo', route: '/video' },
    { label: 'Música', route: '/musica' },
    { label: 'Audiovisual', route: '/audiovisual' },
  ],
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ContrasteIconosDirective, SpeakableDirective],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  uiState = inject(UiStateService);
  voiceNav = inject(VoiceNavigationService);
  private router = inject(Router);

  iconoMenuBlanco: string = 'assets/iconos/menuFondoBlanco.png';
  iconoMenuNegro: string = 'assets/iconos/menuFondoNegro.png';
  iconoMenuHover: string = 'assets/iconos/menuHover.png';
  iconoMenu: string = this.iconoMenuNegro;
  isVisible = signal(false);

  private surface: Surface = 'light';
  private hovered = false;
  visible!: Signal<boolean>;

  private rutaActiva = signal(this.router.url);

  menuItems = computed(() => {
    const ruta = (this.rutaActiva() || '').split('?')[0].split('#')[0];
    const menuEspecifico = Object.keys(MENUS).find(key => {
      if (key === 'default') return false;
      return ruta === key || ruta.startsWith(key + '/');
    });
    return MENUS[menuEspecifico ?? 'default'];
  });

  keyboardMenuOpen = computed(() => this.uiState.activeMenu() === 'nav');

  voiceHints = computed(() => this.voiceNav.enabled() && this.keyboardMenuOpen());

  voiceIconHint = computed(() => this.voiceNav.enabled() && !this.keyboardMenuOpen());

  voiceMenuSalirHint = computed(() => this.voiceNav.enabled() && this.keyboardMenuOpen());

  navSpeakText(): string {
    const labels = this.menuItems().map(i => i.label).join('. ');
    return `Menú de navegación. Opciones: ${labels}.`;
  }

  navVoiceHint(item: MenuItem): string {
    return voiceHintForNavLabel(item.label);
  }

  constructor(private ui: UiStateService) {
    this.visible = this.ui.isVisible('nav');

    this.router.events.subscribe(() => {
      this.rutaActiva.set(this.router.url);
    });
  }

  onSurfaceChange(surface: Surface) {
    this.surface = surface;
    this.updateIcon();
  }

  onEnter() {
    this.hovered = true;

    this.isVisible.set(true);
    this.ui.setActiveMenu('nav');

    this.updateIcon();
  }

  onLeave() {
    this.hovered = false;
    this.isVisible.set(false);
    this.ui.setActiveMenu(null);
    this.updateIcon();
  }

  private updateIcon() {
    const modo = this.uiState.colorActivo;

    if (this.hovered) {
      if (modo === 'daltonismo1') {
        this.iconoMenu = 'assets/iconos/menuHoverDalt1.png';
        return;
      }

      if (modo === 'daltonismo2') {
        this.iconoMenu = 'assets/iconos/menuHoverDalt2.png';
        return;
      }

      this.iconoMenu = this.iconoMenuHover;
      return;
    }

    this.iconoMenu = (this.surface === 'dark')
      ? this.iconoMenuNegro
      : this.iconoMenuBlanco;
  }
}
