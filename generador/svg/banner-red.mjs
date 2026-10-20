import { colorVisible, documentoSvg, escapar, fotoDataUri, fuentesCss, icono, iconos } from './comun.mjs';

const ANCHO = 1600;
const ALTO = 400;
const MONO_AVANCE = 0.6;
const PANEL_X = 1010;
const DURACION_GRUPO = 2.5;

// Las casillas pasan por todo el stack en grupos y se detienen en las
// destacadas. Sin animación se ven directamente las destacadas.
function gruposDeTecnologias(perfil) {
  const destacadas = perfil.destacadas;
  const resto = [...new Set(perfil.stack.flatMap((grupo) => grupo.tecnologias))]
    .filter((slug) => !destacadas.includes(slug));
  const grupos = [];
  for (let inicio = 0; inicio < resto.length; inicio += destacadas.length) {
    grupos.push(destacadas.map((_, i) => resto[(inicio + i) % resto.length]));
  }
  return [...grupos, destacadas];
}
const EYEBROW = { tam: 16, espaciado: 1.5 };

export function bannerRed({ perfil, idioma, paleta, fuentes }) {
  const centro = { x: (PANEL_X + ANCHO) / 2, y: 200 };
  const tiles = perfil.destacadas.map((slug, i, todas) => {
    const angulo = (-90 + 22.5 + (360 / todas.length) * i) * (Math.PI / 180);
    return {
      slug,
      x: centro.x + Math.cos(angulo) * 200,
      y: centro.y + Math.sin(angulo) * 128,
      retraso: (i % 4) * 0.3,
    };
  });

  const aristas = tiles.map(({ x, y }) => `M${centro.x} ${centro.y}L${x.toFixed(1)} ${y.toFixed(1)}`).join('');

  const grupos = gruposDeTecnologias(perfil);
  const tilesSvg = tiles.map(({ x, y, retraso }, posicion) => {
    const capas = grupos.map((grupo, orden) => {
      const slug = grupo[posicion];
      const color = iconos[slug].path ? colorVisible(slug, paleta.fondo, paleta.texto) : undefined;
      const esFinal = orden === grupos.length - 1;
      return `<g class="${esFinal ? 'capa-final' : 'capa'}" style="animation-delay:${(orden * DURACION_GRUPO).toFixed(1)}s">` +
        icono(slug, { x: x - 18, y: y - 18, tam: 36, color }) + '</g>';
    }).join('');
    return `<g class="flota" style="animation-delay:${retraso}s">` +
      `<rect x="${x - 36}" y="${y - 36}" width="72" height="72" rx="18" fill="${paleta.fondo}" ` +
      `stroke="${paleta.borde}" stroke-width="1.5" filter="url(#sombra)"/>` +
      capas +
      '</g>';
  }).join('');

  const roles = perfil.roles[idioma].slice(0, 3).map((rol) => rol.toUpperCase());
  let cursor = 80;
  const eyebrow = roles.map((rol, i) => {
    const texto = `<text x="${cursor}" y="92" class="mono">${escapar(rol)}</text>`;
    cursor += rol.length * (EYEBROW.tam * MONO_AVANCE + EYEBROW.espaciado);
    const separador = i < roles.length - 1
      ? `<rect x="${cursor + 12}" y="83" width="7" height="7" rx="1.5" fill="${paleta.acento2}"/>`
      : '';
    cursor += 38;
    return texto + separador;
  }).join('');

  const host = new URL(perfil.sitio).host;
  const anchoHost = host.length * EYEBROW.tam * MONO_AVANCE;

  const estilos = fuentesCss(fuentes) +
    `.titulo{font-family:'${fuentes[0].familia}';font-weight:800;font-size:52px;letter-spacing:-1px}` +
    `.nombre{font-family:'${fuentes[0].familia}';font-weight:700;font-size:26px;fill:${paleta.texto}}` +
    `.tenue{font-family:'${fuentes[0].familia}';font-weight:500;font-size:17px;fill:${paleta.tenue}}` +
    `.mono{font-family:'${fuentes[2].familia}';font-weight:500;font-size:${EYEBROW.tam}px;letter-spacing:${EYEBROW.espaciado}px;fill:${paleta.acento}}` +
    // La rotación del stack dura unos 8 s y se detiene. El resto termina
    // antes de 5 s (WCAG 2.2.2).
    '.flota{animation:flotar 2s ease-in-out 2}' +
    '.flujo{stroke-dasharray:4 10;animation:fluir 1.6s linear 3}' +
    '@keyframes flotar{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}' +
    '.latido{transform-origin:center;transform-box:fill-box;animation:latir 2.4s ease-out 2}' +
    '@keyframes fluir{to{stroke-dashoffset:-28}}' +
    '@keyframes latir{0%{opacity:.55;transform:scale(.9)}100%{opacity:0;transform:scale(1.15)}}' +
    `.capa{opacity:0;animation:mostrar ${DURACION_GRUPO}s linear}` +
    '.capa-final{animation:aparecer .4s ease-out backwards}' +
    '@keyframes mostrar{0%{opacity:0}15%,85%{opacity:1}100%{opacity:0}}' +
    '@keyframes aparecer{from{opacity:0}}' +
    '@media (prefers-reduced-motion:reduce){.flota,.flujo,.latido,.capa,.capa-final{animation:none}}';

  const contenido =
    '<defs>' +
    `<clipPath id="marco"><rect width="${ANCHO}" height="${ALTO}" rx="24"/></clipPath>` +
    `<clipPath id="foto"><circle cx="${centro.x}" cy="${centro.y}" r="60"/></clipPath>` +
    `<pattern id="reticula" width="40" height="40" patternUnits="userSpaceOnUse">` +
    `<path d="M40 0H0V40" fill="none" stroke="${paleta.borde}" stroke-width="1"/></pattern>` +
    `<filter id="sombra" x="-30%" y="-30%" width="160%" height="160%">` +
    `<feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="${paleta.sombra}" flood-opacity="${paleta.opacidadSombra}"/></filter>` +
    '</defs>' +
    '<g clip-path="url(#marco)">' +
    `<rect width="${ANCHO}" height="${ALTO}" fill="${paleta.fondo}"/>` +
    `<rect x="${PANEL_X}" width="${ANCHO - PANEL_X}" height="${ALTO}" fill="${paleta.panel}"/>` +
    `<rect x="${PANEL_X}" width="${ANCHO - PANEL_X}" height="${ALTO}" fill="url(#reticula)"/>` +
    `<path d="M${PANEL_X} 0V${ALTO}" stroke="${paleta.borde}" stroke-width="1.5"/>` +
    `<path d="${aristas}" stroke="${paleta.borde}" stroke-width="2" fill="none"/>` +
    `<path d="${aristas}" class="flujo" stroke="${paleta.acento}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.8"/>` +
    tilesSvg +
    `<circle cx="${centro.x}" cy="${centro.y}" r="76" fill="none" stroke="${paleta.acento}" stroke-width="2" class="latido"/>` +
    `<circle cx="${centro.x}" cy="${centro.y}" r="66" fill="${paleta.panel}" stroke="${paleta.acento}" stroke-width="4" filter="url(#sombra)"/>` +
    `<image href="${fotoDataUri()}" x="${centro.x - 60}" y="${centro.y - 60}" width="120" height="120" clip-path="url(#foto)" preserveAspectRatio="xMidYMid slice"/>` +
    eyebrow +
    `<text x="78" y="160" class="titulo" fill="${paleta.texto}">${escapar(perfil.lema[idioma][0])}</text>` +
    `<text x="78" y="222" class="titulo" fill="${paleta.acento}">${escapar(perfil.lema[idioma][1])}</text>` +
    `<rect x="80" y="282" width="48" height="4" rx="2" fill="${paleta.acento}"/>` +
    `<text x="80" y="322" class="nombre">${escapar(perfil.nombre)}</text>` +
    `<text x="80" y="352" class="mono" style="letter-spacing:0">${escapar(host)}</text>` +
    `<circle cx="${80 + anchoHost + 14}" cy="346" r="3" fill="${paleta.tenue}"/>` +
    `<text x="${80 + anchoHost + 28}" y="352" class="tenue">${escapar(perfil.ubicacion[idioma])}</text>` +
    '</g>' +
    `<rect x="0.75" y="0.75" width="${ANCHO - 1.5}" height="${ALTO - 1.5}" rx="23.5" fill="none" stroke="${paleta.borde}" stroke-width="1.5"/>`;

  return documentoSvg({
    ancho: ANCHO,
    alto: ALTO,
    titulo: `${perfil.nombre}. ${perfil.lema[idioma].join(' ')}`,
    estilos,
    contenido,
  });
}
