export function isPopupHostOpen(host: Element | null | undefined): boolean {
  if (!host) return false;
  return !host.classList.contains('popup-host--closed');
}

export function isAnyPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const nodes = document.querySelectorAll('app-popup');
  for (let i = 0; i < nodes.length; i++) {
    if (isPopupHostOpen(nodes[i])) return true;
  }
  return false;
}

export function isJuegoPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-juego')?.closest('app-popup');
  return isPopupHostOpen(host);
}

export function isCarruselPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-carrusel')?.closest('app-popup');
  return isPopupHostOpen(host);
}

export function isTextoCarruselPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-carrusel-texto')?.closest('app-popup');
  return isPopupHostOpen(host);
}

export function isTextoDispositivoPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-texto .dispositivo-popup')?.closest('app-popup');
  return isPopupHostOpen(host);
}

export function isAudioEscucharPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-escuchar')?.closest('app-popup');
  return isPopupHostOpen(host);
}

export function isAudioEscucharDetalleOpen(): boolean {
  if (typeof document === 'undefined') return false;
  return !!document.querySelector('app-escuchar .detalle-overlay');
}

export function isAudioExplorarPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-explorar')?.closest('app-popup');
  return isPopupHostOpen(host);
}

export function isAudioDispositivoPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-audio .dispositivo-popup')?.closest('app-popup');
  return isPopupHostOpen(host);
}

export function isVideoDispositivoPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-video .dispositivo-popup')?.closest('app-popup');
  return isPopupHostOpen(host);
}

export function isVideoReproductoresPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-reproductores app-popup');
  return isPopupHostOpen(host);
}

export function isImagenMosaicoPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-mosaico app-popup');
  return isPopupHostOpen(host);
}

export function isImagenDispositivoPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-imagen .dispositivo-popup')?.closest('app-popup');
  return isPopupHostOpen(host);
}

export function isMusicaDispositivoPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-musica .dispositivo-popup')?.closest('app-popup');
  return isPopupHostOpen(host);
}

export function isAudiovisualDispositivoPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-audiovisual .dispositivo-popup')?.closest('app-popup');
  return isPopupHostOpen(host);
}

export function isInteractividadDispositivoPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  const host = document.querySelector('app-interactividad .dispositivo-popup')?.closest('app-popup');
  return isPopupHostOpen(host);
}
