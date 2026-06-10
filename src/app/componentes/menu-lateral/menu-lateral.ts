import { Component, Output, EventEmitter, signal, Signal, effect, computed, inject } from '@angular/core';
import { UiStateService } from '../../services/ui-state.service';
import { ContrasteIconosDirective } from '../../directives/contraste-iconos';
import { FontService } from '../../services/font.service';
import { ColorService } from '../../services/color.service';
import { SpeakableDirective } from '../../directives/app-speakable';
import { VoiceNavigationService } from '../../services/voice-navigation.service';

type Surface = 'light' | 'dark';
type PopupId = 'info' | null;
type ActiveTipo = 'kanit' | 'opendys';
type ActiveColor = 'original' | 'daltonismo1' | 'daltonismo2';

@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [ContrasteIconosDirective, SpeakableDirective],
  templateUrl: './menu-lateral.html',
  styleUrl: './menu-lateral.scss',
})
export class MenuLateral {
  iconoInfoBlanco: string = 'assets/iconos/infoFondoBlanco.png';
  iconoInfoNegro: string = 'assets/iconos/infoFondoNegro.png';
  iconoInfoHover: string = 'assets/iconos/infoHover.png';

  iconoTipoBlancoKanit: string = 'assets/iconos/tipoKanitFondoBlanco.png';
  iconoTipoNegroKanit: string = 'assets/iconos/tipoKanitFondoNegro.png';
  iconoTipoHoverKanit: string = 'assets/iconos/tipoKanitHover.png';

  iconoTipoBlancoOpenDys: string = 'assets/iconos/tipoDysFondoBlanco.png';
  iconoTipoNegroOpenDys: string = 'assets/iconos/tipoDysFondoNegro.png';
  iconoTipoHoverOpenDys: string = 'assets/iconos/tipoDysHover.png';

  iconoColorBlanco: string = 'assets/iconos/colorFondoBlanco.png';
  iconoColorNegro: string = 'assets/iconos/colorFondoNegro.png';
  iconoColorHover: string = 'assets/iconos/colorHover.png';

  iconoDalt1Blanco: string = 'assets/iconos/colorDalt1FondoBlanco.png';
  iconoDalt1Negro: string = 'assets/iconos/colorDalt1FondoNegro.png';
  iconoDalt1Hover: string = 'assets/iconos/colorDalt1Hover.png';

  iconoDalt2Blanco: string = 'assets/iconos/colorDalt2FondoBlanco.png';
  iconoDalt2Negro: string = 'assets/iconos/colorDalt2FondoNegro.png';
  iconoDalt2Hover: string = 'assets/iconos/colorDalt2Hover.png';

  private surfaceInfo: Surface = 'light';
  private surfaceTipo: Surface = 'light';
  private surfaceColor: Surface = 'light';

  private hoveredInfo = signal(false);
  private hoveredTipo = signal(false);
  private hoveredColor = signal(false);

  visible!: Signal<boolean>;
  keyboardMenuOpen = computed(() => this.ui.activeMenu() === 'lateral');

  iconoInfo: string = this.iconoInfoNegro;
  iconoTipo: string = this.iconoTipoNegroKanit;
  iconoColor: string = this.iconoColorNegro;

  voiceNav = inject(VoiceNavigationService);
  voiceHints = computed(() => this.voiceNav.enabled() && this.keyboardMenuOpen());

  voiceIconHint = computed(() => this.voiceNav.enabled() && !this.keyboardMenuOpen());

  voiceMenuSalirHint = computed(() => this.voiceNav.enabled() && this.keyboardMenuOpen());

  constructor(private ui: UiStateService, private font: FontService, private colorService: ColorService) {
    this.visible = this.ui.isVisible('lateral');

    this.tipoActivo = this.font.getFont() === 'dyslexic' ? 'opendys' : 'kanit';
    this.refreshAllIcons();

    effect(() => {
      this.ui.activeMenu();
      this.ui.colorActivo;
      this.refreshAllIcons();
    });
  }

  private tipoActivo: ActiveTipo = 'kanit';

  private isLateralActive(): boolean {
    return this.ui.activeMenu() === 'lateral';
  }

  private refreshAllIcons() {
    this.updateInfo();
    this.updateTipo();
    this.updateColor();
  }

  onSurfaceChangeInfo(surface: Surface) {
    this.surfaceInfo = surface;
    this.updateInfo();
  }

  onEnterInfo() {
    this.hoveredInfo.set(true);
    this.ui.setActiveMenu('lateral');
    this.updateInfo();
  }

  onLeaveInfo() {
    this.hoveredInfo.set(false);
    this.ui.setActiveMenu(null);
    this.updateInfo();
  }

