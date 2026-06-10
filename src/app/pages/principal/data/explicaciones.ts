import { NivelExplicacion } from '../../../services/explicacion.service';

export const explicaciones: Record<string, Record<NivelExplicacion, string>> = {
  seccion1: {
    tecnica: `El contenido multimedia se define como la integración coordinada de distintos medios —texto, imagen, audio, 
              animación y vídeo— dentro de un mismo entorno digital. Su objetivo es optimizar la comunicación y la experiencia de 
              usuario mediante la combinación simultánea de canales sensoriales y formatos de información.<br><br>
              En el ámbito informático, el término se asocia con sistemas capaces de almacenar, procesar y reproducir datos 
              codificados en múltiples formatos digitales (por ejemplo, JPEG, MP3, MP4, HTML5 o SVG). Estos sistemas emplean tanto
              hardware especializado —como procesadores gráficos, interfaces táctiles y tarjetas de sonido— como software de 
              gestión y renderizado que permiten la sincronización entre elementos visuales y sonoros.<br><br>
              La multimedia puede clasificarse según su estructura de interacción. Se denomina lineal cuando el contenido se 
              presenta en una secuencia fija sin intervención del usuario. La hipermedia, en cambio, permite al usuario navegar 
              entre nodos de información interconectados, alterando el orden de acceso sin necesariamente modificar el contenido.
              Por último, la hipermedia interactiva amplía este modelo dotando al usuario de capacidad para intervenir, manipular 
              y controlar activamente los elementos del sistema, más allá de la mera navegación.<br><br>
              Gracias al desarrollo de las redes digitales e Internet, la multimedia ha evolucionado hacia sistemas interactivos 
              y distribuidos, en los que la convergencia entre medios y la integración de datos en tiempo real son componentes 
              esenciales de la comunicación contemporánea.`,
    media:   `El contenido multimedia es aquel que combina, de forma conjunta y simultánea, distintos mecanismos de comunicación, 
              como el audio, el vídeo, el texto escrito y las imágenes.<br><br>
              En el ámbito de la informática, este término se utiliza con mucha frecuencia para referirse a la tecnología capaz de
              transmitir información en diferentes formatos: sonoros, textuales, visuales y de vídeo.<br><br>
              Dispositivos tecnológicos modernos como las tablets, los smartphones y los ordenadores son ejemplos claros de 
              sistemas multimedia, que superan en capacidad e interactividad a los medios audiovisuales tradicionales, como la 
              televisión. Con la llegada de Internet, este tipo de formatos múltiples se convirtió en la norma del consumo de 
              información en la vida contemporánea.<br><br>
              Podemos distinguir entre equipos multimedia lineales, en los que el usuario no puede cambiar ni modificar el 
              contenido y lo visualiza en un orden preestablecido, y sistemas de hipermedia, que ofrecen mayor control gracias a 
              opciones de navegación. Finalmente, encontramos la multimedia no lineal o hipermedia interactiva, donde el usuario 
              puede interactuar y controlar gran parte del contenido.`,
    sencilla: `La multimedia combina audio, vídeo, texto e imágenes en un mismo entorno. Es la base de dispositivos como móviles, 
              tablets y ordenadores, y con Internet se convirtió en la forma principal de consumir información.<br><br>
              Existen tres tipos: la multimedia <strong>lineal</strong>, donde el contenido tiene un orden fijo que el usuario no 
              puede cambiar; la <strong>hipermedia</strong>, donde el usuario puede navegar libremente entre contenidos; y la 
              <strong>hipermedia interactiva</strong>, donde además puede manipular y controlar los elementos directamente.`
  },

  seccion2_1: {
    tecnica:  `Aunque la multimedia digital comenzó a desarrollarse en la década de 1960, sus antecedentes tecnológicos se remontan 
              a siglos anteriores. En el siglo XVII surgió la linterna mágica, un proyector óptico de transparencias de vidrio 
              acompañadas de narración y música en directo.<br><br>
              En audio, el fonoautógrafo (1857) registró por primera vez ondas sonoras sin reproducción; el fonógrafo de Edison (1877) 
              incorporó la reproducción en cilindros, y el gramófono (1887) estandarizó el disco plano. En imagen, el cinematógrafo 
              (1895) introdujo la proyección secuencial de fotogramas, el cine sonoro (1927) integró audio sincronizado mediante 
              registro óptico, y la televisión añadió la transmisión en tiempo real.<br><br>
              Este recorrido culminó con el Sensorama (1962), cabina inmersiva con proyección estereoscópica, sonido binaural, 
              retroalimentación háptica y estimulación olfativa, considerado precursor directo de la realidad virtual y la 
              multimedia interactiva moderna.`,
    media:    `Los antecedentes de la multimedia se remontan a dispositivos analógicos que combinaron distintos estímulos sensoriales 
              antes de la era digital. Desde la linterna mágica del siglo XVII —que proyectaba imágenes acompañadas de narración y música— 
              hasta los sistemas acústicos del siglo XIX (fonoautógrafo, fonógrafo y gramófono), se establecieron las bases tecnológicas p
              ara la integración audiovisual.<br><br>
              El desarrollo del cinematógrafo y la televisión introdujo la sincronización entre imagen en movimiento y sonido 
              reproducido, un principio esencial en los sistemas multimedia. Finalmente, el Sensorama (1962), diseñado por Morton 
              Heilig, incorporó componentes multisensoriales (imagen estereoscópica, sonido envolvente, vibración y estímulos 
              olfativos), constituyéndose como el primer prototipo de entorno inmersivo interactivo y precursor de la multimedia 
              digital contemporánea.`,
    sencilla: `La multimedia tiene una larga historia antes de los ordenadores.<br><br>
              Primero llegaron los inventos de imagen y sonido por separado: la linterna mágica proyectaba imágenes, el fonógrafo 
              grababa y reproducía sonido, y el cinematógrafo juntó imagen en movimiento con sonido.<br><br>
              Con el tiempo, estos medios se fueron combinando hasta llegar en 1962 al Sensorama, una cabina que juntaba imagen, 
              sonido, movimiento y olor al mismo tiempo, el primer intento real de multimedia inmersiva.`
  },
  seccion2_2: {
    tecnica: `La evolución de la multimedia digital se articula en torno al progreso del hardware, los soportes de almacenamiento 
              y las redes de comunicación. En los años 70, los primeros microcomputadores (Altair 8800, Apple II) posibilitaron el 
              procesamiento y visualización de datos multiformato. En los 80, las interfaces gráficas de usuario (GUI) transformaron 
              la interacción hombre-máquina mediante representaciones visuales y control directo de objetos digitales.<br><br>
              El advenimiento de la World Wide Web en los 90 introdujo la distribución global de contenido multimedia y el 
              desarrollo de estándares como HTML, MPEG y JPEG, que unificaron la codificación audiovisual. En el siglo XXI, 
              la proliferación de dispositivos móviles y plataformas sociales consolidó un ecosistema multimedia ubicuo, dinámico 
              y participativo, caracterizado por la convergencia entre comunicación, entretenimiento e interacción en tiempo real.`,
    media:    `La evolución de la multimedia digital está ligada al avance de los ordenadores, los formatos de almacenamiento y las 
              redes de comunicación. En los años 70, los primeros ordenadores personales como el Altair 8800 y el Apple II 
              permitieron trabajar con distintos tipos de datos digitales. En los 80, la llegada de las interfaces gráficas cambió 
              la forma en que las personas interactuaban con los ordenadores, haciendo todo más visual e intuitivo.<br><br>En los 90, 
              Internet y la World Wide Web revolucionaron la distribución de contenido multimedia, y se establecieron formatos estándar 
              como HTML, MPEG y JPEG que permitieron compartir audio, vídeo e imágenes de forma universal. En el siglo XXI, los 
              smartphones y las redes sociales completaron esta evolución, creando un entorno donde la comunicación, el 
              entretenimiento y la interacción conviven en tiempo real desde cualquier dispositivo.`,
    sencilla: `La multimedia evolucionó junto con la tecnología. En los 70 y 80 llegaron los primeros ordenadores personales y 
              las pantallas con iconos y ventanas. En los 90, Internet permitió compartir vídeos, imágenes y música con todo el 
              mundo usando los mismos formatos.<br><br>
              Hoy, con los móviles y las redes sociales, consumimos y creamos multimedia en cualquier momento y lugar.`
  },
  seccion2_3: {
    tecnica:  `En la actualidad, la multimedia se define por la convergencia tecnológica y la interactividad. Los contenidos se 
              distribuyen de forma ubicua a través de dispositivos conectados (PC, móviles, televisores, wearables y sistemas automotrices), 
              integrando distintos flujos de datos en un mismo entorno digital.<br><br>
              La producción y el consumo de medios son ahora bidireccionales: los usuarios actúan como prosumidores, generando y 
              compartiendo contenido en plataformas sociales y servicios de streaming. Tecnologías como la realidad aumentada (AR), 
              la realidad virtual (VR) y la inteligencia artificial generativa expanden los límites de la experiencia multimedia 
              hacia entornos inmersivos y personalizados, donde la interacción en tiempo real redefine el papel del espectador.`,
    media:    `Hoy en día, la multimedia está en todas partes. La consumimos a través de ordenadores, móviles, televisores, relojes 
              inteligentes y hasta en los coches, todos ellos conectados y capaces de combinar distintos tipos de contenido en un 
              mismo entorno.<br><br>
              Además, la relación entre usuarios y medios ha cambiado: ya no solo consumimos contenido, sino que también lo creamos 
              y compartimos a través de redes sociales y plataformas de streaming. Tecnologías como la realidad aumentada, la 
              realidad virtual y la inteligencia artificial están llevando la multimedia un paso más allá, creando experiencias 
              inmersivas y personalizadas donde el espectador tiene un papel mucho más activo.`,
    sencilla: `Hoy la multimedia está en todos nuestros dispositivos: el móvil, el ordenador, la tele o el reloj inteligente. 
              Ya no solo vemos o escuchamos contenido, también lo creamos y lo compartimos.<br><br>
              Y con tecnologías como la realidad virtual o la inteligencia artificial, las experiencias multimedia son cada vez 
              más inmersivas e interactivas.`
  },
};
