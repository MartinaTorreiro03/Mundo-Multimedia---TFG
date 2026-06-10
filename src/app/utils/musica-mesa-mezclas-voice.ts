import { parseFiltrosAdjustDeltas, normalizeSpokenNumbers } from './imagen-filtros-voice';

export type MesaDeckIndex = 1 | 2 | 3;
export type MesaEqBand = 'bass' | 'mid' | 'treble';
export type MesaWaveType = 'sine' | 'triangle' | 'square' | 'sawtooth';

export type MesaSliderTarget =
  | { kind: 'tune'; deck: MesaDeckIndex }
  | { kind: 'vol'; track: MesaDeckIndex }
  | { kind: 'vol'; track: 'master' }
  | { kind: 'eq'; track: MesaDeckIndex; band: MesaEqBand };

export type MesaMezclasVoiceParsed =
  | { kind: 'deckPlay'; deck: MesaDeckIndex; play: boolean }
  | { kind: 'deckWave'; deck: MesaDeckIndex; wave: MesaWaveType }
  | { kind: 'pad'; padId: string }
  | { kind: 'recordStart' }
  | { kind: 'recordStop' }
  | { kind: 'download' }
  | { kind: 'selectSlider'; target: MesaSliderTarget }
  | { kind: 'adjust'; deltas: number[] };

const DECK_NUM: Record<string, MesaDeckIndex> = {
  '1': 1,
  uno: 1,
  '2': 2,
  dos: 2,
  '3': 3,
  tres: 3,
};

const PAD_VOICE: { id: string; hint: string; keywords: string[] }[] = [
  {
    id: 'kick',
    hint: 'kick',
    keywords: [
      'kick',
      'kik',
      'kic',
      'quic',
      'quik',
      'quick',
      'kike',
      'kique',
      'quique',
      'kit',
      'keik',
      'keek',
      'click',
      'clic',
      'clique',
      'bombo',
      'patada',
    ],
  },
  {
    id: 'snare',
    hint: 'snare',
    keywords: [
      'snare',
      'esnare',
      'sner',
      'esner',
      'snar',
      'sneer',
      'redoble',
      'caja',
      'cascara',
    ],
  },
  {
    id: 'hihat',
    hint: 'hi-hat',
    keywords: [
      'hi-hat',
      'hi hat',
      'hihat',
      'jijat',
      'ji jat',
      'ji-jat',
      'jai jat',
      'jai-jat',
      'hay hat',
      'hai hat',
      'hai-hat',
      'platillo',
    ],
  },
  {
    id: 'tom',
    hint: 'tom',
    keywords: ['tom', 'toms', 'tum', 'tam', 'tambor tom', 'tom-tom', 'tom tom'],
  },
  {
    id: 'clap',
    hint: 'clap',
    keywords: ['clap', 'club', 'klap', 'klup', 'claps', 'aplause', 'aplauso', 'palmada', 'palmas'],
  },
  {
    id: 'cowbell',
    hint: 'cowbell',
    keywords: [
      'cowbell',
      'cow bell',
      'caubel',
      'caubell',
      'cau bel',
      'cau bell',
      'cau-bell',
      'cau-bel',
      'cowell',
      'cauwell',
      'campana',
      'campanilla',
    ],
  },
  {
    id: 'conga',
    hint: 'conga',
    keywords: ['conga', 'congas', 'konga', 'congaa', 'tumbadora'],
  },
  {
    id: 'perc',
    hint: 'perc',
    keywords: [
      'perc',
      'percu',
      'percusion',
      'perk',
      'percs',
      'percus',
      'percusión',
      'percutir',
      'percutor',
    ],
  },
];

const EQ_VOICE: { band: MesaEqBand; keywords: string[] }[] = [
  { band: 'bass', keywords: ['bass', 'bajo', 'bas', 'vas', 'base', 'bajos', 'grave', 'graves', 'low'] },
  {
    band: 'mid',
    keywords: ['mid', 'medios', 'medio', 'med', 'mids', 'medio tono', 'mediano', 'central'],
  },
  {
    band: 'treble',
    keywords: [
      'treble',
      'agudos',
      'agudo',
      'trebel',
      'trevle',
      'trebol',
      'trebbel',
      'trebble',
      'trible',
      'trivle',
      'treb',
      'trev',
      'trable',
      'tréble',
      'high',
      'altos',
      'alto',
      'aguda',
    ],
  },
];

