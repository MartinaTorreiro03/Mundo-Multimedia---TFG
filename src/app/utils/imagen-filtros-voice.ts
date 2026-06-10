export type FiltroKey =
  | 'brightness'
  | 'contrast'
  | 'saturate'
  | 'sepia'
  | 'grayscale'
  | 'invert'
  | 'blur'
  | 'hueRotate'
  | 'opacity'
  | 'shadow'
  | 'temperature'
  | 'pixelate';

export interface FiltroVoiceMeta {
  clave: FiltroKey;
  label: string;
  hintLabel: string;
  keywords: string[];
  min: number;
  max: number;
}

export const FILTROS_VOICE: FiltroVoiceMeta[] = [
  {
    clave: 'brightness',
    label: 'Brillo',
    hintLabel: 'brillo',
    keywords: ['brillo', 'brightness', 'luminosidad'],
    min: 0,
    max: 200,
  },
  {
    clave: 'contrast',
    label: 'Contraste',
    hintLabel: 'contraste',
    keywords: ['contraste', 'contrast'],
    min: 0,
    max: 200,
  },
  {
    clave: 'saturate',
    label: 'Saturación',
    hintLabel: 'saturación',
    keywords: ['saturacion', 'saturate'],
    min: 0,
    max: 200,
  },
  { clave: 'sepia', label: 'Sepia', hintLabel: 'sepia', keywords: ['sepia'], min: 0, max: 100 },
  {
    clave: 'grayscale',
    label: 'Escala Grises',
    hintLabel: 'escala grises',
    keywords: ['escala grises', 'escala de grises', 'grayscale', 'grises', 'gris'],
    min: 0,
    max: 100,
  },
  {
    clave: 'invert',
    label: 'Invertir',
    hintLabel: 'invertir',
    keywords: ['invertir', 'invert', 'inversion'],
    min: 0,
    max: 100,
  },
  {
    clave: 'blur',
    label: 'Blur',
    hintLabel: 'blur',
    keywords: ['blur', 'desenfoque', 'desenfocar'],
    min: 0,
    max: 15,
  },
  {
    clave: 'hueRotate',
    label: 'Tono (Hue)',
    hintLabel: 'tono',
    keywords: ['tono', 'hue', 'matiz', 'tono hue'],
    min: 0,
    max: 360,
  },
  {
    clave: 'opacity',
    label: 'Opacidad',
    hintLabel: 'opacidad',
    keywords: ['opacidad', 'opacity', 'transparencia'],
    min: 0,
    max: 100,
  },
  {
    clave: 'shadow',
    label: 'Sombra',
    hintLabel: 'sombra',
    keywords: ['sombra', 'shadow'],
    min: 0,
    max: 20,
  },
  {
    clave: 'temperature',
    label: 'Temperatura',
    hintLabel: 'temperatura',
    keywords: ['temperatura', 'temperature', 'calido', 'frio'],
    min: -100,
    max: 100,
  },
  {
    clave: 'pixelate',
    label: 'Pixelado',
    hintLabel: 'pixelado',
    keywords: ['pixelado', 'pixelate', 'pixelar', 'pixeles'],
    min: 0,
    max: 20,
  },
];

export function filtroMeta(clave: FiltroKey): FiltroVoiceMeta {
  return FILTROS_VOICE.find(f => f.clave === clave)!;
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

export function matchFiltroClave(n: string): FiltroKey | null {
  const phrases = collectPhrases(n);
  let best: { clave: FiltroKey; score: number } | null = null;

  for (const item of FILTROS_VOICE) {
    for (const kw of item.keywords) {
      const matched = phrases.some(p => phraseMatchesKeyword(p, kw));
      if (!matched) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { clave: item.clave, score };
    }
  }

  return best?.clave ?? null;
}

export function hasFiltrosSalirIntent(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.some(t => t === 'salir' || t === 'sali' || t === 'exit' || t === 'sal')) return true;
  return /\bsalir\b/.test(n) || /\bexit\b/.test(n);
}

const ADJUST_DIR = 'mas|menos|more|less|mayor|menor|subir|bajar';

const ADJUST_TOKEN = new RegExp(
  `(?:^|\\s)(\\d+)\\s*(${ADJUST_DIR})(?=\\s|$)|(?:^|\\s)(${ADJUST_DIR})\\s*(\\d+)(?=\\s|$)`,
  'gi'
);

const SPOKEN_NUMBER_WORDS: Readonly<Record<string, number>> = {
  cero: 0,
  uno: 1,
  un: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  sinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  dies: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  dieciseis: 16,
  diecisiete: 17,
  dieciocho: 18,
  diecinueve: 19,
  veinte: 20,
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
  cien: 100,
  ciento: 100,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  fifteen: 15,
  twenty: 20,
  hundred: 100,
};

export function normalizeSpokenNumbers(n: string): string {
  let s = ` ${n} `;
  const entries = Object.entries(SPOKEN_NUMBER_WORDS).sort((a, b) => b[0].length - a[0].length);
  for (const [word, value] of entries) {
    const re = new RegExp(`(?:^|\\s)${escapeRegExp(word)}(?:\\s|$)`, 'gi');
    s = s.replace(re, ` ${value} `);
  }
  return s.replace(/\s+/g, ' ').trim();
}

function isIncreaseDir(dir: string): boolean {
  const d = dir.toLowerCase();
  return d === 'mas' || d === 'more' || d === 'mayor' || d === 'subir';
}

export function parseFiltrosAdjustDeltas(n: string): number[] {
  const normalized = normalizeSpokenNumbers(n);
  const deltas: number[] = [];
  let m: RegExpExecArray | null;
  ADJUST_TOKEN.lastIndex = 0;
  while ((m = ADJUST_TOKEN.exec(normalized)) !== null) {
    const amount = Number(m[1] ?? m[4]);
    const dir = (m[2] ?? m[3])?.toLowerCase();
    if (!Number.isFinite(amount) || amount <= 0 || !dir) continue;
    deltas.push(isIncreaseDir(dir) ? amount : -amount);
  }
  return deltas;
}

export type FiltrosVoiceParsed =
  | { kind: 'salir' }
  | { kind: 'ajustar'; deltas: number[] }
  | { kind: 'seleccionar'; clave: FiltroKey };

function stripAdjustPhrases(n: string): string {
  const normalized = normalizeSpokenNumbers(n);
  return normalized
    .replace(ADJUST_TOKEN, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseFiltrosVoiceCommands(n: string): FiltrosVoiceParsed[] {
  if (!n) return [];

  if (hasFiltrosSalirIntent(n)) {
    return [{ kind: 'salir' }];
  }

  const deltas = parseFiltrosAdjustDeltas(n);
  const stripped = stripAdjustPhrases(n);
  const cmds: FiltrosVoiceParsed[] = [];

  const clave = matchFiltroClave(stripped) ?? (deltas.length ? null : matchFiltroClave(n));
  if (clave) cmds.push({ kind: 'seleccionar', clave });
  if (deltas.length) cmds.push({ kind: 'ajustar', deltas });

  return cmds;
}

export function isFiltrosEditorInViewport(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.querySelector('app-filtros .editor-window');
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.height < 80 || r.width < 80) return false;
  const vh = window.innerHeight;
  const centerY = r.top + r.height / 2;
  return centerY >= vh * 0.12 && centerY <= vh * 0.92;
}
