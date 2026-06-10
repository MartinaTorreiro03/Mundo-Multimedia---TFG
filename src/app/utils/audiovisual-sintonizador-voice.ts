export type SintonizadorVoiceParsed =
  | { kind: 'selectEra'; index: number }
  | { kind: 'play' }
  | { kind: 'pause' }
  | { kind: 'toggleMute' };

const ERA_TOKEN_INDEX: Record<string, number> = {
  '1': 0,
  uno: 0,
  '2': 1,
  dos: 1,
  '3': 2,
  tres: 2,
  '4': 3,
  cuatro: 3,
  '5': 4,
  cinco: 4,
};

export function sintonizadorEraHint(index: number): string {
  return String(index + 1);
}

export function sintonizadorPlayHint(): string {
  return 'play';
}

export function sintonizadorPauseHint(): string {
  return 'pausa';
}

export function sintonizadorMuteHint(muted: boolean): string {
  return muted ? 'desmutear' : 'mutear';
}

function hasPlayCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  return (
    tokens.includes('play') ||
    tokens.includes('paly') ||
    tokens.includes('reproducir') ||
    tokens.includes('reproduce')
  );
}

function hasPauseCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  return (
    tokens.includes('pausa') ||
    tokens.includes('pause') ||
    tokens.includes('pausar') ||
    tokens.includes('parar')
  );
}

function hasMutearCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  return tokens.includes('mutear') || tokens.includes('silenciar') || tokens.includes('mute');
}

function hasDesmutearCommand(n: string): boolean {
  const tokens = n.split(/\s+/).filter(Boolean);
  return tokens.includes('desmutear') || tokens.includes('unmute');
}

function matchEraIndex(n: string): number | null {
  const tokens = n.split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    const idx = ERA_TOKEN_INDEX[t];
    if (idx !== undefined) return idx;
  }
  return null;
}

export function parseSintonizadorVoiceCommands(n: string): SintonizadorVoiceParsed[] {
  if (!n) return [];
  const cmds: SintonizadorVoiceParsed[] = [];

  if (hasPlayCommand(n) && !hasPauseCommand(n)) {
    cmds.push({ kind: 'play' });
    return cmds;
  }
  if (hasPauseCommand(n) && !hasPlayCommand(n)) {
    cmds.push({ kind: 'pause' });
    return cmds;
  }

  const eraIdx = matchEraIndex(n);
  if (eraIdx !== null) {
    cmds.push({ kind: 'selectEra', index: eraIdx });
    return cmds;
  }

  if (hasMutearCommand(n) && !hasDesmutearCommand(n)) {
    cmds.push({ kind: 'toggleMute' });
    return cmds;
  }
  if (hasDesmutearCommand(n) && !hasMutearCommand(n)) {
    cmds.push({ kind: 'toggleMute' });
    return cmds;
  }

  return cmds;
}
