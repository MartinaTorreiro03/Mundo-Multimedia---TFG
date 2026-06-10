import { normalizeSpokenNumbers } from './imagen-filtros-voice';

export type EvolucionInterfazEpocaId = 0 | 1 | 2 | 3 | 4;
export type EvolucionInterfazDireccion = 1 | 2 | 3 | 4;

export interface EvolucionInterfazVoiceItem {
  id: EvolucionInterfazEpocaId;
  hintLabel: string;
  keywords: string[];
}

export const EVOLUCION_INTERFAZ_EPOCA_VOICE: EvolucionInterfazVoiceItem[] = [
  {
    id: 0,
    hintLabel: 'ratón y teclado',
    keywords: [
      'raton y teclado',
      'ratón y teclado',
      'raton teclado',
      'ratón teclado',
      'raton',
      'ratón',
      'teclado',
      'mouse',
    ],
  },
  {
    id: 1,
    hintLabel: 'pantallas táctiles',
    keywords: [
      'pantallas tactiles',
      'pantallas táctiles',
      'pantalla tactil',
      'pantalla táctil',
      'tactil',
      'táctil',
      'touch',
      'multitouch',
    ],
  },
  {
    id: 2,
    hintLabel: 'mandos',
    keywords: ['mandos', 'mando', 'gamepad', 'joystick', 'control', 'controles'],
  },
  {
    id: 3,
    hintLabel: 'sensores de movimiento',
    keywords: [
      'sensores de movimiento',
      'sensor de movimiento',
      'sensores movimiento',
      'sensor movimiento',
      'kinect',
      'gestos',
    ],
  },
  {
    id: 4,
    hintLabel: 'realidad virtual',
    keywords: [
      'realidad virtual',
      'realidad virtua',
      'gafas vr',
      'gafas de realidad virtual',
    ],
  },
];

const DIRECCION_WORDS: Record<EvolucionInterfazDireccion, string[]> = {
  1: ['1', 'uno', 'un'],
  2: ['2', 'dos'],
  3: ['3', 'tres'],
  4: ['4', 'cuatro'],
};

function limpiarToken(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
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
    for (let j = i + 2; j <= tokens.length && j - i <= 6; j++) {
      phrases.add(tokens.slice(i, j).join(' '));
    }
  }
  return [...phrases];
}

function tokenMatchesDirection(word: string, token: string): boolean {
  const t = limpiarToken(token);
  const w = limpiarToken(word);
  if (!t || !w) return false;
  return t === w;
}

export function evolucionInterfazEpocaHintLabel(id: EvolucionInterfazEpocaId): string {
  return EVOLUCION_INTERFAZ_EPOCA_VOICE.find(e => e.id === id)?.hintLabel ?? String(id);
}

export function parseEvolucionInterfazEpocaCommand(n: string): EvolucionInterfazEpocaId | null {
  const phrases = collectPhrases(n);
  let best: { id: EvolucionInterfazEpocaId; score: number } | null = null;

  for (const item of EVOLUCION_INTERFAZ_EPOCA_VOICE) {
    for (const kw of item.keywords) {
      if (!phrases.some(p => phraseMatchesKeyword(p, kw))) continue;
      const score = kw.length;
      if (!best || score > best.score) {
        best = { id: item.id, score };
      }
    }
  }

  return best?.id ?? null;
}

export function parseEvolucionInterfazDireccionCommand(n: string): EvolucionInterfazDireccion | null {
  const raw = normalizeSpokenNumbers(n)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
  const tokens = raw.split(/\s+/).map(limpiarToken).filter(Boolean);

  if (!tokens.length) return null;

  if (tokens.length === 1) {
    for (const [dirStr, words] of Object.entries(DIRECCION_WORDS) as [string, string[]][]) {
      const dir = Number(dirStr) as EvolucionInterfazDireccion;
      if (words.some(w => tokenMatchesDirection(w, tokens[0]))) return dir;
    }
  }

  let best: { dir: EvolucionInterfazDireccion; score: number } | null = null;

  for (const [dirStr, words] of Object.entries(DIRECCION_WORDS) as [string, string[]][]) {
    const dir = Number(dirStr) as EvolucionInterfazDireccion;
    for (const word of words) {
      for (const token of tokens) {
        if (!tokenMatchesDirection(word, token)) continue;
        const score = word.length;
        if (!best || score > best.score) {
          best = { dir, score };
        }
      }
    }
  }

  return best?.dir ?? null;
}

export function evolucionInterfazZonaClickCoords(
  direccion: EvolucionInterfazDireccion
): { x: number; y: number } {
  const W = 800;
  const H = 600;
  const m = 52;
  switch (direccion) {
    case 1:
      return { x: m, y: H / 2 };
    case 2:
      return { x: W / 2, y: m };
    case 3:
      return { x: W - m, y: H / 2 };
    case 4:
      return { x: W / 2, y: H - m };
  }
}

export function isEvolucionInterfacesInViewport(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.querySelector('app-evolucion-interfaces .canvas-container');
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.height < 80 || r.width < 80) return false;
  const vh = window.innerHeight;
  const centerY = r.top + r.height / 2;
  return centerY >= vh * 0.12 && centerY <= vh * 0.92;
}
