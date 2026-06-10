import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorService } from '../../../services/color.service';
import { UiStateService } from '../../../services/ui-state.service';
import { SpeakableDirective } from '../../../directives/app-speakable';
import { VoiceNavigationService } from '../../../services/voice-navigation.service';
import { KeyboardNavService } from '../../../services/keyboard-nav.service';

@Component({
  selector: 'app-bloc-notas',
  standalone: true,
  imports: [FormsModule, NgIf, SpeakableDirective],
  templateUrl: './bloc-notas.html',
  styleUrl: './bloc-notas.scss',
})
export class BlocNotas {
  private colorService = inject(ColorService);
  private cdr = inject(ChangeDetectorRef);

  texto = '';
  guardado = '';
  guardadoVisible = false;
  estaGuardado = false;

  private storageKey = 'blocNotas_texto';

  ngOnInit() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.texto = saved;
      this.guardado = saved;
      this.guardadoVisible = true;
    }
  }

  guardar() {
    if (!this.texto.trim()) return;
    localStorage.setItem(this.storageKey, this.texto);
    this.guardado = this.texto;
    this.guardadoVisible = true;
    this.estaGuardado = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.estaGuardado = false;
      this.cdr.markForCheck();
    }, 1500);
  }

  limpiar() {
    this.texto = '';
    this.guardado = '';
    this.guardadoVisible = false;
    this.estaGuardado = false;
    localStorage.removeItem(this.storageKey);
    this.cdr.markForCheck();
  }

  appendVoiceText(chunk: string): boolean {
    const t = chunk.replace(/\s+/g, ' ').trim();
    if (!t) return false;
    const sep = this.texto.length > 0 && !/\s$/.test(this.texto) ? ' ' : '';
    const next = (this.texto + sep + t).slice(0, 500);
    if (next === this.texto && this.texto.length >= 500) return false;
    this.texto = next;
    this.cdr.markForCheck();
    return true;
  }

  ui = inject(UiStateService);
  voiceNav = inject(VoiceNavigationService);
  keyboardNav = inject(KeyboardNavService);
}
