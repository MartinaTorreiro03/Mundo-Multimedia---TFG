import { NivelExplicacion } from '../../../services/explicacion.service';

export const explicaciones: Record<string, Record<NivelExplicacion, string>> = {
    seccion1: {
        tecnica: `El texto es el primer sistema de comunicación registrado de la historia. La escritura nació como una necesidad 
                práctica —registrar intercambios, leyes, relatos— y evolucionó a través de distintos sistemas, desde los jeroglíficos hasta 
                el alfabeto fonético. La invención de la imprenta en el siglo XV fue el primer gran salto en la difusión masiva de 
                información: por primera vez, un mismo contenido podía reproducirse de forma idéntica a gran escala, lo que transformó la 
                educación, la ciencia y la cultura. Este modelo de almacenar y distribuir conocimiento mediante texto sentó las bases 
                conceptuales de todos los medios que vinieron después. El audio, la imagen y el vídeo heredaron del texto su lógica de c
                odificar y transmitir mensajes. Hoy, en cualquier sistema multimedia, el texto sigue siendo fundamental: es el componente 
                que permite buscar, clasificar y dar contexto al resto de contenidos.`,
        media: `El texto es el inicio de todo en la historia de la comunicación y, por extensión, de la multimedia. La escritura, la 
                lectura y los libros sentaron las bases de cómo transmitimos ideas y conocimiento. La invención de la imprenta permitió que 
                la información llegara a más personas y se consolidara la cultura escrita. Con el tiempo, de ese texto surgieron nuevas 
                formas de expresión: primero el audio, luego la imagen, después el video, y finalmente la multimedia, que combina todos 
                estos elementos en experiencias más completas e interactivas. Aunque hoy asociemos la multimedia con imágenes, sonidos y 
                videos, todo parte del texto: sin él, no habría historias que contar, ideas que transmitir ni información que organizar.`,
        sencilla: `Todo empezó con las palabras. Antes de los vídeos, las fotos o la música grabada, las personas aprendieron a e
                scribir para poder guardar y compartir sus ideas. Cuando se inventó la imprenta, esas ideas pudieron llegar a muchísima más 
                gente. Con el tiempo, al texto se le fueron sumando más cosas: primero el sonido, luego las imágenes, y así hasta llegar 
                a la multimedia que conocemos hoy. Sin las palabras escritas, nada de eso habría sido posible.`
    },

    seccion2: {
        tecnica: `La evolución del texto desde soporte físico hasta formato digital marcó una de las transiciones más importantes 
        en la historia de los medios. Con la llegada de los procesadores de texto y posteriormente de internet, el texto adquirió 
        propiedades que antes eran imposibles: hipervinculación, edición colaborativa en tiempo real, indexación automática y 
        distribución instantánea a escala global. Formatos como el HTML convirtieron el texto en la estructura sobre la que se 
        construye toda la web, mientras que los e-books y plataformas como wikis o editores colaborativos lo transformaron en un 
        medio dinámico y participativo. Esta digitalización del texto fue el paso previo e imprescindible para la integración de 
        audio, imagen y vídeo en un mismo entorno, sentando las bases técnicas y conceptuales de la multimedia moderna.`,
        media: `Desde la máquina de escribir hasta los e-books y plataformas de colaboración, cada avance nos acercó a la 
        multimedia que conocemos hoy. El texto dejó de ser estático: primero se digitalizó, luego se conectó en red y finalmente 
        se volvió interactivo y participativo. Ya no era solo algo que se leía, sino algo que se podía editar en tiempo real, 
        compartir al instante y enriquecer con enlaces, comentarios y otros medios. Ese proceso de transformación fue el que 
        preparó el terreno para que el audio, la imagen y el vídeo se integraran de forma natural, dando lugar a las experiencias 
        multimedia completas que usamos hoy en día.`,
        sencilla: `El texto fue cambiando poco a poco. Pasó del papel a la pantalla, y de la pantalla a internet. De repente 
        podías escribir con otras personas a la vez, compartir lo que escribías en segundos y añadirle fotos, sonidos o vídeos. 
        El texto dejó de ser algo fijo y se convirtió en algo vivo. Ese cambio fue el que abrió la puerta a todo lo que hoy 
        llamamos multimedia.`
    },
}