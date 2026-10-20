import { documentoSvg, escapar, fuentesCss, partirLineas } from './comun.mjs';

const ANCHO = 620;
const ALTO = 176;

// Íconos de Octicons (MIT) en su caja de 16 px.
const OCTICONS = {
  repo: 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z',
  estrella: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z',
  fork: 'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z',
  enlace: 'm7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z',
};

function octicon(nombre, x, y, color, tam = 16) {
  return `<svg x="${x}" y="${y}" width="${tam}" height="${tam}" viewBox="0 0 16 16"><path fill="${color}" d="${OCTICONS[nombre]}"/></svg>`;
}

export function tarjetaRepositorio({ repositorio, datos, idioma, paleta, fuente, fuenteTitulo }) {
  const [propietario, nombre] = repositorio.repo.split('/');
  const lineas = partirLineas(repositorio.descripcion[idioma], 50).slice(0, 2);

  let x = 28;
  const yPie = 148;
  const pie = [];
  if (datos.lenguaje) {
    pie.push(`<circle cx="${x + 7}" cy="${yPie - 6}" r="7" fill="${datos.lenguaje.color}"/>`);
    pie.push(`<text x="${x + 22}" y="${yPie}" class="dato">${escapar(datos.lenguaje.nombre)}</text>`);
    x += 40 + datos.lenguaje.nombre.length * 9.5;
  }
  pie.push(octicon('estrella', x, yPie - 15, paleta.tenue, 18));
  pie.push(`<text x="${x + 24}" y="${yPie}" class="dato">${datos.estrellas}</text>`);
  x += 60;
  pie.push(octicon('fork', x, yPie - 15, paleta.tenue, 18));
  pie.push(`<text x="${x + 24}" y="${yPie}" class="dato">${datos.forks}</text>`);
  if (datos.sitio) {
    x += 60;
    pie.push(octicon('enlace', x, yPie - 15, paleta.acento, 18));
    pie.push(`<text x="${x + 24}" y="${yPie}" class="dato" fill="${paleta.acento}">${escapar(new URL(datos.sitio).host)}</text>`);
  }

  const estilos = fuentesCss([fuente, fuenteTitulo]) +
    `.repo{font-family:'${fuenteTitulo.familia}';font-weight:${fuenteTitulo.peso};font-size:23px}` +
    `.desc{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:19px;fill:${paleta.texto};opacity:.85}` +
    `.dato{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:17px;fill:${paleta.tenue}}`;

  const contenido =
    `<rect x="0.5" y="0.5" width="${ANCHO - 1}" height="${ALTO - 1}" rx="14" fill="${paleta.fondo}" stroke="${paleta.borde}"/>` +
    octicon('repo', 28, 26, paleta.tenue, 22) +
    `<text x="62" y="45" class="repo"><tspan fill="${paleta.tenue}">${escapar(propietario)} / </tspan>` +
    `<tspan fill="${paleta.acento}">${escapar(nombre)}</tspan></text>` +
    lineas.map((linea, i) => `<text x="28" y="${84 + i * 26}" class="desc">${escapar(linea)}</text>`).join('') +
    pie.join('');

  return documentoSvg({ ancho: ANCHO, alto: ALTO, titulo: `${repositorio.repo}. ${repositorio.descripcion[idioma]}`, estilos, contenido });
}
