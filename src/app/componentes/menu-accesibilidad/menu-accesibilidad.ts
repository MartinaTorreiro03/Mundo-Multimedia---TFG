import { Component, signal, Signal, inject } from '@angular/core';
import { UiStateService } from '../../services/ui-state.service';
import { ContrasteIconosDirective } from '../../directives/contraste-iconos';
import { ExplicacionService, NivelExplicacion } from '../../services/explicacion.service';
import { VisionReducidaService } from '../../services/vision-reducida';
import { LectorPantallaService } from '../../services/lector-pantalla';
import { SpeakableDirective } from '../../directives/app-speakable';
import { computed } from '@angular/core';
import { KeyboardNavService } from '../../services/keyboard-nav.service';
import { VoiceNavigationService } from '../../services/voice-navigation.service';

type Surface = 'light' | 'dark';

@Component({
  selector: 'app-menu-accesibilidad',
  standalone: true,
  imports: [SpeakableDirective, ContrasteIconosDirective],
  templateUrl: './menu-accesibilidad.html',
  styleUrl: './menu-accesibilidad.scss'
})
export class MenuAccesibilidad {
  uiState = inject(UiStateService);

  iconoMenuAccsBlanco: string = 'assets/iconos/menuAccsFondoBlanco.png';
  iconoMenuAccsNegro: string = 'assets/iconos/menuAccsFondoNegro.png';
  iconoMenuAccsHover: string = 'assets/iconos/menuAccsHover.png';
  iconoMenuAccs: string = this.iconoMenuAccsNegro;
  isVisible = signal(false); 

  private surface: Surface = 'light';
  private hovered = false;
  visible!: Signal<boolean>;
  keyboardMenuOpen = computed(() => this.uiState.activeMenu() === 'accessibility');

  voiceHints = computed(() => this.voiceNav.enabled() && this.keyboardMenuOpen());

  voiceIconHint = computed(() => this.voiceNav.enabled() && !this.keyboardMenuOpen());

  voiceMenuSalirHint = computed(() => this.voiceNav.enabled() && this.keyboardMenuOpen());

  constructor(private ui: UiStateService) {
    this.visible = this.ui.isVisible('accessibility');
  }

  onSurfaceChange(surface: Surface) {
    this.surface = surface;
    this.updateIcon();
  }

  onEnter() {
    this.hovered = true;
    this.isVisible.set(true);
    this.ui.setActiveMenu('accessibility');
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
        this.iconoMenuAccs = 'assets/iconos/menuAccsHover.png';
        return;
      }

      if (modo === 'daltonismo2') {
        this.iconoMenuAccs = 'assets/iconos/menuAccsHoverDalt2.png';
        return;
      }

      this.iconoMenuAccs = this.iconoMenuAccsHover;
      return;
    }

    this.iconoMenuAccs = (this.surface === 'dark')
      ? this.iconoMenuAccsNegro
      : this.iconoMenuAccsBlanco;
  }

  explicacionService = inject(ExplicacionService);
  submenuExplicacionVisible = signal(false);

  onCambiarExplicacion() {
    const niveles: NivelExplicacion[] = ['tecnica', 'media', 'sencilla'];
    const index = niveles.indexOf(this.explicacionService.nivelActivo());
    this.explicacionService.setNivel(niveles[(index + 1) % niveles.length]);
  }

  visionReducida = inject(VisionReducidaService);

  lector = inject(LectorPantallaService);
  keyboardNav = inject(KeyboardNavService);
  voiceNav = inject(VoiceNavigationService);

  onToggleVoiceNav(): void {
    const enabling = !this.voiceNav.enabled();
    this.voiceNav.toggleEnabled();
    if (enabling) {
      this.hovered = false;
      this.isVisible.set(false);
      this.ui.setActiveMenu(null);
      this.updateIcon();
    }
  }

  onToggleLectorPantalla(): void {
    this.lector.toggle();

    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('app:refresh-scroll'));
    });
  }

  onVisionReducida() {
    this.visionReducida.toggle();
  }

  onToggleKeyboardNav() {
    this.keyboardNav.toggle();
  }
}
