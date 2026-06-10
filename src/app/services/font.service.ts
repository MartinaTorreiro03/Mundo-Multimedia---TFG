import { Injectable } from '@angular/core';

export type AppFont = 'kanit' | 'dyslexic';

const STORAGE_KEY = 'app_font';

@Injectable({ providedIn: 'root' })
export class FontService {
  private current: AppFont = 'kanit';

  init() {
    const saved = (localStorage.getItem(STORAGE_KEY) as AppFont | null);
    this.setFont(saved ?? 'kanit');
  }

  getFont(): AppFont {
    return this.current;
  }

  toggle() {
    const next: AppFont = this.current === 'kanit' ? 'dyslexic' : 'kanit';
    this.setFont(next);
  }

  setFont(font: AppFont): void {
    this.current = font;

    const enabled = font === 'dyslexic';

    document.body.classList.toggle('font-dyslexic', enabled);
    document.documentElement.classList.toggle('font-dyslexic', enabled);

    localStorage.setItem(STORAGE_KEY, font);
  }
}
