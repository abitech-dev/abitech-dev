import assert from 'node:assert/strict';
import { test } from 'node:test';
import { construirPerfil } from '../generador/construir.mjs';
import { perfilConTrayectoria } from '../generador/trayectoria.mjs';
import { validarPerfil } from '../generador/validar.mjs';
import { blog, github, perfilBase, resumes } from './fixture.mjs';

const perfil = perfilConTrayectoria(perfilBase, resumes);

test('los hechos del perfil salen del resume.json del sitio', () => {
  assert.equal(perfil.nombre, 'Ana Perez Rojas');
  assert.equal(perfil.nombreCorto, 'Ana Perez');
  assert.equal(perfil.presentacion.titular.es, 'Desarrolladora full stack');
  assert.equal(perfil.presentacion.detalle.en, 'Full stack developer with three years.');
  assert.equal(perfil.experiencia.es, 'Trabajo en Empresa Actual');
  assert.equal(perfil.experiencia.en, 'I work at Empresa Actual');
  assert.equal(perfil.contacto.email, 'ana@ejemplo.pe');
});

test('las cifras salen de meta.figures', () => {
  assert.deepEqual(perfil.cifras.map(({ valor }) => valor), ['3+', '15', '7']);
  assert.equal(perfil.cifras[1].etiqueta.es, 'sistemas en producción');
});

test('cada proyecto destacado toma su nombre y su enlace del resume', () => {
  const [proyecto] = perfil.proyectos;
  assert.equal(proyecto.nombre, 'Proyecto Uno');
  assert.equal(proyecto.url, 'https://uno.ejemplo.pe/');
});

test('un proyecto destacado que el resume no publica detiene la generación', () => {
  const conOculto = { ...perfilBase, proyectos: [{ ...perfilBase.proyectos[0], id: 'oculto' }] };
  assert.throws(() => perfilConTrayectoria(conOculto, resumes), /oculto/);
});

test('perfil.json no lleva cifras en sus descripciones', () => {
  const conCifra = structuredClone(perfilBase);
  conCifra.proyectos[0].descripcion.es = 'Cursos con 8900 usuarios';
  assert.throws(() => validarPerfil(conCifra), /proyectos\[0\]\.descripcion\.es.*cifra/);
});

test('sin WhatsApp no hay botón de WhatsApp', () => {
  const archivos = construirPerfil({ perfil, github, blog, temaId: 'corporativo' });
  assert.ok(![...archivos.keys()].some((ruta) => ruta.includes('whatsapp')));
  assert.doesNotMatch(archivos.get('README.md'), /wa\.me/);
});

test('el perfil no anuncia disponibilidad', () => {
  const archivos = construirPerfil({ perfil, github, blog, temaId: 'tech' });
  assert.doesNotMatch(archivos.get('README.md'), /disponible/);
  assert.doesNotMatch(archivos.get('README.en.md'), /available/);
});

test('la trayectoria completa se enlaza al sitio', () => {
  const archivos = construirPerfil({ perfil, github, blog, temaId: 'corporativo' });
  assert.match(archivos.get('README.md'), /Más sobre mi trayectoria en <a href="https:\/\/abitech\.dev">abitech\.dev<\/a>/);
});
