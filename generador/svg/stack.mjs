import { anchoTexto, colorVisible, documentoSvg, escapar, fuentesCss, icono, iconos, partirPorAncho } from './comun.mjs';

const ANCHO = 1256;
const MARGEN = 28;
const COLUMNA_ETIQUETA = 240;
const CHIP = { alto: 46, separacion: 12, icono: 45, relleno: 16 };
const ALTO_FILA = 58;
const TEXTO = { tam: 15 };
const ETIQUETA = { tam: 13, espaciado: 2 };

// Las casillas miden lo que su nombre y bajan de fila al llenarse, así el
// panel crece hacia abajo sin salirse cuando se agregan tecnologías.
export function panelStack({ perfil, idioma, paleta, fuente }) {
  const inicioX = MARGEN + COLUMNA_ETIQUETA;
  const limiteX = ANCHO - MARGEN;
  let y = MARGEN;
  let orden = 0;

  const grupos = perfil.stack.map((grupo) => {
    const lineasEtiqueta = partirPorAncho(grupo.categoria[idioma].toUpperCase(), ETIQUETA.tam, COLUMNA_ETIQUETA - 24, ETIQUETA.espaciado);
    const yEtiqueta = y + 28 - (lineasEtiqueta.length - 1) * 8;
    const etiqueta = lineasEtiqueta.map((linea, i) =>
      `<text x="${MARGEN}" y="${yEtiqueta + i * 17}" class="grupo">${escapar(linea)}</text>`).join('');

    let x = inicioX;
    const chips = grupo.tecnologias.map((slug) => {
      const nombre = iconos[slug].titulo;
      const ancho = Math.ceil(CHIP.icono + anchoTexto(nombre, TEXTO.tam) + CHIP.relleno);
      if (x > inicioX && x + ancho > limiteX) {
        x = inicioX;
        y += ALTO_FILA;
      }
      const color = iconos[slug].path ? colorVisible(slug, paleta.panel, paleta.texto) : undefined;
      const retraso = (orden++ * 0.035).toFixed(3);
      const chip = `<g class="chip" style="animation-delay:${retraso}s">` +
        `<rect x="${x}" y="${y}" width="${ancho}" height="${CHIP.alto}" rx="11" fill="${paleta.panel}" stroke="${paleta.borde}"/>` +
        icono(slug, { x: x + 13, y: y + 12, tam: 22, color }) +
        `<text x="${x + CHIP.icono}" y="${y + 28.5}" class="tec">${escapar(nombre)}</text></g>`;
      x += ancho + CHIP.separacion;
      return chip;
    }).join('');

    y += ALTO_FILA;
    return etiqueta + chips;
  }).join('');

  const alto = y - (ALTO_FILA - CHIP.alto) + MARGEN;
  const estilos = fuentesCss([fuente]) +
    `.grupo{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:${ETIQUETA.tam}px;letter-spacing:${ETIQUETA.espaciado}px;fill:${paleta.acento}}` +
    `.tec{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:${TEXTO.tam}px;fill:${paleta.texto}}` +
    '.chip{animation:aparecer .5s ease-out backwards}' +
    '@keyframes aparecer{from{opacity:0;transform:translateY(6px)}}' +
    '@media (prefers-reduced-motion:reduce){.chip{animation:none}}';

  return documentoSvg({
    ancho: ANCHO,
    alto,
    titulo: perfil.stack.map((grupo) => grupo.tecnologias.map((slug) => iconos[slug].titulo).join(', ')).join(', '),
    estilos,
    contenido: `<rect x="0.5" y="0.5" width="${ANCHO - 1}" height="${alto - 1}" rx="18" fill="${paleta.fondo}" stroke="${paleta.borde}"/>` + grupos,
  });
}
