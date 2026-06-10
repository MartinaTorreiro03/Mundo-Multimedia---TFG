import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceNavigationService } from '../../services/voice-navigation.service';

const CMD_HIGHLIGHT =
  /\b(salir|exit|cerrar|cierra|mas|menos|more|less|mayor|menor|subir|bajar|cinco|diez|quince|veinte|cien|ciento|once|doce|trece|abajo|arriba|ariba|arriva|bajar|baja|bajo|subir|izquierda|izquierdo|derecha|derecho|carrusel|carousel|navegacion|navegaci[oó]n|accesibilidad|lateral|juguemos|jugamos|siguiente|next|pagina|p[aá]gina|escribir|escribe|write|guardar|guarda|save|limpiar|limpia|clean|borrar|evoluci[oó]n|evolucionar|maquina|m[aá]quina|kindle|mundo|texto|audio|imagen|video|musica|m[uú]sica|audiovisual|interactividad|informacion|informaci[oó]n|tipografia|tipograf[ií]a|fuente|color|colores|teclado|lector|explicacion|explicaci[oó]n|vision|ver|mirar|ocultar|oculta|esconder|escuchar|escucha|explorar|reproducir|reproduce|play|pausar|pause|parar|walkman|altavoz|fon[oó]grafo|gram[oó]fono|radio|cassette|casete|cinta|carrete|grabadora|compacto|discman|disco\s+compacto|fragmento|minecraft|maincra|caperucita|netflix|smartphone|redes\s+sociales|red\s+social|daguerrotipo|daguerre|brownie|browni|brawnie|polaroid|diapositivas|diapositiva|proyector|camara\s+kodak|camara\s+rollo|fotografia\s+digital|foto\s+digital|kodak|brillo|brightness|contraste|contrast|saturacion|saturaci[oó]n|sepia|grayscale|grises|invertir|invert|blur|desenfoque|tono|hue|matiz|opacidad|opacity|sombra|shadow|temperatura|temperature|pixelado|pixelate|epson|impresora|inyeccion)\b/giu;

function splitHighlight(text: string): { text: string; cmd: boolean }[] {
  if (!text.trim()) return [];
  const out: { text: string; cmd: boolean }[] = [];
  let last = 0;
  CMD_HIGHLIGHT.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CMD_HIGHLIGHT.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ text: text.slice(last, m.index), cmd: false });
    }
    out.push({ text: m[0], cmd: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push({ text: text.slice(last), cmd: false });
  }
  return out.length ? out : [{ text, cmd: false }];
}

@Component({
  selector: 'app-voice-transcript-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-transcript-panel.html',
  styleUrl: './voice-transcript-panel.scss',
})
export class VoiceTranscriptPanelComponent {
  voice = inject(VoiceNavigationService);

  readonly segments = computed(() => splitHighlight(this.voice.liveTranscript()));

}
