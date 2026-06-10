import { Injectable } from '@angular/core';
import { ModalTheme } from '../componentes/popup/popup';

@Injectable({ providedIn: 'root' })
  export class PopupThemeService {

  daltonismo1: ModalTheme = {
    overlayBg: 'rgba(0,0,0,0.85)',
    panelBg: '#ffb000',
    panelText: '#000',
    borderColor: '#906200',
    insetLight: '#ffffff',
    insetDark: '#906200',
    titlebarBg: '#fe6100',
    titlebarText: 'white',
    titlebarDivider: '#808080',
    closeBg: '#ffb000',
    buttonBg: '#ffb000',
    buttonBorderTop: '#ffffff',
    buttonBorderLeft: '#ffffff',
    buttonBorderBottom: '#906200',
    buttonBorderRight: '#906200',
    buttonActiveBg: '#ffb000',
    buttonActiveBorderTop: '#906200',
    buttonActiveBorderLeft: '#906200',
    buttonActiveBorderBottom: '#ffffff',
    buttonActiveBorderRight: '#ffffff',
  };

  daltonismo2: ModalTheme = {
    overlayBg: 'rgba(0,0,0,0.85)',
    panelBg: '#e1e1e1',
    panelText: '#000',
    borderColor: '#7d7d7d',
    insetLight: '#ffffff',
    insetDark: '#404040',
    titlebarBg: '#818181',
    titlebarText: 'white',
    titlebarDivider: '#808080',
    closeBg: '#9a9a9a',
    buttonBg: '#9a9a9a',
    buttonBorderTop: '#ffffff',
    buttonBorderLeft: '#ffffff',
    buttonBorderBottom: '#404040',
    buttonBorderRight: '#404040',
    buttonActiveBg: '#e1e1e1',
    buttonActiveBorderTop: '#404040',
    buttonActiveBorderLeft: '#404040',
    buttonActiveBorderBottom: '#ffffff',
    buttonActiveBorderRight: '#ffffff',
  };
}
