export interface EscucharDeviceVoice {
  id: string;
  hintLabel: string;
  keywords: string[];
}

export const ESCUCHAR_DEVICES_VOICE: EscucharDeviceVoice[] = [
  { id: 'fonografo', hintLabel: 'fonógrafo', keywords: ['fonografo', 'fonógrafo', 'phonograph', 'fono'] },
  { id: 'gramofono', hintLabel: 'gramófono', keywords: ['gramofono', 'gramófono', 'gramophone'] },
  { id: 'radio', hintLabel: 'radio', keywords: ['radio am', 'radio'] },
  { id: 'cassette', hintLabel: 'cassette', keywords: ['cassette', 'casete', 'cinta'] },
  { id: 'cd', hintLabel: 'disco compacto', keywords: ['disco compacto', 'compact disc', 'discman', 'compacto'] },
  { id: 'carrete', hintLabel: 'carrete', keywords: ['carrete', 'grabadora carrete', 'grabadora', 'reel'] },
];

export function escucharDeviceHintLabel(id: string): string {
  return ESCUCHAR_DEVICES_VOICE.find(d => d.id === id)?.hintLabel ?? id;
}

export function hasEscucharPlayIntent(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('play')) return true;
  if (
    n.includes('reproducir') ||
    n.includes('reproduce') ||
    n.includes('reproducir fragmento') ||
    n.includes('play fragment')
  ) {
    return true;
  }
  return false;
}

export function hasEscucharPauseIntent(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('pausar') || tokens.includes('pause') || tokens.includes('parar')) return true;
  if (n.includes('pausar') || n.includes('pause')) return true;
  return false;
}

export function matchEscucharDeviceId(n: string): string | null {
  let best: { id: string; score: number } | null = null;
  for (const dev of ESCUCHAR_DEVICES_VOICE) {
    for (const kw of dev.keywords) {
      if (!n.includes(kw)) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { id: dev.id, score };
    }
  }
  return best?.id ?? null;
}

export function parseEscucharGalleryCommand(n: string): { deviceId: string; play: boolean } | null {
  const deviceId = matchEscucharDeviceId(n);
  if (!deviceId) return null;
  if (hasEscucharPauseIntent(n)) return null;
  return { deviceId, play: hasEscucharPlayIntent(n) };
}

export function parseEscucharGalleryPauseCommand(n: string): { deviceId: string | null } | null {
  if (!hasEscucharPauseIntent(n)) return null;
  return { deviceId: matchEscucharDeviceId(n) };
}

export function isBarePlayInDetalleCommand(n: string): boolean {
  const t = n.trim();
  if (t === 'play' || t === 'reproducir' || t === 'reproduce') return true;
  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length === 1 && (tokens[0] === 'play' || tokens[0] === 'reproducir')) return true;
  if (t.includes('reproducir fragmento') || t.includes('play fragment')) return true;
  return false;
}
