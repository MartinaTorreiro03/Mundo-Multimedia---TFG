import { NivelExplicacion } from "../../../services/explicacion.service";

export const explicaciones: Record<string, Record<NivelExplicacion, string>> = {

    zootropo: {
        tecnica: `Inventado por William George Horner en 1834, el zootropo es un dispositivo estroboscópico que explota el 
        fenómeno de la persistencia retiniana. Consiste en un tambor cilíndrico con rendijas verticales equidistantes en su 
        parte superior y una tira de imágenes secuenciales en el interior. Al girar, cada rendija actúa como obturador 
        momentáneo, permitiendo ver un fotograma diferente a una frecuencia suficiente para que el cerebro los fusione en 
        movimiento continuo. Es uno de los precursores directos del cinematógrafo.`,

        media: `El zootropo es uno de los primeros juguetes ópticos de la historia. Se trata de un cilindro que gira con 
        ranuras a los lados y dibujos en su interior. Cuando lo haces girar y miras por las ranuras, los dibujos parecen 
        moverse como si fueran una pequeña animación. El truco está en que tu ojo retiene cada imagen una fracción de segundo, 
        y el cerebro une todas esas imágenes como si fueran continuas. Fue uno de los primeros pasos hacia el cine.`,

        sencilla: `El zootropo es como un juguete mágico que hace que los dibujos se muevan. Tiene forma de cubo redondo con 
        agujeros. Dentro hay dibujos. Cuando lo giras y miras por los agujeros, los dibujos parecen estar vivos y moviéndose. 
        Fue uno de los primeros inventos que hizo posible el cine.`
    },

    cinematografo: {
        tecnica: `Presentado por los hermanos Lumière el 28 de diciembre de 1895, el cinematógrafo era a la vez cámara, 
        copiadora y proyector. Utilizaba película perforada de 35 mm que avanzaba de forma intermitente mediante una 
        grifa, exponiendo 16 fotogramas por segundo. Su diseño compacto y su mecanismo de arrastre por fricción lo 
        diferenciaban del pesado kinetoscopio de Edison, permitiendo proyecciones públicas ante grandes audiencias y 
        convirtiéndose en el estándar técnico sobre el que se construyó toda la industria cinematográfica posterior.`,

        media: `El cinematógrafo fue la primera máquina que permitió filmar y proyectar imágenes en movimiento ante un 
        público numeroso. Lo inventaron los hermanos Lumière en Francia y lo presentaron en 1895 en lo que se considera 
        la primera sesión de cine de la historia. Era una máquina compacta y versátil: servía para grabar, copiar y 
        proyectar. Usaba una película de 35 mm que avanzaba a 16 imágenes por segundo, suficiente para crear la ilusión 
        de movimiento real.`,

        sencilla: `El cinematógrafo fue la primera máquina de cine de la historia. Con ella se podía grabar lo que pasaba 
        en la calle y luego proyectarlo en una pantalla grande para que mucha gente lo viera. La inventaron dos hermanos 
        franceses llamados Lumière. Fue el comienzo del cine tal y como lo conocemos hoy.`
    },

    camaraDeceluloide: {
        tecnica: `Las cámaras de celuloide del periodo silente empleaban película de nitrato de celulosa de 35 mm, 
        altamente inflamable, con una cadencia estándar de entre 16 y 24 fotogramas por segundo accionada mediante 
        manivela. El formato 4:3 se estableció como norma de la industria durante esta etapa. La ausencia de sonido 
        sincronizado obligó a desarrollar un lenguaje visual propio basado en el montaje, la actuación expresiva y los 
        intertítulos, sentando las bases del lenguaje cinematográfico moderno.`,

        media: `Las cámaras del cine mudo eran grandes aparatos que funcionaban con manivela y usaban película de 
        celuloide. Se rodaba sin sonido, porque todavía no existía la tecnología para sincronizarlo con la imagen. 
        Eso obligó a los cineastas a contar las historias solo con gestos, expresiones y títulos de texto en pantalla. 
        Aunque parezca una limitación, fue en esta época cuando se inventaron muchos de los recursos narrativos que 
        el cine sigue usando hoy.`,

        sencilla: `Estas cámaras se usaban para hacer las primeras películas de cine. No tenían sonido, así que los 
        actores tenían que expresar todo con la cara y el cuerpo. De vez en cuando aparecían palabras en la pantalla 
        para explicar lo que pasaba. Aunque eran muy antiguas, con ellas se hicieron algunas de las historias más 
        famosas del cine.`
    }
};
