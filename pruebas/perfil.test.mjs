import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { iconos, luminancia, partirLineas } from '../generador/svg/comun.mjs';
import { ajustarNombre, lineasDescripcion } from '../generador/svg/pilar.mjs';
import { temas } from '../generador/temas/index.mjs';
import { perfil } from './fixture.mjs';

function camposBilingues(valor, ruta = 'perfil', encontrados = []) {
  if (Array.isArray(valor)) {
    valor.forEach((item, i) => camposBilingues(item, `${ruta}[${i}]`, encontrados));
  } else if (valor && typeof valor === 'object') {
    if ('es' in valor || 'en' in valor) encontrados.push({ ruta, valor });
    else Object.entries(valor).forEach(([clave, hijo]) => camposBilingues(hijo, `${ruta}.${clave}`, encontrados));
  }
  return encontrados;
}

test('cada texto bilingüe tiene versión en español y en inglés', () => {
  for (const { ruta, valor } of camposBilingues(perfil)) {
    assert.deepEqual(Object.keys(valor).sort(), ['en', 'es'], ruta);
    for (const idioma of ['es', 'en']) {
      const texto = [valor[idioma]].flat().join('');
      assert.ok(texto.trim().length > 0, `${ruta}.${idioma} está vacío`);
    }
  }
});

test('las frases cortas no terminan en punto', () => {
  const fragmentos = [
    ...perfil.proyectos.map((p) => p.descripcion),
    ...perfil.repositorios.map((r) => r.descripcion),
    ...perfil.iniciativas.map((i) => i.descripcion),
    perfil.experiencia,
    perfil.presentacion.titular,
    perfil.presentacion.detalle,
  ];
  for (const fragmento of fragmentos) {
    for (const idioma of ['es', 'en']) assert.doesNotMatch(fragmento[idioma], /\.$/, fragmento[idioma]);
  }
});

test('cada logo declarado existe en generador/logos o en iconos.json', () => {
  for (const { nombre, logo } of [...perfil.iniciativas, ...perfil.proyectos]) {
    if (!logo) continue;
    const existe = /\.(png|jpe?g)$/.test(logo) ? existsSync(new URL(`../generador/logos/${logo}`, import.meta.url)) : Boolean(iconos[logo]);
    assert.ok(existe, `${nombre} apunta a un logo inexistente: ${logo}`);
  }
});

test('cada descripción cabe en su tarjeta', () => {
  for (const { nombre, descripcion } of perfil.iniciativas) {
    const { lineas } = ajustarNombre(nombre);
    assert.ok(lineas.length <= 2, `El nombre ${nombre} no cabe en el pilar`);
    const disponibles = 5 - lineas.length;
    for (const idioma of ['es', 'en']) {
      assert.ok(lineasDescripcion(descripcion[idioma]).length <= disponibles, `${nombre} (${idioma}) no cabe en el pilar`);
    }
  }
  for (const { nombre, descripcion } of perfil.proyectos) {
    for (const idioma of ['es', 'en']) {
      assert.ok(partirLineas(descripcion[idioma], 64).length <= 2, `${nombre} (${idioma}) no cabe en la fila`);
    }
  }
  for (const { repo, descripcion } of perfil.repositorios) {
    for (const idioma of ['es', 'en']) {
      assert.ok(partirLineas(descripcion[idioma], 50).length <= 2, `${repo} (${idioma}) no cabe en la tarjeta`);
    }
  }
});

test('cada proyecto declara su color de marca', () => {
  for (const { nombre, color } of perfil.proyectos) assert.match(color ?? '', /^#[0-9A-F]{6}$/i, nombre);
});

test('toda tecnología mencionada tiene ícono', () => {
  const usadas = [
    ...perfil.destacadas,
    ...perfil.stack.flatMap((grupo) => grupo.tecnologias),
    ...perfil.proyectos.flatMap((proyecto) => proyecto.stack),
  ];
  for (const slug of usadas) assert.ok(iconos[slug], `Falta ${slug} en iconos.json`);
});

test('el texto de cada paleta llega a 4.5:1 sobre su fondo (WCAG 1.4.3)', () => {
  const contraste = (a, b) => {
    const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
    return (claro + 0.05) / (oscuro + 0.05);
  };
  for (const [id, tema] of Object.entries(temas)) {
    for (const [modo, paleta] of Object.entries(tema.paletas)) {
      for (const color of ['texto', 'tenue', 'acento']) {
        const ratio = contraste(paleta[color], paleta.fondo);
        assert.ok(ratio >= 4.5, `${id} ${modo} ${color} ${ratio.toFixed(2)}:1`);
      }
    }
  }
});

test('la rotación solo nombra temas que existen', () => {
  for (const id of perfil.temas) assert.ok(temas[id], `Tema inexistente ${id}`);
});
