import { NivelExplicacion } from '../../../services/explicacion.service';

export const explicacionesLinea: Record<string, Record<NivelExplicacion, string>> = {
    camaraRollo: {
        tecnica: `La cámara de rollo de 35 mm consolidó el formato estándar de la fotografía amateur y profesional durante 
                gran parte del siglo XX. El carrete de película de gelatina y haluros de plata permitía entre 24 y 36 exposiciones 
                por rollo, con una relación coste-imagen muy inferior a los formatos de placa. Los sistemas SLR (réflex de objetivo 
                único) incorporaron visor a través del objetivo, control manual de velocidad, diafragma e ISO, y objetivos 
                intercambiables, dotando al usuario de control técnico completo sobre la exposición y la profundidad de campo. 
                El revelado en cuarto oscuro —o externalizado en laboratorio— seguía siendo un paso obligatorio entre la captura 
                y la imagen final.`,

        media: `La cámara de rollo puso la fotografía en manos de millones de personas. Con un carrete de 36 fotos, había que 
                pensar bien cada disparo: no había forma de ver el resultado hasta días después, cuando el laboratorio devolvía 
                las copias. Esa limitación obligaba a una atención al encuadre y a la luz que hoy se echa de menos. Los modelos 
                más avanzados permitían controlar manualmente la exposición, el enfoque y la profundidad de campo, convirtiendo 
                la fotografía en un oficio técnico además de creativo.`,

        sencilla: `Con la cámara de rollo, cada foto contaba. Tenías 36 oportunidades por carrete y no podías ver cómo había 
                quedado hasta que la revelaras en el laboratorio, días después. Eso hacía que pensaras antes de disparar. Era 
                sencilla de llevar, barata y capaz de capturar momentos con una calidez que todavía hoy tiene mucho valor.`
    },

    fotografiaDigital: {
        tecnica: `El primer prototipo de cámara digital fue desarrollado por Steve Sasson en Kodak en 1975: capturaba imágenes 
                en blanco y negro a una resolución de 0,01 megapíxeles sobre una cinta de casete, y tardaba 23 segundos en 
                registrar cada fotograma. El sensor CCD sustituía al soporte fotoquímico, convirtiendo la luz en señales 
                eléctricas almacenables. Kodak nunca lo comercializó para no canibalizar su negocio de película. No fue hasta 
                los años 90 cuando las cámaras digitales llegaron al mercado de consumo, y la adopción masiva se aceleró con 
                la mejora de los sensores CMOS, la reducción de costes de la memoria flash y la integración de pantallas LCD 
                para previsualización inmediata.`,

        media: `La primera cámara digital existió en 1975, pero Kodak la guardó en un cajón para proteger su negocio de carretes. 
                Era un prototipo enorme que tardaba casi medio minuto en guardar una sola foto en una cinta de casete. Cuando 
                las digitales llegaron al mercado en los 90, cambiaron todo: podías ver la foto al instante, borrarla si no 
                gustaba y hacer cientos de imágenes sin coste adicional. El laboratorio dejó de ser necesario y la fotografía 
                pasó a ser inmediata.`,

        sencilla: `¿Sabías que la primera cámara digital se inventó en 1975, pero nunca salió a la venta? Kodak la creó pero 
                prefirió seguir vendiendo carretes. Cuando por fin llegaron las digitales a las tiendas, años después, todo 
                cambió: podías ver la foto nada más hacerla, repetirla si salía mal y guardar miles de imágenes en una tarjetita. 
                Se acabó esperar al laboratorio.`
    },

    smartphone: {
        tecnica: `La integración de sensores de imagen CMOS en teléfonos móviles, popularizada a partir del Nokia N95 (2007) 
                y acelerada por el iPhone de ese mismo año, fusionó captura, procesamiento y distribución en un único dispositivo 
                conectado. Los procesadores de imagen ISP incorporados permitieron funciones como HDR, estabilización electrónica 
                y reducción de ruido en tiempo real. La ausencia de óptica intercambiable se compensó progresivamente con 
                sistemas multicámara y algoritmos de computación fotográfica que simulan profundidad de campo y zoom óptico 
                mediante software.`,

        media: `El Nokia de 2007 ya intuía lo que iba a pasar: una cámara decente siempre en el bolsillo. Pero fue el 
                smartphone moderno el que lo cambió todo, integrando captura, edición y publicación en un mismo gesto. 
                Ya no hacía falta llevar cámara aparte: el móvil se convirtió en el dispositivo fotográfico más usado 
                del mundo, no por tener la mejor óptica, sino por estar siempre disponible.`,

        sencilla: `El móvil convirtió a todo el mundo en fotógrafo. Con un Nokia de 2007 ya podías llevar una cámara en 
                el bolsillo, pero los smartphones de hoy hacen fotos que antes solo conseguían cámaras profesionales. 
                Y lo mejor: siempre lo tienes encima. La mejor cámara es la que llevas contigo.`
    },

    redesSociales: {
        tecnica: `A partir de 2010, plataformas como Instagram —lanzada ese mismo año— redefinieron la fotografía como 
                práctica social en red. La imagen dejó de ser documento privado para convertirse en unidad de comunicación 
                pública optimizada algorítmicamente. Los sistemas de recomendación por engagement condicionaron la estética 
                predominante, favoreciendo composiciones de alto contraste y narrativas visuales inmediatamente legibles. 
                El ciclo captura-edición-publicación-retroalimentación comprimió el tiempo entre el disparo y la respuesta 
                social a segundos, alterando la relación del autor con la imagen y subordinando la decisión estética 
                a la métrica de interacción.`,

        media: `Con Instagram y las redes sociales, la fotografía dejó de ser un recuerdo privado para convertirse en 
                un acto comunicativo. Una foto ya no se guarda en un álbum: se publica, se comenta y se mide en likes. 
                Eso transformó tanto la forma de hacer fotos como los motivos para hacerlas. La estética, el encuadre 
                y hasta el momento del disparo empezaron a pensarse en función de la audiencia.`,

        sencilla: `Las redes sociales cambiaron para qué hacemos fotos. Antes era para recordar; ahora también es para 
                compartir, para contar quién eres y qué vives. Una imagen puede llegar a miles de personas en segundos. 
                Eso hace que pensemos las fotos de otra manera: no solo para nosotros, sino para los demás.`
    },
}
