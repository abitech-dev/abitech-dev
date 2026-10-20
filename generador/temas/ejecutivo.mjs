import {
  cuadricula, enlacesTexto, imagenActividad, imagenAdaptable, bloquePresentacion, llamadoFinal, nombresTecnologias,
  selectorIdioma,
} from '../markdown.mjs';
import { bannerEditorial } from '../svg/banner-editorial.mjs';
import { tarjetasIniciativas, tarjetasProyectos } from '../tarjetas.mjs';

function celda(texto) {
  return String(texto).replace(/\|/g, '\\|');
}

function lineaCifras({ perfil, idioma }) {
  const cifras = perfil.cifras.map(({ valor, etiqueta }) => `<b>${valor}</b> ${etiqueta[idioma]}`);
  return `<p align="center">${cifras.join(' &emsp;&emsp; ')}</p>`;
}

function tablaCompetencias({ perfil, idioma, t }) {
  const filas = perfil.stack.map((grupo) =>
    `| **${celda(grupo.categoria[idioma])}** | ${celda(nombresTecnologias(grupo.tecnologias).join(', '))} |`);
  return [`| ${t.area} | ${t.tecnologias} |`, '|:--|:--|', ...filas].join('\n');
}

function readme(ctx) {
  const { perfil, idioma, t, github } = ctx;
  return [
    '<div align="center">',
    '',
    imagenAdaptable(idioma, 'banner', `${perfil.nombre}. ${perfil.lema[idioma].join(' ')}`, 'width="100%"'),
    '',
    selectorIdioma(t),
    '',
    '</div>',
    '',
    bloquePresentacion(ctx),
    '',
    lineaCifras(ctx),
    '',
    `## ${t.loQueHago}`,
    '',
    cuadricula(idioma, tarjetasIniciativas(ctx), '24%'),
    '',
    `## ${t.proyectos}`,
    '',
    cuadricula(idioma, tarjetasProyectos(ctx), '100%'),
    '',
    `## ${t.codigo}`,
    '',
    ...perfil.repositorios.map(({ repo, descripcion }) =>
      `- [**${repo.split('/')[1]}**](https://github.com/${repo}) &nbsp;${descripcion[idioma]}`),
    '',
    `## ${t.competencias}`,
    '',
    tablaCompetencias(ctx),
    '',
    ...(github ? [`## ${t.actividad}`, '', imagenActividad(ctx), ''] : []),
    `## ${t.contacto}`,
    '',
    llamadoFinal(t, perfil),
    '',
    `<p align="center">${enlacesTexto(ctx)}</p>`,
    '',
  ].join('\n');
}

export const ejecutivo = {
  id: 'ejecutivo',
  fuentes: [
    { familia: 'Fraunces', archivo: 'fraunces-latin-600-normal.woff2', peso: 600 },
    { familia: 'Fraunces', archivo: 'fraunces-latin-400-italic.woff2', peso: 400, estilo: 'italic' },
    { familia: 'Plus Jakarta Sans', archivo: 'plus-jakarta-sans-latin-500-normal.woff2', peso: 500 },
  ],
  tarjetas: {
    texto: { familia: 'Plus Jakarta Sans', archivo: 'plus-jakarta-sans-latin-500-normal.woff2', peso: 500 },
    titulo: { familia: 'Fraunces', archivo: 'fraunces-latin-600-normal.woff2', peso: 600 },
  },
  paletas: {
    oscuro: {
      fondo: '#14110E', panel: '#1C1814', borde: '#3A3129', texto: '#F4EEE5', tenue: '#A99C8D',
      acento: '#D4AF37', acento2: '#C0626D',
    },
    claro: {
      fondo: '#FBF8F2', panel: '#FFFFFF', borde: '#E6DDCF', texto: '#1F1A15', tenue: '#6B6157',
      acento: '#856717', acento2: '#7A1F2B',
    },
  },
  banner: bannerEditorial,
  readme,
};
