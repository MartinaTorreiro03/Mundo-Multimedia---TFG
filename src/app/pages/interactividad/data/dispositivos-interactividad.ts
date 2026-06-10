import { NivelExplicacion } from '../../../services/explicacion.service';

export interface DispositivoInteractividad {
  clave: 'ordenador' | 'ps5';
  nombre: string;
  anio: string;
  video: string;
}

export const dispositivosInteractividad: DispositivoInteractividad[] = [
  {
    clave: 'ordenador',
    nombre: 'Commodore 64',
    anio: '1982',
    video: 'assets/videos/interactividad/ordenador.webm',
  },
  {
    clave: 'ps5',
    nombre: 'PlayStation 5',
    anio: '2020',
    video: 'assets/videos/interactividad/ps5.webm',
  },
];

export const explicacionesDispositivosInteractividad: Record<
  DispositivoInteractividad['clave'],
  Record<NivelExplicacion, string>
> = {
  ordenador: {
    tecnica:
      `El Commodore 64 (1982) consolidó la microinformática doméstica de 8 bits: CPU MOS 6510, 64 KiB de RAM, ` +
      `sintetizador SID para audio y puertos para cassette o unidad de disco. Su BASIC en ROM y el acceso directo ` +
      `a mapa de memoria y registros de vídeo (VIC-II) permitían programar juegos y demos con respuesta inmediata ` +
      `al teclado o al joystick. La interactividad aquí es explícita: el usuario escribe o carga un programa y la ` +
      `máquina ejecuta en tiempo real, sin la latencia de los sistemas batch. Precursor de la cultura demoscene y ` +
      `de interfaces que unieron lógica, gráficos y sonido en un mismo dispositivo de salón.`,
    media:
      `El Commodore 64 fue uno de los ordenadores más vendidos de los ochenta. En casa podías escribir programas ` +
      `en BASIC, cargar juegos desde cassette y conectar un joystick: cada tecla o movimiento cambiaba lo que ` +
      `pasaba en pantalla al momento. No era solo mirar un vídeo; eras tú quien daba las órdenes. Mucha gente ` +
      `aprendió sus primeros pasos de programación y de videojuegos con esta máquina, cuando la interactividad ` +
      `digital empezaba a entrar en los hogares.`,
    sencilla:
      `Era un ordenador de los años ochenta muy popular en casa. Con el teclado y un joystick podías jugar o ` +
      `hacer programas sencillos y la pantalla respondía al instante. Fue una de las primeras formas de ` +
      `interactuar con un ordenador sin tener que ir a un centro especial.`,
  },
  ps5: {
    tecnica:
      `La PlayStation 5 (2020) integra CPU Zen 2 y GPU RDNA 2 con SSD NVMe de alta velocidad para reducir tiempos ` +
      `de carga y habilitar mundos más continuos. El mando DualSense añade retroalimentación háptica adaptativa, ` +
      `gatillos con resistencia variable y micrófono integrado, ampliando el canal de entrada más allá de botones ` +
      `binarios. La interfaz del sistema, el audio 3D Tempest y los servicios en red convierten la consola en un ` +
      `hub multimedia interactivo: juegos, streaming, comunicación y actualizaciones en vivo. La interactividad ` +
      `actual combina latencia baja, periféricos expresivos y software que reacciona al contexto del jugador.`,
    media:
      `La PS5 es una consola reciente pensada para juegos con gráficos muy detallados y cargas casi instantáneas ` +
      `gracias a su disco rápido. El mando DualSense vibra y ofrece resistencia distinta según lo que pasa en el ` +
      `juego, de modo que sientes más la acción. Además de jugar, sirve para ver series, chatear con amigos y ` +
      `descargar títulos por internet. Es un ejemplo de cómo la interactividad hoy mezcla imagen, sonido, ` +
      `movimiento del cuerpo y conexión en línea en una sola experiencia.`,
    sencilla:
      `Es una consola de videojuegos muy potente de hoy. El mando vibra y se resiste de formas distintas según ` +
      `lo que ocurre en pantalla, y los juegos cargan muy rápido. Puedes jugar solo o con otras personas por ` +
      `internet y también ver películas o series desde la misma máquina.`,
  },
};
