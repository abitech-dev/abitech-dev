import { anchoTexto, documentoSvg, escapar, fuentesCss, iconos } from './comun.mjs';

const ALTO = 52;

const glifos = {
  linkedin: (color) =>
    `<rect x="18" y="14" width="24" height="24" rx="5" fill="${color}"/>` +
    '<circle cx="24.5" cy="20.5" r="2.1" fill="#fff"/><rect x="22.6" y="24" width="3.8" height="9.5" rx="0.8" fill="#fff"/>' +
    '<path d="M28.6 24h3.6v1.4c.6-1 1.8-1.7 3.2-1.7 2.4 0 3.6 1.5 3.6 4.2v5.6h-3.8v-5c0-1.2-.5-1.9-1.5-1.9-1.1 0-1.7.8-1.7 2v4.9h-3.4z" fill="#fff"/>',
  correo: (color) =>
    `<rect x="17" y="16" width="26" height="20" rx="4" fill="none" stroke="${color}" stroke-width="2.4"/>` +
    `<path d="M18.5 18.5 30 27l11.5-8.5" fill="none" stroke="${color}" stroke-width="2.4" stroke-linejoin="round"/>`,
  whatsapp: (color) =>
    `<svg x="17" y="14" width="26" height="26" viewBox="0 0 24 24"><path fill="${color}" d="${iconos.whatsapp.path}"/></svg>`,
  youtube: (color) =>
    `<svg x="17" y="14" width="26" height="26" viewBox="0 0 24 24"><path fill="${color}" d="${iconos.youtube.path}"/></svg>`,
  web: (color) =>
    `<circle cx="30" cy="26" r="12" fill="none" stroke="${color}" stroke-width="2.2"/>` +
    `<ellipse cx="30" cy="26" rx="5.2" ry="12" fill="none" stroke="${color}" stroke-width="2.2"/>` +
    `<path d="M18 26h24M20 20h20M20 32h20" stroke="${color}" stroke-width="2" fill="none"/>`,
};

const coloresMarca = { linkedin: '#0A66C2', whatsapp: '#25D366', youtube: '#FF0000' };

export function boton({ canal, etiqueta, paleta, fuente }) {
  const ancho = Math.round(54 + anchoTexto(etiqueta, 17) + 24);
  const color = coloresMarca[canal] ?? paleta.acento;
  const estilos = fuentesCss([fuente]) +
    `.etiqueta{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:17px;fill:${paleta.texto}}`;
  const contenido =
    `<rect x="0.75" y="0.75" width="${ancho - 1.5}" height="${ALTO - 1.5}" rx="${(ALTO - 1.5) / 2}" fill="${paleta.panel}" stroke="${paleta.borde}" stroke-width="1.5"/>` +
    glifos[canal](color) +
    `<text x="54" y="32" class="etiqueta">${escapar(etiqueta)}</text>`;
  return documentoSvg({ ancho, alto: ALTO, titulo: etiqueta, estilos, contenido });
}
