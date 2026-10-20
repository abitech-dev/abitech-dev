import { documentoSvg, escapar, fuentesCss, partirLineas } from './comun.mjs';
import { cajaLogo } from './logo.mjs';

const ANCHO = 280;
const ALTO = 400;
const LOGO = 112;
const LINEAS_TEXTO = 4;

// El nombre y la descripción comparten cuatro líneas para no pisar el pie.
export function lineasDescripcion(descripcion) {
  return partirLineas(descripcion, 25);
}

export function tarjetaPilar({ nombre, etiqueta, descripcion, logo, pie, paleta, fuente, fuenteTitulo }) {
  const centro = ANCHO / 2;
  const lineasNombre = partirLineas(nombre, 17).slice(0, 2);
  let y = 196;
  const nombreSvg = lineasNombre.map((linea) => {
    const texto = `<text x="${centro}" y="${y}" text-anchor="middle" class="nombre">${escapar(linea)}</text>`;
    y += 30;
    return texto;
  }).join('');

  const rol = etiqueta.toUpperCase();
  const anchoPildora = rol.length * 9.6 + 30;
  const yPildora = y - 6;
  const pildora =
    `<rect x="${centro - anchoPildora / 2}" y="${yPildora}" width="${anchoPildora}" height="28" rx="14" ` +
    `fill="${paleta.acento}" fill-opacity="0.14" stroke="${paleta.acento}" stroke-opacity="0.35"/>` +
    `<text x="${centro}" y="${yPildora + 19}" text-anchor="middle" class="rol">${escapar(rol)}</text>`;

  const maximoLineas = LINEAS_TEXTO - lineasNombre.length;
  const descripcionSvg = lineasDescripcion(descripcion).slice(0, maximoLineas).map((linea, i) =>
    `<text x="${centro}" y="${yPildora + 64 + i * 25}" text-anchor="middle" class="desc">${escapar(linea)}</text>`).join('');

  const estilos = fuentesCss([fuente, fuenteTitulo]) +
    `.nombre{font-family:'${fuenteTitulo.familia}';font-weight:${fuenteTitulo.peso};font-size:25px;fill:${paleta.texto}}` +
    `.rol{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:13px;letter-spacing:1.4px;fill:${paleta.acento}}` +
    `.desc{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:19px;fill:${paleta.texto};opacity:.8}` +
    `.pie{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:16px;fill:${paleta.acento}}`;

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
    `<text x="${centro}" y="${ALTO - 26}" text-anchor="middle" class="pie">${escapar(pie)}</text>`;

  return documentoSvg({ ancho: ANCHO, alto: ALTO, titulo: `${nombre}. ${descripcion}`, estilos, contenido });
}
