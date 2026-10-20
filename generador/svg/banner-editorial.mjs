import { documentoSvg, escapar, fotoDataUri, fuentesCss } from './comun.mjs';

const ANCHO = 1600;
const ALTO = 400;

export function bannerEditorial({ perfil, idioma, paleta, fuentes }) {
  const foto = { x: 1360, y: 200, r: 112 };
  const host = new URL(perfil.sitio).host;
  const [serif, serifCursiva, sans] = fuentes;

  const estilos = fuentesCss(fuentes) +
    `.nombre{font-family:'${serif.familia}';font-weight:600;font-size:66px;letter-spacing:-1px}` +
    `.lema{font-family:'${serifCursiva.familia}';font-style:italic;font-weight:400;font-size:29px}` +
    `.versal{font-family:'${sans.familia}';font-weight:${sans.peso};font-size:15px;letter-spacing:4.5px}` +
    `.dato{font-family:'${sans.familia}';font-weight:${sans.peso};font-size:17px}`;

  const contenido =
    '<defs>' +
    `<clipPath id="marco"><rect width="${ANCHO}" height="${ALTO}" rx="24"/></clipPath>` +
    `<clipPath id="foto"><circle cx="${foto.x}" cy="${foto.y}" r="${foto.r}"/></clipPath>` +
    '</defs>' +
    '<g clip-path="url(#marco)">' +
    `<rect width="${ANCHO}" height="${ALTO}" fill="${paleta.fondo}"/>` +
    `<rect x="22" y="22" width="${ANCHO - 44}" height="${ALTO - 44}" rx="10" fill="none" stroke="${paleta.acento}" stroke-opacity="0.55" stroke-width="1"/>` +
    `<text x="96" y="110" class="versal" fill="${paleta.acento}">${escapar(perfil.roles[idioma][0].toUpperCase())}</text>` +
    `<text x="92" y="192" class="nombre" fill="${paleta.texto}">${escapar(perfil.nombre)}</text>` +
    `<rect x="96" y="222" width="72" height="2" fill="${paleta.acento}"/>` +
    `<text x="96" y="274" class="lema" fill="${paleta.texto}" opacity="0.88">${escapar(perfil.lema[idioma].join(' '))}</text>` +
    `<text x="96" y="332" class="dato" fill="${paleta.tenue}">${escapar(perfil.roles[idioma].slice(1, 3).join('   |   '))}` +
    `<tspan dx="40" fill="${paleta.acento}">${escapar(host)}</tspan>` +
    `<tspan dx="40">${escapar(perfil.ubicacion[idioma])}</tspan></text>` +
    `<circle cx="${foto.x}" cy="${foto.y}" r="${foto.r + 16}" fill="none" stroke="${paleta.acento}" stroke-opacity="0.4" stroke-width="1"/>` +
    `<circle cx="${foto.x}" cy="${foto.y}" r="${foto.r + 7}" fill="none" stroke="${paleta.acento}" stroke-width="2"/>` +
    `<image href="${fotoDataUri()}" x="${foto.x - foto.r}" y="${foto.y - foto.r}" width="${foto.r * 2}" height="${foto.r * 2}" ` +
    'clip-path="url(#foto)" preserveAspectRatio="xMidYMid slice"/>' +
    '</g>';

  return documentoSvg({
    ancho: ANCHO,
    alto: ALTO,
    titulo: `${perfil.nombre}. ${perfil.lema[idioma].join(' ')}`,
    estilos,
    contenido,
  });
}
