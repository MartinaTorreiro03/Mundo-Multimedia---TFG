export type JuegoAreaId = 'lineal' | 'hipermedia' | 'interactiva';

export type JuegoVoiceDetail =
  | { action: 'moverArea'; deviceId: string; areaId: JuegoAreaId }
  | { action: 'devolver'; deviceId: string }
  | { action: 'comprobar' }
  | { action: 'cerrar' }
  | { action: 'aceptar' };

const DEVICE_KEYWORDS: Array<{ id: string; keywords: string[] }> = [
  { id: 'vid', keywords: ['videojuego', 'video juego', 'videojuegos', 'video juegos', 'juego'] },
  { id: 'vr', keywords: ['simulador', 'simulacion'] },
  { id: 'vhs', keywords: ['reproductor', 'reproductores', 'vhs'] },
  { id: 'pre', keywords: ['presentacion', 'presentaciones'] },
  { id: 'web', keywords: ['web', 'pagina web'] },
  { id: 'cd', keywords: ['disco', 'cd', 'cdrom', 'cd rom'] },
];

const AREA_KEYWORDS: Array<{ id: JuegoAreaId; keywords: string[] }> = [
  { id: 'lineal', keywords: ['lineal'] },
  { id: 'hipermedia', keywords: ['hipermedia', 'hiper media'] },
  { id: 'interactiva', keywords: ['interactiva', 'interactivo'] },
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findKeywordInText(text: string, keyword: string): { start: number; end: number } | null {
  const re = new RegExp(`(?:^|\\s)(${escapeRegExp(keyword)})(?=\\s|$)`, 'u');
  const match = re.exec(text);
  if (!match) return null;
  const start = (match.index ?? 0) + (match[0].startsWith(' ') ? 1 : 0);
  return { start, end: start + keyword.length };
}

function hasWord(n: string, keyword: string): boolean {
  return findKeywordInText(n, keyword) !== null;
}

function matchDevice(n: string): { id: string; start: number; end: number } | null {
  let best: { id: string; start: number; end: number } | null = null;
  for (const item of DEVICE_KEYWORDS) {
    for (const kw of item.keywords) {
      const hit = findKeywordInText(n, kw);
      if (!hit) continue;
      if (!best || hit.start < best.start) {
        best = { id: item.id, start: hit.start, end: hit.end };
      }
    }
  }
  return best;
}

function matchArea(n: string): { id: JuegoAreaId; start: number; end: number } | null {
  let best: { id: JuegoAreaId; start: number; end: number } | null = null;
  for (const item of AREA_KEYWORDS) {
    for (const kw of item.keywords) {
      const hit = findKeywordInText(n, kw);
      if (!hit) continue;
      if (!best || hit.start < best.start) {
        best = { id: item.id, start: hit.start, end: hit.end };
      }
    }
  }
  return best;
}

export function parseJuegoVoiceCommand(n: string): JuegoVoiceDetail | null {
  if (!n) return null;

  if (hasWord(n, 'aceptar')) return { action: 'aceptar' };
  if (hasWord(n, 'comprobar')) return { action: 'comprobar' };
  if (hasWord(n, 'cerrar')) return { action: 'cerrar' };

  const device = matchDevice(n);
  if (!device) return null;

  const afterDevice = n.slice(device.end).trim();
  if (!afterDevice) return null;

  if (hasWord(afterDevice, 'devolver') || hasWord(afterDevice, 'de volver')) {
    return { action: 'devolver', deviceId: device.id };
  }

  const area = matchArea(afterDevice);
  if (!area) return null;

  return { action: 'moverArea', deviceId: device.id, areaId: area.id };
}
