import assert from 'node:assert/strict';
import { test } from 'node:test';
import { temaDeLaSemana } from '../generador/rotacion.mjs';

const temas = ['corporativo', 'tech', 'ejecutivo'];
const dia = 86400000;

test('el tema se mantiene durante toda la semana', () => {
  const lunes = new Date(Date.UTC(2026, 9, 19));
  const vistos = new Set(Array.from({ length: 7 }, (_, i) => temaDeLaSemana(temas, new Date(lunes.getTime() + i * dia))));
  assert.equal(vistos.size, 1);
});

test('en tres semanas seguidas aparecen los tres temas', () => {
  const lunes = Date.UTC(2026, 9, 19);
  const vistos = new Set([0, 7, 14].map((d) => temaDeLaSemana(temas, new Date(lunes + d * dia))));
  assert.deepEqual([...vistos].sort(), [...temas].sort());
});

test('con un solo tema en la lista el perfil queda fijo', () => {
  assert.equal(temaDeLaSemana(['ejecutivo'], new Date()), 'ejecutivo');
});

test('una lista vacía de temas es un error de configuración', () => {
  assert.throws(() => temaDeLaSemana([], new Date()), /no declara temas/);
});
