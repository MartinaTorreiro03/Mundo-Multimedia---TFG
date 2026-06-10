import { NivelExplicacion } from '../../../services/explicacion.service';

export type SlidesItem = {
  baseName: string;
  ext: 'jpg' | 'png';
  title: string;
  text: string;
};

const textos = {
  jukebox: {
    tecnica:  `La jukebox, comercializada masivamente desde los años 40, fue el primer sistema de reproducción musical automatizada de uso público. Mediante la selección mecánica de discos de vinilo a través de un mecanismo de brazo selector, permitía reproducir canciones individuales a cambio de monedas. Incorporaba amplificadores de válvulas y altavoces de gran potencia, convirtiéndose en el principal medio de difusión musical en espacios públicos antes de la radio de transistores portátil.`,
    media:    `La jukebox fue el primer dispositivo que permitió escuchar música grabada en espacios públicos de forma automatizada. Introduciendo una moneda, el usuario podía elegir una canción entre varias decenas de discos almacenados en su interior. Fue una presencia habitual en bares, cafeterías y salones de baile desde los años 40, y se convirtió en un símbolo cultural de la música popular antes de la era de la radio portátil.`,
    sencilla: `Una máquina que ponía música en bares y cafeterías al introducir una moneda. Fue la primera forma de escuchar la canción que tú elegías en un lugar público.`
  },
  walkman: {
    tecnica:  `El Walkman, introducido por Sony en 1979, fue el primer dispositivo de reproducción de audio portátil de uso masivo basado en casete de cinta magnética. Su diseño miniaturizó el mecanismo de cabezal lector, motor y sistema de tracción en un formato de bolsillo, incorporando auriculares de diadema de alta impedancia. Democratizó la escucha personal e individualizada de música, separándola por primera vez del espacio doméstico o público compartido.`,
    media:    `El Walkman de Sony, lanzado en 1979, cambió para siempre la forma de escuchar música al hacerla completamente portátil e individual. Por primera vez, cualquier persona podía llevar su música favorita en el bolsillo y escucharla con auriculares en cualquier lugar. Fue un éxito masivo que transformó los hábitos culturales de toda una generación y abrió el camino a todos los reproductores portátiles que vendrían después.`,
    sencilla: `El primer aparato que te permitía escuchar música en cualquier sitio, con auriculares y en el bolsillo. Cambió la forma de relacionarse con la música para siempre.`
  },
  discman: {
    tecnica:  `El Discman, lanzado por Sony en 1984 como D-50, fue el primer reproductor de CD portátil. Basado en tecnología de lectura óptica mediante láser de semiconductor, reproducía audio digital codificado en formato PCM sobre disco compacto. Supuso la transición del soporte analógico magnético al soporte digital óptico en el ámbito de la reproducción portátil, con una mejora significativa en relación señal-ruido y ausencia de degradación por uso repetido.`,
    media:    `El Discman fue la versión portátil del CD, lanzada por Sony en 1984. Permitía llevar encima los discos compactos y escucharlos con auriculares, igual que el Walkman con los casetes, pero con la calidad de audio digital. Fue el primer contacto masivo con el sonido digital portátil y marcó el inicio del declive del casete como formato dominante.`,
    sencilla: `Como el Walkman, pero para CDs. Fue el primer aparato portátil que reproducía música digital, con mucha mejor calidad que los casetes.`
  },
  minidisc: {
    tecnica:  `El MiniDisc, desarrollado por Sony en 1992, fue un formato de almacenamiento magneto-óptico que combinaba la grabación magnética con la lectura y escritura mediante láser. Utilizaba compresión ATRAC para reducir el tamaño de los archivos de audio manteniendo una calidad perceptualmente similar al CD. Permitía la regrabación, edición no destructiva y reorganización de pistas, funciones inéditas en un formato físico portátil de la época.`,
    media:    `El MiniDisc fue un formato creado por Sony en 1992 que combinaba la calidad del CD con la posibilidad de grabar y borrar como un casete. Sus discos eran pequeños, resistentes y podían editarse fácilmente. Aunque técnicamente avanzado para su época, no logró imponerse al gran público y quedó como un formato de culto, especialmente popular en Japón.`,
    sencilla: `Un disco pequeño que podías grabar y borrar como un casete pero con calidad de CD. Era muy avanzado para su época, aunque pocas personas lo llegaron a usar.`
  },
  mp3: {
    tecnica:  `El formato MP3 (MPEG-1 Audio Layer III), desarrollado por el Instituto Fraunhofer en 1993, aplica codificación perceptual para eliminar componentes de audio considerados imperceptibles por el sistema auditivo humano, logrando factores de compresión de hasta 12:1 respecto al PCM sin pérdida subjetiva significativa. Los reproductores MP3 portátiles, como el MPMan (1998) o el Rio PMP300, almacenaban audio en memoria flash, eliminando las partes móviles y la susceptibilidad a vibraciones de sus predecesores.`,
    media:    `El MP3 fue un formato de compresión de audio que redujo drásticamente el tamaño de los archivos de música sin perder demasiada calidad. Esto hizo posible los primeros reproductores digitales portátiles basados en memoria, sin discos ni piezas móviles. Junto con internet, el MP3 transformó completamente la industria musical a finales de los años 90, facilitando el intercambio masivo de música en la red.`,
    sencilla: `Un formato que comprimía la música para que ocupara muy poco espacio. Gracias a él surgieron los primeros reproductores digitales y cambió para siempre cómo se compartía y consumía música.`
  },
  ipod: {
    tecnica:  `El iPod, lanzado por Apple en 2001, integraba un disco duro de 1,8 pulgadas con capacidad inicial de 5 GB, una interfaz de usuario basada en rueda de desplazamiento capacitiva y el software iTunes como ecosistema de gestión y sincronización. Su arquitectura cerrada pero optimizada permitía tiempos de respuesta y autonomía superiores a los reproductores MP3 contemporáneos, y su integración con la iTunes Store en 2003 estableció el modelo de distribución digital de música por unidad que precedió al streaming.`,
    media:    `El iPod de Apple, presentado en 2001, no fue el primer reproductor de música digital, pero sí el que lo convirtió en un producto masivo y deseable. Su rueda de navegación, su gran capacidad y su integración con iTunes lo hicieron enormemente intuitivo. Junto con la iTunes Store, estableció el modelo de compra de música digital por canciones que dominó la década de los 2000 antes de la llegada del streaming.`,
    sencilla: `El reproductor de música de Apple que lo cambió todo. Cabían miles de canciones en el bolsillo y era muy fácil de usar. Fue el rey de la música portátil durante toda una década.`
  },
  streaming: {
    tecnica:  `Los servicios de streaming de audio como Spotify (2008) o Apple Music (2015) se basan en la transmisión de audio comprimido en tiempo real mediante protocolos adaptativos sobre redes IP, utilizando códecs como Ogg Vorbis, AAC o su propio formato. El modelo elimina la necesidad de almacenamiento local y desplaza la propiedad del archivo por el acceso bajo suscripción, integrando sistemas de recomendación basados en aprendizaje automático para la personalización del catálogo.`,
    media:    `El streaming de música supuso el paso definitivo de poseer música a simplemente acceder a ella. Servicios como Spotify o Apple Music permiten escuchar millones de canciones sin descargar nada, desde cualquier dispositivo conectado a internet. Han transformado los hábitos de consumo musical, la forma en que los artistas distribuyen su trabajo y el modelo económico de toda la industria discográfica.`,
    sencilla: `Escuchar cualquier canción del mundo sin descargarla ni tenerla guardada. Basta con tener internet. Ha cambiado completamente cómo consumimos música hoy en día.`
  }
};

export function getSlides(nivel: NivelExplicacion): SlidesItem[] {
  return [
    { baseName: 'jukebox',   ext: 'jpg', title: 'Jukebox - años 40',     text: textos.jukebox[nivel] },
    { baseName: 'walkman',   ext: 'png', title: 'Walkman - 1979',         text: textos.walkman[nivel] },
    { baseName: 'discman',   ext: 'png', title: 'Discman - 1984',         text: textos.discman[nivel] },
    { baseName: 'minidisc',  ext: 'jpg', title: 'MiniDisc - 1992',        text: textos.minidisc[nivel] },
    { baseName: 'mp3',       ext: 'png', title: 'Reproductor MP3 - 1998', text: textos.mp3[nivel] },
    { baseName: 'ipod',      ext: 'jpg', title: 'iPod - 2001',            text: textos.ipod[nivel] },
    { baseName: 'streaming', ext: 'jpg', title: 'Streaming - 2008',       text: textos.streaming[nivel] },
  ];
}