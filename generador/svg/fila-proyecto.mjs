import { colorVisible, documentoSvg, escapar, fuentesCss, icono, iconos, partirLineas } from './comun.mjs';
import { cajaLogo } from './logo.mjs';

const ANCHO = 1256;
const ALTO = 184;
const TEXTO_X = 184;
const LOGO = 108;

export function filaProyecto({ nombre, etiqueta, descripcion, logo, stack = [], pie, color, paleta, fuente, fuenteTitulo }) {
  const iconosStack = stack.map((slug, i) => {
    const relleno = iconos[slug].path ? colorVisible(slug, paleta.fondo, paleta.texto) : undefined;
    const x = ANCHO - 48 - (stack.length - i) * 40 + 8;
    return icono(slug, { x, y: 40, tam: 28, color: relleno });
  }).join('');

  const estilos = fuentesCss([fuente, fuenteTitulo]) +
    `.rubro{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:14px;letter-spacing:1.6px;fill:${paleta.tenue}}` +
    `.nombre{font-family:'${fuenteTitulo.familia}';font-weight:${fuenteTitulo.peso};font-size:30px;fill:${paleta.texto}}` +
    `.desc{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:20px;fill:${paleta.texto};opacity:.8}` +
    `.pie{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:18px;fill:${paleta.acento}}`;

  const contenido =
    `<defs><clipPath id="marco"><rect width="${ANCHO}" height="${ALTO}" rx="18"/></clipPath></defs>` +
    '<g clip-path="url(#marco)">' +
    `<rect width="${ANCHO}" height="${ALTO}" fill="${paleta.fondo}"/>` +
    `<rect width="7" height="${ALTO}" fill="${color}"/>` +
    '</g>' +
    `<rect x="0.5" y="0.5" width="${ANCHO - 1}" height="${ALTO - 1}" rx="18" fill="none" stroke="${paleta.borde}"/>` +
    cajaLogo({ logo, nombre, x: 44, y: (ALTO - LOGO) / 2, tam: LOGO, paleta, fuenteTitulo }) +
    `<rect x="${TEXTO_X}" y="45" width="10" height="10" rx="2" fill="${color}"/>` +
    `<text x="${TEXTO_X + 20}" y="55" class="rubro">${escapar(etiqueta.toUpperCase())}</text>` +
    `<text x="${TEXTO_X}" y="94" class="nombre">${escapar(nombre)}</text>` +
    partirLineas(descripcion, 64).slice(0, 2).map((linea, i) =>
      `<text x="${TEXTO_X}" y="${128 + i * 26}" class="desc">${escapar(linea)}</text>`).join('') +
    iconosStack +
    `<text x="${ANCHO - 48}" y="${ALTO - 36}" text-anchor="end" class="pie">${escapar(pie)}</text>`;

  return documentoSvg({ ancho: ANCHO, alto: ALTO, titulo: `${nombre}. ${descripcion}`, estilos, contenido });
}
