import { hasEscucharPauseIntent, hasEscucharPlayIntent } from './audio-escuchar-voice';

export interface ExplorarItemVoice {
  id: string;
  hintLabel: string;
  keywords: string[];
}

export const EXPLORAR_ITEMS_VOICE: ExplorarItemVoice[] = [
  { id: 'minecraft', hintLabel: 'Minecraft', keywords: ['minecraft', 'maincra', 'mine craft'] },
  { id: 'caperucita', hintLabel: 'Caperucita', keywords: ['caperucita', 'caperucita roja'] },
  {
    id: 'movil',
    hintLabel: 'móvil',
    keywords: ['movil', 'móvil', 'telefono movil', 'teléfono móvil', 'telefono', 'teléfono'],
  },
  { id: 'netflix', hintLabel: 'Netflix', keywords: ['netflix'] },
];

export function explorarItemHintLabel(id: string): string {
  return EXPLORAR_ITEMS_VOICE.find(d => d.id === id)?.hintLabel ?? id;
}

export function matchExplorarItemId(n: string): string | null {
  let best: { id: string; score: number } | null = null;
  for (const item of EXPLORAR_ITEMS_VOICE) {
    for (const kw of item.keywords) {
      if (!n.includes(kw)) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { id: item.id, score };
    }
  }
  return best?.id ?? null;
}

export function parseExplorarPlayCommand(n: string): string | null {
  const itemId = matchExplorarItemId(n);
  if (!itemId || hasEscucharPauseIntent(n)) return null;
  if (hasEscucharPlayIntent(n)) return itemId;
  const item = EXPLORAR_ITEMS_VOICE.find(d => d.id === itemId);
  if (!item) return null;
  const tokens = n.split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  const onlyItemTokens = tokens.every(t =>
    item.keywords.some(kw => {
      const parts = kw.split(/\s+/).filter(Boolean);
      return parts.length ? parts.every(p => t.includes(p) || p.includes(t)) : t.includes(kw) || kw.includes(t);
    })
  );
  return onlyItemTokens ? itemId : null;
}

export function parseExplorarGalleryPauseCommand(n: string): { itemId: string | null } | null {
  if (!hasEscucharPauseIntent(n)) return null;
  return { itemId: matchExplorarItemId(n) };
}
