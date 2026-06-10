export type InmersivoFlechaId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type InmersivoFlechaRotacion = { x: number; y: number };

const FLECHA_VOICE: { id: InmersivoFlechaId; rot: InmersivoFlechaRotacion }[] = [
  { id: 1, rot: { x: 4, y: 0 } },
  { id: 2, rot: { x: 4, y: 4 } },
  { id: 3, rot: { x: 0, y: 4 } },
  { id: 4, rot: { x: -4, y: 4 } },
  { id: 5, rot: { x: -4, y: 0 } },
  { id: 6, rot: { x: -4, y: -4 } },
  { id: 7, rot: { x: 0, y: -4 } },
  { id: 8, rot: { x: 4, y: -4 } },
];

const NUMERO_PALABRA: Record<string, InmersivoFlechaId> = {
  '1': 1,
  'uno': 1,
  '2': 2,
  'dos': 2,
  '3': 3,
  'tres': 3,
  '4': 4,
  'cuatro': 4,
  '5': 5,
  'cinco': 5,
  '6': 6,
  'seis': 6,
  '7': 7,
  'siete': 7,
  '8': 8,
  'ocho': 8,
};

export function inmersivoFlechaHint(id: InmersivoFlechaId): string {
  return String(id);
}

export function inmersivoFlechaRotacion(id: InmersivoFlechaId): InmersivoFlechaRotacion {
  return FLECHA_VOICE.find(f => f.id === id)?.rot ?? { x: 0, y: 0 };
}

export function parseInmersivoFlechaCommand(n: string): InmersivoFlechaId | null {
  const t = n.trim();
  if (!t) return null;

  if (NUMERO_PALABRA[t]) return NUMERO_PALABRA[t];

  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length === 1 && NUMERO_PALABRA[tokens[0]]) {
    return NUMERO_PALABRA[tokens[0]];
  }

  return null;
}
