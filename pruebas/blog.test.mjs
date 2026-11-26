import assert from 'node:assert/strict';
import { test } from 'node:test';
import { leerRss } from '../generador/blog.mjs';
import { construirPerfil } from '../generador/construir.mjs';
import { temas } from '../generador/temas/index.mjs';
import { blog, github, perfil } from './fixture.mjs';

function item(titulo, ruta, fecha) {
  return `<item><title>${titulo}</title><link>https://abitech.dev${ruta}</link>` +
    `<pubDate>${fecha}</pubDate></item>`;
}

test('leerRss devuelve los tres escritos más recientes con su título y enlace', () => {
  const xml = `<rss><channel><title>Blog</title>${[
    item('Viejo', '/blog/viejo/', 'Mon, 02 Nov 2026 00:00:00 GMT'),
    item('Ramas &amp; ambientes', '/blog/ramas/', 'Fri, 20 Nov 2026 00:00:00 GMT'),
    item('<![CDATA[Nota]]>', '/blog/nota/', 'Sat, 21 Nov 2026 00:00:00 GMT'),
    item('Medio', '/blog/medio/', 'Tue, 10 Nov 2026 00:00:00 GMT'),
  ].join('')}</channel></rss>`;

  assert.deepEqual(leerRss(xml), [
    { titulo: 'Nota', url: 'https://abitech.dev/blog/nota/', fecha: '2026-11-21' },
    { titulo: 'Ramas & ambientes', url: 'https://abitech.dev/blog/ramas/', fecha: '2026-11-20' },
    { titulo: 'Medio', url: 'https://abitech.dev/blog/medio/', fecha: '2026-11-10' },
  ]);
});

test('leerRss rechaza un canal sin escritos', () => {
  assert.throws(() => leerRss('<rss><channel></channel></rss>'), /sin escritos/);
});

for (const temaId of Object.keys(temas)) {
  test(`el tema ${temaId} enlaza los escritos del blog en cada idioma`, () => {
    const archivos = construirPerfil({ perfil, github, blog, temaId });
    assert.match(archivos.get('README.md'), /## Del blog\n\n- \[Nota uno\]\(https:\/\/abitech\.dev\/blog\/uno\/\)/);
    assert.match(archivos.get('README.md'), /href="https:\/\/abitech\.dev\/blog"/);
    assert.match(archivos.get('README.en.md'), /## From the blog\n\n- \[Note one\]\(https:\/\/abitech\.dev\/en\/blog\/uno\/\)/);
    assert.match(archivos.get('README.en.md'), /href="https:\/\/abitech\.dev\/en\/blog"/);
  });

  test(`el tema ${temaId} omite la sección del blog sin escritos`, () => {
    const archivos = construirPerfil({ perfil, github, blog: null, temaId });
    assert.doesNotMatch(archivos.get('README.md'), /## Del blog/);
  });
}
