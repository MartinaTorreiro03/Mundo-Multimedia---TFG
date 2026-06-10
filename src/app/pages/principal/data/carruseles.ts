 import { NivelExplicacion } from '../../../services/explicacion.service';

export type CarouselItemPopup = {
  src: string;
  title: string;
  text: string;
};

const textos = {
  linternaMagica: {
    tecnica:  `Proyector óptico basado en la proyección de transparencias de vidrio mediante una fuente lumínica y un sistema de lentes convergentes; precursor directo de la proyección cinematográfica.`,
    media:    `Dispositivo que proyectaba imágenes pintadas sobre vidrio usando una fuente de luz y un sistema de lentes, considerado uno de los primeros antecedentes del cine.`,
    sencilla: `Un proyector antiguo que usaba luz para mostrar imágenes pintadas en cristal, como el abuelo del cine moderno.`
  },
  fonoautografo: {
    tecnica:  `Transductor acústico-mecánico que convertía vibraciones del aire en desplazamientos lineales sobre un soporte físico, generando un registro gráfico de la onda sonora sin capacidad de reproducción.`,
    media:    `Dispositivo que captaba las vibraciones del sonido y las transformaba en marcas sobre una superficie física, generando así el primer registro gráfico de una onda sonora, aunque sin poder reproducirlo.`,
    sencilla: `El primer aparato capaz de "dibujar" el sonido en papel, aunque todavía no podía reproducirlo.`
  },
  fonografo: {
    tecnica:  `Sistema mecánico de registro y reproducción analógica de sonido, basado en la modulación vertical de un surco helicoidal sobre cilindros recubiertos, con transducción mecanoacústica directa.`,
    media:    `Dispositivo mecánico que grababa y reproducía sonido grabando las vibraciones en un surco en espiral sobre cilindros, siendo el primer aparato capaz tanto de registrar como de reproducir audio.`,
    sencilla: `El primer aparato que podía grabar tu voz y reproducirla, usando cilindros con ranuras en espiral.`
  },
  gramofono: {
    tecnica:  `Dispositivo de reproducción analógica que utilizaba discos planos con modulación lateral del surco; permitió la estandarización del formato fonográfico y su producción masiva.`,
    media:    `Reproductor de sonido que utilizaba discos planos en lugar de cilindros, lo que facilitó su fabricación en serie y convirtió el formato en el estándar de la industria musical durante décadas.`,
    sencilla: `El primero en usar discos planos para reproducir música, el formato que todos conocemos y que dominó la industria durante mucho tiempo.`
  },
  cinematografo: {
    tecnica:  `Sistema mecano-óptico que combinaba cámara, impresora y proyector de película fotosensible de 35 mm, sincronizando avance intermitente y proyección secuencial a 16 fps.`,
    media:    `Dispositivo que funcionaba a la vez como cámara, copiadora y proyector de película, sincronizando el avance de los fotogramas para crear la ilusión de movimiento, considerado el origen del cine tal como lo conocemos.`,
    sencilla: `La primera máquina que grababa y proyectaba películas, el invento que dio origen al cine.`
  },
  cineSonoro: {
    tecnica:  `Sistema audiovisual sincronizado mediante registro óptico o mecánico del sonido en la misma película, coordinado por motores de velocidad constante y sistemas de lectura fotoeléctrica.`,
    media:    `Sistema que integró el sonido directamente en la propia película, sincronizándolo con las imágenes mediante mecanismos de velocidad constante, lo que permitió por primera vez ver y escuchar una película de forma coordinada.`,
    sencilla: `El salto del cine mudo al cine con sonido, grabando el audio directamente en la misma película.`
  },
  sensorama: {
    tecnica:  `Sistema analógico de simulación inmersiva con proyección estereoscópica, sonido binaural, retroalimentación háptica y estimulación olfativa, considerado el primer entorno de realidad virtual multimodal.`,
    media:    `Cabina de experiencia inmersiva que combinaba imagen en tres dimensiones, sonido envolvente, vibraciones y hasta olores, considerada el primer intento real de crear una realidad virtual que implicara varios sentidos a la vez.`,
    sencilla: `Una cabina que te metía de lleno en una experiencia con imagen 3D, sonido, vibraciones y olores. El primer intento de realidad virtual de la historia.`
  },
};

