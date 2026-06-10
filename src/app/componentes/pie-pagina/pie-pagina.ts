import { Component } from '@angular/core';
import { SpeakableDirective } from '../../directives/app-speakable';

@Component({
  selector: 'app-pie-pagina',
  standalone: true,
  imports: [SpeakableDirective],
  templateUrl: './pie-pagina.html',
  styleUrl: './pie-pagina.scss',
})
export class PiePagina {
  readonly speakProyecto =
    'Mundo Multimedia. TFG interactivo sobre la evolución de los equipos multimedia, con piezas audiovisuales y recursos 3D.';

  readonly speakAvisoUso =
    'Aviso de uso. Este proyecto tiene fines exclusivamente educativos. Las marcas, nombres e imágenes de referencia ' +
    'pertenecen a sus respectivos propietarios y se utilizan solo con propósito didáctico y sin ánimo de lucro.';
}