const WAVE_VOICE: { wave: MesaWaveType; keywords: string[] }[] = [
  { wave: 'sine', keywords: ['seno', 'sin', 'sinusoidal', 'sinus', 'sin ' ] },
  { wave: 'triangle', keywords: ['triangular', 'triangulo', 'triangulo', 'tri'] },
  { wave: 'square', keywords: ['cuadrada', 'cuadrado', 'cuadr', 'sqr', 'square'] },
  { wave: 'sawtooth', keywords: ['sierra', 'saw', 'diente', 'sawtooth'] },
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function phraseMatchesKeyword(phrase: string, kw: string): boolean {
  if (!phrase || !kw) return false;
  if (kw.includes(' ')) return phrase.includes(kw);
  const re = new RegExp(`(?:^|\\s)${escapeRegExp(kw)}(?:\\s|$)`, 'i');
  return re.test(` ${phrase} `);
}

function nearTokenMatch(token: string, kw: string): boolean {
  if (!token || !kw) return false;
  if (token === kw) return true;
  if (token.length < 3 || kw.length < 3) return false;
  if (Math.abs(token.length - kw.length) > 1) return false;
  let mismatches = 0;
  const len = Math.min(token.length, kw.length);
  for (let i = 0; i < len; i++) {
    if (token[i] !== kw[i]) mismatches++;
    if (mismatches > 1) return false;
  }
  return mismatches + Math.abs(token.length - kw.length) <= 1;
}

function matchPadKeyword(phrase: string, kw: string): boolean {
  if (phraseMatchesKeyword(phrase, kw)) return true;
  if (!kw.includes(' ') && phrase === phrase.trim() && nearTokenMatch(phrase, kw)) return true;
  return false;
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

export function parseMesaDeckIndex(n: string): MesaDeckIndex | null {
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (DECK_NUM[t]) return DECK_NUM[t];
  }
  return null;
}

export function mesaDeckPlayHint(deck: MesaDeckIndex, playing: boolean): string {
  return playing ? `pause ${deck}` : `play ${deck}`;
}

export function mesaRecordHint(recording: boolean): string {
  return recording ? 'detener' : 'grabar';
}

export function mesaWaveHint(wave: MesaWaveType, deck: MesaDeckIndex): string {
  const labels: Record<MesaWaveType, string> = {
    sine: 'seno',
    triangle: 'triangular',
    square: 'cuadrada',
    sawtooth: 'sierra',
  };
  return `${labels[wave]} ${deck}`;
}

export function mesaPadHint(padId: string): string {
  return PAD_VOICE.find(p => p.id === padId)?.hint ?? padId;
}

export function mesaTuneHint(deck: MesaDeckIndex): string {
  return `tono ${deck}`;
}

export function mesaVolHint(track: MesaDeckIndex | 'master'): string {
  return track === 'master' ? 'volumen final' : `volumen ${track}`;
}

export function mesaEqHint(band: MesaEqBand, track: MesaDeckIndex): string {
  return `${band} ${track}`;
}

function parseDeckPlayCommand(n: string): { deck: MesaDeckIndex; play: boolean } | null {
  const norm = normalizeSpokenNumbers(n);
  const playRe = /(?:^|\s)(play|reproducir|reproduce)(?:\s+(\d+|uno|dos|tres))?(?:\s|$)/i;
  const pauseRe = /(?:^|\s)(pause|pausar|pausa|detener|parar)(?:\s+(\d+|uno|dos|tres))?(?:\s|$)/i;
  let m = playRe.exec(norm);
  if (m) {
    const deck = (m[2] && DECK_NUM[m[2].toLowerCase()]) || parseMesaDeckIndex(norm);
    if (deck) return { deck, play: true };
  }
  m = pauseRe.exec(norm);
  if (m) {
    const deck = (m[2] && DECK_NUM[m[2].toLowerCase()]) || parseMesaDeckIndex(norm);
    if (deck) return { deck, play: false };
  }
  return null;
}

function parseWaveCommand(n: string): { deck: MesaDeckIndex; wave: MesaWaveType } | null {
  const phrases = collectPhrases(n);
  let wave: MesaWaveType | null = null;
  for (const w of WAVE_VOICE) {
    if (phrases.some(p => w.keywords.some(kw => phraseMatchesKeyword(p, kw)))) {
      wave = w.wave;
      break;
    }
  }
  if (!wave) return null;
  const deck = parseMesaDeckIndex(n);
  if (!deck) return null;
  return { deck, wave };
}

function parsePadCommand(n: string): string | null {
  const norm = normalizeSpokenNumbers(n);
  const phrases = collectPhrases(norm);
  const tokens = norm.split(/\s+/).filter(Boolean);
  let bestId: string | null = null;
  let bestScore = -1;

  const consider = (padId: string, score: number): void => {
    if (score > bestScore) {
      bestScore = score;
      bestId = padId;
    }
  };

  for (const pad of PAD_VOICE) {
    if (norm === pad.id || norm === pad.hint) {
      consider(pad.id, 100);
    }
    for (const kw of pad.keywords) {
      if (phrases.some(p => matchPadKeyword(p, kw))) {
        consider(pad.id, kw.length + (kw.includes(' ') ? 10 : 0));
        continue;
      }
      if (!kw.includes(' ') && tokens.some(t => matchPadKeyword(t, kw))) {
        consider(pad.id, kw.length + 5);
      }
    }
  }

  return bestId;
}

export function hasMesaPadCommand(n: string): boolean {
  return parsePadCommand(n) !== null;
}

function matchEqBand(n: string): MesaEqBand | null {
  const phrases = collectPhrases(n);
  let best: { band: MesaEqBand; score: number } | null = null;

  const tokens = n.split(/\s+/).filter(Boolean);

  for (const item of EQ_VOICE) {
    for (const kw of item.keywords) {
      const matched =
        phrases.some(p => phraseMatchesKeyword(p, kw) || (!kw.includes(' ') && nearTokenMatch(p, kw))) ||
        (!kw.includes(' ') && tokens.some(t => phraseMatchesKeyword(t, kw) || nearTokenMatch(t, kw)));
      if (!matched) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { band: item.band, score };
    }
  }

  return best?.band ?? null;
}

function parseSelectSlider(n: string): MesaSliderTarget | null {
  const norm = normalizeSpokenNumbers(n);
  const deck = parseMesaDeckIndex(norm);

  if (/(?:^|\s)(volumen\s+final|volumen\s+master|master)(?:\s|$)/i.test(norm)) {
    return { kind: 'vol', track: 'master' };
  }
  if (/(?:^|\s)volumen(?:\s|$)/i.test(norm) && deck) {
    return { kind: 'vol', track: deck };
  }
  if (/(?:^|\s)(tono|tune)(?:\s|$)/i.test(norm) && deck) {
    return { kind: 'tune', deck };
  }

  const band = matchEqBand(norm);
  if (band) {
    const track = deck ?? 1;
    return { kind: 'eq', track, band };
  }

  return null;
}

export function hasMesaGrabarCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  return tokens.some(t => t === 'grabar' || t === 'graba' || t === 'record' || t === 'rec');
}

