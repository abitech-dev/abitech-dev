import {
  cuadricula, filaBotones, imagenActividad, imagenAdaptable, bloquePresentacion, llamadoFinal, selectorIdioma,
  textoCifras, textoStack,
} from '../markdown.mjs';
import { bannerRed } from '../svg/banner-red.mjs';
import { tarjetasIniciativas, tarjetasProyectos, tarjetasRepositorios } from '../tarjetas.mjs';

function readme(ctx) {
  const { perfil, idioma, t, github } = ctx;
  return [
    '<div align="center">',
    '',
    imagenAdaptable(idioma, 'banner', `${perfil.nombre}. ${perfil.lema[idioma].join(' ')}`, 'width="100%"'),
    '',
    filaBotones(ctx),
    '',
    selectorIdioma(t),
    '',
    '</div>',
    '',
    bloquePresentacion(ctx),
    '',
    imagenAdaptable(idioma, 'cifras', textoCifras(ctx), 'width="100%"'),
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
    cuadricula(idioma, tarjetasRepositorios(ctx)),
    '',
    `## ${t.tecnologias}`,
    '',
    imagenAdaptable(idioma, 'stack', textoStack(ctx), 'width="100%"'),
    '',
    ...(github ? [`## ${t.actividad}`, '', imagenActividad(ctx), ''] : []),
    llamadoFinal(t, perfil),
    '',
  ].join('\n');
}

export const corporativo = {
  id: 'corporativo',
  fuentes: [
    { familia: 'Plus Jakarta Sans', archivo: 'plus-jakarta-sans-latin-800-normal.woff2', peso: 800 },
    { familia: 'Plus Jakarta Sans', archivo: 'plus-jakarta-sans-latin-700-normal.woff2', peso: 700 },
    { familia: 'JetBrains Mono', archivo: 'jetbrains-mono-latin-500-normal.woff2', peso: 500 },
    { familia: 'Plus Jakarta Sans', archivo: 'plus-jakarta-sans-latin-500-normal.woff2', peso: 500 },
  ],
  tarjetas: {
    texto: { familia: 'Plus Jakarta Sans', archivo: 'plus-jakarta-sans-latin-500-normal.woff2', peso: 500 },
    titulo: { familia: 'Plus Jakarta Sans', archivo: 'plus-jakarta-sans-latin-700-normal.woff2', peso: 700 },
  },
  paletas: {
    oscuro: {
      fondo: '#111317', panel: '#181B20', borde: '#2B2F36', texto: '#F2F4F7', tenue: '#9BA3AE',
      acento: '#4DA3FF', acento2: '#F2B417', sombra: '#000000', opacidadSombra: 0.4,
    },
    claro: {
      fondo: '#FFFFFF', panel: '#F4F5F7', borde: '#E3E5EA', texto: '#0F1115', tenue: '#5B6270',
      acento: '#1A6FD6', acento2: '#F2B417', sombra: '#0F1115', opacidadSombra: 0.1,
    },
  },
  banner: bannerRed,
  readme,
};
