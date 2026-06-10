import { NivelExplicacion } from '../../../services/explicacion.service';

export const explicacionesEscuchar: Record<string, Record<NivelExplicacion, string>> = {
  introGaleria: {
    tecnica: `La galería combina imagen fija, reproducción de muestras de audio y un panel modal con descripción ampliada. Cada elemento es un disparador independiente: clic en la imagen abre el detalle; el botón controla el elemento <audio> asociado por identificador.`,

    media: `Puedes hacer clic en cada imagen para leer más y escuchar un fragmento. Cada aparato tiene su propio sonido de ejemplo, como en un museo pequeño que puedes recorrer con el ratón.`,

    sencilla: `Haz clic en las fotos para ver más. También puedes darle al botón para oír un trozo de sonido.`,
  },

  fonografo: {
    tecnica: `Thomas Edison patentó en 1877 un aparato que grababa vibraciones acústicas en surcos de un cilindro recubierto de material blando; la aguja al seguir el surco restituía el sonido. Fue la primera reproducción mecánica fiable del habla y la música.`,

    media: `El fonógrafo de Edison fue la primera máquina que de verdad grababa la voz y la volvía a poner. Usaba un cilindro de cera y una aguja que vibraba al hablar o cantar cerca.`,

    sencilla: `Fue la primera máquina que guardaba sonidos en un cilindro y los volvía a tocar.`,
  },

  gramofono: {
    tecnica: `Emile Berliner popularizó el disco plano frente al cilindro: surcos espirales en una superficie rígida, reproducción lateral y posibilidad de prensar copias en serie. Ese modelo sentó las bases de la industria del disco durante décadas.`,

    media: `El gramófono llevó la música a casa con discos planos en lugar de cilindros. Así se podían fabricar muchas copias iguales y la gente empezó a coleccionar discos.`,

    sencilla: `Usaba discos planos. La música se podía copiar y escuchar en muchas casas.`,
  },

  radio: {
    tecnica: `La radiodifusión AM modula la amplitud de una portadora de radiofrecuencia para transportar audio a gran distancia sin cable; el receptor demodula y amplifica. Cambió la política, el ocio y el consumo de música en masa.`,

    media: `La radio AM llevó noticias y música a millones de hogares por el aire, sin cables hasta el aparato. Solo hacía falta encender y sintonizar para oír el mundo.`,

    sencilla: `Sonaba por el aire. La gente la encendía para oír noticias y canciones en casa.`,
  },

  cassette: {
    tecnica: `El compact cassette usa cinta magnética en un carrete miniaturizado con protección de carcasa; estandarizado por Philips, permitió grabación doméstica y duplicación con calidad aceptable, motor de la cultura de las mixtapes.`,

    media: `El cassette era una cinta pequeña en una cajita. Podías grabar la radio o tu propia voz y llevar la música en el bolsillo con el Walkman.`,

    sencilla: `Era una cinta en una caja. Podías grabar y llevar tu música a todas partes.`,
  },

  cd: {
    tecnica: `El CD almacena audio como PCM de 44,1 kHz y 16 bits; el láser lee pits y lands sin contacto mecánico con el surco “sonoro”. Supuso fidelidad estable, saltos casi instantáneos y base del audio digital de consumo.`,

    media: `El disco compacto guardaba la música en números, no en surcos analógicos. Sonaba muy limpio y se podía saltar de canción en canción sin rozar aguja.`,

    sencilla: `Era un disco plateado. La música sonaba muy clara y no se estropeaba tanto como las cintas.`,
  },

  carrete: {
    tecnica: `Las grabadoras de carrete abierto usan cinta ancha a velocidades elevadas (p. ej. 38 cm/s), reduciendo el ruido de modulación y permitiendo edición física con corte y empalme; fueron referencia en estudios de grabación profesional.`,

    media: `Las de carrete abierto eran las máquinas grandes de los estudios: cinta ancha, mucha calidad y controles finos. Ahí se grababan discos que luego oíamos en casa.`,

    sencilla: `Eran grabadoras grandes con cinta ancha. Los músicos grababan ahí sus discos.`,
  },
};
