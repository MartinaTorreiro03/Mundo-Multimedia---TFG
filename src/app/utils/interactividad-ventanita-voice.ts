export type InteractividadVentanitaClave = 'ordenador' | 'ps5';

export interface InteractividadVentanitaVoice {
  clave: InteractividadVentanitaClave;
  hintLabel: string;
  keywords: string[];
}

export const INTERACTIVIDAD_VENTANITA_VOICE: InteractividadVentanitaVoice[] = [
  {
    clave: 'ordenador',
    hintLabel: 'commodore',
    keywords: ['commodore', 'comodore', 'commodore 64', 'c64'],
  },
  {
    clave: 'ps5',
    hintLabel: 'ps5',
    keywords: [
      'ps5',
      'playstation 5',
      'playstation5',
      'ps 5',
      'pese cinco',
      'pese 5',
      'pese5',
      'pes cinco',
    ],
  },
];

export function interactividadVentanitaHintLabel(clave: InteractividadVentanitaClave): string {
  return INTERACTIVIDAD_VENTANITA_VOICE.find(d => d.clave === clave)?.hintLabel ?? clave;
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
  const normalized = n
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const phrases = new Set<string>([normalized, ...tokens]);
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 2; j <= tokens.length && j - i <= 5; j++) {
      phrases.add(tokens.slice(i, j).join(' '));
    }
  }
  return [...phrases];
}

export function parseInteractividadVentanitaOpenCommand(n: string): InteractividadVentanitaClave | null {
  const phrases = collectPhrases(n);
  let bestId: InteractividadVentanitaClave | null = null;
  let bestScore = -1;

  for (const item of INTERACTIVIDAD_VENTANITA_VOICE) {
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

export function isInteractividadVentanitaInViewport(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.querySelector('app-interactividad .ventanita');
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.height < 80 || r.width < 80) return false;
  const vh = window.innerHeight;
  const centerY = r.top + r.height / 2;
  return centerY >= vh * 0.12 && centerY <= vh * 0.92;
}
