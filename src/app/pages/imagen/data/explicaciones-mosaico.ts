import { NivelExplicacion } from '../../../services/explicacion.service';

export const explicacionesDispositivos: Record<string, Record<NivelExplicacion, string>> = {
    daguerrotipo: {
        tecnica: `Presentado en 1839, fue el primer proceso fotográfico comercial. Utilizaba una placa de cobre con plata pulida, 
        sensibilizada con vapores de yodo. Tras la exposición, la imagen se revelaba con vapores de mercurio y se fijaba con 
        tiosulfato sódico. El resultado era una imagen de nitidez asombrosa sobre una superficie especular, aunque era una pieza 
        única, frágil e irreproducible.`,

        media: `Fue la primera fotografía real. Para lograrla, había que sensibilizar una placa de plata con químicos, exponerla 
        en la cámara y esperar varios minutos sin moverse. El revelado se hacía con mercurio. Aunque lograba un detalle increíble 
        para su época, cada foto era única: no se podían hacer copias y el metal se dañaba fácilmente si no se protegía tras un 
        cristal.`,

        sencilla: `Fue la primera forma de hacer fotos en la historia. Se usaba una placa de metal brillante que guardaba la imagen 
        como si fuera un espejo. Había que estar muy quieto durante mucho tiempo para que la foto no saliera borrosa. Era un objeto 
        muy valioso y delicado, porque no existían los negativos y no se podían sacar copias de la misma imagen.`
    },

    kodakBrownie: {
        tecnica: `Lanzada en 1900, democratizó la fotografía al sustituir las placas por carretes de película de 117. Su diseño de 
        foco fijo y obturador simple de 1/25 s permitía prescindir de ajustes técnicos. El modelo de negocio de Kodak separó la 
        captura del revelado: el usuario enviaba el carrete por correo y recibía las copias impresas, convirtiendo la fotografía 
        en un producto de consumo masivo.`,

        media: `Con la Brownie, cualquiera podía hacer fotos sin ser un experto. Era una cámara pequeña y barata que usaba 
        carretes de película en lugar de pesadas placas de vidrio. No tenía botones complicados: solo apuntabas y disparabas. 
        Cuando terminabas el carrete, lo mandabas a Kodak y ellos te devolvían las fotos listas. Fue la cámara que llevó la 
        fotografía a la vida cotidiana.`,

        sencilla: `Fue la primera cámara pensada para todo el mundo. Antes, hacer fotos era difícil y caro, pero la Brownie era 
        muy barata y fácil de usar. Solo tenías que poner el carrete, apretar un botón y listo. Gracias a ella, las familias 
        empezaron a guardar recuerdos de sus cumpleaños, viajes y momentos felices de forma habitual.`
    },

    kodakCarousel: {
        tecnica: `Introducido en 1961, estandarizó la proyección de diapositivas mediante un cargador circular que utilizaba la 
        gravedad para el avance del material, evitando atascos. Contaba con enfoque automático y lámparas halógenas de alta 
        potencia para grandes superficies. Su capacidad de acceso aleatorio y fiabilidad lo convirtieron en la herramienta 
        estándar para presentaciones profesionales y educativas durante décadas.`,

        media: `Este proyector cambió la forma de ver fotos en grupo. En lugar de pasar un álbum, las imágenes se proyectaban en 
        grande sobre la pared. Su cargador redondo permitía que las diapositivas cayeran solas por su propio peso, lo que lo 
        hacía muy fiable. Fue el centro de las reuniones familiares de los años 60 y 70, y el antepasado directo de lo que hoy 
        conocemos como PowerPoint.`,

        sencilla: `El Carousel servía para ver las fotos de las vacaciones en gigante, como si estuvieras en el cine. Ponías las 
        diapositivas en una rueda que giraba y proyectaba la imagen en la pared del salón. Era el plan favorito de las familias: 
        apagar las luces, encender el proyector y recordar juntos los viajes y momentos especiales proyectados en grande.`
    },

    polaroidSX70: {
        tecnica: `Lanzada en 1972, fue la primera cámara réflex instantánea de película integral. Al disparar, unos rodillos 
        internos rompían cápsulas de reactivos que iniciaban el revelado cromógeno automáticamente sobre el soporte físico. 
        Su diseño plegable y su óptica de alta calidad permitían enfoques precisos, creando una estética de formato cuadrado que 
        se convirtió en un icono de la cultura visual moderna.`,

        media: `La SX-70 fue una revolución: la primera cámara que expulsaba la foto y la revelaba sola frente a ti en pocos 
        minutos. Tenía un diseño futurista que se plegaba totalmente para llevarla en el bolsillo. No hacía falta laboratorio ni 
        esperar días; la imagen aparecía poco a poco en el papel cuadrado, creando una experiencia mágica e inmediata que fascinó 
        a todo el mundo.`,

        sencilla: `Era la cámara de la "magia" instantánea. Nada más pulsar el botón, la foto salía por una ranura y, mientras la 
        tenías en la mano, los colores y las formas iban apareciendo poco a poco. En un par de minutos tenías la foto terminada 
        sin haber salido de casa. Fue la forma más rápida y emocionante de compartir un recuerdo físico al instante.`
    }
};