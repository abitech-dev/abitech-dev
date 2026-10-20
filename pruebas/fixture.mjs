import { readFileSync } from 'node:fs';

export const perfil = JSON.parse(readFileSync(new URL('../perfil.json', import.meta.url), 'utf8'));

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
