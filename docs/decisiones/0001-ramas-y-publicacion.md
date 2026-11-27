# 0001. Ramas, integración continua y publicación

- Estado: aceptada
- Fecha: 2026-11-26

## Contexto

El perfil se publicaba desde la rama `dev`, sin integración continua en los
PR. Las pruebas corrían recién después de unir el cambio. El repositorio es
público, no tiene servidor ni imagen de Docker, y GitHub muestra el
`README.md` de la rama por defecto. Una Action diaria regenera el perfil con
las estadísticas de GitHub, el blog y el `resume.json` del sitio, y empuja
el resultado a esa rama.

## Decisión

- **GitHub Flow, la estrategia 2 de la guía
  [Ramas y ambientes](https://abitech.dev/blog/ramas-y-ambientes).** Sus
  preguntas para elegir llevan aquí, porque hay una sola versión, sin
  oleadas y sin aprobación de fuera del equipo. Trunk-based pediría
  etiquetas o un revisor para publicar, pasos que aquí no aportan.
  - `main` es la única rama larga y la rama por defecto. El trabajo va en
    `feature/*` o `fix/*`, siempre por PR.
  - `ci.yml` corre en cada PR con Gitleaks, pruebas y validación de
    `perfil.json`.
- **Ambientes `local` y `prod`.** `local` es `npm run generar -- --sin-red`
  en la PC y `prod` es el perfil publicado. No hay `uat`.
- **Publicar al unir a `main`.** `deploy-prod.yml` llama a `ci.yml`, genera
  el perfil y lo publica en cada push a `main`, cada día a las 06:00 de Lima
  y a mano.
- **Forma B, no aplica.** No hay imagen que construir.

## Excepción

El bot de `deploy-prod.yml` empuja directo a `main`, contra la regla de
`release/merge-to-main`. Solo publica archivos generados (`README.md`,
`README.en.md`, `assets/` y `datos/`), y todo cambio de una persona entra
por PR. Por eso `main` no tiene protección de rama. En una cuenta
personal, el `GITHUB_TOKEN` no puede saltarla y la publicación diaria se
detendría.

## Consecuencias

- Un PR no se puede unir sin ver antes su CI en verde, como norma del dueño.
- Un error en el generador no llega a `main`, porque `deploy-prod.yml`
  vuelve a correr la CI antes de publicar.
- Si algún día el perfil necesita aprobación de alguien más, se revisa esta
  decisión con la skill `choosing-delivery-strategy`.
