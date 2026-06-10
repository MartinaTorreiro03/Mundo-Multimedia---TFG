export type InstrumentoId = 'piano' | 'guitarra' | 'tambor' | 'flauta' | 'violin';

export type InstrumentoSlot = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface InstrumentoVoiceItem {
  id: InstrumentoId;
  hintLabel: string;
  keywords: string[];
}

export const INSTRUMENTOS_VOICE: InstrumentoVoiceItem[] = [
  { id: 'piano', hintLabel: 'piano', keywords: ['piano'] },
  { id: 'guitarra', hintLabel: 'guitarra', keywords: ['guitarra'] },
  { id: 'tambor', hintLabel: 'tambor', keywords: ['tambor'] },
  { id: 'flauta', hintLabel: 'flauta', keywords: ['flauta'] },
  { id: 'violin', hintLabel: 'violín', keywords: ['violin', 'violín', 'violines'] },
];

const NUMERO_PALABRA: Record<string, InstrumentoSlot> = {
  '1': 1,
  uno: 1,
  '2': 2,
  dos: 2,
  '3': 3,
  tres: 3,
  '4': 4,
  cuatro: 4,
  '5': 5,
  cinco: 5,
  '6': 6,
  seis: 6,
  '7': 7,
  siete: 7,
  '8': 8,
  ocho: 8,
};

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

export function instrumentoHintLabel(id: InstrumentoId): string {
  return INSTRUMENTOS_VOICE.find(i => i.id === id)?.hintLabel ?? id;
}

export function instrumentoSlotHint(slot: InstrumentoSlot): string {
  return String(slot);
}

export function matchInstrumentoId(n: string): InstrumentoId | null {
  const phrases = collectPhrases(n);
  let best: { id: InstrumentoId; score: number } | null = null;

  for (const item of INSTRUMENTOS_VOICE) {
    for (const kw of item.keywords) {
      const matched = phrases.some(p => phraseMatchesKeyword(p, kw));
      if (!matched) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { id: item.id, score };
    }
  }

  return best?.id ?? null;
}

export function parseInstrumentoSlotCommand(n: string): InstrumentoSlot | null {
  const t = n.trim();
  if (!t) return null;
  if (NUMERO_PALABRA[t]) return NUMERO_PALABRA[t];
  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length === 1 && NUMERO_PALABRA[tokens[0]]) {
    return NUMERO_PALABRA[tokens[0]];
  }
  return null;
}

export function parseInstrumentoSelectCommand(n: string): InstrumentoId | null {
  return matchInstrumentoId(n);
}

export function parseInstrumentoPlayCommand(n: string): InstrumentoSlot | null {
  const slot = parseInstrumentoSlotCommand(n);
  if (!slot) return null;
  if (matchInstrumentoId(n)) return null;
  return slot;
}
