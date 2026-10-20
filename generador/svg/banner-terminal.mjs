import { documentoSvg, escapar, fotoDataUri, fuentesCss, tituloTecnologia } from './comun.mjs';

const ANCHO = 1600;
const ALTO = 400;
const MONO_AVANCE = 0.6;
const TAM_TERMINAL = 18;

const comandos = {
  es: { despliegue: '$ deploy --env=produccion', sistemas: 'sistemas en producción' },
  en: { despliegue: '$ deploy --env=production', sistemas: 'systems in production' },
};

function lineasTerminal(perfil, idioma) {
  const textos = comandos[idioma];
  const stack = perfil.destacadas.slice(0, 6).map((slug) => tituloTecnologia(slug).toLowerCase()).join('  ');
  const sistemas = perfil.cifras[1].valor;
  return [
    { texto: '$ whoami', tipo: 'comando' },
    { texto: `${perfil.nombreCorto.toLowerCase()}, ${perfil.roles[idioma][1].toLowerCase()}`, tipo: 'salida' },
    { texto: '$ cat stack.txt', tipo: 'comando' },
    { texto: stack, tipo: 'resaltado' },
    { texto: textos.despliegue, tipo: 'comando' },
    { texto: `✓ ${sistemas} ${textos.sistemas}`, tipo: 'exito' },
  ];
}

export function bannerTerminal({ perfil, idioma, paleta, fuentes }) {
  const terminal = { x: 990, y: 46, ancho: 560, alto: 308 };
  const lineas = lineasTerminal(perfil, idioma);
  const colores = {
    comando: paleta.terminal.texto,
    salida: paleta.terminal.tenue,
    resaltado: paleta.terminal.acento2,
    exito: paleta.terminal.acento,
  };

  // El ancho final es el valor base del clip. Sin animación el texto queda
  // completo y nunca se ve una terminal vacía.
  let inicio = 0.4;
  const lineasSvg = lineas.map((linea, i) => {
    const y = terminal.y + 82 + i * 30;
    const ancho = linea.texto.length * TAM_TERMINAL * MONO_AVANCE + 4;
    const esComando = linea.tipo === 'comando';
    const duracion = esComando ? linea.texto.length * 0.045 : 0.05;
    const pasos = esComando ? linea.texto.length : 1;
    const animacion = `animation:escribir ${duracion.toFixed(2)}s steps(${pasos}) ${inicio.toFixed(2)}s backwards`;
    inicio += duracion + (esComando ? 0.25 : 0.35);
    return `<clipPath id="l${i}"><rect x="${terminal.x + 28}" y="${y - 22}" width="${ancho.toFixed(1)}" height="30" ` +
      `style="${animacion}"/></clipPath>` +
      `<text x="${terminal.x + 28}" y="${y}" class="mono" fill="${colores[linea.tipo]}" clip-path="url(#l${i})">${escapar(linea.texto)}</text>`;
  }).join('');
  const yCursor = terminal.y + 82 + lineas.length * 30;

  const roles = perfil.roles[idioma];
  const host = new URL(perfil.sitio).host;

  const estilos = fuentesCss(fuentes) +
    `.titulo{font-family:'${fuentes[0].familia}';font-weight:700;font-size:50px;letter-spacing:-1.2px}` +
    `.nombre{font-family:'${fuentes[0].familia}';font-weight:700;font-size:26px;fill:${paleta.texto}}` +
    `.mono{font-family:'${fuentes[1].familia}';font-weight:500;font-size:${TAM_TERMINAL}px;font-variant-ligatures:none}` +
    `.chico{font-family:'${fuentes[1].familia}';font-weight:400;font-size:16px}` +
    // El cursor deja de parpadear antes de 5 s, como pide WCAG 2.2.2.
    '.cursor{animation:parpadeo 1.1s steps(1) 4}' +
    '@keyframes parpadeo{50%{opacity:0}}' +
    '@keyframes escribir{from{width:0}}' +
    '@media (prefers-reduced-motion:reduce){*{animation:none!important}}';

  const contenido =
    '<defs>' +
    `<clipPath id="marco"><rect width="${ANCHO}" height="${ALTO}" rx="24"/></clipPath>` +
    '<clipPath id="foto"><rect x="80" y="276" width="80" height="80" rx="18"/></clipPath>' +
    `<pattern id="puntos" width="28" height="28" patternUnits="userSpaceOnUse">` +
    `<circle cx="2" cy="2" r="1.3" fill="${paleta.borde}"/></pattern>` +
    `<filter id="sombra" x="-20%" y="-20%" width="140%" height="140%">` +
    `<feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000" flood-opacity="${paleta.opacidadSombra}"/></filter>` +
    '</defs>' +
    '<g clip-path="url(#marco)">' +
    `<rect width="${ANCHO}" height="${ALTO}" fill="${paleta.fondo}"/>` +
    `<rect width="${ANCHO}" height="${ALTO}" fill="url(#puntos)"/>` +
    `<text x="80" y="92" class="mono" fill="${paleta.acento}">&gt; ${escapar(roles.slice(0, 2).join(' + ').toLowerCase())}</text>` +
    `<text x="77" y="164" class="titulo" fill="${paleta.texto}">${escapar(perfil.lema[idioma][0])}</text>` +
    `<text x="77" y="226" class="titulo" fill="${paleta.texto}">${escapar(perfil.lema[idioma][1])}` +
    `<tspan fill="${paleta.acento}" class="cursor">_</tspan></text>` +
    `<rect x="76" y="272" width="88" height="88" rx="21" fill="none" stroke="${paleta.acento}" stroke-width="2"/>` +
    `<image href="${fotoDataUri()}" x="80" y="276" width="80" height="80" clip-path="url(#foto)" preserveAspectRatio="xMidYMid slice"/>` +
    `<text x="186" y="310" class="nombre">${escapar(perfil.nombre)}</text>` +
    `<text x="186" y="342" class="chico" fill="${paleta.tenue}">${escapar(host)}  /  ${escapar(perfil.ubicacion[idioma])}</text>` +
    `<g filter="url(#sombra)"><rect x="${terminal.x}" y="${terminal.y}" width="${terminal.ancho}" height="${terminal.alto}" rx="16" ` +
    `fill="${paleta.terminal.fondo}" stroke="${paleta.terminal.borde}" stroke-width="1.5"/></g>` +
    `<path d="M${terminal.x} ${terminal.y + 44}h${terminal.ancho}" stroke="${paleta.terminal.borde}" stroke-width="1.5"/>` +
    ['#FF5F57', '#FEBC2E', '#28C840'].map((color, i) =>
      `<circle cx="${terminal.x + 26 + i * 22}" cy="${terminal.y + 22}" r="6.5" fill="${color}"/>`).join('') +
    `<text x="${terminal.x + terminal.ancho / 2}" y="${terminal.y + 28}" text-anchor="middle" class="chico" fill="${paleta.terminal.tenue}">` +
    `${escapar(perfil.usuario)}@abitech: ~</text>` +
    lineasSvg +
    `<text x="${terminal.x + 28}" y="${yCursor}" class="mono" fill="${paleta.terminal.texto}">$ ` +
    `<tspan class="cursor" fill="${paleta.terminal.acento}">▍</tspan></text>` +
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
