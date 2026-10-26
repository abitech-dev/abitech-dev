import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { cargarPerfil, validarPerfil } from '../generador/validar.mjs';
import { perfil } from './fixture.mjs';

test('un perfil válido pasa la validación', () => {
  assert.doesNotThrow(() => validarPerfil(perfil));
});

test('falla si falta un campo obligatorio', () => {
  const invalido = { ...perfil };
  delete invalido.presentacion;
  assert.throws(() => validarPerfil(invalido), /presentacion: campo obligatorio ausente/);
});

test('falla si un texto bilingüe no tiene las claves es y en', () => {
  const invalido = {
    ...perfil,
    presentacion: { ...perfil.presentacion, titular: { es: 'Solo español' } },
  };
  assert.throws(() => validarPerfil(invalido), /perfil\.presentacion\.titular: falta la clave "en"/);
});

test('falla si una tecnología no existe en iconos.json', () => {
  const invalido = { ...perfil, destacadas: [...perfil.destacadas, 'tecnologia-inexistente'] };
  assert.throws(() => validarPerfil(invalido), /destacadas\[\d+\]: la tecnología "tecnologia-inexistente" no existe en iconos\.json/);
});

test('falla si hay enlaces mal formados', () => {
  const invalido = { ...perfil, sitio: 'nota-url' };
  assert.throws(() => validarPerfil(invalido), /sitio: URL inválida/);
});

test('falla si hay temas que no existen', () => {
  const invalido = { ...perfil, temas: [...perfil.temas, 'neon'] };
  assert.throws(() => validarPerfil(invalido), /tema inexistente "neon"/);
});

test('falla con mensaje claro cuando el JSON es inválido', () => {
  const dir = mkdtempSync(join(tmpdir(), 'perfil-json-'));
  const ruta = join(dir, 'perfil.json');
  writeFileSync(ruta, '{"usuario":');
  assert.throws(() => cargarPerfil(ruta), /JSON inválido en .*perfil\.json/);
  rmSync(dir, { recursive: true, force: true });
});
