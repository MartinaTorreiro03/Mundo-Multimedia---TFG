export interface LineaDeviceVoice {
  clave: string;
  hintLabel: string;
  keywords: string[];
}

export const LINEA_DEVICES_VOICE: LineaDeviceVoice[] = [
  {
    clave: 'camaraRollo',
    hintLabel: 'cámara kodak',
    keywords: [
      'camara kodak',
      'camara de rollo',
      'camara rollo',
      'rollo kodak',
      'kodak rollo',
      'camara de rollo kodak',
    ],
  },
  {
    clave: 'fotografiaDigital',
    hintLabel: 'fotografía digital',
    keywords: ['fotografia digital', 'foto digital', 'fotografia digital kodak'],
  },
  {
    clave: 'smartphone',
    hintLabel: 'smartphone',
    keywords: ['smartphone', 'telefono movil', 'movil smartphone'],
  },
  {
    clave: 'redesSociales',
    hintLabel: 'redes sociales',
    keywords: ['redes sociales', 'red social', 'redes'],
  },
];

export function lineaDeviceHintLabel(clave: string): string {
  return LINEA_DEVICES_VOICE.find(d => d.clave === clave)?.hintLabel ?? clave;
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

export function matchLineaClave(n: string): string | null {
  const phrases = collectPhrases(n);
  let best: { clave: string; score: number } | null = null;

  for (const item of LINEA_DEVICES_VOICE) {
    for (const kw of item.keywords) {
      const matched = phrases.some(p => phraseMatchesKeyword(p, kw));
      if (!matched) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { clave: item.clave, score };
    }
  }

  return best?.clave ?? null;
}

export function parseLineaSelectCommand(n: string): string | null {
  return matchLineaClave(n);
}
