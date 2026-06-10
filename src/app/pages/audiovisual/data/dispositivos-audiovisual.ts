import { NivelExplicacion } from '../../../services/explicacion.service';

export interface DispositivoAudiovisual {
  clave: 'quinetofono' | 'camara';
  nombre: string;
  anio: string;
  video: string;
}

export const dispositivosAudiovisual: DispositivoAudiovisual[] = [
  {
    clave: 'quinetofono',
    nombre: 'Quinetófono',
    anio: '1890s',
    video: 'assets/videos/audiovisual/quinetofono.webm',
  },
  {
    clave: 'camara',
    nombre: 'Cámara digital',
    anio: '2008',
    video: 'assets/videos/audiovisual/camara.webm',
  },
];

export const explicacionesDispositivosAudiovisual: Record<
  DispositivoAudiovisual['clave'],
  Record<NivelExplicacion, string>
> = {
  quinetofono: {
    tecnica:
      `Los dispositivos de visión secuencial de finales del siglo XIX —como el quinetoscopio y sus variantes ` +
      `con registro fotográfico en celuloide— permitían percibir movimiento mediante la sucesión rápida de ` +
      `imágenes fijas vistas a través de una ranura o un tambor. El quinetófono, en la línea de experimentos ` +
      `que unían imagen y fonógrafo, anticipó el audiovisual sincronizado: dos soportes distintos (película ` +
      `silente y cilindro de sonido) debían arrancar al unísono para ilusión de coherencia. Limitaciones ` +
      `mecánicas, luminosidad y duración del soporte marcaron el salto posterior al cine proyectado y al sonoro ` +
      `óptico en los años veinte.`,
    media:
      `El quinetófono pertenece a la época en que la gente empezaba a ver «fotos que se movían» en máquinas ` +
      `personales o pequeñas proyecciones, antes del cine de sala tal como lo conocemos. Algunos inventos ` +
      `intentaban añadir sonido grabado a esas imágenes, pero todavía eran experimentos: la imagen iba por un ` +
      `lado y la voz o la música por otro. Fue un paso clave hacia el cine sonoro, aunque todavía no existía ` +
      `una sola cinta que llevara imagen y sonido juntos de forma fiable.`,
    sencilla:
      `Era una máquina de los primeros tiempos del cine: enseñaba imágenes que parecían moverse y, en algunos ` +
      `modelos, probaba a ponerles sonido aparte. Todavía no era el cine moderno, pero abrió el camino para ` +
      `que más tarde la imagen y el sonido viajaran juntos en una sola película.`,
  },
  camara: {
    tecnica:
      `La cámara digital de vídeo convierte la escena en señal electrónica mediante sensor (CCD o CMOS), ` +
      `almacenada en tarjetas de memoria con códecs como H.264 o H.265 en lugar de celuloide. Integra ` +
      `obturación electrónica, balance de blancos, perfiles de color y, en modelos avanzados, salida HDMI ` +
      `o RAW/Log para postproducción. Desde finales de los años 2000, las réflex y mirrorless con vídeo ` +
      `Full HD —y después 4K— democratizaron rodajes independientes, documentales y contenido online. ` +
      `Los archivos pasan directamente al montaje digital, mezcla y distribución multiplataforma.`,
    media:
      `La cámara digital graba fotos y vídeo en una tarjeta: ya no hace falta revelar película ni proyectar ` +
      `un rollo. Puedes cambiar el encuadre, el foco y el movimiento como en un rodaje clásico, pero lo que ` +
      `capturas son archivos que copias al ordenador para editar, poner música o voz y publicar en redes, ` +
      `streaming o la tele. Desde los años 2000 es la herramienta habitual de creadores, reporteros y ` +
      `pequeños equipos que quieren calidad sin un estudio enorme.`,
    sencilla:
      `Es una cámara digital: apuntas, grabas y todo queda guardado en una tarjeta, no en película. ` +
      `Sirve para hacer vídeos en casa, en la calle o en un rodaje pequeño. Luego pasas las imágenes ` +
      `al ordenador para cortarlas, poner sonido y compartirlas en internet o en la tele.`,
  },
};
