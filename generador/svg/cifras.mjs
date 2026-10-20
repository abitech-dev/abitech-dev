import { documentoSvg, escapar, fuentesCss } from './comun.mjs';

const ANCHO = 1256;
const ALTO = 128;

export function panelCifras({ perfil, idioma, paleta, fuente, fuenteNumeros }) {
  const ancho = ANCHO / perfil.cifras.length;
  const columnas = perfil.cifras.map(({ valor, etiqueta }, i) => {
    const centro = ancho * i + ancho / 2;
    const separador = i > 0
      ? `<path d="M${ancho * i} 30V${ALTO - 30}" stroke="${paleta.borde}" stroke-width="1.5"/>`
      : '';
    return separador +
      `<text x="${centro}" y="66" text-anchor="middle" class="valor">${escapar(valor)}</text>` +
      `<text x="${centro}" y="96" text-anchor="middle" class="etiqueta">${escapar(etiqueta[idioma])}</text>`;
  }).join('');

  const estilos = fuentesCss([fuente, fuenteNumeros]) +
    `.valor{font-family:'${fuenteNumeros.familia}';font-weight:${fuenteNumeros.peso};font-size:44px;fill:${paleta.acento}}` +
    `.etiqueta{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:17px;fill:${paleta.tenue}}`;

  const contenido =
    `<rect x="0.5" y="0.5" width="${ANCHO - 1}" height="${ALTO - 1}" rx="18" fill="${paleta.fondo}" stroke="${paleta.borde}"/>` +
    columnas;

  return documentoSvg({
    ancho: ANCHO,
    alto: ALTO,
    titulo: perfil.cifras.map(({ valor, etiqueta }) => `${valor} ${etiqueta[idioma]}`).join(', '),
    estilos,
    contenido,
  });
}
