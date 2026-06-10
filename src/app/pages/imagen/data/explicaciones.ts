import { NivelExplicacion } from '../../../services/explicacion.service';

export const explicaciones: Record<string, Record<NivelExplicacion, string>> = {
    seccion1: {
        tecnica: `La fotografía analógica se fundamenta en procesos fotoquímicos de captura y fijación de imágenes mediante la 
                exposición de superficies sensibilizadas a la luz. El daguerrotipo (1839), primer procedimiento fotográfico de uso 
                extendido, empleaba placas de plata yodada expuestas en cámara oscura y reveladas mediante vapores de mercurio, 
                produciendo imágenes de alta resolución sobre soporte metálico sin posibilidad de reproducción. La evolución hacia 
                el negativo en papel y posteriormente el negativo flexible de celuloide permitió la replicación múltiple de imágenes 
                mediante procesos de ampliación en laboratorio. La fotografía instantánea, desarrollada por Polaroid a partir de 1948, 
                integraba en un único soporte los elementos de captura y revelado autocatalítico, eliminando la fase de laboratorio 
                y generando copias únicas no reproducibles. En todos estos sistemas, la imagen quedaba físicamente inscrita en el soporte 
                material, sin posibilidad de manipulación posterior ni transmisión inmediata, confiriéndole un carácter de objeto único 
                e irrepetible.`,

        media: `Antes de lo digital, cada fotografía era el resultado de un proceso cuidadoso e irreversible. Desde las primeras 
                imágenes fijadas sobre placas metálicas en el siglo XIX hasta las populares fotos instantáneas Polaroid, capturar un 
                momento significaba comprometerse con él: no había forma de borrar, editar ni reencuadrar después del disparo. El revelado 
                en laboratorio podía llevar días, y cada copia tenía un coste real en material y tiempo. Esa limitación, lejos de ser un 
                defecto, dotaba a cada imagen de un valor especial: era un objeto físico, único, que se guardaba en álbumes y se compartía 
                en persona, como una pequeña reliquia del pasado.`,

        sencilla: `Antes, hacer una foto era algo especial. No podías ver el resultado al momento ni borrarla si salía mal: había que 
                esperar días a que la revelaran en un laboratorio. Las primeras fotos se hacían sobre placas de metal, y más adelante 
                llegaron las instantáneas que se revelaban solas en segundos. Pero todas tenían algo en común: eran únicas, físicas, 
                y había que cuidarlas. Una foto era un recuerdo real que podías tocar, guardar en un álbum y enseñar a quien tuvieras 
                al lado.`
    },
    seccion2: {
        tecnica: `La transición hacia la fotografía digital supuso una ruptura paradigmática en los fundamentos tecnológicos de 
                la captura de imagen. Los sensores CCD y posteriormente CMOS sustituyeron al soporte fotoquímico, convirtiendo la 
                información lumínica en señales eléctricas cuantificables y almacenables en formato de archivo digital. La progresiva 
                miniaturización de estos sensores, unida al desarrollo de ópticas compactas y procesadores de imagen de alto rendimiento, 
                permitió su integración en dispositivos móviles de uso generalizado. El smartphone consolidó la convergencia entre 
                captura, procesamiento y distribución de imagen en un único dispositivo conectado, eliminando las barreras técnicas y 
                económicas del proceso fotográfico tradicional. La infraestructura de redes sociales y protocolos de transmisión de datos 
                en tiempo real posibilitó la difusión instantánea de imágenes a escala global, transformando la fotografía en un vector 
                de comunicación masiva e inmediata. Los algoritmos de procesamiento computacional —HDR, reducción de ruido, estabilización 
                óptica por software— han desplazado progresivamente la pericia técnica del operador hacia la inteligencia del dispositivo.`,

        media: `La llegada de la cámara digital primero, y del smartphone después, democratizó por completo la fotografía. Ya no 
                hacía falta saber de diafragmas ni de tiempos de exposición: bastaba apuntar y disparar, con la ventaja añadida de ver 
                el resultado al instante y repetir cuantas veces fuera necesario. El almacenamiento digital eliminó el coste por imagen 
                y la espera del laboratorio, mientras que la conectividad a internet convirtió cada foto en un mensaje potencialmente 
                global. Hoy, una imagen tomada en cualquier rincón del mundo puede circular por redes sociales en cuestión de segundos, 
                transformando la fotografía en un lenguaje universal de comunicación, memoria y expresión personal al alcance de cualquiera.`,

        sencilla: `Con las cámaras digitales y los móviles, hacer fotos se convirtió en algo de todos los días. Ya no había que 
                esperar al laboratorio ni preocuparse por gastar carrete: podías hacer cientos de fotos, ver cómo habían quedado al 
                momento y borrar las que no te gustaran. Y con internet, compartirlas se volvió inmediato: en segundos, una imagen 
                puede llegar a cualquier parte del mundo. Lo que antes era un proceso lento y costoso, hoy es tan fácil como sacar 
                el móvil del bolsillo.`
    },
    seccion3: {
        tecnica: `En el ecosistema visual contemporáneo, la imagen ha trascendido su función representacional para constituirse 
                en unidad básica de interacción social y producción cultural distribuida. Los formatos efímeros —stories, reels, 
                contenido vertical de consumo rápido— explotan los mecanismos de atención intermitente del usuario mediante estructuras 
                narrativas fragmentadas optimizadas algorítmicamente. La edición no destructiva, los filtros por redes neuronales 
                convolucionales y las herramientas de composición accesibles han desplazado la autoría especializada hacia una producción 
                visual masiva y participativa. La imagen ya no es documento: es interfaz.`,

        media: `Hoy las imágenes no se contemplan, se manipulan, se remezclan y se lanzan al mundo. Un meme, una story o un 
                collage son formas de conversación tan válidas como las palabras. Las herramientas de edición, antes reservadas a 
                profesionales, están ahora en cualquier móvil, y los formatos efímeros han acelerado el ritmo del consumo visual 
                hasta hacerlo casi instantáneo. La imagen se ha convertido en el idioma más hablado de internet.`,

        sencilla: `Antes las fotos se miraban. Ahora se usan: para bromear, para contar lo que haces, para expresarte. Un meme, 
                una story o un vídeo corto son formas de hablar con imágenes. Todo el mundo puede crear y compartir, y las imágenes 
                se han convertido en la forma más rápida de comunicarse hoy en día.`
    },
}
