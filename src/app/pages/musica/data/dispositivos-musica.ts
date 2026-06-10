import { NivelExplicacion } from '../../../services/explicacion.service';

export interface DispositivoMusica {
  clave: 'sintetizador' | 'tocadiscos';
  nombre: string;
  anio: string;
  video: string;
}

export const dispositivosMusica: DispositivoMusica[] = [
  {
    clave: 'sintetizador',
    nombre: 'Sintetizador',
    anio: '1980s',
    video: 'assets/videos/musica/sintetizador.webm',
  },
  {
    clave: 'tocadiscos',
    nombre: 'Tocadiscos digital',
    anio: '2010s',
    video: 'assets/videos/musica/tocadiscos.webm',
  },
];

export const explicacionesDispositivosMusica: Record<
  DispositivoMusica['clave'],
  Record<NivelExplicacion, string>
> = {
  sintetizador: {
    tecnica:
      `Los sintetizadores analógicos y digitales generan señales eléctricas que se convierten en audio mediante ` +
      `osciladores, filtros y modulación (VCA, VCF, LFO). En los años ochenta, instrumentos como el Yamaha DX7 ` +
      `popularizaron la síntesis FM; más tarde, los workstations integraron secuenciadores y muestreo. En producción ` +
      `multimedia, los sintetizadores alimentan bandas sonoras de videojuegos, interfaces de apps y paisajes sonoros ` +
      `interactivos: un mismo gesto en pantalla puede disparar timbres sintéticos en tiempo real, ampliando el ` +
      `vocabulario musical más allá de grabaciones fijas.`,
    media:
      `El sintetizador es un instrumento que crea sonidos nuevos en lugar de imitar solo un piano o una guitarra. ` +
      `Con teclas, ruedas y botones puedes cambiar el timbre al instante, lo que lo hizo imprescindible en el pop ` +
      `y en la música electrónica de los ochenta y noventa. Hoy también suena en juegos y aplicaciones: la música ` +
      `no siempre viene de una canción grabada, sino de capas que el propio programa va generando.`,
    sencilla:
      `Un sintetizador fabrica sonidos con electricidad y botones, no con cuerdas ni aire. Permite inventar ` +
      `colores musicales para canciones, películas y videojuegos. Por eso la música digital puede cambiar ` +
      `según lo que haces en pantalla, no solo reproducir un archivo fijo.`,
  },
  tocadiscos: {
    tecnica:
      `El tocadiscos digital combina platillo y brazo (a menudo con cartucho MM/MC) con etapa de ` +
      `preamplificación y conversión analógica-digital integrada (ADC USB, 16/24 bit, 44,1–48 kHz o más). ` +
      `La señal puede monitorizarse por salida analógica RCA y, a la vez, registrarse en un ordenador como WAV ` +
      `o FLAC mediante drivers ASIO o class-compliant. Muchos modelos incorporan ajuste de pitch digital, ` +
      `cuantización de velocidad y software de archivo o DJ (DVS). Así se une el soporte físico del vinilo ` +
      `con flujos de trabajo multimedia: digitalizar colecciones, publicar samples o mezclar en vivo con ` +
      `platos que envían datos MIDI/timecode además del audio analógico.`,
    media:
      `Un tocadiscos digital es un plato de vinilo conectado al ordenador: puedes escuchar por altavoces ` +
      `y guardar la música en archivos digitales a la vez. Sirve para pasar discos a MP3 o WAV sin un ` +
      `grabador aparte, y muchos DJs lo usan porque envía también información al programa de mezcla. ` +
      `Mantiene la experiencia de poner un disco físico, pero el resultado acaba en el mundo digital: ` +
      `playlists, redes o proyectos de vídeo con la misma pista.`,
    sencilla:
      `Es un tocadiscos que se enchufa al PC. Pone el disco como siempre, pero el sonido también ` +
      `puede guardarse en el ordenador. Así pasas tus vinilos a archivos digitales o los usas en ` +
      `mezclas y vídeos sin perder el gesto de poner el plato.`,
  },
};
