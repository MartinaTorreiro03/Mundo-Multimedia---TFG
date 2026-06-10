export type ImagenVentanitaClave = 'daguerrotipo' | 'epson';

export interface ImagenVentanitaVoice {
  clave: ImagenVentanitaClave;
  hintLabel: string;
  keywords: string[];
}

export const IMAGEN_VENTANITA_VOICE: ImagenVentanitaVoice[] = [
  {
    clave: 'daguerrotipo',
    hintLabel: 'daguerrotipo',
    keywords: ['daguerrotipo', 'daguerre', 'daguerrotipos', 'placa'],
  },
  {
    clave: 'epson',
    hintLabel: 'epson',
    keywords: ['epson', 'impresora', 'impresora de inyeccion', 'inyeccion de tinta', 'inyeccion'],
  },
];

export function imagenVentanitaHintLabel(clave: ImagenVentanitaClave): string {
  return IMAGEN_VENTANITA_VOICE.find(d => d.clave === clave)?.hintLabel ?? clave;
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

export function matchImagenVentanitaClave(n: string): ImagenVentanitaClave | null {
  const phrases = collectPhrases(n);
  let best: { clave: ImagenVentanitaClave; score: number } | null = null;

  for (const item of IMAGEN_VENTANITA_VOICE) {
    for (const kw of item.keywords) {
      const matched = phrases.some(p => phraseMatchesKeyword(p, kw));
      if (!matched) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { clave: item.clave, score };
    }
  }

  return best?.clave ?? null;
}

export function parseImagenVentanitaOpenCommand(n: string): ImagenVentanitaClave | null {
  return matchImagenVentanitaClave(n);
}

export function isImagenVentanitaInViewport(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.querySelector('app-imagen .ventanita');
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.height < 80 || r.width < 80) return false;
  const vh = window.innerHeight;
  const centerY = r.top + r.height / 2;
  return centerY >= vh * 0.12 && centerY <= vh * 0.92;
}
