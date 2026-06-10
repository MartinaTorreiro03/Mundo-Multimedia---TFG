export function isTextoBlocOnPage(): boolean {
  if (typeof document === 'undefined') return false;
  return !!document.querySelector('app-texto app-bloc-notas');
}

export function isBlocNotasVoiceContext(): boolean {
  if (typeof document === 'undefined') return false;
  const bloc = document.querySelector('app-bloc-notas');
  if (!bloc) return false;

  const active = document.activeElement;
  if (active instanceof HTMLElement && bloc.contains(active)) return true;

  const r = bloc.getBoundingClientRect();
  const vh = window.innerHeight;
  const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
  if (visible < 72) return false;

  const mid = r.top + r.height / 2;
  return mid > vh * 0.18 && mid < vh * 0.88;
}