  private updateInfo() {
    const modo = this.ui.colorActivo;

    if (this.hoveredInfo()) {
      if (modo === 'daltonismo1') {
        this.iconoInfo = 'assets/iconos/infoHoverDalt1.png';
        return;
      }

      if (modo === 'daltonismo2') {
        this.iconoInfo = 'assets/iconos/infoHoverDalt2.png';
        return;
      }
      this.iconoInfo = this.iconoInfoHover;
      return;
    }

    const effectiveSurface: Surface = this.isLateralActive() ? 'dark' : this.surfaceInfo;
    this.iconoInfo = (effectiveSurface === 'dark') ? this.iconoInfoNegro : this.iconoInfoBlanco;
  }

  @Output() infoRequested = new EventEmitter<void>();

  openPopup() {
    this.infoRequested.emit();
  }

  onSurfaceChangeTipo(surface: Surface) {
    this.surfaceTipo = surface;
    this.updateTipo();
  }

  onEnterTipo() {
    this.hoveredTipo.set(true);
    this.ui.setActiveMenu('lateral');
    this.updateTipo();
  }

  onLeaveTipo() {
    this.hoveredTipo.set(false);
    this.ui.setActiveMenu(null);
    this.updateTipo();
  }

  private updateTipo() {
    const modo = this.ui.colorActivo;

    if (this.hoveredTipo()) {
      if (this.tipoActivo === 'kanit') {
        if (modo === 'daltonismo1') this.iconoTipo = 'assets/iconos/tipoKanitHoverDalt1.png';
        else if (modo === 'daltonismo2') this.iconoTipo = 'assets/iconos/tipoKanitHoverDalt2.png';
        else this.iconoTipo = this.iconoTipoHoverKanit;
      } else if (this.tipoActivo === 'opendys') {
        if (modo === 'daltonismo1') this.iconoTipo = 'assets/iconos/tipoDysHoverDalt1.png';
        else if (modo === 'daltonismo2') this.iconoTipo = 'assets/iconos/tipoDysHoverDalt2.png';
        else this.iconoTipo = this.iconoTipoHoverOpenDys;
      }
      return;
    }

    const iconos = this.iconosTipo[this.tipoActivo];
    const effectiveSurface: Surface = this.isLateralActive() ? 'dark' : this.surfaceTipo;
    this.iconoTipo = (effectiveSurface === 'dark') ? iconos.blanco : iconos.negro;
  }

  private iconosTipo: Record<ActiveTipo, { blanco: string; negro: string; hover: string }> = {
    kanit: {
      blanco: this.iconoTipoNegroKanit,
      negro: this.iconoTipoBlancoKanit,
      hover: this.iconoTipoHoverKanit,
    },
    opendys: {
      blanco: this.iconoTipoNegroOpenDys,
      negro: this.iconoTipoBlancoOpenDys,
      hover: this.iconoTipoHoverOpenDys,
    }
  };

  onToggleFont() {
    this.tipoActivo = this.tipoActivo === 'kanit' ? 'opendys' : 'kanit';
    this.font.toggle();
    this.updateTipo();
  }

  onSurfaceChangeColor(surface: Surface) {
    this.surfaceColor = surface;
    this.updateColor();
  }

  onEnterColor() {
    this.hoveredColor.set(true);
    this.ui.setActiveMenu('lateral');
    this.updateColor();
  }

  onLeaveColor() {
    this.hoveredColor.set(false);
    this.ui.setActiveMenu(null);
    this.updateColor();
  }

  private updateColor() {
    const iconos = this.iconosColor[this.colorService.colorActivo()];

    if (this.hoveredColor()) {
      this.iconoColor = iconos.hover;
      return;
    }

    const effectiveSurface: Surface = this.isLateralActive() ? 'dark' : this.surfaceColor;
    this.iconoColor = (effectiveSurface === 'dark') ? iconos.blanco : iconos.negro;
  }

  private iconosColor: Record<ActiveColor, { blanco: string; negro: string; hover: string }> = {
    original: {
      blanco: this.iconoColorNegro,
      negro: this.iconoColorBlanco,
      hover: this.iconoColorHover,
    },
    daltonismo1: {
      blanco: this.iconoDalt1Negro,
      negro: this.iconoDalt1Blanco,
      hover: this.iconoDalt1Hover,
    },
    daltonismo2: {
      blanco: this.iconoDalt2Negro,
      negro: this.iconoDalt2Blanco,
      hover: this.iconoDalt2Hover,
    },
  };

  onToggleColor() {
    this.colorService.toggleColor();
    this.updateColor();
  }
}
