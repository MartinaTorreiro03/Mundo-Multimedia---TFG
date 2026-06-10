import { NivelExplicacion } from '../../../services/explicacion.service';

export interface DispositivoImagen {
  clave: 'daguerrotipo' | 'epson';
  nombre: string;
  anio: string;
  video: string;
}

export const dispositivosImagen: DispositivoImagen[] = [
  {
    clave: 'daguerrotipo',
    nombre: 'Daguerrotipo',
    anio: '1839',
    video: 'assets/videos/imagen/daguerrotipo.webm',
  },
  {
    clave: 'epson',
    nombre: 'Impresora de inyección',
    anio: '1990s',
    video: 'assets/videos/imagen/epson.webm',
  },
];

export const explicacionesDispositivosImagen: Record<
  DispositivoImagen['clave'],
  Record<NivelExplicacion, string>
> = {
  daguerrotipo: {
    tecnica:
      `El daguerrotipo (anuncio público en 1839) es un proceso fotográfico directo sobre placa de cobre ` +
      `plateada con yoduro de plata, revelado con vapor de mercurio y fijado. Cada pieza es un positivo único ` +
      `e irreversible: no hay negativo intermedio como en el calotipo. La superficie es un espejo mate que ` +
      `hay que inclinar para ver la imagen; la resolución es extremadamente fina pero el soporte es frágil ` +
      `y el retrato obliga a tiempos de exposición largos. Simboliza la imagen analógica como objeto único, ` +
      `ligado al químico y al taller, antes de la cadena negativo-copia masiva del siglo XX.`,
    media:
      `El daguerrotipo fue uno de los primeros sistemas que permitió “fijar” una escena con luz en una placa ` +
      `de metal. Cada foto era un original: no podías sacar copias baratas como con un carrete. La gente ` +
      `iba al estudio, posaba muy quieto y se llevaba una imagen muy detallada pero delicada. Representa la ` +
      `fotografía como algo único y casi mágico, muy lejos de disparar cientos de fotos con el móvil.`,
    sencilla:
      `El daguerrotipo era una foto hecha en una chapita de metal brillante. Salía una sola imagen, como un ` +
      `retrato único que no se podía duplicar fácil. La gente tenía que estar muy quieta y la foto parecía ` +
      `un objeto valioso. Es como el principio de la fotografía, cuando cada imagen era especial.`,
  },
  epson: {
    tecnica:
      `Las impresoras de inyección de tinta (popularizadas en hogares y estudios desde los años 90, con ` +
      `marcas como Epson y sus cabezales piezoeléctricos o térmicos según fabricante) convierten datos ` +
      `digitales en gotas controladas sobre papel. El flujo típico es captura o archivo digital → perfil ` +
      `ICC → rasterización → deposición CMYK o más canales. Acerca la reproducción de imagen al entorno ` +
      `computacional: la foto deja de ser solo química en laboratorio y pasa a ser salida repetible desde ` +
      `el ordenador, puente natural hacia la cultura de la imagen digital masiva y la multimedia.`,
    media:
      `En los años 90 muchas casas empezaron a tener impresoras de inyección: conectabas el ordenador y ` +
      `podías sacar en papel las fotos que habías hecho con la cámara digital o que te habían mandado. ` +
      `Ya no hacía falta revelar solo en el laboratorio: la imagen viajaba como archivo y se materializaba ` +
      `cuando querías. Es el paso de la foto como placa única a la foto como dato que se puede imprimir muchas veces.`,
    sencilla:
      `La impresora de inyección pinta la foto en el papel con tinta, desde el ordenador. Así puedes ` +
      `tener copias en casa de las imágenes que tienes en pantalla. Es lo contrario del daguerrotipo en una ` +
      `cosa importante: aquí la imagen es un archivo y puedes imprimirla varias veces, no solo una chapita única.`,
  },
};
