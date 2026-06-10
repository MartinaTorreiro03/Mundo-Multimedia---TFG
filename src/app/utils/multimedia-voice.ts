import { normalizeSpokenNumbers } from './imagen-filtros-voice';

export type MultimediaTabId = 'canvas' | 'audio' | 'data';
export type MultimediaBrushModeId = 'particles' | 'waves' | 'ink';
export type MultimediaPaintDirection = 1 | 2 | 3 | 4;

export type MultimediaVoiceCommand =
  | { action: 'tab'; tab: MultimediaTabId }
  | { action: 'brushMode'; mode: MultimediaBrushModeId }
  | { action: 'color'; index: number }
  | { action: 'brushSize'; delta: number }
  | { action: 'clear' }
  | { action: 'paintStart' }
  | { action: 'paintExit' }
  | { action: 'paintMove'; direction: MultimediaPaintDirection }
  | { action: 'micToggle' }
  | { action: 'note'; index: number }
  | { action: 'refreshWeather' }
  | { action: 'city'; city: string };

let voicePaintActive = false;

export function setMultimediaVoicePaintActive(active: boolean): void {
  voicePaintActive = active;
}

export interface MultimediaVoiceState {
  tab: MultimediaTabId;
  paintMode: boolean;
}

const TAB_VOICE: { id: MultimediaTabId; hint: string; keywords: string[] }[] = [
  { id: 'canvas', hint: 'lienzo', keywords: ['lienzo', 'generativo', 'canvas', 'lienzo generativo'] },
  { id: 'audio', hint: 'audio', keywords: ['audio', 'reactivo', 'audio reactivo'] },
  { id: 'data', hint: 'datos', keywords: ['datos', 'vivo', 'datos en vivo', 'tiempo', 'clima'] },
];

const BRUSH_MODE_VOICE: { id: MultimediaBrushModeId; hint: string; keywords: string[] }[] = [
  { id: 'particles', hint: 'partículas', keywords: ['particulas', 'partículas', 'particula', 'partícula'] },
  { id: 'waves', hint: 'ondas', keywords: ['ondas', 'onda'] },
  { id: 'ink', hint: 'tinta', keywords: ['tinta'] },
];

const NOTE_VOICE: { index: number; hint: string; keywords: string[] }[] = [
  { index: 0, hint: 'do', keywords: ['do'] },
  { index: 1, hint: 're', keywords: ['re'] },
  { index: 2, hint: 'mi', keywords: ['mi'] },
  { index: 3, hint: 'fa', keywords: ['fa'] },
  { index: 4, hint: 'sol', keywords: ['sol'] },
  { index: 5, hint: 'la', keywords: ['la'] },
  { index: 6, hint: 'si', keywords: ['si'] },
  { index: 7, hint: 'segundo do', keywords: ['segundo do', 'segundo do alto', 'do agudo'] },
];

const CITY_VOICE: { city: string; hint: string; keywords: string[] }[] = [
  { city: 'Madrid', hint: 'madrid', keywords: ['madrid'] },
  { city: 'Barcelona', hint: 'barcelona', keywords: ['barcelona'] },
  { city: 'Valencia', hint: 'valencia', keywords: ['valencia'] },
  { city: 'Sevilla', hint: 'sevilla', keywords: ['sevilla'] },
  { city: 'Bilbao', hint: 'bilbao', keywords: ['bilbao'] },
  { city: 'Málaga', hint: 'málaga', keywords: ['malaga', 'málaga'] },
];

const PAINT_DIR_WORDS: Record<MultimediaPaintDirection, string[]> = {
  1: ['1', 'uno', 'un'],
  2: ['2', 'dos'],
  3: ['3', 'tres'],
  4: ['4', 'cuatro'],
};

function normalize(n: string): string {
  return n
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s#]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function limpiarToken(t: string): string {
  return t.replace(/[^\p{L}\p{N}#]/gu, '');
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
  const normalized = normalize(n);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const phrases = new Set<string>([normalized, ...tokens]);
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 2; j <= tokens.length && j - i <= 6; j++) {
      phrases.add(tokens.slice(i, j).join(' '));
    }
  }
  return [...phrases];
}

