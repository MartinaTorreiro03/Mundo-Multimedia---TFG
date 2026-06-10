import { NivelExplicacion } from '../../../services/explicacion.service';

export const explicaciones: Record<string, Record<NivelExplicacion, string>> = {
  seccion1: {
    tecnica: `La génesis del vídeo se sustenta en el principio de la persistencia retiniana y el fenómeno phi, donde la sucesión rápida de imágenes estáticas crea la ilusión de movimiento continuo. Los primeros dispositivos ópticos, como el zootropo, utilizaban tambores giratorios con rendijas para fragmentar la visión y generar dinamismo. El salto cualitativo ocurrió con el cinematógrafo de los hermanos Lumière (1895), que integraba la captura, el revelado y la proyección en un solo aparato mediante el arrastre intermitente de una película de celuloide perforada.`,

    media: `El vídeo no siempre fue como lo conocemos hoy; nació como un ingenioso truco visual para engañar a nuestros ojos. Antes de las pantallas digitales, existían juguetes ópticos como el zootropo que hacían que dibujos estáticos parecieran cobrar vida al girar. Con la invención del cinematógrafo, esas imágenes saltaron a las grandes salas de cine.`,

    sencilla: `Hace mucho tiempo, las imágenes no se movían. Después, se inventaron unas máquinas de madera y metal que hacían girar los dibujos muy rápido para que pareciera que tenían vida. Al principio, estas películas no tenían sonido y eran en blanco y negro.`
  },
  seccion2: {
    tecnica: `La democratización del vídeo se produjo con la transición de los soportes químicos a los magnéticos y digitales. La introducción del formato VHS y Betamax permitió el registro de señales de luminancia y crominancia en cintas de óxido de hierro, trasladando la experiencia del visionado al ámbito doméstico. Posteriormente, la digitalización permitió almacenar vídeo en discos ópticos como el DVD.`,

    media: `Con el paso de los años, el vídeo salió de los cines para entrar en nuestras casas. Pasamos de las grabaciones familiares con cámaras pesadas a coleccionar nuestras películas favoritas en cintas de VHS y, más tarde, en discos digitales como el DVD. Este cambio hizo que el vídeo fuera algo cotidiano que podíamos controlar.`,

    sencilla: `Más tarde, el vídeo llegó a nuestras casas. Primero usamos cintas grandes y luego discos redondos para ver películas en la televisión. También podíamos grabar nuestros propios recuerdos con cámaras. Ahora, ya no hace falta tener discos ni cintas.`
  },
  seccion3: {
    tecnica: `En la actualidad, el vídeo ha evolucionado hacia un modelo no lineal e interactivo impulsado por la computación de alto rendimiento. Las tecnologías de Realidad Virtual (VR) y vídeo 360° emplean motores de renderizado en tiempo real para sumergir al usuario en entornos inmersivos donde la perspectiva no está predefinida. El vídeo ya no es solo un flujo de datos pasivo.`,

    media: `Hoy el vídeo es mucho más que algo que simplemente nos sentamos a mirar; es una experiencia en la que participamos. Podemos elegir el final de una historia, sumergirnos en mundos virtuales con gafas especiales o hablar en tiempo real con alguien que está emitiendo un vídeo al otro lado del planeta.`,

    sencilla: `Hoy en día, nosotros decidimos cómo ver los vídeos. Podemos usar gafas especiales para sentir que estamos dentro de la imagen o ver vídeos en directo para hablar con otras personas a la vez. Ya no solo miramos lo que ponen en la tele.`
  }
};
