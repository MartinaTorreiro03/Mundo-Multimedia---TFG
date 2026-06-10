 import { NivelExplicacion } from '../../../services/explicacion.service';

export type CarouselItemPopup = {
  src: string;
  title: string;
  text: string;
};

const textos = {
  maquinaEscribirMecanica: {
    tecnica:  `La máquina de escribir mecánica, comercializada masivamente desde la segunda mitad del siglo XIX con modelos como la Remington N.º 1, mecanizó la producción textual mediante un sistema de palancas, tipos metálicos y cinta entintada. Estandarizó la tipografía en documentos no impresos y aumentó significativamente la velocidad de transcripción respecto a la escritura manual, siendo adoptada de forma masiva en entornos administrativos, periodísticos y literarios.`,
    media:    `La máquina de escribir mecánica fue el primer dispositivo de uso masivo para producir texto de forma rápida y legible. Apareció en la segunda mitad del siglo XIX y transformó oficinas, redacciones y despachos: lo que antes se hacía a mano, lento y variable, ahora podía hacerse de forma uniforme y mucho más ágil. Fue el primer gran paso hacia la mecanización de la escritura.`,
    sencilla: `El primer aparato que permitió escribir rápido y con letra uniforme, sin necesidad de bolígrafo ni pluma. Cambió para siempre cómo se trabajaba con texto.`
  },

  maquinaEscribirElectrica: {
    tecnica:  `La máquina de escribir eléctrica sustituyó el accionamiento mecánico directo por un motor eléctrico que reducía la fuerza necesaria en cada pulsación y permitía incorporar funciones automáticas como el retorno de carro motorizado, el espaciado proporcional y, en modelos avanzados como la IBM Selectric, la cabeza de impresión intercambiable tipo "golf ball". Supuso un paso intermedio clave entre la mecanografía analógica y los primeros procesadores de texto.`,
    media:    `La máquina de escribir eléctrica mejoró a su predecesora mecánica reduciendo el esfuerzo físico del mecanógrafo e incorporando funciones automáticas como el retorno de carro o el espaciado proporcional. Modelos como la IBM Selectric introdujeron mejoras técnicas que la acercaban ya a lo que sería un procesador de texto, convirtiéndola en una herramienta más precisa y cómoda para uso profesional.`,
    sencilla: `Una versión mejorada de la máquina de escribir, con motor eléctrico. Escribir requería menos esfuerzo y algunas cosas se hacían solas, como volver al inicio de la línea.`
  },

  teletipo: {
    tecnica:  `El teletipo fue un sistema electromecánico de transmisión de texto codificado mediante señales eléctricas a través de líneas telegráficas, basado en el código Baudot-Murray. Permitió la comunicación textual a distancia en tiempo casi real entre terminales remotas, siendo ampliamente utilizado en agencias de noticias, servicios militares y redes corporativas entre las décadas de 1920 y 1960. Constituye un precursor directo del fax y de los protocolos de transmisión de datos en red.`,
    media:    `El teletipo permitió transmitir texto a distancia a través de líneas telegráficas, convirtiéndose en una herramienta clave para agencias de noticias, gobiernos y empresas entre los años 20 y 60. Era capaz de enviar y recibir mensajes escritos de forma casi inmediata entre puntos remotos, algo revolucionario para su época. Se considera un precursor directo del fax y de las comunicaciones digitales en red.`,
    sencilla: `Una máquina que enviaba texto escrito a través de cables telegráficos, como un fax pero mucho más antiguo. Fue clave para transmitir noticias y mensajes a larga distancia.`
  },

  linotipia: {
    tecnica:  `La linotipia, inventada por Ottmar Mergenthaler en 1886, automatizó la composición tipográfica mediante la fundición de líneas completas de texto en metal (slugs) a partir de matrices ensambladas por teclado. La fotocomposición, desarrollada posteriormente, sustituyó el metal por exposición fotográfica sobre papel o película, eliminando el proceso de fundición y acelerando la preimpresión. Ambas tecnologías fueron fundamentales en la industria editorial y periodística hasta la llegada de la autoedición digital.`,
    media:    `La linotipia revolucionó la industria de la impresión al permitir componer líneas enteras de texto en metal de forma mecánica, sustituyendo la composición manual letra a letra. Más adelante, la fotocomposición eliminó el metal y usó luz sobre papel fotosensible, haciendo el proceso más rápido y limpio. Estas tecnologías fueron la base de la producción editorial profesional durante casi un siglo.`,
    sencilla: `Máquinas que componían el texto para imprimir periódicos y libros de forma automática. Primero usaban metal fundido, luego luz sobre papel. Sin ellas, la prensa moderna no habría existido.`
  },

  tarjetasPerforadas: {
    tecnica:  `Los sistemas de tarjetas perforadas, derivados de los telares Jacquard y popularizados por Herman Hollerith para el censo de EE.UU. de 1890, codificaban datos mediante la presencia o ausencia de perforaciones en posiciones predefinidas de una tarjeta de cartulina. Fueron el soporte de entrada y almacenamiento de datos dominante en los mainframes de los años 30 a 50, y establecieron el principio de la codificación binaria discreta como base del procesamiento informático.`,
    media:    `Las tarjetas perforadas fueron el primer método estándar para introducir texto y datos en ordenadores. Cada perforación en una posición concreta representaba un carácter o instrucción, y las máquinas las leían automáticamente. Aunque hoy parezcan rudimentarias, fueron la base de la informática durante décadas y establecieron el principio de codificar información de forma discreta y legible por máquina.`,
    sencilla: `Tarjetas de cartulina con agujeros que los ordenadores leían como datos. Era la única forma de "hablarle" a un ordenador en sus primeros años. Tediosas, pero revolucionarias para su época.`
  },

  terminalesTexto: {
    tecnica:  `Los terminales de texto, como el VT100 de Digital Equipment Corporation (1978), eran dispositivos de entrada/salida que se comunicaban con mainframes o minicomputadoras mediante protocolos serie (RS-232), mostrando únicamente caracteres del conjunto ASCII en pantallas monocromo de fósforo verde o ámbar. Carecían de capacidad de procesamiento local y dependían del servidor central para toda la lógica de aplicación, siendo el modelo arquitectónico dominante antes de la computación personal.`,
    media:    `Los terminales de texto como el VT100 eran pantallas monocromo conectadas a grandes ordenadores centrales, capaces de mostrar únicamente caracteres de texto. No procesaban nada por sí solos: todo se ejecutaba en el servidor al que estaban conectados. Fueron la interfaz estándar en universidades, laboratorios y empresas durante los años 70, y el modelo sobre el que se construyeron las primeras interfaces de línea de comandos.`,
    sencilla: `Pantallas en blanco y negro que solo mostraban letras y números, conectadas a un ordenador grande en otra sala. No hacían nada solos, pero eran la ventana para interactuar con los primeros sistemas informáticos.`
  },

  procesadoresTexto: {
    tecnica:  `Los procesadores de texto dedicados, como el Wang Word Processor o el IBM DisplayWriter, eran sistemas ofimáticos de propósito único que integraban teclado, pantalla, unidad de procesamiento y almacenamiento en un único dispositivo optimizado para la edición, corrección y formateo de documentos. A diferencia de los ordenadores de propósito general, no eran programables para otras tareas, pero ofrecían funcionalidades avanzadas de edición textual —búsqueda, reemplazo, paginación automática— que anticiparon los procesadores de texto modernos.`,
    media:    `Los procesadores de texto dedicados fueron dispositivos electrónicos diseñados exclusivamente para escribir, editar e imprimir documentos. A diferencia de los ordenadores generales, no servían para nada más, pero lo que hacían lo hacían muy bien: permitían corregir, mover párrafos, buscar palabras y formatear texto antes de imprimirlo, funciones que hoy damos por sentadas en cualquier editor.`,
    sencilla: `Aparatos que solo servían para escribir y editar texto, como un Word pero en un dispositivo propio. No hacían nada más, pero para escribir documentos eran perfectos.`
  },

  impresoras: {
    tecnica:  `Las impresoras matriciales operaban mediante un cabezal de pines que impactaba sobre una cinta entintada, generando caracteres por composición de puntos en una matriz; su velocidad y bajo coste las hicieron dominantes en entornos corporativos. Las impresoras láser, basadas en electrofotografía xerográfica, utilizaban un haz láser para cargar selectivamente un tambor fotosensible, transfiriendo tóner al papel con resolución y velocidad muy superiores. Ambas tecnologías democratizaron la producción de documentos impresos de calidad profesional fuera del entorno editorial.`,
    media:    `Las impresoras matriciales y láser transformaron la forma de plasmar texto digital en papel. Las matriciales, ruidosas pero económicas, usaban agujas para formar los caracteres punto a punto. Las láser, más avanzadas, aplicaban tóner con precisión mediante un rayo de luz, ofreciendo velocidad y calidad muy superiores. Juntas hicieron posible que cualquier empresa u oficina pudiera producir documentos con aspecto profesional sin necesidad de imprenta.`,
    sencilla: `Las primeras impresoras que llevaron el texto digital al papel de verdad. Las de agujas eran ruidosas pero baratas; las láser eran rápidas y nítidas. Gracias a ellas, imprimir dejó de ser cosa solo de imprentas.`
  },

  ordenadoresPersonales: {
    tecnica:  `La llegada del IBM PC (1981), el Apple II y posteriormente el Macintosh (1984) consolidó la computación personal como paradigma dominante. El Macintosh introdujo la interfaz gráfica de usuario (GUI) basada en metáforas visuales de escritorio, tipografía WYSIWYG y dispositivos apuntadores, lo que permitió integrar texto y gráficos en un mismo entorno de edición. Programas como WordPerfect y Microsoft Word establecieron el procesador de texto como aplicación central del PC, mientras que PageMaker sentó las bases de la autoedición digital.`,
    media:    `Con los ordenadores personales como el IBM PC, el Apple II o el Macintosh, el texto dejó de ser algo estático para convertirse en algo editable, formateble y combinable con gráficos en la misma pantalla. Programas como WordPerfect o Microsoft Word se convirtieron en herramientas cotidianas, y el Macintosh popularizó la interfaz visual que permitía ver el documento tal como se imprimiría. Fue el momento en que el texto digital entró en los hogares y oficinas de todo el mundo.`,
    sencilla: `Con los primeros ordenadores personales, escribir en pantalla y editar texto se volvió algo normal para cualquiera. Programas como Word llegaron para quedarse, y por primera vez podías mezclar texto con imágenes en el mismo documento.`
  },

  disquetesCDROM: {
    tecnica:  `Los disquetes de 5,25" y 3,5" permitieron la distribución portátil de software y documentos con capacidades de entre 360 KB y 1,44 MB, estableciendo un estándar de intercambio físico de datos. El CD-ROM, con capacidad de hasta 700 MB, amplió radicalmente las posibilidades de almacenamiento y distribución, permitiendo incluir texto junto con imágenes, audio y vídeo en un único soporte óptico. Fue el primer formato que hizo viable la distribución masiva de contenido multimedia empaquetado.`,
    media:    `Los disquetes y los CD-ROM cambiaron la forma de almacenar y distribuir texto digital. Los disquetes permitieron por primera vez llevar documentos de un ordenador a otro de forma portátil. Los CD-ROM dieron un salto enorme en capacidad, permitiendo incluir no solo texto sino también imágenes, sonidos y vídeos en un mismo soporte. Fueron el primer paso real hacia la distribución de contenido multimedia empaquetado.`,
    sencilla: `Los disquetes permitían llevar documentos en el bolsillo, y los CD-ROM podían almacenar tantísima información que por primera vez era posible distribuir texto, música e imágenes juntos en un solo disco.`
  },

  hipertextoHTML: {
    tecnica:  `El hipertexto, conceptualizado por Ted Nelson en los años 60 y operacionalizado por Tim Berners-Lee con la creación del protocolo HTTP y el lenguaje HTML en 1991, transformó el texto lineal en una red de nodos interconectados mediante hipervínculos. HTML permitió estructurar semánticamente el contenido textual e integrarlo con imágenes, formularios y, posteriormente, audio y vídeo, sentando las bases de la web como entorno hipermedia. La World Wide Web convirtió el texto en el eje estructural de la comunicación digital global.`,
    media:    `El hipertexto y el lenguaje HTML transformaron radicalmente el concepto de texto: ya no era algo que se leía de forma lineal, sino una red de contenidos interconectados mediante enlaces. Con la llegada de la World Wide Web en los años 90, cualquier palabra podía llevar a otra página, otro documento o cualquier otro recurso. El texto se volvió interactivo, enlazado y combinable con imágenes y otros medios, convirtiéndose en la base de la web multimedia que conocemos hoy.`,
    sencilla: `El momento en que el texto dejó de ser algo que solo se leía y se convirtió en algo en lo que podías hacer clic. Los enlaces entre páginas web cambiaron para siempre cómo navegamos y consumimos información.`
  },

  ebooks: {
    tecnica:  `Los lectores de libros electrónicos, como el Amazon Kindle (2007) o el Sony Reader, utilizaron pantallas de tinta electrónica (e-ink) basadas en microcápsulas de partículas pigmentadas con bajo consumo energético y alta legibilidad en condiciones de luz ambiental. Los formatos ePub y MOBI estandarizaron la distribución de texto digital con soporte para tipografía variable, anotaciones y sincronización entre dispositivos, consolidando el libro digital como alternativa real al impreso.`,
    media:    `Los e-books y lectores digitales como el Kindle convirtieron el texto digital en un formato portable y cómodo de leer, con pantallas de tinta electrónica que imitaban el papel y permitían llevar miles de libros en un solo dispositivo. Además de la comodidad, introdujeron funciones nuevas como el subrayado digital, los diccionarios integrados o la sincronización entre dispositivos, redefiniendo la experiencia de lectura.`,
    sencilla: `Miles de libros en un dispositivo del tamaño de un libro de bolsillo, con una pantalla que parece papel de verdad. Los e-readers cambiaron cómo leemos y dónde leemos.`
  },

  smartphonesTablets: {
    tecnica:  `La introducción del iPhone (2007) y la posterior proliferación de smartphones y tablets consolidaron un ecosistema multimedia móvil en el que el texto dejó de existir como medio aislado. Las interfaces táctiles, los sistemas operativos móviles y las aplicaciones integradas permitieron la coexistencia y el consumo simultáneo de texto, imagen, audio y vídeo en un único dispositivo conectado. Los estándares HTML5 y las apps nativas completaron la convergencia multimedia, haciendo del smartphone el principal punto de acceso a la información textual y audiovisual.`,
    media:    `Con los smartphones y tablets, el texto dejó de estar solo. En el mismo dispositivo con el que leías un artículo podías ver un vídeo, escuchar música, hacer una foto o enviar un mensaje. El texto se integró de forma natural en un ecosistema multimedia completo, siempre conectado y siempre en el bolsillo. El móvil se convirtió en la principal puerta de acceso a la información para la mayoría de personas en el mundo.`,
    sencilla: `Con el móvil, el texto ya no viaja solo: va acompañado de fotos, vídeos, audios y notificaciones, todo a la vez. El smartphone es hoy el dispositivo multimedia por excelencia.`
  },

  asistentesVoz: {
    tecnica:  `Los sistemas de reconocimiento automático del habla (ASR) como Siri (2011), Google Now o Alexa combinan modelos acústicos y de lenguaje basados en redes neuronales para transcribir señales de voz en texto con alta precisión. La integración de procesamiento del lenguaje natural (NLP) permitió que este texto generado por voz pudiera interpretarse semánticamente y ejecutar acciones, desacoplando por primera vez la producción textual de la entrada manual por teclado y ampliando el acceso a la información a nuevos perfiles de usuario.`,
    media:    `Los asistentes virtuales y sistemas de dictado por voz como Siri, Google Assistant o Alexa introdujeron una nueva forma de generar texto: hablando. Gracias al reconocimiento de voz y al procesamiento del lenguaje natural, el texto ya no tenía que escribirse manualmente, lo que amplió el acceso a la tecnología y cambió la forma en que interactuamos con nuestros dispositivos. El texto pasó de ser algo que se escribe a algo que también se dice.`,
    sencilla: `Ya no hace falta escribir para generar texto: basta con hablar. Los asistentes de voz entienden lo que dices y lo convierten en texto o en acciones, haciendo la tecnología más accesible que nunca.`
  },

  plataformasColaborativas: {
    tecnica:  `Las plataformas colaborativas actuales como Google Docs, Notion o los modelos de lenguaje de gran escala (LLMs) como ChatGPT representan la convergencia total del texto con el resto de medios y con la inteligencia artificial. La edición colaborativa en tiempo real, los sistemas de control de versiones, la integración nativa de imágenes, vídeos y bases de datos, y la generación automática de contenido textual mediante IA cierran el ciclo evolutivo del texto: de soporte estático a componente dinámico, generativo y multimedia de un ecosistema de comunicación global.`,
    media:    `Las plataformas colaborativas actuales como Google Docs, Notion o herramientas de IA como ChatGPT representan el punto más avanzado de la evolución del texto. Ya no es solo algo que se escribe: se genera, se edita entre varias personas a la vez, se combina con imágenes, vídeos y datos en tiempo real, y puede ser producido por inteligencia artificial. El texto ha cerrado su ciclo: de ser el origen de todo, ahora convive y se fusiona con todos los medios que ayudó a crear.`,
    sencilla: `Hoy escribimos juntos en la nube, en tiempo real, mezclando texto con vídeos, imágenes y hasta inteligencia artificial. El texto ya no es solo texto: es el centro de un ecosistema multimedia completo.`
  },
};

