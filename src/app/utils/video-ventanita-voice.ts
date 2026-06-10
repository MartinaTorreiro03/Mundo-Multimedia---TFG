export type VideoVentanitaClave = 'camaraCine' | 'proyector';

export interface VideoVentanitaVoice {
  clave: VideoVentanitaClave;
  hintLabel: string;
  keywords: string[];
}

export const VIDEO_VENTANITA_VOICE: VideoVentanitaVoice[] = [
  {
    clave: 'camaraCine',
    hintLabel: 'cámara',
    keywords: [
      'camara',
      'cámara',
      'camara de cine',
      'cámara de cine',
      'camara antigua',
      'cámara antigua',
    ],
  },
  {
    clave: 'proyector',
    hintLabel: 'proyector',
    keywords: ['proyector', 'proyectores', 'proyector de cine', 'cinema'],
  },
];

export function videoVentanitaHintLabel(clave: VideoVentanitaClave): string {
  return VIDEO_VENTANITA_VOICE.find(d => d.clave === clave)?.hintLabel ?? clave;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function phraseMatchesKeyword(phrase: string, kw: string): boolean {
  if (!phrase || !kw) return false;
  if (kw.includes(' ')) {
    return phrase.includes(kw);
  }
  const re = new RegExp(`(?:^|\\s)${escapeRegExp(kw)}(?:\\s|$)`, 'i');
  return re.test(` ${phrase} `);
}

function collectPhrases(n: string): string[] {
  const tokens = n.split(/\s+/).filter(Boolean);
  const phrases = new Set<string>([n, ...tokens]);
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 2; j <= tokens.length && j - i <= 5; j++) {
      phrases.add(tokens.slice(i, j).join(' '));
    }
  }
  return [...phrases];
}

export function parseVideoVentanitaOpenCommand(n: string): VideoVentanitaClave | null {
  const phrases = collectPhrases(n);
  let best: { clave: VideoVentanitaClave; score: number } | null = null;

  for (const item of VIDEO_VENTANITA_VOICE) {
    for (const kw of item.keywords) {
      const matched = phrases.some(p => phraseMatchesKeyword(p, kw));
      if (!matched) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { clave: item.clave, score };
    }
  }

  return best?.clave ?? null;
}

export function isVideoVentanitaInViewport(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.querySelector('app-video .ventanita');
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.height < 80 || r.width < 80) return false;
  const vh = window.innerHeight;
  const centerY = r.top + r.height / 2;
  return centerY >= vh * 0.12 && centerY <= vh * 0.92;
}
