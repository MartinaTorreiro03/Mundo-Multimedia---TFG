import {
  matchImagenVentanitaClave,
  parseImagenVentanitaOpenCommand,
} from './imagen-ventanita-voice';

describe('imagen-ventanita-voice', () => {
  it('matches ventanita device keywords', () => {
    expect(matchImagenVentanitaClave('daguerrotipo')).toBe('daguerrotipo');
    expect(matchImagenVentanitaClave('abrir epson')).toBe('epson');
    expect(matchImagenVentanitaClave('impresora de inyeccion')).toBe('epson');
  });

  it('parses open command', () => {
    expect(parseImagenVentanitaOpenCommand('epson por favor')).toBe('epson');
  });
});