export function getCarruselPopup(nivel: NivelExplicacion): CarouselItemPopup[] {
  return [
    { src: 'assets/imagenes/texto/maquinaMecanica.png',    title: 'Máquina de escribir mecánica - siglo XIX',                            text: textos.maquinaEscribirMecanica[nivel] },
    { src: 'assets/imagenes/texto/maquinaElectrica.png',   title: 'Máquina de escribir eléctrica - mediados siglo XX',                   text: textos.maquinaEscribirElectrica[nivel] },
    { src: 'assets/imagenes/texto/teletipo.jpg',           title: 'Teletipo - 1920s-1960s',                                              text: textos.teletipo[nivel] },
    { src: 'assets/imagenes/texto/linotipia.jpg',          title: 'Linotipia y fotocomposición - finales s. XIX - s. XX',                 text: textos.linotipia[nivel] },
    { src: 'assets/imagenes/texto/perforadora.png',        title: 'Ordenador de tarjetas perforadas - 1930s-1950s',                      text: textos.tarjetasPerforadas[nivel] },
    { src: 'assets/imagenes/texto/vt100.png',              title: 'Terminales de texto (VT100 y similares) - 1970s',                     text: textos.terminalesTexto[nivel] },
    { src: 'assets/imagenes/texto/procesadorTexto.png',    title: 'Procesadores de texto dedicados - 1970s-1980s',                       text: textos.procesadoresTexto[nivel] },
    { src: 'assets/imagenes/texto/impresoraMatricial.png', title: 'Impresoras matriciales y láser - 1970s-1980s',                        text: textos.impresoras[nivel] },
    { src: 'assets/imagenes/texto/macintosh.jpg',          title: 'Ordenadores personales (IBM PC, Apple II, Macintosh) - 1980s',        text: textos.ordenadoresPersonales[nivel] },
    { src: 'assets/imagenes/texto/disquete.png',          title: 'Disquetes y CD-ROM - 1980s-1990s',                                    text: textos.disquetesCDROM[nivel] },
    { src: 'assets/imagenes/texto/www.jpg',               title: 'Hipertexto y HTML (World Wide Web) - 1990s',                          text: textos.hipertextoHTML[nivel] },
    { src: 'assets/imagenes/texto/ebook.png',              title: 'E-books y lectores digitales (Kindle, Sony Reader) - 2000s',          text: textos.ebooks[nivel] },
    { src: 'assets/imagenes/texto/nokia.png', title: 'Smartphones y tablets - 2007 en adelante',                            text: textos.smartphonesTablets[nivel] },
    { src: 'assets/imagenes/texto/asistenteVirtual.png',   title: 'Asistentes virtuales y dictado por voz - 2010s',                      text: textos.asistentesVoz[nivel] },
    { src: 'assets/imagenes/texto/ia.png',                 title: 'Plataformas colaborativas y multimedia - actualidad',                  text: textos.plataformasColaborativas[nivel] },
  ];
}
