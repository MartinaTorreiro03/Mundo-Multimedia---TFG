export type MusicaVentanitaClave = 'sintetizador' | 'tocadiscos';

export interface MusicaVentanitaVoice {
  clave: MusicaVentanitaClave;
  hintLabel: string;
  keywords: string[];
}

export const MUSICA_VENTANITA_VOICE: MusicaVentanitaVoice[] = [
  {
    clave: 'sintetizador',
    hintLabel: 'sintetizador',
    keywords: [
      'sintetizador',
      'sintetizadores',
      'sintetisa',
      'sintetico',
      'sintetica',
      'sinte',
      'synth',
      'synthesizer',
      'sintesis',
      'sin tesis',
      'sin tetizador',
    ],
  },
  {
    clave: 'tocadiscos',
    hintLabel: 'tocadiscos',
    keywords: [
      'tocadiscos',
      'toca discos',
      'tocadisco',
      'tocador discos',
      'tocadiscos digital',
      'toca discos digital',
      'discos digital',
      'plato',
      'vinilo digital',
      'tocadiscos digitales',
    ],
  },
];

export function musicaVentanitaHintLabel(clave: MusicaVentanitaClave): string {
  return MUSICA_VENTANITA_VOICE.find(d => d.clave === clave)?.hintLabel ?? clave;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function phraseMatchesKeyword(phrase: string, kw: string): boolean {
  if (!phrase || !kw) return false;
  if (kw.includes(' ')) return phrase.includes(kw);
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

export function parseMusicaVentanitaOpenCommand(n: string): MusicaVentanitaClave | null {
  const phrases = collectPhrases(n);
  let bestId: MusicaVentanitaClave | null = null;
  let bestScore = -1;

  for (const item of MUSICA_VENTANITA_VOICE) {
    for (const kw of item.keywords) {
      if (!phrases.some(p => phraseMatchesKeyword(p, kw))) continue;
      const score = kw.length;
      if (score > bestScore) {
        bestScore = score;
        bestId = item.clave;
      }
    }
  }

  return bestId;
}

export function isMusicaVentanitaInViewport(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.querySelector('app-musica .ventanita');
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.height < 80 || r.width < 80) return false;
  const vh = window.innerHeight;
  const centerY = r.top + r.height / 2;
  return centerY >= vh * 0.12 && centerY <= vh * 0.92;
}
