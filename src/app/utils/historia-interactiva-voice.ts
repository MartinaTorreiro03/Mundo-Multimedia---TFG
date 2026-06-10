export type HistoriaTarjetaId = 1 | 2 | 3;

export const PONG_PALETA_ZONAS = 12;

export interface HistoriaTarjetaVoiceItem {
  id: HistoriaTarjetaId;
  hintLabel: string;
  keywords: string[];
}

export const HISTORIA_TARJETAS_VOICE: HistoriaTarjetaVoiceItem[] = [
  {
    id: 1,
    hintLabel: 'primeros ordenadores',
    keywords: [
      'primeros ordenadores',
      'primer ordenador',
      'ordenador',
      'ordenadores',
      'pc',
      'computadora',
      'computador',
    ],
  },
  {
    id: 2,
    hintLabel: 'primeras consolas',
    keywords: [
      'primeras consolas',
      'primera consola',
      'consola',
      'consolas',
      'videoconsola',
    ],
  },
  {
    id: 3,
    hintLabel: 'máquinas arcade',
    keywords: [
      'maquinas arcade',
      'máquinas arcade',
      'maquina arcade',
      'máquina arcade',
      'arcade',
      'arcades',
      'recreativa',
      'recreativas',
    ],
  },
];

const PONG_OPEN_KEYWORDS = [
  'pong',
  'ping',
  'mini pong',
  'minipong',
  'jugar pong',
  'juega pong',
  'abrir pong',
  'abre pong',
  'juego pong',
  'videojuego pong',
];

const NUMERO_PALABRA: Record<string, number> = {
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
  '9': 9,
  nueve: 9,
  '10': 10,
  diez: 10,
  '11': 11,
  once: 11,
  '12': 12,
  doce: 12,
};

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

export function historiaTarjetaHintLabel(id: HistoriaTarjetaId): string {
  return HISTORIA_TARJETAS_VOICE.find(t => t.id === id)?.hintLabel ?? String(id);
}

export function parseHistoriaTarjetaCommand(n: string): HistoriaTarjetaId | null {
  const phrases = collectPhrases(n);
  let best: { id: HistoriaTarjetaId; score: number } | null = null;

  for (const item of HISTORIA_TARJETAS_VOICE) {
    for (const kw of item.keywords) {
      if (!phrases.some(p => phraseMatchesKeyword(p, kw))) continue;
      const score = kw.length;
      if (!best || score > best.score) {
        best = { id: item.id, score };
      }
    }
  }

  return best?.id ?? null;
}

export function parsePongOpenCommand(n: string): boolean {
  const phrases = collectPhrases(n);
  return PONG_OPEN_KEYWORDS.some(kw => phrases.some(p => phraseMatchesKeyword(p, kw)));
}

export function parsePongPaletaZonaCommand(n: string): number | null {
  const phrases = collectPhrases(n);

  for (const phrase of phrases) {
    const m = phrase.match(/(?:zona|posicion|posición|paleta|nivel|marca)\s+(\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/i);
    if (m) {
      const z = NUMERO_PALABRA[m[1].toLowerCase()];
      if (z >= 1 && z <= PONG_PALETA_ZONAS) return z;
    }
  }

  for (const phrase of phrases) {
    for (const [word, num] of Object.entries(NUMERO_PALABRA)) {
      if (num < 1 || num > PONG_PALETA_ZONAS) continue;
      if (phraseMatchesKeyword(phrase, word)) return num;
    }
  }

  return null;
}

export function isHistoriaInteractivaInViewport(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.querySelector('app-historia-interactiva .main-wrapper');
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.height < 80 || r.width < 80) return false;
  const vh = window.innerHeight;
  const centerY = r.top + r.height / 2;
  return centerY >= vh * 0.12 && centerY <= vh * 0.92;
}

export function isPongModalOpen(): boolean {
  if (typeof document === 'undefined') return false;
  return !!document.querySelector('app-historia-interactiva .contenido-modal-pong');
}
