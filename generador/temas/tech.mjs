import {
  cuadricula, filaBotones, imagenActividad, imagenAdaptable, lineaExperiencia, llamadoFinal, nombresTecnologias,
  selectorIdioma, textoStack,
} from '../markdown.mjs';
import { bannerTerminal } from '../svg/banner-terminal.mjs';
import { tarjetasIniciativas, tarjetasProyectos, tarjetasRepositorios } from '../tarjetas.mjs';

function cadena(texto) {
  return `'${String(texto).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function bloqueCodigo({ perfil, idioma, t }) {
  const claves = t.codigoClaves;
  const roles = perfil.roles[idioma].map(cadena).join(', ');
  const stack = nombresTecnologias(perfil.destacadas.slice(0, 6)).map(cadena).join(', ');
  return [
    '```js',
    `// ${perfil.presentacion.titular[idioma]}`,
    `const ${perfil.nombreCorto.split(' ')[0].toLowerCase()} = {`,
    `  ${claves.roles}: [${roles}],`,
    `  ${claves.base}: ${cadena(perfil.ubicacion[idioma])},`,
    `  ${claves.stack}: [${stack}],`,
    `  ${claves.disponible}: true,`,
    '};',
    '```',
  ].join('\n');
}

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
    bloqueCodigo(ctx),
    '',
    `<sub>${lineaExperiencia(ctx)}</sub>`,
    '',
    `## ${t.loQueHago}`,
    '',
    cuadricula(idioma, tarjetasIniciativas(ctx), '24%'),
    '',
    `## ${t.tecnologias}`,
    '',
    imagenAdaptable(idioma, 'stack', textoStack(ctx), 'width="100%"'),
    '',
    `## ${t.proyectos}`,
    '',
    cuadricula(idioma, tarjetasProyectos(ctx), '100%'),
    '',
    `## ${t.codigo}`,
    '',
    cuadricula(idioma, tarjetasRepositorios(ctx)),
    '',
    ...(github ? [`## ${t.actividad}`, '', imagenActividad(ctx), ''] : []),
    llamadoFinal(t, perfil),
    '',
  ].join('\n');
}

const terminal = {
  fondo: '#0C0F14', borde: '#262C38', texto: '#E6EAF2', tenue: '#7D8699', acento: '#A3E635', acento2: '#C4B5FD',
};

export const tech = {
  id: 'tech',
  fuentes: [
    { familia: 'Space Grotesk', archivo: 'space-grotesk-latin-700-normal.woff2', peso: 700 },
    { familia: 'JetBrains Mono', archivo: 'jetbrains-mono-latin-500-normal.woff2', peso: 500 },
    { familia: 'JetBrains Mono', archivo: 'jetbrains-mono-latin-400-normal.woff2', peso: 400 },
  ],
  tarjetas: {
    texto: { familia: 'Space Grotesk', archivo: 'space-grotesk-latin-500-normal.woff2', peso: 500 },
    titulo: { familia: 'Space Grotesk', archivo: 'space-grotesk-latin-700-normal.woff2', peso: 700 },
  },
  paletas: {
    oscuro: {
      fondo: '#06080C', panel: '#0E1218', borde: '#222833', texto: '#F1F4F9', tenue: '#8A93A6',
      acento: '#A3E635', acento2: '#A78BFA', opacidadSombra: 0.6, terminal,
    },
    claro: {
      fondo: '#F6F6F2', panel: '#FFFFFF', borde: '#DEDED6', texto: '#0E1218', tenue: '#5B6170',
      acento: '#4D7C0F', acento2: '#7C3AED', opacidadSombra: 0.22, terminal,
    },
  },
  banner: bannerTerminal,
  readme,
};
