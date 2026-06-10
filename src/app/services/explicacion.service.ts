import { Injectable, signal } from '@angular/core';

export type NivelExplicacion = 'tecnica' | 'media' | 'sencilla';

@Injectable({ providedIn: 'root' })
export class ExplicacionService {
  nivelActivo = signal<NivelExplicacion>('tecnica');

  setNivel(nivel: NivelExplicacion) {
    this.nivelActivo.set(nivel);
  }
}