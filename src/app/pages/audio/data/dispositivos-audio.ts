import { NivelExplicacion } from '../../../services/explicacion.service';

export interface DispositivoAudio {
  clave: 'walkman' | 'altavoz';
  nombre: string;
  anio: string;
  video: string;
}

export const dispositivosAudio: DispositivoAudio[] = [
  {
    clave: 'walkman',
    nombre: 'Walkman',
    anio: '1979',
    video: 'assets/videos/audio/walkman.webm',
  },
  {
    clave: 'altavoz',
    nombre: 'Altavoz inalámbrico',
    anio: '2010s',
    video: 'assets/videos/audio/altavoz.webm',
  },
];

export const explicacionesDispositivosAudio: Record<
  DispositivoAudio['clave'],
  Record<NivelExplicacion, string>
> = {
  walkman: {
    tecnica:
      `El Sony Walkman TPS-L2 (1979) popularizó la reproducción de audio portátil estéreo mediante casete ` +
      `compacto y auriculares ligeros. Fue un salto respecto a los magnetófonos portátiles: menor tamaño, ` +
      `alimentación a pilas y escucha privada que desacopló el consumo musical del espacio doméstico o del ` +
      `automóvil. Estableció el paradigma del “playlist personal” antes del digital: cinta editada, lado A/B, ` +
      `y control de volumen en el propio cuerpo del dispositivo. Es antecedente directo de los reproductores ` +
      `MP3 y de la cultura de auriculares en espacios públicos.`,
    media:
      `El Walkman, lanzado por Sony a finales de los 70, fue el primer aparato muy popular que permitió ` +
      `llevar la música a la calle con auriculares y un cassette pequeño. La gente podía escuchar lo que ` +
      `quisiera mientras caminaba o viajaba, sin molestar a nadie. Cambió la forma de relacionarnos con la ` +
      `música: de algo que sonaba en casa o en la radio a algo íntimo y portátil. Es el abuelo de los móviles ` +
      `con música y de los auriculares en el transporte.`,
    sencilla:
      `El Walkman era un cacharrito con auriculares para escuchar cintas de cassette mientras ibas por ahí. ` +
      `Fue de lo primero que dejó llevar tu música contigo fuera de casa, solo para ti, sin altavoz. ` +
      `Es como los auriculares del móvil, pero con cinta.`,
  },
  altavoz: {
    tecnica:
      `Los altavoces inalámbricos actuales combinan amplificación clase D, Bluetooth (perfil A2DP) y, a ` +
      `menudo, códec SBC o AAC para streaming desde el teléfono. Muchos integran micrófonos y asistentes, ` +
      `pero su núcleo sigue siendo la conversión electromecánica de señal eléctrica en onda sonora audible, ` +
      `con gestión DSP de ecualización y límites de potencia. En multimedia, el altavoz comparte espacio con ` +
      `pantalla y vibración háptica: el audio deja de ser solo “hi-fi” doméstico y pasa a ser parte de ` +
      `interfaces móviles, juegos y vídeo en cualquier entorno.`,
    media:
      `Un altavoz inalámbrico actual recibe la música por Bluetooth desde el móvil o la tablet, la amplifica ` +
      `dentro de la propia caja y suena bastante fuerte para una habitación o una terraza. Suele tener batería ` +
      `recargable y botones o controles desde la app. En la multimedia de hoy, el sonido acompaña vídeos, ` +
      `juegos y videollamadas: no hace falta un equipo enorme para tener audio decente en cualquier sitio.`,
    sencilla:
      `Es un altavoz sin cables: conectas el móvil por Bluetooth y suena la música para varias personas a la vez. ` +
      `Sirve para fiestas pequeñas, para ver vídeos con sonido fuerte o para llevarlo de viaje. Es la otra cara ` +
      `del Walkman: en vez de escuchar solo tú con auriculares, el sonido va para todos.`,
  },
};
