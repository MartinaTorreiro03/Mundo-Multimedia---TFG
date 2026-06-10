export interface MosaicoItemVoice {
  clave: string;
  hintLabel: string;
  keywords: string[];
}

export const MOSAICO_ITEMS_VOICE: MosaicoItemVoice[] = [
  {
    clave: 'daguerrotipo',
    hintLabel: 'daguerrotipo',
    keywords: ['daguerrotipo', 'daguerre', 'daguerrotipos'],
  },
  {
    clave: 'kodakBrownie',
    hintLabel: 'brownie',
    keywords: ['kodak brownie', 'kodak browni', 'brownie', 'browni', 'brawnie'],
  },
  {
    clave: 'kodakCarousel',
    hintLabel: 'diapositivas',
    keywords: ['kodak carousel', 'kodak carrusel', 'diapositivas', 'diapositiva', 'proyector kodak'],
  },
  {
    clave: 'polaroidSX70',
    hintLabel: 'polaroid',
    keywords: ['polaroid', 'polaroid sx 70', 'sx 70', 'sx70'],
  },
];

export function mosaicoItemHintLabel(clave: string): string {
  return MOSAICO_ITEMS_VOICE.find(d => d.clave === clave)?.hintLabel ?? clave;
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
    for (let j = i + 2; j <= tokens.length && j - i <= 4; j++) {
      phrases.add(tokens.slice(i, j).join(' '));
    }
  }
  return [...phrases];
}

export function matchMosaicoClave(n: string): string | null {
  const phrases = collectPhrases(n);
  let best: { clave: string; score: number } | null = null;

  for (const item of MOSAICO_ITEMS_VOICE) {
    for (const kw of item.keywords) {
      const matched = phrases.some(p => phraseMatchesKeyword(p, kw));
      if (!matched) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { clave: item.clave, score };
    }
  }

  return best?.clave ?? null;
}

export function parseMosaicoOpenCommand(n: string): string | null {
  if (hasMosaicoCloseIntent(n)) return null;
  return matchMosaicoClave(n);
}

function hasMosaicoCloseIntent(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  return tokens.some(t => t === 'cerrar' || t === 'cierra' || t === 'salir' || t === 'sali');
}
