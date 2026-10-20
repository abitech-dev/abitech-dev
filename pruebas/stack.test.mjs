import assert from 'node:assert/strict';
import { test } from 'node:test';
import { anchoTexto, iconos } from '../generador/svg/comun.mjs';
import { panelStack } from '../generador/svg/stack.mjs';
import { corporativo } from '../generador/temas/corporativo.mjs';
import { perfil } from './fixture.mjs';

const fuente = corporativo.tarjetas.texto;
const paleta = corporativo.paletas.oscuro;

function casillas(svg) {
  return [...svg.matchAll(/<g class="chip"[^>]*><rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"/g)]
    .map(([, x, y, ancho]) => ({ x: Number(x), y: Number(y), ancho: Number(ancho) }));
}

test('ninguna casilla del stack se sale del panel aunque una categoría crezca', () => {
  const todas = Object.keys(iconos);
  const grande = { ...perfil, stack: [{ categoria: { es: 'Todo', en: 'All' }, tecnologias: todas }, ...perfil.stack] };
  const svg = panelStack({ perfil: grande, idioma: 'es', paleta, fuente });
  const anchoPanel = Number(svg.match(/width="([\d.]+)"/)[1]);
  const altoPanel = Number(svg.match(/height="([\d.]+)"/)[1]);
  for (const { x, y, ancho } of casillas(svg)) {
    assert.ok(x + ancho <= anchoPanel - 20, `Casilla en x=${x} se sale del panel`);
    assert.ok(y + 46 <= altoPanel - 20, `Casilla en y=${y} se sale del panel`);
  }
});

test('cada casilla es más ancha que su nombre', () => {
  const svg = panelStack({ perfil, idioma: 'es', paleta, fuente });
  const nombres = [...svg.matchAll(/class="tec">([^<]+)</g)].map(([, nombre]) => nombre.replace(/&amp;/g, '&'));
  casillas(svg).forEach(({ ancho }, i) => {
    assert.ok(ancho >= anchoTexto(nombres[i], 15) + 45 + 12, `${nombres[i]} no cabe en su casilla`);
  });
});