export function hasMesaDetenerCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  return tokens.some(t => t === 'detener' || t === 'deten' || t === 'parar' || t === 'stop');
}

export function hasMesaDescargarCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  return tokens.some(t => t === 'descargar' || t === 'descarga' || t === 'download');
}

function stripSliderKeywords(n: string): string {
  let s = normalizeSpokenNumbers(n);
  for (const item of EQ_VOICE) {
    for (const kw of item.keywords) {
      if (kw.includes(' ')) {
        s = s.replace(new RegExp(escapeRegExp(kw), 'gi'), ' ');
      } else {
        s = s.replace(new RegExp(`(?:^|\\s)${escapeRegExp(kw)}(?:\\s|$)`, 'gi'), ' ');
      }
    }
  }
  return s
    .replace(/(?:^|\s)(volumen\s+final|volumen\s+master|master|volumen|tono|tune)(?:\s+\d+)?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseMesaMezclasVoiceCommands(n: string): MesaMezclasVoiceParsed[] {
  if (!n) return [];
  const cmds: MesaMezclasVoiceParsed[] = [];

  if (hasMesaDescargarCommand(n)) {
    cmds.push({ kind: 'download' });
    return cmds;
  }

  const play = parseDeckPlayCommand(n);
  if (play) {
    cmds.push({ kind: 'deckPlay', ...play });
    return cmds;
  }

  const pad = parsePadCommand(n);
  if (pad) {
    cmds.push({ kind: 'pad', padId: pad });
    return cmds;
  }

  if (hasMesaGrabarCommand(n)) {
    cmds.push({ kind: 'recordStart' });
    return cmds;
  }
  if (hasMesaDetenerCommand(n) && !parseMesaDeckIndex(n)) {
    cmds.push({ kind: 'recordStop' });
    return cmds;
  }

  const wave = parseWaveCommand(n);
  if (wave) {
    cmds.push({ kind: 'deckWave', ...wave });
    return cmds;
  }

  const deltas = parseFiltrosAdjustDeltas(n);
  const stripped = stripSliderKeywords(n);
  const target = parseSelectSlider(stripped) ?? parseSelectSlider(n);
  if (target) cmds.push({ kind: 'selectSlider', target });
  if (deltas.length) cmds.push({ kind: 'adjust', deltas });

  return cmds;
}

export function mesaSliderTargetLabel(target: MesaSliderTarget): string {
  switch (target.kind) {
    case 'tune':
      return `tono ${target.deck}`;
    case 'vol':
      return target.track === 'master' ? 'volumen final' : `volumen ${target.track}`;
    case 'eq':
      return `${target.band} ${target.track}`;
  }
}
