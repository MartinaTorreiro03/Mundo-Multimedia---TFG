export type MediaDeckFormatoId = 'vhs' | 'beta' | 'dvd';

const FORMATO_VOICE: { id: MediaDeckFormatoId; hint: string; keywords: string[] }[] = [
  {
    id: 'vhs',
    hint: 'cinta',
    keywords: ['cinta vhs', 'cinta', 'vhs', 'casete', 'cassette'],
  },
  {
    id: 'beta',
    hint: 'betamax',
    keywords: ['betamax', 'beta max', 'beta'],
  },
  {
    id: 'dvd',
    hint: 'dvd',
    keywords: ['dvd', 'disco dvd', 'disco compacto video'],
  },
];

export function mediaDeckFormatoHint(id: MediaDeckFormatoId): string {
  return FORMATO_VOICE.find(f => f.id === id)?.hint ?? id;
}

export function parseMediaDeckFormatoCommand(n: string): MediaDeckFormatoId | null {
  let best: { id: MediaDeckFormatoId; score: number } | null = null;
  for (const fmt of FORMATO_VOICE) {
    for (const kw of fmt.keywords) {
      if (!n.includes(kw)) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { id: fmt.id, score };
    }
  }
  return best?.id ?? null;
}

export function hasMediaDeckReproducirCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('play') || tokens.includes('reproducir') || tokens.includes('reproduce')) return true;
  if (n.includes('reproducir') || n.includes('reproduce') || n.includes(' play')) return true;
  return false;
}

export function hasMediaDeckPausarCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('pausar') || tokens.includes('pause') || tokens.includes('pausa') || tokens.includes('parar')) {
    return true;
  }
  if (n.includes('pausar') || n.includes('pause') || n.includes(' pausa')) return true;
  return false;
}

export function hasMediaDeckVolumenCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('volumen') || tokens.includes('volumn')) return true;
  if (n.includes('volumen') || n.includes('volumn')) return true;
  return false;
}
