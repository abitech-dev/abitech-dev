import { anchoTexto, documentoSvg, escapar, fuentesCss, partirPorAncho } from './comun.mjs';
import { cajaLogo } from './logo.mjs';

const ANCHO = 280;
const ALTO = 450;
const LOGO = 112;
const ANCHO_UTIL = ANCHO - 28;
const TAMANOS_NOMBRE = [26, 24, 22];
const DESCRIPCION = { tam: 21, interlineado: 27 };
const ROL = { tam: 14, espaciado: 1.4 };
const LINEAS_TEXTO = 5;

// El nombre usa el tamaño más grande con el que entra en dos líneas.
export function ajustarNombre(nombre) {
  for (const tam of TAMANOS_NOMBRE) {
    const lineas = partirPorAncho(nombre, tam, ANCHO_UTIL);
    if (lineas.length <= 2) return { tam, lineas };
  }
  const tam = TAMANOS_NOMBRE.at(-1);
  return { tam, lineas: partirPorAncho(nombre, tam, ANCHO_UTIL) };
}

// El nombre y la descripción comparten cinco líneas para no pisar el pie.

export function lineasDescripcion(descripcion) {
  return partirPorAncho(descripcion, DESCRIPCION.tam, ANCHO_UTIL);
}

export function tarjetaPilar({ nombre, etiqueta, descripcion, logo, pie, paleta, fuente, fuenteTitulo }) {
  const centro = ANCHO / 2;
  const { tam: tamNombre, lineas: nombreEnLineas } = ajustarNombre(nombre);
  let y = 198;
  const nombreSvg = nombreEnLineas.map((linea) => {
    const texto = `<text x="${centro}" y="${y}" text-anchor="middle" class="nombre">${escapar(linea)}</text>`;
    y += tamNombre + 5;
    return texto;
  }).join('');

  const rol = etiqueta.toUpperCase();
  const anchoPildora = anchoTexto(rol, ROL.tam, ROL.espaciado) + 28;
  const yPildora = y - 8;
  const pildora =
    `<rect x="${centro - anchoPildora / 2}" y="${yPildora}" width="${anchoPildora}" height="30" rx="15" ` +
    `fill="${paleta.acento}" fill-opacity="0.14" stroke="${paleta.acento}" stroke-opacity="0.35"/>` +
    `<text x="${centro}" y="${yPildora + 20}" text-anchor="middle" class="rol">${escapar(rol)}</text>`;

  const maximoLineas = LINEAS_TEXTO - nombreEnLineas.length;
  const descripcionSvg = lineasDescripcion(descripcion).slice(0, maximoLineas).map((linea, i) =>
    `<text x="${centro}" y="${yPildora + 68 + i * DESCRIPCION.interlineado}" text-anchor="middle" class="desc">${escapar(linea)}</text>`).join('');

  const estilos = fuentesCss([fuente, fuenteTitulo]) +
    `.nombre{font-family:'${fuenteTitulo.familia}';font-weight:${fuenteTitulo.peso};font-size:${tamNombre}px;fill:${paleta.texto}}` +
    `.rol{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:${ROL.tam}px;letter-spacing:${ROL.espaciado}px;fill:${paleta.acento}}` +
    `.desc{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:${DESCRIPCION.tam}px;fill:${paleta.texto};opacity:.85}` +
    `.pie{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:18px;fill:${paleta.acento}}`;

  const contenido =
    '<defs>' +
    `<filter id="sombra" x="-30%" y="-30%" width="160%" height="160%">` +
    '<feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.18"/></filter>' +
    '</defs>' +
    `<rect x="0.5" y="0.5" width="${ANCHO - 1}" height="${ALTO - 1}" rx="22" fill="${paleta.fondo}" stroke="${paleta.borde}"/>` +
    cajaLogo({ logo, nombre, x: centro - LOGO / 2, y: 36, tam: LOGO, paleta, fuenteTitulo, sombra: ' filter="url(#sombra)"' }) +
    nombreSvg +
    pildora +
    descripcionSvg +
    `<text x="${centro}" y="${ALTO - 28}" text-anchor="middle" class="pie">${escapar(pie)}</text>`;

  return documentoSvg({ ancho: ANCHO, alto: ALTO, titulo: `${nombre}. ${descripcion}`, estilos, contenido });
}
