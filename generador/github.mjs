import { execFileSync } from 'node:child_process';

const API = 'https://api.github.com/graphql';

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
}

async function consultar(query, variables) {
  const respuesta = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!respuesta.ok) throw new Error(`GitHub respondió ${respuesta.status} ${respuesta.statusText}`);
  const cuerpo = await respuesta.json();
  if (cuerpo.errors) throw new Error(cuerpo.errors.map((error) => error.message).join('; '));
  return cuerpo.data;
}

// GitHub informa las privadas como restringidas si el token no es del dueño,
// o dentro de cada repo privado si lo es. La suma da lo mismo en ambos casos.
export function contribucionesPrivadas(coleccion) {
  const porRepositorio = [
    coleccion.commitContributionsByRepository,
    coleccion.issueContributionsByRepository,
    coleccion.pullRequestContributionsByRepository,
    coleccion.pullRequestReviewContributionsByRepository,
  ].flat();
  const enReposPrivados = porRepositorio
    .filter(({ repository }) => repository.isPrivate)
    .reduce((suma, { contributions }) => suma + contributions.totalCount, 0);
  const reposPrivadosCreados = coleccion.repositoryContributions.nodes.filter(({ repository }) => repository.isPrivate).length;
  return coleccion.restrictedContributionsCount + enReposPrivados + reposPrivadosCreados;
}

export async function obtenerDatosGithub(perfil) {
  const alias = perfil.repositorios.map(({ repo }, i) => {
    const [owner, name] = repo.split('/');
    return `r${i}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) {
      stargazerCount forkCount homepageUrl primaryLanguage { name color }
    }`;
  }).join('\n');

  const datos = await consultar(`query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        restrictedContributionsCount
        commitContributionsByRepository(maxRepositories: 100) { repository { isPrivate } contributions { totalCount } }
        issueContributionsByRepository(maxRepositories: 100) { repository { isPrivate } contributions { totalCount } }
        pullRequestContributionsByRepository(maxRepositories: 100) { repository { isPrivate } contributions { totalCount } }
        pullRequestReviewContributionsByRepository(maxRepositories: 100) { repository { isPrivate } contributions { totalCount } }
        repositoryContributions(first: 100) { nodes { repository { isPrivate } } }
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount contributionLevel } }
        }
      }
    }
    ${alias}
  }`, { login: perfil.usuario });

  const coleccion = datos.user.contributionsCollection;
  return {
    generado: new Date().toISOString(),
    contribuciones: {
      total: coleccion.contributionCalendar.totalContributions,
      privadas: contribucionesPrivadas(coleccion),
      semanas: coleccion.contributionCalendar.weeks.map((semana) => semana.contributionDays.map((dia) => ({
        fecha: dia.date,
        cantidad: dia.contributionCount,
        nivel: dia.contributionLevel,
      }))),
    },
    repositorios: Object.fromEntries(perfil.repositorios.map(({ repo }, i) => {
      const r = datos[`r${i}`];
      return [repo, {
        estrellas: r.stargazerCount,
        forks: r.forkCount,
        sitio: r.homepageUrl || null,
        lenguaje: r.primaryLanguage ? { nombre: r.primaryLanguage.name, color: r.primaryLanguage.color } : null,
      }];
    })),
  };
}
