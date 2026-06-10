import type { ModalTheme } from '../componentes/popup/popup';
import type { ActiveColor } from './color.service';

/** Tema Win95 rosa del mini-juego en paleta original. */
export const JUEGO_ORIGINAL_THEME: ModalTheme = {
  overlayBg: 'rgba(0,0,0,0.85)',
  panelBg: '#ff77d4',
  panelText: 'black',
  borderColor: '#df0097',
  insetLight: '#ffffff',
  insetDark: '#6d004a',
  titlebarBg: '#ab0075',
  titlebarText: 'white',
  titlebarDivider: '#808080',
  closeBg: '#ff77d4',
  buttonBg: '#ff77d4',
  buttonBorderTop: '#fff',
  buttonBorderLeft: '#fff',
  buttonBorderBottom: '#6d004a',
  buttonBorderRight: '#6d004a',
  buttonActiveBg: '#ff77d4',
  buttonActiveBorderTop: '#6d004a',
  buttonActiveBorderLeft: '#6d004a',
  buttonActiveBorderBottom: '#fff',
  buttonActiveBorderRight: '#fff',
};

export function applyPopupCssVars(el: HTMLElement, theme: ModalTheme): void {
  el.style.setProperty('--popup-panel-bg', theme.panelBg ?? '#ff77d4');
  el.style.setProperty('--popup-panel-text', theme.panelText ?? '#000');
  el.style.setProperty('--popup-border-color', theme.borderColor ?? '#df0097');
  el.style.setProperty('--popup-inset-light', theme.insetLight ?? '#fff');
  el.style.setProperty('--popup-inset-dark', theme.insetDark ?? '#6d004a');
  el.style.setProperty('--popup-titlebar-bg', theme.titlebarBg ?? '#ab0075');
  el.style.setProperty('--popup-titlebar-text', theme.titlebarText ?? 'white');
  el.style.setProperty('--popup-titlebar-divider', theme.titlebarDivider ?? '#808080');
  el.style.setProperty(
    '--popup-close-bg',
    (theme.closeBg ?? theme.panelBg ?? '#ff77d4') as string
  );
  el.style.setProperty('--popup-btn-bg', theme.buttonBg ?? '#fff');
  el.style.setProperty('--popup-btn-border-top', theme.buttonBorderTop ?? '#000');
  el.style.setProperty('--popup-btn-border-left', theme.buttonBorderLeft ?? '#000');
  el.style.setProperty('--popup-btn-border-bottom', theme.buttonBorderBottom ?? '#000');
  el.style.setProperty('--popup-btn-border-right', theme.buttonBorderRight ?? '#000');
  el.style.setProperty('--popup-btn-active-bg', theme.buttonActiveBg ?? '#fff');
  el.style.setProperty('--popup-btn-active-border-top', theme.buttonActiveBorderTop ?? '#000');
  el.style.setProperty('--popup-btn-active-border-left', theme.buttonActiveBorderLeft ?? '#000');
  el.style.setProperty('--popup-btn-active-border-bottom', theme.buttonActiveBorderBottom ?? '#000');
  el.style.setProperty('--popup-btn-active-border-right', theme.buttonActiveBorderRight ?? '#000');
}

export function juegoThemeForMode(
  modo: ActiveColor,
  daltonismo1: ModalTheme,
  daltonismo2: ModalTheme
): ModalTheme {
  if (modo === 'original') {
    return JUEGO_ORIGINAL_THEME;
  }
  if (modo === 'daltonismo1') {
    return daltonismo1;
  }
  return daltonismo2;
}
