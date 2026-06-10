import { Injectable, signal, effect } from '@angular/core';

export type ActiveColor = 'original' | 'daltonismo1' | 'daltonismo2';

@Injectable({ providedIn: 'root' })
export class ColorService {

  colorActivo = signal<ActiveColor>('original');

  constructor() {
    effect(() => {
      const color = this.colorActivo();

      document.body.classList.remove(
        'tema-original',
        'tema-daltonismo1',
        'tema-daltonismo2'
      );

      document.body.classList.add(`tema-${color}`);
    });
  }

  toggleColor() {
    const colores: ActiveColor[] = ['original', 'daltonismo1', 'daltonismo2'];
    const index = colores.indexOf(this.colorActivo());
    this.colorActivo.set(colores[(index + 1) % colores.length]);
  }
}
