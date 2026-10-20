import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));

export const iconos = JSON.parse(readFileSync(`${raiz}iconos.json`, 'utf8'));

export const fuenteSistema =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";

export function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Un SVG servido como <img> no descarga recursos externos, por eso fuentes
// y foto viajan incrustadas en base64.
export function fuentesCss(fuentes) {
  return fuentes
    .map(({ familia, archivo, peso = 400, estilo = 'normal' }) => {
      const datos = readFileSync(`${raiz}fuentes/${archivo}`).toString('base64');
      return `@font-face{font-family:'${familia}';font-weight:${peso};font-style:${estilo};` +
        `src:url(data:font/woff2;base64,${datos}) format('woff2');}`;
    })
    .join('');
}

export function fotoDataUri() {
  return `data:image/jpeg;base64,${readFileSync(`${raiz}foto.jpg`).toString('base64')}`;
}

export function icono(slug, { x, y, tam, color, colorSigla = '#fff' }) {
  const datos = iconos[slug];
  if (!datos) throw new Error(`Tecnología sin ícono en iconos.json: ${slug}`);
  const relleno = color ?? `#${datos.color}`;
  if (datos.path) {
    return `<svg x="${x}" y="${y}" width="${tam}" height="${tam}" viewBox="0 0 24 24">` +
      `<path fill="${relleno}" d="${datos.path}"/></svg>`;
  }
  const fuente = datos.sigla.length > 2 ? tam * 0.36 : tam * 0.5;
  return `<g><rect x="${x}" y="${y}" width="${tam}" height="${tam}" rx="${tam * 0.22}" fill="${relleno}"/>` +
    `<text x="${x + tam / 2}" y="${y + tam / 2}" dy="0.35em" text-anchor="middle" ` +
    `font-family="${fuenteSistema}" font-weight="700" font-size="${fuente}" fill="${colorSigla}">` +
    `${escapar(datos.sigla)}</text></g>`;
}

export function tituloTecnologia(slug) {
  const datos = iconos[slug];
  if (!datos) throw new Error(`Tecnología sin ícono en iconos.json: ${slug}`);
  return datos.titulo;
}

export function luminancia(hex) {
  const [r, g, b] = hex.replace('#', '').match(/../g).map((c) => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// El color de marca se usa si llega a 3:1 sobre el fondo (WCAG 1.4.11).
export function colorVisible(slug, fondo, alternativo) {
  const datos = iconos[slug];
  const marca = `#${datos.color}`;
  const contraste = (Math.max(luminancia(marca), luminancia(fondo)) + 0.05) /
    (Math.min(luminancia(marca), luminancia(fondo)) + 0.05);
  return contraste < 3 ? alternativo : marca;
}

// Un SVG no puede medir texto al generarse, así que se estima con el ancho
// típico de cada letra en una sans geométrica, con margen de seguridad.
const ANCHO_LETRA = [
  [/[ijlI.,:;'|!]/, 0.3],
  [/[ frt]/, 0.38],
  [/[mw]/, 0.88],
  [/[MW]/, 0.98],
  [/[A-Z]/, 0.72],
  [/[0-9]/, 0.6],
  [/[a-z]/, 0.58],
];

export function anchoTexto(texto, tamFuente, espaciado = 0) {
  const ems = [...String(texto)].reduce((total, letra) => {
    const sinTilde = letra.normalize('NFD')[0];
    const regla = ANCHO_LETRA.find(([patron]) => patron.test(sinTilde));
    return total + (regla ? regla[1] : 0.65);
  }, 0);
  return (ems * tamFuente + String(texto).length * espaciado) * 1.08;
}

export function partirPorAncho(texto, tamFuente, anchoMaximo, espaciado = 0) {
  const lineas = [];
  let actual = '';
  for (const palabra of String(texto).split(/\s+/)) {
    const candidata = actual ? `${actual} ${palabra}` : palabra;
    if (actual && anchoTexto(candidata, tamFuente, espaciado) > anchoMaximo) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = candidata;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

export function partirLineas(texto, maxCaracteres) {
  const lineas = [];
  let actual = '';
  for (const palabra of String(texto).split(/\s+/)) {
    if ((actual + ' ' + palabra).trim().length > maxCaracteres && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = (actual + ' ' + palabra).trim();
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

export function documentoSvg({ ancho, alto, titulo, estilos = '', contenido }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" ` +
    `viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="${escapar(titulo)}">` +
    `<title>${escapar(titulo)}</title>` +
    (estilos ? `<style>${estilos}</style>` : '') +
    contenido +
    '</svg>\n';
}