export function multimediaTabHint(tab: MultimediaTabId): string {
  return TAB_VOICE.find(t => t.id === tab)?.hint ?? tab;
}

export function multimediaBrushModeHint(mode: MultimediaBrushModeId): string {
  return BRUSH_MODE_VOICE.find(m => m.id === mode)?.hint ?? mode;
}

export function multimediaNoteHint(index: number): string {
  return NOTE_VOICE.find(n => n.index === index)?.hint ?? String(index + 1);
}

export function readMultimediaVoiceState(): MultimediaVoiceState {
  if (typeof document === 'undefined') {
    return { tab: 'canvas', paintMode: voicePaintActive };
  }
  const root = document.querySelector('app-multimedia');
  const tab = (root?.getAttribute('data-mm-voice-tab') as MultimediaTabId) ?? 'canvas';
  const paintMode =
    voicePaintActive || root?.getAttribute('data-mm-voice-paint') === '1';
  return { tab, paintMode };
}

export function isMultimediaInViewport(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.querySelector('app-multimedia .mm-shell');
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.height < 80 || r.width < 80) return false;
  const vh = window.innerHeight;
  return r.bottom > vh * 0.06 && r.top < vh * 0.94;
}

function parseTab(n: string): MultimediaTabId | null {
  const phrases = collectPhrases(n);
  let best: { id: MultimediaTabId; score: number } | null = null;
  for (const item of TAB_VOICE) {
    for (const kw of item.keywords) {
      if (!phrases.some(p => phraseMatchesKeyword(p, kw))) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { id: item.id, score };
    }
  }
  return best?.id ?? null;
}

function parseBrushMode(n: string): MultimediaBrushModeId | null {
  const phrases = collectPhrases(n);
  let best: { id: MultimediaBrushModeId; score: number } | null = null;
  for (const item of BRUSH_MODE_VOICE) {
    for (const kw of item.keywords) {
      if (!phrases.some(p => phraseMatchesKeyword(p, kw))) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { id: item.id, score };
    }
  }
  return best?.id ?? null;
}

function parseColorIndex(n: string): number | null {
  const tokens = normalize(normalizeSpokenNumbers(n))
    .split(/\s+/)
    .map(limpiarToken)
    .filter(Boolean);
  for (const t of tokens) {
    const num = parseInt(t, 10);
    if (num >= 1 && num <= 8) return num;
  }
  return null;
}

function parseExplicitColorCommand(n: string): number | null {
  const raw = normalize(n);
  if (!/\bcolor\b/.test(raw)) return null;

  const afterColor = raw.replace(/\bcolor\b/g, ' ').trim();
  return parseColorIndex(afterColor);
}

function parseBrushSizeDelta(n: string): number | null {
  const raw = normalize(normalizeSpokenNumbers(n));
  const numDir = raw.match(/(\d+)\s*(mas|más|menos)\b/i);
  if (numDir) {
    const amount = parseInt(numDir[1], 10);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return /^menos$/i.test(numDir[2]) ? -amount : amount;
  }
  const dirNum = raw.match(/\b(mas|más|menos)\s*(\d+)/i);
  if (dirNum) {
    const amount = parseInt(dirNum[2], 10);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return /^menos$/i.test(dirNum[1]) ? -amount : amount;
  }
  if (/\b(mas|más)\b/.test(raw) && !/\d/.test(raw)) return 1;
  if (/\bmenos\b/.test(raw) && !/\d/.test(raw)) return -1;
  return null;
}

function parseClear(n: string): boolean {
  const phrases = collectPhrases(n);
  return ['limpiar', 'borrar', 'vaciar'].some(kw => phrases.some(p => phraseMatchesKeyword(p, kw)));
}

function parsePaintStart(n: string): boolean {
  const phrases = collectPhrases(n);
  return ['dibujar', 'pintar', 'empezar a pintar', 'modo pintar'].some(kw =>
    phrases.some(p => phraseMatchesKeyword(p, kw))
  );
}

function tokenMatchesPaintDir(word: string, token: string): boolean {
  const t = limpiarToken(token);
  const w = limpiarToken(word);
  return !!t && !!w && t === w;
}

