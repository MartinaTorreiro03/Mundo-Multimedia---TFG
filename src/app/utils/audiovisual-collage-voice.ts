export type CollageColumn = 'videos' | 'audios' | 'textos' | 'gifs';

export type CollageVoiceParsed =
  | { kind: 'selectColumn'; column: CollageColumn }
  | { kind: 'selectItem'; index: number };

const ITEM_TOKEN_INDEX: Record<string, number> = {
  '1': 0,
  uno: 0,
  '2': 1,
  dos: 1,
  '3': 2,
  tres: 2,
};

const COLUMN_KEYWORDS: { column: CollageColumn; keywords: string[] }[] = [
  { column: 'videos', keywords: ['videos', 'video', 'vídeos', 'vídeo'] },
  { column: 'audios', keywords: ['sonidos', 'sonido', 'audios', 'audio'] },
  { column: 'textos', keywords: ['textos', 'texto'] },
  { column: 'gifs', keywords: ['gifs', 'gif'] },
];

export function collageColumnHint(column: CollageColumn): string {
  switch (column) {
    case 'videos':
      return 'vídeos';
    case 'audios':
      return 'sonidos';
    case 'textos':
      return 'textos';
    case 'gifs':
      return 'gifs';
  }
}

export function collageItemHint(index: number): string {
  return String(index + 1);
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
  const tokens = n.split(/\s+/).filter(Boolean);
  const phrases = new Set<string>([n, ...tokens]);
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 2; j <= tokens.length && j - i <= 4; j++) {
      phrases.add(tokens.slice(i, j).join(' '));
    }
  }
  return [...phrases];
}

function matchColumn(n: string): CollageColumn | null {
  const phrases = collectPhrases(n);
  let best: { column: CollageColumn; score: number } | null = null;

  for (const entry of COLUMN_KEYWORDS) {
    for (const kw of entry.keywords) {
      if (!phrases.some(p => phraseMatchesKeyword(p, kw))) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { column: entry.column, score };
    }
  }

  return best?.column ?? null;
}

function matchItemIndex(n: string): number | null {
  if (matchColumn(n)) return null;
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    const idx = ITEM_TOKEN_INDEX[t];
    if (idx !== undefined) return idx;
  }
  return null;
}

export function parseCollageVoiceCommands(n: string): CollageVoiceParsed[] {
  if (!n) return [];
  const cmds: CollageVoiceParsed[] = [];

  const column = matchColumn(n);
  if (column) {
    cmds.push({ kind: 'selectColumn', column });
    return cmds;
  }

  const itemIdx = matchItemIndex(n);
  if (itemIdx !== null) {
    cmds.push({ kind: 'selectItem', index: itemIdx });
    return cmds;
  }

  return cmds;
}
