export type ReproductorClave = 'zootropo' | 'cinematografo' | 'camaraDeceluloide';

const REPRODUCTOR_VOICE: { clave: ReproductorClave; hint: string; keywords: string[] }[] = [
  {
    clave: 'zootropo',
    hint: 'zootropo',
    keywords: ['zootropo', 'zoótropo'],
  },
  {
    clave: 'cinematografo',
    hint: 'lumière',
    keywords: [
      'lumiere',
      'lumière',
      'hermanos lumiere',
      'hermanos lumière',
      'cinematografo',
      'cinematógrafo',
      'cinematograph',
    ],
  },
  {
    clave: 'camaraDeceluloide',
    hint: 'cine mudo',
    keywords: [
      'cine mudo',
      'cinema mudo',
      'camara de celuloide',
      'cámara de celuloide',
      'camara celuloide',
      'celuloide',
      'celuloides',
    ],
  },
];

export function reproductorHintLabel(clave: ReproductorClave): string {
  return REPRODUCTOR_VOICE.find(d => d.clave === clave)?.hint ?? clave;
}

export function parseReproductoresOpenCommand(n: string): ReproductorClave | null {
  let best: { clave: ReproductorClave; score: number } | null = null;
  for (const dev of REPRODUCTOR_VOICE) {
    for (const kw of dev.keywords) {
      if (!n.includes(kw)) continue;
      const score = kw.length;
      if (!best || score > best.score) best = { clave: dev.clave, score };
    }
  }
  return best?.clave ?? null;
}

export function hasAceptarVoiceCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  if (tokens.includes('aceptar') || tokens.includes('accept') || tokens.includes('ok')) return true;
  if (n.includes('aceptar') || n.includes('accept')) return true;
  return false;
}
