export type EvolucionEraId =
  | 'gramofono'
  | 'vinilo'
  | 'cassette'
  | 'cd'
  | 'mp3'
  | 'streaming';

export type EvolucionControlAction = 'anterior' | 'siguiente' | 'togglePlay';

export interface EvolucionEraVoiceItem {
  id: EvolucionEraId;
  hintLabel: string;
  keywords: string[];
}

export const EVOLUCION_ERAS_VOICE: EvolucionEraVoiceItem[] = [
  {
    id: 'gramofono',
    hintLabel: 'gramófono',
    keywords: ['gramofono', 'gramófono', 'gramofonos'],
  },
  {
    id: 'vinilo',
    hintLabel: 'vinilo',
    keywords: ['vinilo', 'vinilos', 'tocadiscos'],
  },
  {
    id: 'cassette',
    hintLabel: 'cassette',
    keywords: ['cassette', 'casete', 'cassete', 'walkman'],
  },
  {
    id: 'cd',
    hintLabel: 'disco',
    keywords: ['disco', 'cd', 'compact disc', 'discman', 'disco compacto'],
  },
  {
    id: 'mp3',
    hintLabel: 'mp3',
    keywords: ['mp3', 'ipod', 'm p 3'],
  },
  {
    id: 'streaming',
    hintLabel: 'streaming',
    keywords: ['streaming', 'streamin', 'spotify', 'nube'],
  },
];

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

export function evolucionEraHintLabel(id: EvolucionEraId): string {
  return EVOLUCION_ERAS_VOICE.find(e => e.id === id)?.hintLabel ?? id;
}

export function evolucionControlHint(action: 'anterior' | 'play' | 'siguiente'): string {
  return action;
}

export function parseEvolucionEraCommand(n: string): EvolucionEraId | null {
  const phrases = collectPhrases(n);
  let best: { id: EvolucionEraId; score: number } | null = null;

  for (const item of EVOLUCION_ERAS_VOICE) {
    for (const kw of item.keywords) {
      const matched = phrases.some(p => phraseMatchesKeyword(p, kw));
      if (!matched) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { id: item.id, score };
    }
  }

  return best?.id ?? null;
}

export function hasEvolucionAnteriorCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('anterior') || tokens.includes('atras') || tokens.includes('atrás')) return true;
  return n.includes('anterior') || n.includes('hacia atras');
}

export function hasEvolucionSiguienteCommand(n: string): boolean {
  if (n.includes('pagina') || n.includes('página') || n.includes(' next page')) return false;
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('siguiente') || tokens.includes('next')) return true;
  if (n.includes('hacia adelante')) return true;
  return false;
}

export function hasEvolucionPlayCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (
    tokens.includes('play') ||
    tokens.includes('reproducir') ||
    tokens.includes('reproduce') ||
    tokens.includes('pausar') ||
    tokens.includes('pause') ||
    tokens.includes('pausa') ||
    tokens.includes('parar')
  ) {
    return true;
  }
  if (n.includes('reproducir') || n.includes(' pausa') || n.includes(' play')) return true;
  return false;
}

export function parseEvolucionControlCommand(n: string): EvolucionControlAction | null {
  if (parseEvolucionEraCommand(n)) return null;
  if (hasEvolucionAnteriorCommand(n)) return 'anterior';
  if (hasEvolucionSiguienteCommand(n)) return 'siguiente';
  if (hasEvolucionPlayCommand(n)) return 'togglePlay';
  return null;
}
