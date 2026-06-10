import {
  matchFiltroClave,
  parseFiltrosAdjustDeltas,
  parseFiltrosVoiceCommands,
} from './imagen-filtros-voice';

describe('imagen-filtros-voice', () => {
  it('matches filter names', () => {
    expect(matchFiltroClave('quiero mas brillo')).toBe('brightness');
    expect(matchFiltroClave('blur por favor')).toBe('blur');
  });

  it('parses unit adjustments', () => {
    expect(parseFiltrosAdjustDeltas('5 mas 10 menos')).toEqual([5, -10]);
    expect(parseFiltrosAdjustDeltas('mas 100 menos 1')).toEqual([100, -1]);
    expect(parseFiltrosAdjustDeltas('10 more 5 less')).toEqual([10, -5]);
    expect(parseFiltrosAdjustDeltas('cinco mas diez menos')).toEqual([5, -10]);
    expect(parseFiltrosAdjustDeltas('mas quince menos veinte')).toEqual([15, -20]);
    expect(parseFiltrosAdjustDeltas('brillo cien mas')).toEqual([100]);
  });

  it('prioritizes salir over adjustments', () => {
    expect(parseFiltrosVoiceCommands('salir')).toEqual([{ kind: 'salir' }]);
  });

  it('parses select then adjust in one phrase', () => {
    expect(parseFiltrosVoiceCommands('brillo 5 mas')).toEqual([
      { kind: 'seleccionar', clave: 'brightness' },
      { kind: 'ajustar', deltas: [5] },
    ]);
    expect(parseFiltrosVoiceCommands('brillo cinco mas')).toEqual([
      { kind: 'seleccionar', clave: 'brightness' },
      { kind: 'ajustar', deltas: [5] },
    ]);
    expect(parseFiltrosVoiceCommands('5 mas')).toEqual([{ kind: 'ajustar', deltas: [5] }]);
    expect(parseFiltrosVoiceCommands('cinco mas')).toEqual([{ kind: 'ajustar', deltas: [5] }]);
  });
});
