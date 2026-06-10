import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full', 
    loadComponent: () => {
      return import('./pages/principal/principal').then(m => m.Principal)
    },
  },
  {
    path: 'texto',
    loadComponent: () => {
      return import('./pages/texto/texto').then(m => m.Texto)
    },
  },
  {
    path: 'audio',
    loadComponent: () => {
      return import('./pages/audio/audio').then(m => m.Audio)
    },
  },
  {
    path: 'imagen',
    loadComponent: () => {
      return import('./pages/imagen/imagen').then(m => m.Imagen)
    },
  },
  {
    path: 'video',
    loadComponent: () => {
      return import('./pages/video/video').then(m => m.Video)
    },
  },
  {
    path: 'musica',
    loadComponent: () => {
      return import('./pages/musica/musica').then(m => m.Musica)
    },
  },
  {
    path: 'audiovisual',
    loadComponent: () => {
      return import('./pages/audiovisual/audiovisual').then(m => m.Audiovisual)
    },
  },
  {
    path: 'interactividad',
    loadComponent: () => {
      return import('./pages/interactividad/interactividad').then(m => m.Interactividad)
    },
  },
];
