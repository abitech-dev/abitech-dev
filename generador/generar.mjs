import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { construirPerfil, validarArchivos } from './construir.mjs';
import { obtenerDatosGithub } from './github.mjs';
import { temaDeLaSemana } from './rotacion.mjs';
import { cargarPerfil } from './validar.mjs';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const rutaCache = join(raiz, 'datos', 'github.json');

const { values: opciones } = parseArgs({
  options: {
    tema: { type: 'string' },
    'sin-red': { type: 'boolean', default: false },
  },
});

const perfil = cargarPerfil(join(raiz, 'perfil.json'));
const temaId = opciones.tema || temaDeLaSemana(perfil.temas, new Date());

// Si GitHub no responde se usan los últimos datos guardados y el perfil
// se publica igual, sin tarjetas rotas.
let github = null;
if (!opciones['sin-red']) {
  try {
    github = await obtenerDatosGithub(perfil);
    mkdirSync(dirname(rutaCache), { recursive: true });
    writeFileSync(rutaCache, `${JSON.stringify(github, null, 2)}\n`);
  } catch (error) {
    console.warn(`No se pudo consultar GitHub (${error.message}). Uso los datos guardados.`);
  }
}
if (!github && existsSync(rutaCache)) github = JSON.parse(readFileSync(rutaCache, 'utf8'));

const archivos = construirPerfil({ perfil, github, temaId });
validarArchivos(archivos);

rmSync(join(raiz, 'assets'), { recursive: true, force: true });
for (const [ruta, contenido] of archivos) {
  const destino = join(raiz, ruta);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, contenido);
}

console.log(`Perfil generado con el tema ${temaId}: ${archivos.size} archivos.`);
