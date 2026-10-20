import { documentoSvg, escapar, fuentesCss } from './comun.mjs';

const ANCHO = 1256;
const ALTO = 236;
const CELDA = 13;
const PASO = 16;
const NIVELES = { NONE: 0, FIRST_QUARTILE: 0.35, SECOND_QUARTILE: 0.55, THIRD_QUARTILE: 0.78, FOURTH_QUARTILE: 1 };

const textos = {
  es: {
    titulo: 'ÚLTIMOS 12 MESES',
    periodo: 'en los últimos 12 meses',
    y: 'y',
    contribuciones: 'contribuciones',
    privadas: 'en proyectos privados',
    diasActivos: 'días con actividad',
    racha: 'días de racha máxima',
    menos: 'Menos',
    mas: 'Más',
    actualizado: 'Actualizado el',
    meses: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    locale: 'es-PE',
  },
  en: {
    titulo: 'LAST 12 MONTHS',
    periodo: 'in the last 12 months',
    y: 'and',
    contribuciones: 'contributions',
    privadas: 'in private projects',
    diasActivos: 'active days',
    racha: 'day longest streak',
    menos: 'Less',
    mas: 'More',
    actualizado: 'Updated on',
    meses: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    locale: 'en-US',
  },
};

export function diasActivos(semanas) {
  return semanas.flat().filter((dia) => dia.cantidad > 0).length;
}

export function rachaMaxima(semanas) {
  let maxima = 0;
  let actual = 0;
  for (const dia of semanas.flat()) {
    actual = dia.cantidad > 0 ? actual + 1 : 0;
    maxima = Math.max(maxima, actual);
  }
  return maxima;
}

export function resumenActividad({ github, idioma }) {
  const t = textos[idioma];
  const formato = new Intl.NumberFormat(t.locale);
  const { contribuciones } = github;
  return `${formato.format(contribuciones.total)} ${t.contribuciones} ${t.periodo}, ` +
    `${formato.format(contribuciones.privadas)} ${t.privadas}, ${diasActivos(contribuciones.semanas)} ${t.diasActivos} ` +
    `${t.y} ${rachaMaxima(contribuciones.semanas)} ${t.racha}`;
}

export function panelActividad({ github, idioma, paleta, fuente, fuenteNumeros }) {
  const t = textos[idioma];
  const formato = new Intl.NumberFormat(t.locale);
  const { contribuciones } = github;
  const indicadores = [
    [contribuciones.total, t.contribuciones],
    [contribuciones.privadas, t.privadas],
    [diasActivos(contribuciones.semanas), t.diasActivos],
    [rachaMaxima(contribuciones.semanas), t.racha],
  ];

  const indicadoresSvg = indicadores.map(([valor, etiqueta], i) => {
    const x = 36 + (i % 2) * 160;
    const y = 104 + Math.floor(i / 2) * 82;
    return `<text x="${x}" y="${y}" class="numero">${formato.format(valor)}</text>` +
      `<text x="${x}" y="${y + 24}" class="etiqueta">${escapar(etiqueta)}</text>`;
  }).join('');

  const x0 = ANCHO - 36 - contribuciones.semanas.length * PASO + (PASO - CELDA);
  const y0 = 62;
  let mesAnterior = -1;
  const meses = [];
  const celdas = contribuciones.semanas.map((semana, columna) => {
    const mes = new Date(`${semana[0].fecha}T00:00:00Z`).getUTCMonth();
    if (mes !== mesAnterior && columna < contribuciones.semanas.length - 2) {
      meses.push(`<text x="${x0 + columna * PASO}" y="${y0 - 12}" class="etiqueta">${t.meses[mes]}</text>`);
      mesAnterior = mes;
    }
    return semana.map((dia) => {
      const fila = new Date(`${dia.fecha}T00:00:00Z`).getUTCDay();
      const opacidad = NIVELES[dia.nivel];
      const relleno = opacidad === 0
        ? `fill="${paleta.borde}"`
        : `fill="${paleta.acento}" fill-opacity="${opacidad}"`;
      return `<rect x="${x0 + columna * PASO}" y="${y0 + fila * PASO}" width="${CELDA}" height="${CELDA}" rx="3" ${relleno} ` +
        `class="celda" style="animation-delay:${(columna * 0.012).toFixed(3)}s"><title>${dia.fecha}: ${dia.cantidad}</title></rect>`;
    }).join('');
  }).join('');

  const leyenda = Object.values(NIVELES).map((opacidad, i) => {
    const relleno = opacidad === 0 ? `fill="${paleta.borde}"` : `fill="${paleta.acento}" fill-opacity="${opacidad}"`;
    return `<rect x="${ANCHO - 36 - 5 * PASO + i * PASO + 3}" y="${ALTO - 44}" width="${CELDA}" height="${CELDA}" rx="3" ${relleno}/>`;
  }).join('');

  const fecha = new Intl.DateTimeFormat(t.locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Lima' })
    .format(new Date(github.generado));

  const estilos = fuentesCss([fuente, fuenteNumeros]) +
    `.numero{font-family:'${fuenteNumeros.familia}';font-weight:${fuenteNumeros.peso};font-size:34px;fill:${paleta.texto}}` +
    `.etiqueta{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:14px;fill:${paleta.tenue}}` +
    `.titulo{font-family:'${fuente.familia}';font-weight:${fuente.peso};font-size:13px;letter-spacing:2px;fill:${paleta.acento}}` +
    '.celda{animation:aparecer .5s ease-out backwards}' +
    '@keyframes aparecer{from{opacity:0}}' +
    '@media (prefers-reduced-motion:reduce){.celda{animation:none}}';

  const contenido =
    `<rect x="0.5" y="0.5" width="${ANCHO - 1}" height="${ALTO - 1}" rx="18" fill="${paleta.fondo}" stroke="${paleta.borde}"/>` +
    `<text x="36" y="50" class="titulo">${t.titulo}</text>` +
    indicadoresSvg +
    meses.join('') +
    celdas +
    `<text x="${x0}" y="${ALTO - 33}" class="etiqueta">${t.actualizado} ${escapar(fecha)}</text>` +
    `<text x="${ANCHO - 36 - 5 * PASO - 8}" y="${ALTO - 33}" class="etiqueta" text-anchor="end">${t.menos}</text>` +
    leyenda +
    `<text x="${ANCHO - 36 + 6}" y="${ALTO - 33}" class="etiqueta">${t.mas}</text>`;

  return documentoSvg({
    ancho: ANCHO,
    alto: ALTO,
    titulo: `${formato.format(contribuciones.total)} ${t.contribuciones}`,
    estilos,
    contenido,
  });
}