const textos2 = {
    altair: {
        tecnica:  `Microordenador basado en el microprocesador Intel 8080, con memoria RAM limitada y panel de control de 
                  interruptores para entrada y LEDs para salida, pionera en la computación doméstica.`,
        media:    `Uno de los primeros ordenadores personales, controlado mediante interruptores físicos y con una memoria muy 
                  limitada, que abrió el camino a la informática doméstica tal como la conocemos hoy.`,
        sencilla: `El primer ordenador pensado para uso doméstico, aunque todavía sin pantalla ni teclado: se manejaba con 
                  interruptores y mostraba los resultados con lucecitas.`
    },
    apple: {
        tecnica:  `Sistema basado en procesador MOS 6502, arquitectura abierta, gráficos de 280×192 píxeles, sonido monofónico y 
                  soporte para almacenamiento en disquetes de 5,25”, con sistema operativo Apple DOS.`,
        media:    `Ordenador personal con arquitectura abierta que permitía ampliar sus capacidades, pantalla con gráficos en 
                  color, sonido y almacenamiento en disquetes, convirtiéndose en uno de los primeros ordenadores verdaderamente accesibles para el usuario doméstico.`,
        sencilla: `Uno de los primeros ordenadores de Apple, ya con pantalla, color, sonido y disquetes. Un gran salto hacia el 
                  ordenador personal moderno.`
    },
    cd: {
        tecnica:  `Disco óptico de 120 mm, con codificación digital PCM para audio o datos binarios, lectura mediante láser 
                  semiconductor que detecta pit y land codificados en espiral.`,
        media:    `Disco de almacenamiento que usaba un láser para leer información codificada digitalmente en su superficie, 
                  capaz de guardar tanto música como datos, y que revolucionó la distribución de contenido audiovisual.`,
        sencilla: `El disco plateado que todos conocemos, que usaba un láser para leer música y datos y reemplazó a los cassettes 
                  y disquetes.`
    },
    windows1: {
        tecnica:  `Sistema operativo gráfico basado en MS-DOS, con interfaz de ventanas mosaico, gestión básica de memoria y 
                  soporte limitado para multitarea cooperativa de aplicaciones.`,
        media:    `Primera versión del sistema operativo de Microsoft con interfaz gráfica, que permitía ver varias aplicaciones 
                  en pantalla al mismo tiempo mediante ventanas, aunque con capacidades bastante limitadas respecto a versiones posteriores.`,
        sencilla: `El primer Windows, que introdujo las ventanas y los iconos en pantalla, aunque todavía muy básico comparado 
                  con lo que conocemos hoy.`
    },
    macos: {
        tecnica:  `Sistema operativo monolítico con GUI basada en QuickDraw, soporte para eventos de ratón y teclado, y 
                  arquitectura orientada a objetos para gestión de ventanas y aplicaciones.`,
        media:    `Sistema operativo de Apple con una interfaz gráfica pionera, que popularizó el uso del ratón y las ventanas 
                  para interactuar con el ordenador, sentando las bases del diseño de sistemas operativos modernos.`,
        sencilla: `El sistema operativo de Apple que popularizó el ratón y las ventanas, haciendo los ordenadores mucho más 
                  fáciles e intuitivos de usar.`
    },
    netscape: {
        tecnica:  `Navegador gráfico cliente-servidor compatible con HTML 2.0/3.2, soporte de TCP/IP, cookies, JavaScript inicial 
                  y plugins, que aceleró la adopción masiva de la web.`,
        media:    `Uno de los primeros navegadores web con interfaz gráfica, que introdujo funcionalidades como las cookies y 
                  JavaScript, y fue clave para que millones de personas se conectaran a Internet por primera vez.`,
        sencilla: `El navegador que llevó Internet a los hogares, fue el primero en hacer la web accesible y fácil de usar para 
                  todo el mundo.`
    },
    primeraWeb: {
        tecnica:  `Página HTML estática servida desde un servidor CERN, usando etiquetas básicas como <html>, <head>, <body> y <a> 
                  para hipertexto.`,
        media:    `Primera página web de la historia, creada en el CERN, que usaba un lenguaje de etiquetas básico para estructurar texto y enlaces, sentando las bases del funcionamiento de la web tal como la conocemos hoy.`,
        sencilla: `La primera página web de la historia, creada por Tim Berners-Lee en el CERN. Solo texto y enlaces, pero el punto de partida de todo Internet tal como lo conocemos.`
    },
    reproductor: {
        tecnica:  `Dispositivo portátil de reproducción analógica de cassettes de cinta magnética, con mecanismo de cabezal lector, 
                  motor de arrastre a velocidad constante y salida de audio estéreo mediante conector jack de 3,5 mm.`,
        media:    `Reproductor portátil de cassettes que permitía escuchar música en cualquier lugar, conectando unos auriculares. 
                  Fue el dispositivo que popularizó el consumo de música en movilidad antes de la era digital.`,
        sencilla: `El aparato con el que la gente escuchaba música por la calle en los 90, metiendo un cassette y conectando 
                  auriculares. El abuelo del iPod.`
    },
    primerIphone: {
        tecnica:  `Dispositivo móvil con sistema operativo iOS, pantalla multitáctil capacitiva de 3,5", SoC ARM 11, conectividad 
                  EDGE y pila de aplicaciones integradas (Teléfono, Safari, iPod, Mail).`,
        media:    `Primer smartphone de Apple, que revolucionó la industria móvil al combinar teléfono, reproductor de música y 
                  navegador web en un único dispositivo controlado completamente mediante una pantalla táctil.`,
        sencilla: `El primer iPhone, que cambió para siempre cómo usamos el móvil: sin teclado físico, todo con el dedo, y con internet, música y teléfono en un solo aparato.`
    },
    primerasTablets: {
        tecnica:  `Ordenadores portátiles con pantalla LCD táctil, CPU ARM/x86, almacenamiento flash, OS basado en dispositivos 
                  móviles o desktop y soporte para entrada directa por stylus o dedos.`,
        media:    `Dispositivos con pantalla táctil que combinaban la potencia de un ordenador con la comodidad de manejarse 
                  directamente con los dedos o un lápiz, ofreciendo una forma más intuitiva y portátil de consumir contenido digital.`,
        sencilla: `Los primeros tablets, ordenadores solo con pantalla táctil y sin teclado, que se manejaban con los dedos o un 
                  lápiz y fueron el paso previo a los tablets modernos como el iPad.`
    }
};

