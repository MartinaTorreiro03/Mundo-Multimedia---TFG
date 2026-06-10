import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VisionReducidaService {
  activa = signal(false);
  private readonly mensajePantallaCollage = 'Selecciona elementos para crear tu collage';
  private readonly textosIgnoradosLupa = [
    'selecciona elementos para crear tu collage',
  ];
  private lupa: HTMLElement | null = null;
  private tamano = 400;
  private anclada = false;
  private ultimoElemento: Element | null = null;
  private ultimoTextoLupa = '';

  private cursorEl: HTMLElement | null = null;
  private cursorZIndexOriginal = '';

  private readonly W95 = {
    bg:     '#c0c0c0',
    raised: '#ffffff #808080 #808080 #ffffff',
    sunken: '#808080 #ffffff #ffffff #808080',
    shadow: '2px 2px 0 #000000',
  };

  private readonly LUPA_ANCHO = 640;
  private readonly LUPA_ALTO  = 320;

  private anchoredAncho = 640;
  private anchoredAlto  = 320;

  private readonly MIN_ANCHO = 380;
  private readonly MIN_ALTO  = 220;

  toggle() {
    if (this.activa()) {
      this.destruir();
    } else {
      this.crear();
    }
    this.activa.set(!this.activa());
  }

  private elevarCursor() {
    this.cursorEl = document.querySelector('.cursor') as HTMLElement | null;
    if (this.cursorEl) {
      this.cursorZIndexOriginal = this.cursorEl.style.zIndex;
      this.cursorEl.style.zIndex = '999999';
    }
  }

  private restaurarCursor() {
    if (this.cursorEl) {
      this.cursorEl.style.zIndex = this.cursorZIndexOriginal;
      this.cursorEl = null;
    }
  }

  private crear() {
    this.anclada = false;
    this.elevarCursor();
    document.addEventListener('wheel', this.onWheel, { passive: false });

    this.lupa = document.createElement('div');
    this.lupa.style.cssText = `
      position: fixed;
      width: ${this.LUPA_ANCHO}px;
      height: ${this.LUPA_ALTO}px;
      background: ${this.W95.bg};
      border: 2px solid;
      border-color: ${this.W95.raised};
      box-shadow: ${this.W95.shadow};
      pointer-events: none;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      font-family: "MS Sans Serif", "Pixelated MS Sans Serif", Arial, sans-serif;
      font-size: 11px;
      user-select: none;
    `;

    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
      background: linear-gradient(to right, #000080, #1084d0);
      color: #ffffff;
      font-weight: bold;
      font-size: 11px;
      padding: 2px 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      flex-shrink: 0;
      cursor: default;
    `;

    const titleText = document.createElement('span');
    titleText.textContent = 'Visión reducida';
    titleText.style.cssText = `flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;`;

    const btnClose = this.crearBtnWin95('✕');
    btnClose.style.marginLeft = '2px';
    btnClose.addEventListener('click', () => this.toggle());

    titleBar.appendChild(titleText);
    titleBar.appendChild(btnClose);

    const statusTop = document.createElement('div');
    statusTop.id = 'lupa-status';
    statusTop.style.cssText = `
      font-size: 10px;
      padding: 1px 6px;
      background: ${this.W95.bg};
      border-bottom: 1px solid #808080;
      color: #000000;
      flex-shrink: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    statusTop.textContent = 'Pase el cursor sobre un texto...';

    const contenedorTexto = document.createElement('div');
    contenedorTexto.style.cssText = `
      flex: 1;
      border: 2px solid;
      border-color: ${this.W95.sunken};
      margin: 3px 4px 2px 4px;
      background: #ffffff;
      overflow-y: auto;
      display: flex;
      align-items: flex-start;
    `;

    const contenido = document.createElement('div');
    contenido.id = 'lupa-contenido';
    contenido.style.cssText = `
      padding: 6px 10px;
      word-break: break-word;
      line-height: 1.5;
      font-size: ${this.tamanoFuente()}rem;
      color: #000000;
      width: 100%;
    `;
    contenido.textContent = 'Pase el cursor sobre un texto...';
    contenedorTexto.appendChild(contenido);

    const controles = document.createElement('div');
    controles.style.cssText = `
      pointer-events: all;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 3px 6px 4px;
      flex-shrink: 0;
      border-top: 1px solid #808080;
    `;

    const btnMenos = this.crearBtnWin95('−');
    btnMenos.addEventListener('click', () => this.cambiarTamano(-30));

    const slider = document.createElement('input');
    slider.type  = 'range';
    slider.min   = '400';
    slider.max   = '700';
    slider.value = String(this.tamano);
    slider.id    = 'lupa-slider';
    slider.style.cssText = `width: 90px; cursor: pointer; accent-color: #000080;`;
    slider.addEventListener('input', (e) => {
      this.tamano = Number((e.target as HTMLInputElement).value);
      this.actualizarTamano();
    });

    const btnMas = this.crearBtnWin95('+');
    btnMas.addEventListener('click', () => this.cambiarTamano(30));

    const btnDesanclar = this.crearBtnWin95('📌 Soltar');
    btnDesanclar.id = 'lupa-btn-desanclar';
    btnDesanclar.style.cssText += 'width: auto; padding: 0 6px; display: none;';
    btnDesanclar.addEventListener('click', () => this.desanclar());

    controles.appendChild(btnMenos);
    controles.appendChild(slider);
    controles.appendChild(btnMas);
    controles.appendChild(btnDesanclar);

    const statusBar = document.createElement('div');
    statusBar.style.cssText = `display: flex; gap: 3px; padding: 2px 4px; flex-shrink: 0;`;

    const panel1 = this.crearStatusPanel('🖱️ Libre');
    panel1.id = 'lupa-panel-estado';
    const panel2 = this.crearStatusPanel('Fuente: ' + this.tamano);
    panel2.id = 'lupa-panel-tamano';
    statusBar.appendChild(panel1);
    statusBar.appendChild(panel2);

    this.lupa.appendChild(titleBar);
    this.lupa.appendChild(statusTop);
    this.lupa.appendChild(contenedorTexto);
    this.lupa.appendChild(controles);
    this.lupa.appendChild(statusBar);
    document.body.appendChild(this.lupa);

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('input', this.onInputEditable, true);

    document.addEventListener('mousedown', this.onMouseDownCapture, true);

    setTimeout(() => {
      document.addEventListener('click', this.onClick, true);
      document.addEventListener('dblclick', this.onDblClick, true);
    }, 100);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.activa()) {
      this.toggle();
    }
  };

  private onInputEditable = (e: Event) => {
    if (!this.lupa) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (!this.esElementoConTextoEditable(t)) return;
    if (t !== this.ultimoElemento) return;

    const texto = this.construirTextoParaLupa(t);
    this.ultimoTextoLupa = texto;
    this.reflejarElemento(t);
  };

  private destruir() {
    this.lupa?.remove();
    this.lupa           = null;
    this.anclada        = false;
    this.ultimoElemento = null;
    this.ultimoTextoLupa = '';
    this.restaurarCursor();
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('click',     this.onClick, true);
    document.removeEventListener('dblclick',  this.onDblClick, true);
    document.removeEventListener('mousedown', this.onMouseDownCapture, true);
    document.removeEventListener('input', this.onInputEditable, true);
    document.removeEventListener('wheel', this.onWheel);
  }

  private desanclar() {
    this.anclada = false;
    if (!this.lupa) return;

    const rect = this.lupa.getBoundingClientRect();
    this.anchoredAncho = Math.max(this.MIN_ANCHO, Math.round(rect.width));
    this.anchoredAlto  = Math.max(this.MIN_ALTO,  Math.round(rect.height));

    this.lupa.style.resize     = 'none';
    this.lupa.style.overflow   = '';
    this.lupa.style.width      = `${this.LUPA_ANCHO}px`;
    this.lupa.style.height     = `${this.LUPA_ALTO}px`;
    this.lupa.style.minWidth   = '';
    this.lupa.style.minHeight  = '';
    this.lupa.style.maxWidth   = '';
    this.lupa.style.maxHeight  = '';

    this.lupa.style.pointerEvents = 'none';
    this.setEstado('Libre');
    const btnDesanclar = document.getElementById('lupa-btn-desanclar') as HTMLElement;
    if (btnDesanclar) btnDesanclar.style.display = 'none';
  }

  private bloquearProximoClickEnPopup = false;

  private onMouseDownCapture = (e: MouseEvent) => {
    if (!this.lupa) return;
    if (this.lupa.contains(e.target as Node)) return;
    if (this.anclada) return;
    if (e.detail !== 2) return;

    const target = e.target as Element | null;
    const dentroPopup = !!target?.closest('app-popup');
    if (!dentroPopup) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    this.bloquearProximoClickEnPopup = true;
  };

  private onClick = (e: MouseEvent) => {
    if (!this.lupa) return;

    if (this.bloquearProximoClickEnPopup && e.detail >= 2) {
      this.bloquearProximoClickEnPopup = false;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }

    if (this.lupa.contains(e.target as Node)) return;

    if (this.anclada) {
      this.desanclar();
      return;
    }

    const target = e.target as Element | null;
    if (!target) return;

    if (this.ultimoElemento && !this.esElementoInteractivo(target)) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.anclar();
    }
  };

  private esElementoInteractivo(el: Element): boolean {
    return !!el.closest(
      'button, a[href], input, select, textarea, label, summary, ' +
      '[role="button"], [role="link"], [role="checkbox"], [role="switch"], ' +
      '[role="tab"], [role="menuitem"], [role="option"], ' +
      '[tabindex]:not([tabindex="-1"]), ' +
      '[contenteditable], [contenteditable=""], [contenteditable="true"]'
    );
  }

  private onDblClick = (e: MouseEvent) => {
    if (!this.lupa) return;
    if (this.lupa.contains(e.target as Node)) return;
    if (this.anclada) return;

    e.stopPropagation();
    e.stopImmediatePropagation();

    this.anclar();
  };

  private anclar() {
    if (!this.lupa) return;
    this.anclada = true;
    this.lupa.style.pointerEvents = 'all';

    this.lupa.style.width     = `${this.anchoredAncho}px`;
    this.lupa.style.height    = `${this.anchoredAlto}px`;
    this.lupa.style.minWidth  = `${this.MIN_ANCHO}px`;
    this.lupa.style.minHeight = `${this.MIN_ALTO}px`;
    this.lupa.style.maxWidth  = '95vw';
    this.lupa.style.maxHeight = '95vh';
    this.lupa.style.overflow  = 'hidden';
    this.lupa.style.resize    = 'both';

    this.setEstado('Anclada');
    const btnDesanclar = document.getElementById('lupa-btn-desanclar') as HTMLElement;
    if (btnDesanclar) btnDesanclar.style.display = 'inline-flex';
  }

  private pickElementoBajoCursor(clientX: number, clientY: number): Element | null {
    const stack = document.elementsFromPoint(clientX, clientY);
    for (const node of stack) {
      if (!(node instanceof Element)) continue;
      if (this.lupa?.contains(node)) continue;
      if (node.closest('app-cursor') || node.classList.contains('cursor')) {
        continue;
      }
      if (node.classList.contains('speak-btn')) {
        continue;
      }
      if (node.closest('[data-vision-ignore]')) {
        return null;
      }
      return node;
    }
    return null;
  }

  private pickPantallaCollage(clientX: number, clientY: number): HTMLElement | null {
    const stack = document.elementsFromPoint(clientX, clientY);
    for (const node of stack) {
      if (!(node instanceof Element)) continue;
      if (this.lupa?.contains(node)) continue;
      const screen = node.closest('app-collage-interactivo #screen');
      if (screen instanceof HTMLElement) return screen;
    }
    return null;
  }

  private onMouseMove = (e: MouseEvent) => {
    if (!this.lupa || this.anclada) return;

    const w = this.LUPA_ANCHO;
    const h = this.LUPA_ALTO;
    const off = 20;
    let x = e.clientX + off;
    let y = e.clientY - h / 2;

    if (x + w > window.innerWidth) x = e.clientX - w - off;
    if (y < 0) y = 0;
    if (y + h > window.innerHeight) y = window.innerHeight - h;

    this.lupa.style.left = `${x}px`;
    this.lupa.style.top = `${y}px`;

    this.lupa.style.visibility = 'hidden';
    const collageScreen = this.pickPantallaCollage(e.clientX, e.clientY);
    const el = this.pickElementoBajoCursor(e.clientX, e.clientY);
    this.lupa.style.visibility = 'visible';

    if (collageScreen) {
      this.reflejarTextoFijoEnLupa(this.mensajePantallaCollage, collageScreen);
      return;
    }

    if (!el) {
      this.limpiarSiHayTexto();
      return;
    }

    let objetivo = this.obtenerElementoRelevante(el);

    const host = this.obtenerHostControlInteractivo(el);
    if (host && (!objetivo || host.contains(objetivo))) {
      objetivo = host;
    }

    if (!objetivo) {
      this.limpiarSiHayTexto();
      return;
    }

    const textoActual = this.construirTextoParaLupa(objetivo);
    if (this.debeIgnorarTextoEnLupa(objetivo, textoActual)) {
      this.limpiarSiHayTexto();
      return;
    }

    if (objetivo !== this.ultimoElemento || textoActual !== this.ultimoTextoLupa) {
      this.ultimoElemento = objetivo;
      this.ultimoTextoLupa = textoActual;
      this.reflejarElemento(objetivo);
    }
  };

  private debeIgnorarTextoEnLupa(el: Element, texto: string): boolean {
    if (el.closest('#placeholder, [data-vision-ignore-text]')) {
      return true;
    }

    const normalizado = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!normalizado) return false;
    return this.textosIgnoradosLupa.some((t) => normalizado.includes(t));
  }

  private obtenerElementoRelevante(el: Element): Element | null {
    if (!el) return null;

    const tag = el.tagName.toLowerCase();

    if (this.esElementoConTextoEditable(el)) {
      return el;
    }

    if (this.tieneEtiquetaAccesible(el)) {
      return el;
    }

    const NO_TEXTO = [
      'img', 'svg', 'canvas', 'video', 'picture', 'iframe',
      'audio', 'source', 'track', 'object', 'embed', 'input',
      'select', 'textarea', 'hr', 'br'
    ];
    if (NO_TEXTO.includes(tag)) return null;

    if (!this.tieneTextoDirecto(el)) return null;

    const INLINE = ['span', 'em', 'b', 'i', 'strong', 'a', 'small', 'mark', 'u'];
    if (INLINE.includes(tag)) {
      const bloque = el.closest(
        'h1, h2, h3, h4, h5, h6, p, li, label, button, figcaption, ' +
        'blockquote, dd, dt, td, th, caption, summary'
      );
      if (bloque && this.tieneTextoDirecto(bloque)) return bloque;
    }

    return el;
  }

  private esElementoConTextoEditable(el: Element): boolean {
    const tag = el.tagName.toLowerCase();

    if (tag === 'textarea') {
      return !(el as HTMLTextAreaElement).disabled;
    }

    if (tag === 'input') {
      const inp = el as HTMLInputElement;
      if (inp.disabled) return false;
      const t = (inp.type || 'text').toLowerCase();
      const textLike = [
        'text', 'search', 'url', 'email', 'tel', 'password', 'number',
        'date', 'time', 'datetime-local', 'month', 'week', 'color',
      ];
      return textLike.includes(t);
    }

    if (tag === 'select') {
      return !(el as HTMLSelectElement).disabled;
    }

    return el instanceof HTMLElement && el.isContentEditable;
  }

  private leerValorEditable(el: Element): string {
    const tag = el.tagName.toLowerCase();

    if (tag === 'textarea') {
      const ta = el as HTMLTextAreaElement;
      const v = ta.value ?? '';
      if (v.trim()) return v;
      return ta.placeholder?.trim() ?? '';
    }

    if (tag === 'input') {
      const inp = el as HTMLInputElement;
      const t = (inp.type || 'text').toLowerCase();
      const textLike = [
        'text', 'search', 'url', 'email', 'tel', 'password', 'number',
        'date', 'time', 'datetime-local', 'month', 'week', 'color',
      ];
      if (!textLike.includes(t)) return '';
      const v = inp.value ?? '';
      if (v.trim()) return v;
      return inp.placeholder?.trim() ?? '';
    }

    if (tag === 'select') {
      const sel = el as HTMLSelectElement;
      const opt = sel.selectedOptions?.[0];
      return opt?.textContent?.trim() ?? '';
    }

    if (el instanceof HTMLElement && el.isContentEditable) {
      return el.textContent?.trim() ?? '';
    }

    return '';
  }

  private construirTextoParaLupa(el: Element): string {
    if (this.esElementoConTextoEditable(el)) {
      const v = this.leerValorEditable(el);
      if (v.trim()) return v;
      const etiqueta = this.leerEtiquetaAccesible(el);
      return etiqueta || '(sin texto)';
    }

    if (this.esHostControlInteractivo(el)) {
      return this.leerTextoControlCompleto(el);
    }

    const etiqueta = this.leerEtiquetaAccesible(el);
    const interno = el.textContent?.trim() ?? '';
    return (etiqueta || interno) || '(sin texto)';
  }

  private readonly SELECTOR_HOST_CONTROL =
    'button, a[href], [role="button"], [role="tab"], [role="menuitem"], ' +
    '[role="option"], summary, label, ' +
    'input[type="button"], input[type="submit"], input[type="reset"], input[type="image"]';

  private obtenerHostControlInteractivo(el: Element | null): Element | null {
    if (!el) return null;
    return el.closest(this.SELECTOR_HOST_CONTROL);
  }

  private esHostControlInteractivo(el: Element): boolean {
    return el.matches(this.SELECTOR_HOST_CONTROL);
  }

  private leerTextoControlCompleto(el: Element): string {
    const tag = el.tagName.toLowerCase();

    if (tag === 'input') {
      const inp = el as HTMLInputElement;
      const t = (inp.type || 'text').toLowerCase();
      if (t === 'button' || t === 'submit' || t === 'reset') {
        const v = inp.value?.trim() ?? '';
        return v || this.leerEtiquetaAccesible(el) || '(sin texto)';
      }
      if (t === 'image') {
        const a = inp.alt?.trim() ?? '';
        return a || this.leerEtiquetaAccesible(el) || '(sin texto)';
      }
    }

    const etiquetaDelControl = this.leerEtiquetaAccesible(el);
    if (etiquetaDelControl) {
      return etiquetaDelControl;
    }

    const partes: string[] = [];

    const visitar = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = node.textContent?.replace(/\s+/g, ' ').trim();
        if (frag) partes.push(frag);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const elem = node as Element;
      const t = elem.tagName.toLowerCase();
      if (t === 'script' || t === 'style' || t === 'template') return;
      if (t === 'button' && elem.classList.contains('speak-btn')) return;

      if (t === 'img') {
        const alt = (elem as HTMLImageElement).alt?.trim();
        if (alt) partes.push(alt);
        return;
      }

      if (t === 'svg') {
        const acc = this.leerEtiquetaAccesible(elem);
        if (acc) partes.push(acc);
        return;
      }

      for (const hijo of Array.from(elem.childNodes)) {
        visitar(hijo);
      }
    };

    visitar(el);

    const unido = partes.join(' ').replace(/\s+/g, ' ').trim();
    if (unido) return unido;

    return this.leerEtiquetaAccesible(el) || '(sin texto)';
  }

  private tieneTextoDirecto(el: Element): boolean {
    for (const node of Array.from(el.childNodes)) {
      if (
        node.nodeType === Node.TEXT_NODE &&
        (node.textContent?.trim().length ?? 0) > 0
      ) {
        return true;
      }
    }
    return false;
  }

  private tieneEtiquetaAccesible(el: Element): boolean {
    return this.leerEtiquetaAccesible(el) !== '';
  }

  private leerEtiquetaAccesible(el: Element): string {
    const aria = el.getAttribute('aria-label');
    if (aria && aria.trim()) return aria.trim();

    const title = el.getAttribute('title');
    if (title && title.trim()) return title.trim();

    const tag = el.tagName.toLowerCase();

    if (tag === 'img') {
      const alt = (el as HTMLImageElement).alt;
      if (alt && alt.trim()) return alt.trim();
    }

    if (tag === 'svg') {
      const titleEl = el.querySelector(':scope > title');
      const t = titleEl?.textContent?.trim();
      if (t) return t;
    }

    return '';
  }

  private limpiarSiHayTexto() {
    if (this.ultimoElemento === null) return;
    this.ultimoElemento = null;
    this.ultimoTextoLupa = '';

    const contenido = document.getElementById('lupa-contenido') as HTMLElement | null;
    const statusTop = document.getElementById('lupa-status') as HTMLElement | null;

    if (contenido) {
      contenido.textContent = 'Pase el cursor sobre un texto...';
      contenido.style.backgroundColor = '#ffffff';
      contenido.style.color = '#000000';
      contenido.style.fontWeight = 'normal';
      contenido.style.fontStyle = 'normal';
      contenido.style.textAlign = 'left';
      contenido.style.textDecoration = 'none';
      contenido.style.letterSpacing = 'normal';
      contenido.style.fontFamily = 'inherit';
      contenido.style.fontSize = `${this.tamanoFuente()}rem`;
    }

    if (statusTop) {
      statusTop.textContent = 'Pase el cursor sobre un texto...';
    }
  }

  private onWheel = (e: WheelEvent) => {
    if (!this.lupa) return;

    const contenedorTexto = this.lupa.querySelector('div[style*="overflow-y"]') as HTMLElement;
    if (!contenedorTexto) return;

    const rect = this.lupa.getBoundingClientRect();
    const sobreLupa = (
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top  && e.clientY <= rect.bottom
    );

    if (sobreLupa) {
      e.preventDefault();
      e.stopPropagation();
      contenedorTexto.scrollTop += e.deltaY;
    }
  };

  private reflejarElemento(el: Element) {
    const contenido = document.getElementById('lupa-contenido') as HTMLElement;
    const statusTop = document.getElementById('lupa-status') as HTMLElement;
    if (!contenido) return;

    const cs = window.getComputedStyle(el);

    const texto = this.construirTextoParaLupa(el);
    if (this.debeIgnorarTextoEnLupa(el, texto)) {
      this.limpiarSiHayTexto();
      return;
    }

    contenido.textContent = texto;

    const bgColor = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : '#ffffff';
    let colorOriginal = cs.color ?? '#000000';

    if (this.esColorMuyClaro(colorOriginal)) {
      colorOriginal = '#000000';
    }

    contenido.style.backgroundColor = bgColor;
    contenido.style.color = colorOriginal;
    contenido.style.fontWeight = cs.fontWeight;
    contenido.style.fontStyle = cs.fontStyle;
    contenido.style.textAlign = cs.textAlign;
    contenido.style.textDecoration = cs.textDecoration;
    contenido.style.letterSpacing = cs.letterSpacing;
    contenido.style.fontFamily = cs.fontFamily;

    
    const fuenteOriginalPx = parseFloat(cs.fontSize) || 16;
    
    const factorEscala = 1 + (this.tamano - 400) / 400; 
    
    const fuenteMinLupaPx = this.tamanoFuente() * 16;

    const fuenteFinalPx = Math.max(fuenteMinLupaPx, fuenteOriginalPx * factorEscala);
    
    contenido.style.fontSize = `${fuenteFinalPx}px`;

    const contenedor = contenido.parentElement;
    if (contenedor) contenedor.scrollTop = 0;

    const tag = el.tagName.toLowerCase();
    const className = el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
      : '';
    if (statusTop) statusTop.textContent = `<${tag}${className}>`;
  }

  private reflejarTextoFijoEnLupa(texto: string, origen: Element) {
    const contenido = document.getElementById('lupa-contenido') as HTMLElement | null;
    const statusTop = document.getElementById('lupa-status') as HTMLElement | null;
    if (!contenido) return;

    const cs = window.getComputedStyle(origen);
    const bgColor = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : '#ffffff';

    contenido.textContent = texto;
    contenido.style.backgroundColor = bgColor;
    contenido.style.color = '#00cea8';
    contenido.style.fontWeight = '700';
    contenido.style.fontStyle = 'normal';
    contenido.style.textAlign = 'center';
    contenido.style.textDecoration = 'none';
    contenido.style.letterSpacing = 'normal';
    contenido.style.fontFamily = 'inherit';
    contenido.style.fontSize = `${this.tamanoFuente()}rem`;

    const contenedor = contenido.parentElement;
    if (contenedor) contenedor.scrollTop = 0;

    if (statusTop) statusTop.textContent = '<pantalla collage>';
    this.ultimoElemento = origen;
    this.ultimoTextoLupa = texto;
  }

  private esColorMuyClaro(color: string): boolean {
    if (color.includes('rgba(0, 0, 0, 0)')) return false;

    const match = color.match(/\d+/g);
    if (!match || match.length < 3) return false;

    const r = parseInt(match[0]);
    const g = parseInt(match[1]);
    const b = parseInt(match[2]);

    const brillo = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brillo > 200;
  }

  private cambiarTamano(delta: number) {
    this.tamano = Math.min(700, Math.max(400, this.tamano + delta));
    this.actualizarTamano();
    const slider = document.getElementById('lupa-slider') as HTMLInputElement;
    if (slider) slider.value = String(this.tamano);
  }

  private actualizarTamano() {
    if (!this.lupa) return;

    const contenido = document.getElementById('lupa-contenido') as HTMLElement;
    if (contenido && this.ultimoElemento) {
      const cs = window.getComputedStyle(this.ultimoElemento);
      
      const fuenteOriginalPx = parseFloat(cs.fontSize) || 16;
      
      const factorEscala = 1 + (this.tamano - 400) / 400; 
      
      const fuenteMinLupaPx = this.tamanoFuente() * 16;

      const fuenteFinalPx = Math.max(fuenteMinLupaPx, fuenteOriginalPx * factorEscala);
      
      contenido.style.fontSize = `${fuenteFinalPx}px`;
    } else if (contenido) {
      contenido.style.fontSize = `${this.tamanoFuente()}rem`;
    }

    const panel = document.getElementById('lupa-panel-tamano') as HTMLElement;
    if (panel) panel.textContent = `Fuente: ${this.tamano}`;
  }

  private tamanoFuente() { return 1.6 + (this.tamano - 150) / 200; }

  private setEstado(estado: 'Libre' | 'Anclada') {
    const p = document.getElementById('lupa-panel-estado') as HTMLElement;
    if (p) p.textContent = estado === 'Anclada' ? '📌 Anclada' : '🖱️ Libre';
  }

  private crearStatusPanel(texto: string): HTMLElement {
    const p = document.createElement('div');
    p.style.cssText = `
      border: 1px solid;
      border-color: #808080 #ffffff #ffffff #808080;
      padding: 0 4px;
      min-width: 60px;
      font-size: 10px;
      background: ${this.W95.bg};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    p.textContent = texto;
    return p;
  }

  private crearBtnWin95(label: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `
      width: 28px;
      height: 24px;
      font-size: 12px;
      font-family: "MS Sans Serif", Arial, sans-serif;
      background: #c0c0c0;
      border: 2px solid;
      border-color: #ffffff #808080 #808080 #ffffff;
      box-shadow: 1px 1px 0 #000000;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    `;
    btn.addEventListener('mousedown', () => {
      btn.style.borderColor = '#808080 #ffffff #ffffff #808080';
      btn.style.boxShadow   = 'none';
    });
    btn.addEventListener('mouseup', () => {
      btn.style.borderColor = '#ffffff #808080 #808080 #ffffff';
      btn.style.boxShadow   = '1px 1px 0 #000000';
    });
    return btn;
  }
}
