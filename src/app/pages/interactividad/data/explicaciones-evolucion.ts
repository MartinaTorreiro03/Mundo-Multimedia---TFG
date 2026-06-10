import { NivelExplicacion } from '../../../services/explicacion.service';

export const explicacionesEvolucion: Record<string, Record<NivelExplicacion, string>> = {
  epocaRatonTeclado: {
    tecnica: `Era de la entrada discreta y de baja latencia: el ratón aporta coordenadas absolutas y el teclado, eventos puntuales. El usuario opera sobre un cursor que apunta a regiones diferenciadas, modelo dominante de la GUI de escritorio.`,

    media: `La interactividad clásica del PC: muevas el ratón, hagas clic o pulses una tecla, el ordenador reacciona en el sitio exacto. Todo gira en torno a un puntero que controlas con la mano.`,

    sencilla: `Mueves el ratón y aprietas teclas. El ordenador hace lo que tú le pides.`,
  },

  epocaTactil: {
    tecnica: `Las pantallas multitáctiles unifican entrada y salida: el panel capacitivo detecta varios puntos a la vez y los traduce en gestos (pinch, swipe, rotate). Desaparece el dispositivo intermedio y la manipulación se vuelve directa.`,

    media: `Con el táctil ya no necesitas ratón: tocas la pantalla directamente. Y al detectar varios dedos a la vez puedes hacer pellizco, deslizar o girar imágenes con las manos.`,

    sencilla: `Tocas la pantalla con los dedos. Puedes mover y agrandar lo que ves.`,
  },

  epocaMandos: {
    tecnica: `Los mandos de videojuego combinan ejes analógicos, botones digitales y actuadores hápticos. Los joysticks dan control direccional continuo y la vibración aporta feedback corporal, cerrando un bucle sensoriomotor más rico que clic-teclado.`,

    media: `El mando del videojuego mezcla palancas y botones, pero además vibra cuando pasa algo. Esa vibración no es solo efecto: te avisa con el cuerpo de que algo importante ha ocurrido en la pantalla.`,

    sencilla: `Coges un mando con botones y palancas. Vibra para avisarte. Sientes el juego en las manos.`,
  },

  epocaMovimiento: {
    tecnica: `Acelerómetros, giroscopios y cámaras de profundidad capturan postura y desplazamiento. El cuerpo entero pasa a ser dispositivo de entrada, sin contacto físico con la máquina, abriendo la puerta a interfaces gestuales.`,

    media: `Aquí ya no aprietas ni tocas: la máquina te ve. Con sensores en el móvil o en la consola entiende cómo mueves el cuerpo y reacciona a tus gestos.`,

    sencilla: `Te mueves y la máquina te ve. Sin tocar nada, ella entiende lo que haces.`,
  },

  epocaVR: {
    tecnica: `Realidad virtual y computación espacial: visores, seguimiento posicional y audio binaural construyen un entorno 3D inmersivo. La interacción ocurre dentro del contenido, no frente a él: el usuario es un actor situado en el espacio digital.`,

    media: `Con las gafas de realidad virtual te sientes dentro del mundo digital. Mueves la cabeza, las manos, y todo cambia a tu alrededor como si estuvieras de verdad allí.`,

    sencilla: `Con unas gafas especiales entras dentro de la pantalla. Es como estar en otro sitio sin moverte.`,
  },
};
