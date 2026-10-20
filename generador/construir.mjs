import { contactos } from './markdown.mjs';
import { panelActividad } from './svg/actividad.mjs';
import { boton } from './svg/boton.mjs';
import { panelCifras } from './svg/cifras.mjs';
import { tarjetaRepositorio } from './svg/repositorio.mjs';
import { panelStack } from './svg/stack.mjs';
import { filaProyecto } from './svg/fila-proyecto.mjs';
import { tarjetaPilar } from './svg/pilar.mjs';
import { tarjetasIniciativas, tarjetasProyectos, tarjetasRepositorios } from './tarjetas.mjs';
import { temas } from './temas/index.mjs';
import { textos } from './textos.mjs';

export const IDIOMAS = ['es', 'en'];
const MODOS = ['oscuro', 'claro'];
const REPOSITORIO_SIN_DATOS = { estrellas: 0, forks: 0, sitio: null, lenguaje: null };

const BASURA = /undefined|NaN|\[object Object\]/;

// Un dato faltante nunca debe llegar al perfil publicado. Se revisa sin los
// datos incrustados en base64, donde esas letras aparecen por azar.
export function validarArchivos(archivos) {
  for (const [ruta, contenido] of archivos) {
    const coincidencia = contenido.replace(/data:[^)"]+/g, '').match(BASURA);
    if (coincidencia) throw new Error(`${ruta} contiene «${coincidencia[0]}»; no se publica nada.`);
  }
}

export function construirPerfil({ perfil, github, temaId }) {
  const tema = temas[temaId];
  if (!tema) throw new Error(`Tema desconocido: ${temaId}. Disponibles ${Object.keys(temas).join(', ')}.`);

  const archivos = new Map();
  for (const idioma of IDIOMAS) {
    const t = textos[idioma];
    const ctx = { perfil, github, idioma, t };
    for (const modo of MODOS) {
      const paleta = tema.paletas[modo];
      const ruta = (nombre) => `assets/${idioma}/${nombre}-${modo}.svg`;

      archivos.set(ruta('banner'), tema.banner({ perfil, idioma, paleta, fuentes: tema.fuentes }));
      archivos.set(ruta('stack'), panelStack({ perfil, idioma, paleta, fuente: tema.tarjetas.texto }));
      archivos.set(ruta('cifras'), panelCifras({
        perfil, idioma, paleta, fuente: tema.tarjetas.texto, fuenteNumeros: tema.tarjetas.titulo,
      }));
      if (github) {
        archivos.set(ruta('actividad'), panelActividad({
          github, idioma, paleta, fuente: tema.tarjetas.texto, fuenteNumeros: tema.tarjetas.titulo,
        }));
      }
      const fuentes = { fuente: tema.tarjetas.texto, fuenteTitulo: tema.tarjetas.titulo };
      for (const { archivo, datos } of tarjetasIniciativas(ctx)) {
        archivos.set(ruta(archivo), tarjetaPilar({ ...datos, paleta, ...fuentes }));
      }
      for (const { archivo, datos } of tarjetasProyectos(ctx)) {
        archivos.set(ruta(archivo), filaProyecto({ ...datos, paleta, ...fuentes }));
      }
      for (const { archivo, repositorio } of tarjetasRepositorios(ctx)) {
        const datos = github?.repositorios[repositorio.repo] ?? REPOSITORIO_SIN_DATOS;
        archivos.set(ruta(archivo), tarjetaRepositorio({ repositorio, datos, idioma, paleta, ...fuentes }));
      }
      for (const { canal, etiqueta } of contactos(perfil, t)) {
        archivos.set(ruta(`boton-${canal}`), boton({ canal, etiqueta, paleta, fuente: tema.tarjetas.texto }));
      }
    }
    archivos.set(t.archivo, tema.readme(ctx));
  }
  return archivos;
}
