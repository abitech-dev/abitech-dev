import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { iconos } from './svg/comun.mjs';
import { temas } from './temas/index.mjs';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const IDIOMAS = ['es', 'en'];
const CAMPOS_OBLIGATORIOS = [
  'usuario',
  'temas',
  'nombre',
  'nombreCorto',
  'iniciales',
  'sitio',
  'ubicacion',
  'roles',
  'lema',
  'presentacion',
  'experiencia',
  'cifras',
  'iniciativas',
  'destacadas',
  'contacto',
  'proyectos',
  'repositorios',
  'stack',
  'presentacion.titular',
  'presentacion.detalle',
  'contacto.linkedin',
  'contacto.email',
  'contacto.whatsapp',
];

function valorEnRuta(objeto, ruta) {
  return ruta.split('.').reduce((actual, parte) => actual?.[parte], objeto);
}

function agregarError(errores, campo, detalle) {
  errores.push(`${campo}: ${detalle}`);
}

function validarBilingues(valor, ruta, errores) {
  if (Array.isArray(valor)) {
    valor.forEach((item, i) => validarBilingues(item, `${ruta}[${i}]`, errores));
    return;
  }
  if (!valor || typeof valor !== 'object') return;

  const tieneEs = Object.hasOwn(valor, 'es');
  const tieneEn = Object.hasOwn(valor, 'en');
  if (tieneEs || tieneEn) {
    for (const idioma of IDIOMAS) {
      if (!Object.hasOwn(valor, idioma)) {
        agregarError(errores, ruta, `falta la clave "${idioma}"`);
        continue;
      }
      const texto = valor[idioma];
      if (typeof texto === 'string' && !texto.trim()) agregarError(errores, `${ruta}.${idioma}`, 'está vacío');
      if (Array.isArray(texto)) {
        if (!texto.length || texto.join('').trim().length === 0) agregarError(errores, `${ruta}.${idioma}`, 'está vacío');
      }
    }
    return;
  }

  for (const [clave, hijo] of Object.entries(valor)) validarBilingues(hijo, `${ruta}.${clave}`, errores);
}

function validarUrl(url, campo, errores) {
  if (url == null || url === '') return;
  if (typeof url !== 'string') {
    agregarError(errores, campo, 'debe ser un texto con URL');
    return;
  }
  try {
    const parseada = new URL(url);
    if (!['https:', 'http:'].includes(parseada.protocol)) agregarError(errores, campo, 'debe usar http o https');
  } catch {
    agregarError(errores, campo, 'URL inválida');
  }
}

function validarRepo(repo, campo, errores) {
  if (repo == null || repo === '') return;
  if (typeof repo !== 'string' || !/^[^/\s]+\/[^/\s]+$/.test(repo)) agregarError(errores, campo, 'debe tener formato "owner/repositorio"');
}

function validarTecnologia(slug, campo, errores) {
  if (!iconos[slug]) agregarError(errores, campo, `la tecnología "${slug}" no existe en iconos.json`);
}

export function validarPerfil(perfil) {
  const errores = [];

  for (const campo of CAMPOS_OBLIGATORIOS) {
    if (valorEnRuta(perfil, campo) == null) agregarError(errores, campo, 'campo obligatorio ausente');
  }

  validarBilingues(perfil, 'perfil', errores);

  for (const [i, tema] of (perfil.temas ?? []).entries()) {
    if (!temas[tema]) agregarError(errores, `temas[${i}]`, `tema inexistente "${tema}"`);
  }

  validarUrl(perfil.sitio, 'sitio', errores);
  validarUrl(perfil.contacto?.youtube, 'contacto.youtube', errores);

  for (const [i, iniciativa] of (perfil.iniciativas ?? []).entries()) validarUrl(iniciativa.url, `iniciativas[${i}].url`, errores);
  for (const [i, proyecto] of (perfil.proyectos ?? []).entries()) validarUrl(proyecto.url, `proyectos[${i}].url`, errores);

  for (const [i, proyecto] of (perfil.proyectos ?? []).entries()) validarRepo(proyecto.repo, `proyectos[${i}].repo`, errores);
  for (const [i, repositorio] of (perfil.repositorios ?? []).entries()) validarRepo(repositorio.repo, `repositorios[${i}].repo`, errores);

  for (const [i, slug] of (perfil.destacadas ?? []).entries()) validarTecnologia(slug, `destacadas[${i}]`, errores);
  for (const [i, grupo] of (perfil.stack ?? []).entries()) {
    for (const [j, slug] of (grupo.tecnologias ?? []).entries()) validarTecnologia(slug, `stack[${i}].tecnologias[${j}]`, errores);
  }
  for (const [i, proyecto] of (perfil.proyectos ?? []).entries()) {
    for (const [j, slug] of (proyecto.stack ?? []).entries()) validarTecnologia(slug, `proyectos[${i}].stack[${j}]`, errores);
  }

  if (errores.length) {
    throw new Error(`perfil.json no es válido:\n- ${errores.join('\n- ')}`);
  }
}

export function cargarPerfil(ruta = `${raiz}perfil.json`) {
  let perfil;
  try {
    perfil = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (error) {
    throw new Error(`JSON inválido en ${ruta}: ${error.message}`);
  }
  validarPerfil(perfil);
  return perfil;
}

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  try {
    const ruta = process.argv[2] ?? `${raiz}perfil.json`;
    cargarPerfil(ruta);
    console.log(`Validación correcta: ${ruta}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
