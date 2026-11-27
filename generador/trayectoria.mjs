// Los hechos del perfil salen del resume.json que publica abitech.dev, el
// mismo que exporta abitech-trayectoria-cli. perfil.json solo decide la forma.

const ETIQUETAS_DE_CIFRAS = {
  yearsOfExperience: { es: 'años de experiencia', en: 'years of experience' },
  systemsInProduction: { es: 'sistemas en producción', en: 'systems in production' },
  sectors: { es: 'sectores atendidos', en: 'industries served' },
};

// El cargo ya está en el titular; aquí basta la empresa.
const TRABAJO_EN = { es: 'Trabajo en', en: 'I work at' };

function sinRazonSocial(empresa) {
  return empresa.replace(/\s+(S\.A\.C\.|E\.I\.R\.L\.|S\.A\.|S\.R\.L\.)$/, '');
}

function bilingue(resumes, leer) {
  return { es: leer(resumes.es, 'es'), en: leer(resumes.en, 'en') };
}

function empleoActual(resume) {
  const empleo = resume.work.find(({ endDate }) => !endDate);
  if (!empleo) throw new Error('El resume.json no tiene un empleo actual');
  return empleo;
}

function cifras(resume) {
  const totales = resume.meta.figures;
  if (!totales) throw new Error('El resume.json no trae meta.figures');
  return Object.entries(ETIQUETAS_DE_CIFRAS).map(([clave, etiqueta]) => ({
    valor: clave === 'yearsOfExperience' ? `${totales[clave]}+` : String(totales[clave]),
    etiqueta,
  }));
}

function proyectoDestacado(proyecto, resume) {
  const publicado = resume.projects.find(({ id }) => id === proyecto.id);
  if (!publicado) throw new Error(`El resume.json no publica el proyecto destacado «${proyecto.id}»`);
  return { ...proyecto, nombre: publicado.name, url: publicado.url ?? null };
}

export function perfilConTrayectoria(perfil, resumes) {
  const { basics } = resumes.es;
  return {
    ...perfil,
    nombre: basics.name,
    nombreCorto: basics.name.split(' ').slice(0, 2).join(' '),
    presentacion: {
      titular: bilingue(resumes, (resume) => resume.basics.label),
      detalle: bilingue(resumes, (resume) => resume.basics.summary),
    },
    experiencia: bilingue(resumes, (resume, idioma) => `${TRABAJO_EN[idioma]} ${sinRazonSocial(empleoActual(resume).name)}`),
    cifras: cifras(resumes.es),
    contacto: { ...perfil.contacto, email: basics.email },
    proyectos: perfil.proyectos.map((proyecto) => proyectoDestacado(proyecto, resumes.es)),
  };
}

async function descargar(url) {
  const respuesta = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!respuesta.ok) throw new Error(`${url} respondió ${respuesta.status}`);
  return respuesta.json();
}

export async function obtenerResumes(perfil) {
  const [es, en] = await Promise.all([
    descargar(`${perfil.sitio}/resume.json`),
    descargar(`${perfil.sitio}/en/resume.json`),
  ]);
  return { es, en };
}
