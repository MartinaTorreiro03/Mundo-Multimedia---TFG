import { NivelExplicacion } from '../../../services/explicacion.service';

export const explicaciones: Record<string, Record<NivelExplicacion, string>> = {
    seccion1: {
        tecnica: `El desarrollo histórico de los dispositivos de reproducción sonora comprende una progresión tecnológica que 
                abarca desde los sistemas de transducción mecánico-acústica hasta los paradigmas de codificación digital. El fonógrafo, 
                invento de Edison (1877), empleaba un estilete vibratorio para inscribir señales analógicas en cilindros de cera mediante 
                variaciones de amplitud en surcos helicoidales. Su sucesor, el gramófono de Berliner, migró hacia discos de laca con 
                modulación lateral, optimizando la reproducción y la replicación en serie. La radiodifusión introdujo la transmisión 
                inalámbrica de señales electromagnéticas moduladas en amplitud (AM) y frecuencia (FM), democratizando el acceso a 
                contenidos sonoros a escala masiva. La cinta magnética supuso un hito en el almacenamiento analógico mediante la 
                polarización de partículas ferromagnéticas, culminando en el formato compacto de cassette. El disco compacto (CD), 
                basado en lectura láser de datos codificados en PCM (Pulse Code Modulation) a 44.1 kHz y 16 bits, representó la transición 
                definitiva hacia el almacenamiento digital de alta fidelidad.`,
        media: `Los primeros dispositivos de audio nacieron del ingenio por atrapar y reproducir sonidos que antes se desvanecían 
                en el aire. El fonógrafo abrió el camino al registrar voces y melodías en cilindros, y pronto el gramófono convirtió la 
                música en un ritual doméstico gracias a sus discos planos. Más tarde, la radio llevó las noticias y las canciones a 
                millones de hogares, mientras las cintas magnéticas y los carretes permitieron grabar y escuchar de forma más personal. 
                Con la llegada del cassette y, finalmente, del disco compacto, el sonido analógico vivió su edad dorada, acompañando 
                generaciones enteras antes del salto definitivo al mundo digital.`,
        sencilla: `Durante mucho tiempo, el sonido desaparecía en cuanto terminaba. Todo cambió cuando inventaron máquinas para 
                grabarlo: primero en cilindros, luego en discos, después por la radio, y más tarde en cintas y cassettes. Cada invento 
                hacía la música más fácil de escuchar en casa, hasta que llegó el CD y el sonido se volvió casi perfecto. Después de eso, 
                vino lo digital y todo cambió para siempre.`
    },

    seccion2: {
        tecnica: `La evolución de los dispositivos de reproducción musical portátil refleja una progresión sostenida hacia la 
                miniaturización, la personalización y la desmaterialización del soporte físico. La Jukebox representó el primer modelo 
                de consumo musical bajo demanda en espacios públicos, operando mediante mecanismos electromecánicos de selección y 
                reproducción de discos de vinilo. El Walkman de Sony (1979) inauguró la era de la escucha personal mediante la 
                reproducción de cassettes en un dispositivo de bajo perfil energético con auriculares integrados. El Discman extendió este 
                paradigma al formato CD con lectura óptica por láser, aunque su susceptibilidad a interferencias mecánicas limitaba su uso 
                en contextos de alta movilidad. El Minidisc empleó compresión ATRAC sobre discos magneto-ópticos de 64 mm, ofreciendo 
                capacidad de regrabación y factor de forma reducido, sin lograr penetración comercial sostenida. La codificación MPEG-1 
                Audio Layer III (MP3) supuso una ruptura paradigmática al permitir la compresión con pérdida de archivos de audio a tasas 
                de 128-320 kbps, posibilitando el almacenamiento masivo en dispositivos de memoria flash. El iPod de Apple (2001) consolidó 
                esta tecnología en un ecosistema de hardware y software integrado mediante iTunes. Finalmente, el modelo de streaming 
                —basado en protocolos de transmisión adaptativa sobre infraestructura cloud— eliminó la necesidad de almacenamiento local, 
                trasladando el acceso musical a un esquema de suscripción bajo demanda con latencia mínima.`,
        media: `La Jukebox llenaba bares y cafeterías de luces y música: solo hacía falta una moneda para que empezara la fiesta. 
                Con el Walkman, la música se volvió personal: tus cintas favoritas iban contigo en el bolsillo. Después llegó el Discman, 
                con el sonido limpio de los CDs, aunque los saltos al correr eran inevitables. El Minidisc intentó revolucionar el 
                formato: pequeño, grabable y futurista, pero duró poco en el estrellato. Con los MP3, las colecciones musicales 
                explotaron: miles de canciones en un archivo diminuto. El iPod convirtió esa idea en un icono: "mil canciones en tu 
                bolsillo" y estilo en cada auricular blanco. Y hoy el streaming cambió las reglas para siempre: millones de canciones 
                disponibles al instante, en cualquier lugar, sin ocupar espacio.`,
        sencilla: `Antes escuchabas música solo en casa o en un bar. Luego llegaron aparatos que te la ponían en el bolsillo: 
                primero con cintas, después con CDs, y más tarde con archivos digitales. Cada vez cabían más canciones en menos espacio. 
                El iPod fue el rey de esa era, hasta que el streaming lo cambió todo: ahora no necesitas guardar nada, solo conectarte y 
                escuchar lo que quieras al momento.`
    },

    seccion3: {
        tecnica: `En el ecosistema multimedia contemporáneo, el audio opera como canal sensorial primario en la arquitectura de 
                la experiencia de usuario (UX), complementando y en ocasiones superando al estímulo visual en términos de respuesta 
                cognitiva y emocional. Las señales sonoras de notificación explotan los mecanismos de alerta del sistema nervioso autónomo, 
                generando tiempos de reacción inferiores a los estímulos visuales equivalentes. El diseño sonoro —o sound design— actúa 
                como capa semántica y emocional en producciones audiovisuales, modulando la percepción del contenido visual mediante 
                principios psicoacústicos. El auge del formato podcast evidencia un desplazamiento hacia el consumo de contenido en 
                modalidad auditiva asíncrona, compatible con contextos de atención dividida. Paralelamente, los asistentes de voz basados 
                en procesamiento de lenguaje natural (NLP) y síntesis de voz mediante redes neuronales (TTS) constituyen una interfaz 
                conversacional que humaniza la interacción persona-máquina, reduciendo la fricción cognitiva asociada a las interfaces 
                gráficas tradicionales. La ausencia de diseño sonoro en entornos digitales se traduce en una degradación mensurable de la 
                experiencia de usuario y la percepción de completitud del producto.`,
        media: `Hoy el audio no solo acompaña, sino que estructura la forma en que interactuamos con la multimedia. Una 
                notificación sonora nos alerta más rápido que un mensaje en pantalla, la música crea atmósferas imposibles de lograr 
                solo con imágenes y las voces en podcasts o asistentes virtuales hacen que la tecnología se sienta más humana. En resumen: 
                sin audio, la experiencia digital quedaría incompleta.`,
        sencilla: `El sonido hace que la tecnología funcione mejor. Un pitido te avisa antes de que veas la pantalla, la música te 
                hace sentir cosas que las imágenes solas no pueden, y escuchar una voz hace que hablar con un dispositivo se sienta 
                natural. Sin sonido, todo lo digital sería frío e incompleto.`
    }  
};