export function getCarrusel1Popup(nivel: NivelExplicacion): CarouselItemPopup[] {
  return [
    { src: 'assets/imagenes/principal/linternaMagica.png',  title: 'Linterna mágica - siglo XVII / XIX', text: textos.linternaMagica[nivel] },
    { src: 'assets/imagenes/principal/fonoautografo.jpg',   title: 'Fonoautógrafo - 1857',               text: textos.fonoautografo[nivel] },
    { src: 'assets/imagenes/principal/fonografo.png',       title: 'Fonógrafo - 1877',                   text: textos.fonografo[nivel] },
    { src: 'assets/imagenes/principal/gramofono.png',       title: 'Gramófono - 1887',                   text: textos.gramofono[nivel] },
    { src: 'assets/imagenes/principal/cinematografo.jpg',   title: 'Cinematógrafo - 1895',               text: textos.cinematografo[nivel] },
    { src: 'assets/imagenes/principal/cineSonoro.jpg',      title: 'Cine Sonoro - 1927',                 text: textos.cineSonoro[nivel] },
    { src: 'assets/imagenes/principal/sensorama.jpg',       title: 'Sensorama - 1962',                   text: textos.sensorama[nivel] },
  ];
}

export function getCarrusel2Popup(nivel: NivelExplicacion): CarouselItemPopup[] {
  return [
    { src: 'assets/imagenes/principal/altair8800.png',       title: 'Altair 8800 - años 70',         text: textos2.altair[nivel] },
    { src: 'assets/imagenes/principal/appleII.png',          title: 'Apple II - años 70',             text: textos2.apple[nivel] },
    { src: 'assets/imagenes/principal/vinilo.png',             title: 'CD - años 70',                  text: textos2.cd[nivel] },
    { src: 'assets/imagenes/principal/pantallaWindows.png',  title: 'Windows 1.0 - años 80',         text: textos2.windows1[nivel] },
    { src: 'assets/imagenes/principal/macOSClasico.png',     title: 'MacOS Clásico - años 80',       text: textos2.macos[nivel] },
    { src: 'assets/imagenes/principal/netscape.png',         title: 'Netscape - años 90',            text: textos2.netscape[nivel] },
    { src: 'assets/imagenes/principal/primeraWeb.png',       title: 'Primera página web - años 90',  text: textos2.primeraWeb[nivel] },
    { src: 'assets/imagenes/principal/walkman.jpg',    title: 'Walkman - años 90',         text: textos2.reproductor[nivel] },
    { src: 'assets/imagenes/principal/primerIPhone.png',     title: 'IPhone 1 - años 2000',          text: textos2.primerIphone[nivel] },
    { src: 'assets/imagenes/principal/primeraTablet.png',  title: 'Primera tablet - años 2000',  text: textos2.primerasTablets[nivel] },
  ];
}
