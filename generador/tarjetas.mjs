export function slug(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function host(url) {
  return new URL(url).host;
}

function pieEnlace(url, t) {
  return host(url) === 'github.com' ? `${t.verEnGithub} ↗` : `${host(url)} ↗`;
}

export function tarjetasIniciativas({ perfil, idioma, t }) {
  return perfil.iniciativas.map((iniciativa) => {
    const url = iniciativa.canal ? perfil.contacto[iniciativa.canal] : iniciativa.url;
    return {
      archivo: `iniciativa-${slug(iniciativa.nombre)}`,
      url,
      datos: {
        nombre: iniciativa.nombre,
        etiqueta: iniciativa.tipo[idioma],
        descripcion: iniciativa.descripcion[idioma],
        logo: iniciativa.logo,
        pie: url ? pieEnlace(url, t) : t.muyPronto,
      },
    };
  });
}

export function tarjetasProyectos({ perfil, idioma, t }) {
  return perfil.proyectos.map((proyecto) => {
    const repo = proyecto.repo ? `https://github.com/${proyecto.repo}` : null;
    let pie = `🔒 ${t.privado}`;
    if (proyecto.url) pie = pieEnlace(proyecto.url, t);
    else if (repo) pie = `${t.verCodigo} ↗`;
    return {
      archivo: `proyecto-${slug(proyecto.nombre)}`,
      url: proyecto.url ?? repo,
      datos: {
        nombre: proyecto.nombre,
        etiqueta: proyecto.rubro[idioma],
        descripcion: proyecto.descripcion[idioma],
        logo: proyecto.logo,
        color: proyecto.color,
        stack: proyecto.stack,
        pie,
      },
    };
  });
}

export function tarjetasRepositorios({ perfil, idioma }) {
  return perfil.repositorios.map((repositorio) => ({
    archivo: `repo-${repositorio.repo.split('/')[1]}`,
    url: `https://github.com/${repositorio.repo}`,
    datos: { nombre: repositorio.repo, descripcion: repositorio.descripcion[idioma] },
    repositorio,
  }));
}
