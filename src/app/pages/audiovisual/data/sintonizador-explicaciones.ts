import { NivelExplicacion } from '../../../services/explicacion.service';

export const sintonizadorExplicaciones: Record<string, Record<NivelExplicacion, string>> = {
  cinema: {
    tecnica: `El cine clásico de los años 30 consolida el lenguaje audiovisual moderno con la incorporación del sonido sincronizado. La imagen en blanco y negro proyectada en gran formato establece convenciones narrativas, de montaje y de banda sonora que aún hoy estructuran nuestra forma de contar historias.`,

    media: `En el cine clásico la gran pantalla era el único espacio para ver una película. El sonido llegó para acompañar a la imagen, y la sala se convirtió en un lugar compartido para emocionarse en colectivo con cada estreno.`,

    sencilla: `Antes, las películas se veían solo en cines muy grandes. La gente iba con amigos y familia a sentarse juntos a mirar la pantalla en silencio.`,
  },

  tv60: {
    tecnica: `La televisión de tubo de rayos catódicos transforma el consumo audiovisual al llevar la imagen en directo al ámbito doméstico. La programación lineal por canales, junto con el formato 4:3 y la baja resolución, conforman una nueva gramática audiovisual y un nuevo ritual familiar.`,

    media: `En los años 60, la televisión se hizo el centro del salón. Aparecieron noticieros, series y dibujos animados que se veían todos a la misma hora, sin posibilidad de elegir cuándo verlos.`,

    sencilla: `La televisión llegó a las casas. Las familias se reunían frente a la pantalla a ver programas todos juntos a la misma hora.`,
  },

  vhs: {
    tecnica: `El VHS y, más tarde, el DVD desplazan el control sobre la reproducción al espectador: grabar, rebobinar, pausar y coleccionar películas se convierten en prácticas cotidianas. El alquiler de cintas y la copia doméstica reconfiguran la industria audiovisual y la cultura del consumo.`,

    media: `Con el VHS y el DVD podíamos llevarnos las películas a casa, grabar lo que daban en la tele y verlo cuando quisiéramos. Aparecieron los videoclubs y empezó la idea de tener una pequeña colección de películas en el salón.`,

    sencilla: `Las películas se vendían y alquilaban en cintas o discos. La gente podía verlas en casa cuando quería, varias veces, y guardarlas en una estantería.`,
  },

  youtube: {
    tecnica: `La irrupción de YouTube y la web 2.0 democratiza la producción y distribución audiovisual: cualquier usuario puede subir, comentar y viralizar vídeos. Surge la figura del prosumidor y se rompe el monopolio de los canales tradicionales sobre la difusión global.`,

    media: `Con YouTube y otras webs, cualquiera con un móvil podía crear y compartir vídeos con todo el mundo. Aparecieron los tutoriales, los videoblogs y los primeros creadores de contenido que llegaban a millones de personas sin pasar por la tele.`,

    sencilla: `Internet nos permitió ver y subir vídeos desde casa. Cualquier persona puede grabar algo con el móvil y enseñárselo a gente de todos los países.`,
  },

  streaming: {
    tecnica: `Las plataformas de streaming sustituyen la programación lineal por catálogos bajo demanda gestionados por algoritmos de recomendación. La experiencia se vuelve ubicua y personalizada: el contenido viaja con el usuario entre pantallas y se ajusta a su perfil de consumo.`,

    media: `Hoy elegimos qué ver y cuándo verlo en plataformas de streaming. La pantalla nos sigue del móvil al televisor o a la tableta, y el sistema nos recomienda series y películas según lo que solemos consumir.`,

    sencilla: `Ahora podemos ver series y películas en cualquier momento desde el móvil o la tele. Tú decides qué ver, sin tener que esperar a una hora concreta.`,
  },
};