function parsePaintDirection(n: string): MultimediaPaintDirection | null {
  const tokens = normalize(normalizeSpokenNumbers(n))
    .split(/\s+/)
    .map(limpiarToken)
    .filter(Boolean);
  if (!tokens.length) return null;

  if (tokens.length === 1) {
    for (const [dirStr, words] of Object.entries(PAINT_DIR_WORDS) as [string, string[]][]) {
      const dir = Number(dirStr) as MultimediaPaintDirection;
      if (words.some(w => tokenMatchesPaintDir(w, tokens[0]!))) return dir;
    }
  }

  let best: { dir: MultimediaPaintDirection; score: number } | null = null;
  for (const [dirStr, words] of Object.entries(PAINT_DIR_WORDS) as [string, string[]][]) {
    const dir = Number(dirStr) as MultimediaPaintDirection;
    for (const word of words) {
      for (const token of tokens) {
        if (!tokenMatchesPaintDir(word, token)) continue;
        const score = word.length;
        if (!best || score > best.score) best = { dir, score };
      }
    }
  }
  return best?.dir ?? null;
}

function parsePaintExit(n: string): boolean {
  const phrases = collectPhrases(n);
  return ['salir', 'parar pintar', 'dejar de pintar', 'terminar', 'salir de dibujar'].some(kw =>
    phrases.some(p => phraseMatchesKeyword(p, kw))
  );
}

function parseMic(n: string): boolean {
  const phrases = collectPhrases(n);
  return ['micro', 'microfono', 'micrófono', 'activar micro', 'activar microfono'].some(kw =>
    phrases.some(p => phraseMatchesKeyword(p, kw))
  );
}

function parseNote(n: string): number | null {
  const phrases = collectPhrases(n);
  let best: { index: number; score: number } | null = null;
  for (const item of NOTE_VOICE) {
    for (const kw of item.keywords) {
      if (!phrases.some(p => phraseMatchesKeyword(p, kw))) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { index: item.index, score };
    }
  }
  return best?.index ?? null;
}

function parseRefresh(n: string): boolean {
  const phrases = collectPhrases(n);
  return ['actualizar', 'refrescar', 'recargar'].some(kw => phrases.some(p => phraseMatchesKeyword(p, kw)));
}

function parseCity(n: string): string | null {
  const phrases = collectPhrases(n);
  let best: { city: string; score: number } | null = null;
  for (const item of CITY_VOICE) {
    for (const kw of item.keywords) {
      if (!phrases.some(p => phraseMatchesKeyword(p, kw))) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { city: item.city, score };
    }
  }
  return best?.city ?? null;
}

export function parseMultimediaVoiceCommand(n: string): MultimediaVoiceCommand | null {
  const state = readMultimediaVoiceState();

  const tab = parseTab(n);
  if (tab) return { action: 'tab', tab };

  if (state.tab === 'canvas') {
    if (state.paintMode && parsePaintExit(n)) return { action: 'paintExit' };

    const explicitColor = parseExplicitColorCommand(n);
    if (explicitColor !== null) return { action: 'color', index: explicitColor };

    const sizeDelta = parseBrushSizeDelta(n);
    if (sizeDelta !== null) return { action: 'brushSize', delta: sizeDelta };

    if (parsePaintStart(n)) return { action: 'paintStart' };

    if (state.paintMode) {
      const dir = parsePaintDirection(n);
      if (dir) return { action: 'paintMove', direction: dir };
    }

    if (parseClear(n)) return { action: 'clear' };

    const mode = parseBrushMode(n);
    if (mode) return { action: 'brushMode', mode };

    if (!state.paintMode) {
      const colorIdx = parseColorIndex(n);
      if (colorIdx !== null) return { action: 'color', index: colorIdx };
    } else {
      const colorIdx = parseColorIndex(n);
      if (colorIdx !== null && colorIdx >= 5) return { action: 'color', index: colorIdx };
    }
  }

  if (state.tab === 'audio') {
    if (parseMic(n)) return { action: 'micToggle' };
    const noteIdx = parseNote(n);
    if (noteIdx !== null) return { action: 'note', index: noteIdx };
  }

  if (state.tab === 'data') {
    if (parseRefresh(n)) return { action: 'refreshWeather' };
    const city = parseCity(n);
    if (city) return { action: 'city', city };
  }

  return null;
}
