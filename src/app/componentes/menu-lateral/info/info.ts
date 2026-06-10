import { Component, inject } from '@angular/core';
import { ColorService } from '../../../services/color.service';
import { SpeakableDirective } from '../../../directives/app-speakable';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [SpeakableDirective],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class Info {
  colorService = inject(ColorService);

  get iconoColor(): string {
    switch (this.colorService.colorActivo()) {
      case 'daltonismo1': return 'assets/iconos/colorDalt1FondoBlanco.png';
      case 'daltonismo2': return 'assets/iconos/colorDalt2FondoBlanco.png';
      default:            return 'assets/iconos/colorFondoBlanco.png';
    }
  }
}
