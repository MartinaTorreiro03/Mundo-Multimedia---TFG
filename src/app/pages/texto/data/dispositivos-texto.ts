import { NivelExplicacion } from '../../../services/explicacion.service';

export interface DispositivoTexto {
  clave: 'maquinaEscribir' | 'kindle';
  nombre: string;
  anio: string;
  video: string;
}

export const dispositivosTexto: DispositivoTexto[] = [
  {
    clave: 'maquinaEscribir',
    nombre: 'Máquina de escribir mecánica',
    anio: '1874',
    video: 'assets/videos/texto/maquinaEscribir.webm',
  },
  {
    clave: 'kindle',
    nombre: 'Kindle',
    anio: '2007',
    video: 'assets/videos/texto/kindle.webm',
  },
];

export const explicacionesDispositivosTexto: Record<
  DispositivoTexto['clave'],
  Record<NivelExplicacion, string>
> = {
  maquinaEscribir: {
    tecnica:
      `La máquina de escribir es un dispositivo puramente mecánico desarrollado en la segunda mitad del ` +
      `siglo XIX. Su funcionamiento se basa en un sistema de palancas que, al pulsar una tecla, golpean ` +
      `un tipo metálico contra una cinta entintada y este, a su vez, sobre el papel. Estandarizó la tipografía ` +
      `del texto no impreso y multiplicó la velocidad de transcripción frente a la escritura manual. Modelos ` +
      `comerciales como la Remington N.º 1 (1874) o la posterior IBM Selectric (1961, con cabeza de impresión ` +
      `tipo "golf ball") fueron decisivos para la mecanización de la producción textual en oficinas, redacciones ` +
      `y despachos. Aunque no forma parte del paradigma multimedia, su disposición de teclado y su lógica de ` +
      `entrada carácter a carácter son antecedentes directos de los procesadores de texto y los teclados ` +
      `informáticos actuales.`,
    media:
      `La máquina de escribir es el primer aparato que permitió producir texto de forma rápida y uniforme sin ` +
      `escribir a mano. Apareció en la segunda mitad del siglo XIX y cambió por completo la forma de trabajar ` +
      `en oficinas, periódicos y despachos: lo que antes era lento y variable, ahora se hacía con letra clara ` +
      `y a buena velocidad. Aunque es totalmente mecánica y no tiene nada de multimedia, su teclado y su lógica ` +
      `de pulsar una tecla para generar un carácter son los antepasados directos del teclado del ordenador ` +
      `que usamos hoy.`,
    sencilla:
      `La máquina de escribir es una caja con teclas que, al apretarlas, pinta letras en un papel. No usa ` +
      `electricidad ni pantalla, es solo mecánica, pero gracias a ella la gente pudo escribir mucho más ` +
      `rápido que a mano y con letra siempre igual. Es como el bisabuelo del teclado del ordenador.`,
  },
  kindle: {
    tecnica:
      `El Kindle, lanzado por Amazon en 2007, es un dispositivo de lectura digital basado en tinta electrónica ` +
      `(e-ink). A diferencia de las pantallas LCD u OLED, la tinta electrónica utiliza microcápsulas con ` +
      `partículas cargadas que se reorganizan eléctricamente para formar la imagen, lo que permite una lectura ` +
      `con muy alto contraste, sin retroiluminación directa y con un consumo energético mínimo (solo gasta ` +
      `batería al cambiar de página). Soporta formatos propios como AZW y estándares como EPUB o PDF, e ` +
      `incorpora conectividad Wi-Fi para descargar contenido directamente de la tienda. Representa la ` +
      `consolidación del libro digital como medio masivo y el paso definitivo del texto desde el papel al ` +
      `formato puramente digital.`,
    media:
      `El Kindle es un lector de libros digitales que Amazon lanzó en 2007. En lugar de papel usa una pantalla ` +
      `especial de "tinta electrónica" que imita el aspecto del papel: se ve muy bien incluso con sol y casi ` +
      `no gasta batería porque solo consume al pasar de página. Puede guardar miles de libros, los descarga ` +
      `por internet desde la tienda de Amazon y permite cambiar el tamaño de la letra. Es el momento en el ` +
      `que el texto, que llevaba siglos viajando en papel, se vuelve plenamente digital.`,
    sencilla:
      `El Kindle es un aparato pequeño, parecido a una tableta, que sirve para leer libros. Su pantalla se ` +
      `parece al papel, así que no cansa los ojos. Puedes llevar muchísimos libros dentro sin que pese, ` +
      `descargar otros nuevos por internet y hacer la letra más grande o más pequeña. Es como tener una ` +
      `biblioteca entera en la mano.`,
  },
};
