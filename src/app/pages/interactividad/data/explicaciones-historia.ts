import { NivelExplicacion } from '../../../services/explicacion.service';

export const explicacionesHistoria: Record<string, Record<NivelExplicacion, string>> = {
  tarjetaOrdenadores: {
    tecnica: `Los primeros ordenadores trabajaban en modo batch: tú preparabas las instrucciones, la máquina las ejecutaba y devolvía el resultado al cabo de un tiempo. La interfaz era textual y el feedback, asíncrono: nada de manipulación directa ni respuesta en tiempo real.`,

    media: `Al principio no había ratón ni ventanas. Escribías órdenes y el ordenador tardaba en contestarte, como si le mandaras una lista de tareas. Esta tarjeta imita esa sensación de pantalla verde sobre negro esperando a terminar.`,

    sencilla: `Antes el ordenador tardaba en contestar. Tú escribías y él pensaba. Era lento pero era el comienzo de hablar con una máquina.`,
  },

  tarjetaConsolas: {
    tecnica: `Las consolas domésticas introdujeron el mando como entrada dedicada: un bucle de sondeo leía los botones y traducía esos cambios en actualizaciones gráficas inmediatas en pantalla. Esa bajada brutal de latencia consolidó el patrón “acción → reacción visible” propio del videojuego.`,

    media: `Con las primeras consolas, pulsabas un botón y el personaje se movía al instante. La pantalla dejó de ser solo cine para convertirse en algo que tú controlabas. El vídeo de la tarjeta recuerda ese juego rápido y directo.`,

    sencilla: `Con la consola, si apretabas un botón, el muñeco se movía ya. Era jugar en tu casa sin esperar tanto.`,
  },

  tarjetaArcade: {
    tecnica: `Los arcades llevaban hardware especializado y ROMs fijas; meter moneda lanzaba el “attract mode” y el audio sintetizado (PSG, FM) funcionaba como recompensa e identidad de marca. Luz, sonido y vibración del mueble reforzaban el bucle estímulo-respuesta en un espacio social.`,

    media: `En los arcades metías una moneda y el juego arrancaba con música y efectos fuertes. Luces, pitidos y risas a todo volumen. Por eso al pasar el ratón suena un guiño a esa cultura ruidosa y compartida.`,

    sencilla: `En el arcade ponías una moneda. Sonaba fuerte. Luces y ruidos. Era divertido y compartido con más gente.`,
  },
};
