export type AudiovisualVentanitaClave = 'quinetofono' | 'camara';

export interface AudiovisualVentanitaVoice {
  clave: AudiovisualVentanitaClave;
  hintLabel: string;
  keywords: string[];
}

export const AUDIOVISUAL_VENTANITA_VOICE: AudiovisualVentanitaVoice[] = [
  {
    clave: 'quinetofono',
    hintLabel: 'quinetófono',
    keywords: [
      'quinetofono',
      'quinetófono',
      'quinetoscopio',
      'kinetofono',
      'kinetófono',
      'quineto',
    ],
  },
  {
    clave: 'camara',
    hintLabel: 'cámara digital',
    keywords: [
      'camara digital',
      'cámara digital',
      'digital',
      'camara',
      'cámara',
      'camera',
    ],
  },
];

export function audiovisualVentanitaHintLabel(clave: AudiovisualVentanitaClave): string {
  return AUDIOVISUAL_VENTANITA_VOICE.find(d => d.clave === clave)?.hintLabel ?? clave;
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
    for (let j = i + 2; j <= tokens.length && j - i <= 5; j++) {
      phrases.add(tokens.slice(i, j).join(' '));
    }
  }
  return [...phrases];
}

export function parseAudiovisualVentanitaOpenCommand(n: string): AudiovisualVentanitaClave | null {
  const phrases = collectPhrases(n);
  let bestId: AudiovisualVentanitaClave | null = null;
  let bestScore = -1;

  for (const item of AUDIOVISUAL_VENTANITA_VOICE) {
    for (const kw of item.keywords) {
      if (!phrases.some(p => phraseMatchesKeyword(p, kw))) continue;
      const score = kw.length;
      if (score > bestScore) {
        bestScore = score;
        bestId = item.clave;
      }
    }
  }

  return bestId;
}

export function isAudiovisualVentanitaInViewport(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.querySelector('app-audiovisual .ventanita');
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.height < 80 || r.width < 80) return false;
  const vh = window.innerHeight;
  const centerY = r.top + r.height / 2;
  return centerY >= vh * 0.12 && centerY <= vh * 0.92;
}
