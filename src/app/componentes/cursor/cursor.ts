import { Component, OnInit, OnDestroy, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStateService } from '../../services/ui-state.service';
import { ColorService } from '../../services/color.service';

@Component({
  selector: 'app-cursor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cursor.html',
  styleUrl: './cursor.scss',
})
export class CursorComponent implements OnInit, OnDestroy {
  private ui = inject(UiStateService);
  private colorService = inject(ColorService);

  x = signal(0);
  y = signal(0);

  cursorColor = computed(() => {
    const menu = this.ui.activeMenu();
    const color = this.colorService.colorActivo();

    if (!menu) return '#ffffff';

    switch (color) {
      case 'daltonismo1':
        switch (menu) {
          case 'nav':          return '#dc267f';
          case 'accessibility': return '#fe6100';
          case 'lateral':      return '#ffb000';
        }
        break;
      case 'daltonismo2':
        return '#b9b9b9';
      default:
        switch (menu) {
          case 'nav':          return '#ff90e8';
          case 'accessibility': return '#ff6400';
          case 'lateral':      return '#90a8ed';
        }
    }

    return '#ffffff';
  });

  private onMouseMove = (e: MouseEvent) => {
    this.x.set(e.clientX);
    this.y.set(e.clientY);
  };

  ngOnInit() {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseover', this.onMouseOver);
  }

  ngOnDestroy() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseover', this.onMouseOver);
  }

  isOverInteractive = signal(false);

  private onMouseOver = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const interactive = target.closest(
      'button, a, [routerLink], input, select, li, img[role="button"], .punto, [role="button"], [tabindex]'
    );
    this.isOverInteractive.set(!!interactive);
  };

  cursorScale = computed(() => this.isOverInteractive() ? 1.8 : 1);
}