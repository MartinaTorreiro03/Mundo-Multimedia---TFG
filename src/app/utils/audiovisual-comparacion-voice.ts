import { parseFiltrosAdjustDeltas, normalizeSpokenNumbers } from './imagen-filtros-voice';

export type ComparacionSlider = 'duracion' | 'volumen';

export type ComparacionVoiceParsed =
  | { kind: 'play' }
  | { kind: 'pause' }
  | { kind: 'toggleMute' }
  | { kind: 'toggleBw' }
  | { kind: 'selectSlider'; slider: ComparacionSlider }
  | { kind: 'adjust'; deltas: number[] };

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

export function comparacionPlayHint(): string {
  return 'play';
}

export function comparacionPauseHint(): string {
  return 'pausa';
}

export function comparacionMuteHint(muted: boolean): string {
  return muted ? 'desmutear' : 'mutear';
}

export function comparacionFiltroHint(forceBw: boolean): string {
  return forceBw ? 'quitar filtro' : 'forzar filtro';
}

export function comparacionSliderHint(slider: ComparacionSlider): string {
  return slider === 'duracion' ? 'duración' : 'volumen';
}

function hasPlayCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  return (
    tokens.includes('play') ||
    tokens.includes('paly') ||
    tokens.includes('reproducir') ||
    tokens.includes('reproduce') ||
    tokens.includes('reproduzca')
  );
}

function hasPauseCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  return (
    tokens.includes('pausa') ||
    tokens.includes('pause') ||
    tokens.includes('pausar') ||
    tokens.includes('parar') ||
    tokens.includes('detener')
  );
}

function hasMutearCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  return tokens.includes('mutear') || tokens.includes('silenciar') || tokens.includes('mute');
}

function hasDesmutearCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  return (
    tokens.includes('desmutear') ||
    tokens.includes('activar') ||
    tokens.includes('sonido') ||
    tokens.includes('unmute')
  );
}

function hasQuitarFiltroCommand(n: string): boolean {
  const phrases = collectPhrases(n);
  return phrases.some(
    p =>
      phraseMatchesKeyword(p, 'quitar filtro') ||
      phraseMatchesKeyword(p, 'quitar') ||
      phraseMatchesKeyword(p, 'sin filtro')
  );
}

function hasForzarFiltroCommand(n: string): boolean {
  const phrases = collectPhrases(n);
  return phrases.some(
    p =>
      phraseMatchesKeyword(p, 'forzar filtro') ||
      phraseMatchesKeyword(p, 'forzar') ||
      phraseMatchesKeyword(p, 'forzar bn') ||
      phraseMatchesKeyword(p, 'blanco y negro') ||
      phraseMatchesKeyword(p, 'bn')
  );
}

function matchSlider(n: string): ComparacionSlider | null {
  const phrases = collectPhrases(normalizeSpokenNumbers(n));
  let best: { slider: ComparacionSlider; score: number } | null = null;

  const items: { slider: ComparacionSlider; keywords: string[] }[] = [
    {
      slider: 'duracion',
      keywords: ['duracion', 'duración', 'progreso', 'progress', 'tiempo', 'barra'],
    },
    { slider: 'volumen', keywords: ['volumen', 'vol', 'volume'] },
  ];

  for (const item of items) {
    for (const kw of item.keywords) {
      if (!phrases.some(p => phraseMatchesKeyword(p, kw))) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { slider: item.slider, score };
    }
  }

  return best?.slider ?? null;
}

function stripSliderKeywords(n: string): string {
  let s = normalizeSpokenNumbers(n);
  const kws = [
    'duracion',
    'duración',
    'progreso',
    'progress',
    'tiempo',
    'volumen',
    'vol',
    'volume',
  ];
  for (const kw of kws) {
    s = s.replace(new RegExp(`(?:^|\\s)${escapeRegExp(kw)}(?:\\s|$)`, 'gi'), ' ');
  }
  return s.replace(/\s+/g, ' ').trim();
}

export function parseComparacionVoiceCommands(n: string): ComparacionVoiceParsed[] {
  if (!n) return [];
  const cmds: ComparacionVoiceParsed[] = [];

  if (hasPlayCommand(n) && !hasPauseCommand(n)) {
    cmds.push({ kind: 'play' });
    return cmds;
  }
  if (hasPauseCommand(n) && !hasPlayCommand(n)) {
    cmds.push({ kind: 'pause' });
    return cmds;
  }

  const deltas = parseFiltrosAdjustDeltas(n);
  const stripped = stripSliderKeywords(n);
  const slider = matchSlider(stripped) ?? matchSlider(n);
  if (slider) cmds.push({ kind: 'selectSlider', slider });
  if (deltas.length) cmds.push({ kind: 'adjust', deltas });
  if (cmds.length) return cmds;

  const mutePhrase = stripSliderKeywords(n);
  if (hasMutearCommand(mutePhrase) && !hasDesmutearCommand(mutePhrase)) {
    cmds.push({ kind: 'toggleMute' });
    return cmds;
  }
  if (hasDesmutearCommand(mutePhrase) && !hasMutearCommand(mutePhrase)) {
    cmds.push({ kind: 'toggleMute' });
    return cmds;
  }

  if (hasQuitarFiltroCommand(n) && !hasForzarFiltroCommand(n)) {
    cmds.push({ kind: 'toggleBw' });
    return cmds;
  }
  if (hasForzarFiltroCommand(n) && !hasQuitarFiltroCommand(n)) {
    cmds.push({ kind: 'toggleBw' });
    return cmds;
  }

  return cmds;
}

export function comparacionSliderActivoLabel(slider: ComparacionSlider | null): string {
  if (!slider) return '';
  return comparacionSliderHint(slider);
}
