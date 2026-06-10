import { NivelExplicacion } from '../../../services/explicacion.service';

export interface DispositivoVideo {
  clave: 'camaraCine' | 'proyector';
  nombre: string;
  anio: string;
  video: string;
}

export const dispositivosVideo: DispositivoVideo[] = [
  {
    clave: 'camaraCine',
    nombre: 'Cámara de cine antigua',
    anio: '1890s',
    video: 'assets/videos/video/camaraCine.webm',
  },
  {
    clave: 'proyector',
    nombre: 'Proyector de cine',
    anio: '1920s',
    video: 'assets/videos/video/proyector.webm',
  },
];

export const explicacionesDispositivosVideo: Record<
  DispositivoVideo['clave'],
  Record<NivelExplicacion, string>
> = {
  camaraCine: {
    tecnica:
      `Las primeras cámaras cinematográficas fijaban la película en un chasis ligero y, mediante un obturador ` +
      `intermitente o una manivela, registraban entre 16 y 24 fotogramas por segundo sobre emulsión sensible. ` +
      `No grababan sonido: el soporte era acetato de celulosa (más tarde poliéster) perforado a lo largo de los ` +
      `bordes para el transporte mecánico. El operador debía mantener una cadencia regular al girar la manivela ` +
      `para evitar variaciones de velocidad (“flutter”) que distorsionaban el movimiento en pantalla. Estos ` +
      `equipos sentaron la base del lenguaje audiovisual: plano, encuadre, duración del plano y montaje posterior ` +
      `en laboratorio.`,
    media:
      `La cámara de cine antigua era una caja con lente y una manivela: al girarla, la película iba capturando ` +
      `muchas fotos seguidas que, al proyectarse rápido, parecían moverse. Era el primer paso del cine tal como lo ` +
      `conocemos: antes solo había fotografías fijas. No llevaba micrófono; el sonido llegó décadas después. ` +
      `Los operadores aprendían a girar a ritmo constante para que las escenas no se vieran a trompicones.`,
    sencilla:
      `Era una cámara grande con manivela: al darle vueltas, la película guardaba muchas fotos muy seguidas. ` +
      `Luego, al pasarlas muy rápido en una sala, parecía que la gente se movía de verdad. Así nació el cine ` +
      `mudo: solo imagen, sin voz todavía.`,
  },
  proyector: {
    tecnica:
      `El proyector de sala combina una lámpara de arco o descarga, un condensador óptico y un mecanismo de ` +
      `transporte con rodillos dentados que tira de los fotogramas perforados. Un obturador de disco o de ` +
      `palas interrumpe el haz dos veces por fotograma para reducir el parpadeo perceptible (efecto Phi). ` +
      `La imagen se amplía mediante objetivos de gran apertura hacia una pantalla reflectante. En el cine clásico, ` +
      `el proyector era el punto de encuentro entre el negativo editado en laboratorio y la audiencia: de ahí el ` +
      `modelo de exhibición colectiva que dominaría el siglo XX hasta la llegada del vídeo doméstico y el streaming.`,
    media:
      `El proyector de cine pasaba la película ya montada delante de una luz muy potente y la ampliaba en una ` +
      `pantalla grande para que la vieran muchas personas a la vez. En la sala oscura, la película contaba la ` +
      `historia sin que cada espectador necesitara su propia copia. Fue la forma habitual de ver cine durante ` +
      `décadas: primero en salas, luego también en colegios o festivales con equipos más pequeños.`,
    sencilla:
      `Es la máquina de la sala de cine: metes la película, enciendes la luz y la imagen sale gigante en la ` +
      `pantalla para que la vea todo el mundo junto. Sin proyector no habría “ir al cine”: solo tendrías el ` +
      `rollo de película, pero no verías la historia en grande.`,
  },
};
