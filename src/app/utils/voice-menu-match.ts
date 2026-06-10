export function phraseMatchesAny(n: string, keywords: string[]): boolean {
  return keywords.some(kw => scoreKeywordMatch(n, kw) > 0);
}

export function scoreKeywordMatch(n: string, kw: string): number {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes(kw)) return 100 + kw.length;
  if (n === kw) return 100 + kw.length;
  if (kw.length >= 7 && n.includes(kw)) return 50 + kw.length;
  return 0;
}

export function hasVoiceCerrarCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (t === 'cerrar' || t === 'cierra' || t === 'cerra' || t === 'cerrad' || t === 'cerrame') return true;
    if (/^c+e+r+r+a+r?$/u.test(t)) return true;
  }
  if (n.includes('cerrar') || n.includes('cierra')) return true;
  return false;
}

export function hasVoiceSalirCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (t === 'salir' || t === 'sali' || t === 'salid') return true;
    if (/^s+a+l+i+r+$/u.test(t)) return true;
  }
  if (n.includes('salir')) return true;
  return false;
}

const NAV_BY_LABEL: Record<string, string[]> = {
  mundo: ['mundo', 'inicio', 'portada', 'principal', 'home', 'world'],
  texto: ['texto', 'text'],
  audio: ['audio'],
  imagen: ['imagen', 'image'],
  video: ['video'],
  musica: ['musica', 'music'],
  audiovisual: ['audiovisual'],
  interactividad: ['interactividad', 'interactivity', 'interactiva'],
};

function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

export function scoreNavMenuItem(n: string, label: string): number {
  const lab = normalizeLabel(label);
  const keys = NAV_BY_LABEL[lab] ?? [lab];
  let best = 0;
  for (const kw of keys) {
    best = Math.max(best, scoreKeywordMatch(n, kw));
  }
  return best;
}

export function matchNavMenuItem(n: string, label: string): boolean {
  return scoreNavMenuItem(n, label) > 0;
}

export function matchAccessibilityMenuItem(n: string, index: number): boolean {
  const sets: string[][] = [
    ['voz', 'navegacion por voz', 'navegacion voz', 'microfono', 'micro'],
    ['teclado', 'navegacion por teclado', 'navegacion teclado', 'keyboard'],
    ['vision', 'vision reducida', 'reducida'],
    ['lector', 'lector de pantalla', 'lector pantalla', 'screen reader'],
    ['explicacion', 'cambiar explicacion', 'explicaciones', 'nivel explicacion'],
  ];
  const keys = sets[index];
  return keys ? phraseMatchesAny(n, keys) : false;
}

export function matchLateralMenuItem(n: string, alt: string): boolean {
  const a = normalizeLabel(alt);
  if (phraseMatchesAny(n, ['informacion', 'info'])) {
    return a.includes('informacion');
  }
  if (phraseMatchesAny(n, ['tipografia', 'fuente', 'fuentes', 'letra', 'letras', 'tipo', 'kanit', 'dyslexic', 'dislexico', 'opendyslexic'])) {
    return a.includes('tipografia');
  }
  if (phraseMatchesAny(n, ['color', 'colores', 'daltonismo', 'dalt', 'daltonico'])) {
    return a.includes('color');
  }
  return false;
}

const NAV_HINT_DISPLAY: Record<string, string> = {
  mundo: 'mundo',
  texto: 'texto',
  audio: 'audio',
  imagen: 'imagen',
  video: 'vídeo',
  musica: 'música',
  audiovisual: 'audiovisual',
  interactividad: 'interactividad',
};

export function voiceHintForNavLabel(label: string): string {
  const lab = normalizeLabel(label);
  return NAV_HINT_DISPLAY[lab] ?? lab;
}
