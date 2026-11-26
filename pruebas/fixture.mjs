import { readFileSync } from 'node:fs';

import { perfilConTrayectoria } from '../generador/trayectoria.mjs';

export const perfilBase = JSON.parse(readFileSync(new URL('../perfil.json', import.meta.url), 'utf8'));

function resume(idioma) {
  const es = idioma === 'es';
  return {
    basics: {
      name: 'Ana Perez Rojas',
      label: es ? 'Desarrolladora full stack' : 'Full stack developer',
      email: 'ana@ejemplo.pe',
      summary: es ? 'Desarrolladora full stack con tres años.' : 'Full stack developer with three years.',
    },
    work: [
      { id: 'antes', name: 'Empresa Antigua', position: 'Practicante', endDate: '2024-01' },
      { id: 'actual', name: 'Empresa Actual S.A.C.', position: es ? 'Desarrolladora full stack' : 'Full stack developer' },
    ],
    projects: perfilBase.proyectos.map(({ id }, i) => ({
      id,
      name: i === 0 ? 'Proyecto Uno' : `Proyecto ${id}`,
      ...(i === 0 ? { url: 'https://uno.ejemplo.pe/' } : {}),
    })),
    meta: { version: '1.5.0', figures: { yearsOfExperience: 3, systemsInProduction: 15, sectors: 7 } },
  };
}

export const resumes = { es: resume('es'), en: resume('en') };

export const perfil = perfilConTrayectoria(perfilBase, resumes);

function semanas() {
  const inicio = Date.UTC(2025, 9, 19);
  const niveles = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];
  return Array.from({ length: 53 }, (_, semana) => Array.from({ length: 7 }, (_, dia) => {
    const cantidad = (semana * 7 + dia) % 9 === 0 ? 0 : (semana + dia) % 6;
    return {
      fecha: new Date(inicio + (semana * 7 + dia) * 86400000).toISOString().slice(0, 10),
      cantidad,
      nivel: niveles[Math.min(cantidad, 4)],
    };
  }));
}

export const github = {
  generado: '2026-10-20T11:00:00.000Z',
  contribuciones: { total: 1347, privadas: 1119, semanas: semanas() },
  repositorios: Object.fromEntries(perfil.repositorios.map(({ repo }, i) => [repo, {
    estrellas: i,
    forks: 0,
    sitio: i === 4 ? 'https://inmunoalerta.abitech.dev' : null,
    lenguaje: i === 3 ? null : { nombre: 'TypeScript', color: '#3178c6' },
  }])),
};

export const blog = {
  es: [{ titulo: 'Nota uno', url: 'https://abitech.dev/blog/uno/', fecha: '2026-11-20' }],
  en: [{ titulo: 'Note one', url: 'https://abitech.dev/en/blog/uno/', fecha: '2026-11-20' }],
};
