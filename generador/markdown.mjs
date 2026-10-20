import { resumenActividad } from './svg/actividad.mjs';
import { iconos } from './svg/comun.mjs';

export function html(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function textoCifras({ perfil, idioma }) {
  return perfil.cifras.map(({ valor, etiqueta }) => `${valor} ${etiqueta[idioma]}`).join(', ');
}

// GitHub elige la variante según el tema claro u oscuro de quien visita.
export function imagenAdaptable(idioma, nombre, alt, atributos = '') {
  const base = `assets/${idioma}/${nombre}`;
  return `<picture><source media="(prefers-color-scheme: dark)" srcset="${base}-oscuro.svg">` +
    `<img src="${base}-claro.svg" alt="${html(alt)}"${atributos ? ` ${atributos}` : ''}></picture>`;
}

export function contactos(perfil, t) {
  return [
    { canal: 'linkedin', url: `https://www.linkedin.com/in/${perfil.contacto.linkedin}`, etiqueta: 'LinkedIn' },
    ...(perfil.contacto.youtube ? [{ canal: 'youtube', url: perfil.contacto.youtube, etiqueta: 'YouTube' }] : []),
    { canal: 'correo', url: `mailto:${perfil.contacto.email}`, etiqueta: t.correo },
    { canal: 'whatsapp', url: `https://wa.me/${perfil.contacto.whatsapp}`, etiqueta: 'WhatsApp' },
    { canal: 'web', url: perfil.sitio, etiqueta: new URL(perfil.sitio).host },
  ];
}

export function filaBotones({ perfil, idioma, t }) {
  return contactos(perfil, t)
    .map(({ canal, url, etiqueta }) =>
      `<a href="${url}">${imagenAdaptable(idioma, `boton-${canal}`, etiqueta, 'height="40"')}</a>`)
    .join('&nbsp;');
}

export function enlacesTexto({ perfil, t }) {
  return contactos(perfil, t).map(({ url, etiqueta }) => `<a href="${url}">${html(etiqueta)}</a>`).join(' &nbsp;|&nbsp; ');
}

export function selectorIdioma(t) {
  return `<sub><b>${t.nombreIdioma}</b> &nbsp;|&nbsp; <a href="${t.otroArchivo}">${t.otroIdioma}</a></sub>`;
}

export function nombresTecnologias(slugs) {
  return slugs.map((slug) => iconos[slug].titulo);
}

export function lineaExperiencia({ perfil, idioma, t }) {
  return `${perfil.experiencia[idioma]}. ${t.masEn} <a href="https://www.linkedin.com/in/${perfil.contacto.linkedin}">LinkedIn</a>`;
}

// Titular, prueba concreta y trabajo actual, centrados entre dos líneas.
export function bloquePresentacion(ctx) {
  const { perfil, idioma } = ctx;
  return [
    '<hr>',
    '',
    `<p align="center"><b>${html(perfil.presentacion.titular[idioma])}</b><br>${html(perfil.presentacion.detalle[idioma])}</p>`,
    `<p align="center"><sub>${lineaExperiencia(ctx)}</sub></p>`,
    '',
    '<hr>',
  ].join('\n');
}

export function cuadricula(idioma, tarjetas, ancho = '49%') {
  const elementos = tarjetas.map(({ archivo, url, datos }) => {
    const imagen = imagenAdaptable(idioma, archivo, `${datos.nombre}. ${datos.descripcion}`, `width="${ancho}"`);
    return url ? `<a href="${url}">${imagen}</a>` : imagen;
  });
  return `<p align="center">\n${elementos.join('\n')}\n</p>`;
}

export function llamadoFinal(t, perfil) {
  return `<p align="center"><b>${t.ctaPregunta} <a href="mailto:${perfil.contacto.email}">${t.ctaAccion}</a></b></p>`;
}

export function textoStack({ perfil, idioma }) {
  return perfil.stack
    .map((grupo) => `${grupo.categoria[idioma]} ${nombresTecnologias(grupo.tecnologias).join(', ')}`)
    .join('. ');
}

export function imagenActividad({ github, idioma, t }) {
  return imagenAdaptable(idioma, 'actividad', `${t.actividad}. ${resumenActividad({ github, idioma })}`, 'width="100%"');
}
