# Generador del perfil

El README del perfil y todas sus imágenes salen de dos fuentes. Los hechos (nombre, titular, resumen, empleo actual, cifras, correo y el nombre y enlace de cada proyecto) se leen del `resume.json` que publica abitech.dev, el mismo que exporta `abitech-trayectoria`. La forma (temas, roles, lema, logos, colores, tecnologías y textos de las tarjetas) está en `perfil.json`. Nada depende de servicios externos al cargar la página: los SVG se generan aquí y se guardan en `assets/`.

## Cambiar el contenido

Un hecho se corrige en `abitech-trayectoria` y llega al perfil en la siguiente ejecución diaria. La forma se edita en `perfil.json` y la Action publica. No edites `README.md`, `README.en.md` ni `assets/` a mano, porque se sobrescriben en cada ejecución.

- Los textos bilingües llevan siempre `es` y `en`.
- Cada proyecto destacado lleva el `id` que tiene en el `resume.json`. Si el sitio deja de publicarlo, la generación se detiene.
- Las descripciones de `perfil.json` no llevan cifras, porque envejecen. Las cifras salen de `meta.figures` del `resume.json`.
- Si el `resume.json` no responde, se usa la copia de `datos/resume.json`. Sin copia, no se publica nada.
- Las tecnologías se escriben con su clave de `iconos.json`, por ejemplo `laravel` o `vuedotjs`.
- Cuando tengas canal de YouTube, pon el enlace en `contacto.youtube` y aparecerá el botón.
- Para fijar un tema deja uno solo en `temas`. Con varios, rotan cada lunes.
- La sección «Del blog» muestra los tres escritos más recientes del RSS de `sitio`, en cada idioma. Se actualiza en cada ejecución diaria y, si el RSS no responde, usa `datos/blog.json`.

## Correr en local

```bash
npm run generar                     # tema de la semana y datos frescos de GitHub
npm run generar -- --tema=tech      # fuerza un tema
npm run generar -- --sin-red        # usa datos/github.json sin consultar GitHub
npm run validar                      # revisa perfil.json antes de generar
npm test
```

Si la validación falla, el script muestra cada campo inválido con su ruta (por ejemplo `stack[0].tecnologias[2]`) y detiene la publicación.

En local el token sale de `gh auth token`. La Action usa el `GITHUB_TOKEN` que GitHub le da por defecto.

## Contribuciones privadas

La mayor parte de la actividad está en repos privados. La Action la cuenta porque el perfil tiene activado "Include private contributions on my profile" (Settings, Public profile). Si se desactiva, la tarjeta de actividad baja a las contribuciones públicas.

## Temas

| Tema | Portada | Estilo |
| --- | --- | --- |
| `corporativo` | Tu stack conectado como una red sobre una cuadrícula de plano | Azul marino y cian, tarjetas |
| `tech` | Terminal que escribe comandos | Negro y lima, código y listas |
| `ejecutivo` | Nombre en serif con foto enmarcada | Crema y dorado, tablas sobrias |

Un tema nuevo es un archivo en `temas/` que exporta paletas clara y oscura, fuentes, una función `banner` y una función `readme`, y se registra en `temas/index.mjs`.

## Licencias de terceros

- Fuentes Plus Jakarta Sans, Space Grotesk, JetBrains Mono y Fraunces bajo SIL Open Font License 1.1, tomadas de Fontsource.
- Íconos de marcas de Simple Icons (CC0 1.0) y de Octicons (MIT).
