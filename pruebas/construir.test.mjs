import assert from 'node:assert/strict';
import { test } from 'node:test';
import { construirPerfil, validarArchivos } from '../generador/construir.mjs';
import { contribucionesPrivadas } from '../generador/github.mjs';
import { diasActivos, rachaMaxima } from '../generador/svg/actividad.mjs';
import { iconos } from '../generador/svg/comun.mjs';
import { temas } from '../generador/temas/index.mjs';
import { github, perfil } from './fixture.mjs';

const basura = /undefined|NaN|\[object Object\]/;

for (const temaId of Object.keys(temas)) {
  test(`el tema ${temaId} genera ambos README y todos los SVG que referencia`, () => {
    const archivos = construirPerfil({ perfil, github, temaId });
    for (const readme of ['README.md', 'README.en.md']) {
      const contenido = archivos.get(readme);
      assert.ok(contenido, `Falta ${readme}`);
      assert.doesNotMatch(contenido, basura, readme);
      const referencias = [...contenido.matchAll(/(?:src|srcset)="(assets\/[^"]+)"/g)].map((m) => m[1]);
      assert.ok(referencias.length > 0, `${readme} no muestra ninguna imagen`);
      for (const ruta of referencias) assert.ok(archivos.has(ruta), `${readme} apunta a ${ruta}, que no se generó`);
    }
    assert.match(archivos.get('README.md'), /href="README\.en\.md"/);
    assert.match(archivos.get('README.en.md'), /href="README\.md"/);
  });

  test(`los SVG del tema ${temaId} están completos y son accesibles`, () => {
    const archivos = construirPerfil({ perfil, github, temaId });
    for (const [ruta, contenido] of archivos) {
      if (!ruta.endsWith('.svg')) continue;
      assert.match(contenido, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, ruta);
      assert.match(contenido, /role="img" aria-label="[^"]+"/, ruta);
      assert.match(contenido, /<\/svg>\n$/, ruta);
      assert.doesNotMatch(contenido.replace(/data:[^)"]+/g, ''), basura, ruta);
    }
  });
}

test('ninguna animación es infinita, para cumplir WCAG 2.2.2', () => {
  for (const temaId of Object.keys(temas)) {
    for (const [ruta, contenido] of construirPerfil({ perfil, github, temaId })) {
      if (ruta.endsWith('.svg')) assert.doesNotMatch(contenido, /infinite/, `${temaId} ${ruta}`);
    }
  }
});

test('la portada corporativa recorre todas las tecnologías del stack', () => {
  const banner = construirPerfil({ perfil, github, temaId: 'corporativo' }).get('assets/es/banner-oscuro.svg');
  const tecnologias = new Set([...perfil.destacadas, ...perfil.stack.flatMap((grupo) => grupo.tecnologias)]);
  for (const slug of tecnologias) {
    const huella = iconos[slug].path ?? `>${iconos[slug].sigla}<`;
    assert.ok(banner.includes(huella), `La portada no muestra ${slug}`);
  }
});

test('cada grupo de la rotación de tecnologías se ve al menos 2 segundos', () => {
  const banner = construirPerfil({ perfil, github, temaId: 'corporativo' }).get('assets/es/banner-oscuro.svg');
  const duracion = Number(banner.match(/animation:mostrar ([\d.]+)s/)[1]);
  assert.ok(duracion >= 2, `Cada grupo dura ${duracion} s`);
});

test('los SVG usan colores sólidos, sin degradados', () => {
  for (const temaId of Object.keys(temas)) {
    for (const [ruta, contenido] of construirPerfil({ perfil, github, temaId })) {
      if (ruta.endsWith('.svg')) assert.doesNotMatch(contenido, /Gradient/, `${temaId} ${ruta}`);
    }
  }
});

test('los encabezados del README empiezan en nivel 2', () => {
  for (const temaId of Object.keys(temas)) {
    const readme = construirPerfil({ perfil, github, temaId }).get('README.md');
    const niveles = [...readme.matchAll(/^(#+) /gm)].map((m) => m[1].length);
    assert.equal(Math.min(...niveles), 2, temaId);
  }
});

test('un dato faltante detiene la publicación en vez de mostrar NaN', () => {
  const incompleto = { ...github, contribuciones: { total: 10, semanas: github.contribuciones.semanas } };
  const archivos = construirPerfil({ perfil, github: incompleto, temaId: 'corporativo' });
  assert.throws(() => validarArchivos(archivos), /no se publica nada/);
});

test('sin datos de GitHub el README omite la actividad en vez de mostrar una imagen rota', () => {
  const archivos = construirPerfil({ perfil, github: null, temaId: 'corporativo' });
  assert.ok(!archivos.has('assets/es/actividad-oscuro.svg'));
  assert.doesNotMatch(archivos.get('README.md'), /actividad-/);
});

test('el README en español no se filtra al inglés', () => {
  const archivos = construirPerfil({ perfil, github, temaId: 'corporativo' });
  assert.ok(archivos.get('README.en.md').includes(perfil.presentacion.titular.en));
  assert.ok(!archivos.get('README.en.md').includes(perfil.presentacion.titular.es));
});

test('la tarjeta de una iniciativa sin enlace no se envuelve en un vínculo', () => {
  const readme = construirPerfil({ perfil, github, temaId: 'corporativo' }).get('README.md');
  const linea = readme.split('\n').find((texto) => texto.includes('iniciativa-youtube-oscuro.svg'));
  assert.match(linea, /^<picture>/);
});

test('el botón de YouTube aparece solo cuando hay canal', () => {
  const sinCanal = construirPerfil({ perfil, github, temaId: 'corporativo' });
  assert.ok(!sinCanal.has('assets/es/boton-youtube-claro.svg'));
  const conCanal = construirPerfil({
    perfil: { ...perfil, contacto: { ...perfil.contacto, youtube: 'https://www.youtube.com/@abitech' } },
    github,
    temaId: 'corporativo',
  });
  assert.ok(conCanal.has('assets/es/boton-youtube-claro.svg'));
  assert.match(conCanal.get('README.md'), /href="https:\/\/www\.youtube\.com\/@abitech"/);
});

test('un tema desconocido se rechaza con los nombres disponibles', () => {
  assert.throws(() => construirPerfil({ perfil, github, temaId: 'neon' }), /Disponibles corporativo, tech, ejecutivo/);
});

test('la racha máxima cuenta días seguidos con contribuciones', () => {
  const dias = [1, 2, 0, 3, 4, 5, 0].map((cantidad) => ({ cantidad }));
  assert.equal(rachaMaxima([dias]), 3);
});

test('las contribuciones privadas suman las restringidas y las de repos privados visibles', () => {
  const repo = (isPrivate, totalCount) => ({ repository: { isPrivate }, contributions: { totalCount } });
  const coleccion = {
    restrictedContributionsCount: 10,
    commitContributionsByRepository: [repo(true, 794), repo(false, 50)],
    issueContributionsByRepository: [repo(true, 1)],
    pullRequestContributionsByRepository: [repo(true, 318)],
    pullRequestReviewContributionsByRepository: [],
    repositoryContributions: { nodes: [{ repository: { isPrivate: true } }, { repository: { isPrivate: false } }] },
  };
  assert.equal(contribucionesPrivadas(coleccion), 10 + 794 + 1 + 318 + 1);
});

test('los días activos son los que tienen al menos una contribución', () => {
  const dias = [1, 0, 0, 3, 4, 0, 2].map((cantidad) => ({ cantidad }));
  assert.equal(diasActivos([dias]), 4);
});
