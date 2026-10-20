import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { escapar, icono, iconos } from './comun.mjs';

const carpetaLogos = fileURLToPath(new URL('../logos/', import.meta.url));

function iniciales(nombre) {
  return nombre.split(/\s+/).slice(0, 2).map((palabra) => palabra[0]).join('').toUpperCase();
}

// Caja blanca con el logo dentro. El logo puede ser un archivo de
// generador/logos o una clave de iconos.json; sin logo se usan iniciales.
export function cajaLogo({ logo, nombre, x, y, tam, paleta, fuenteTitulo, sombra = '' }) {
  const margen = tam * 0.15;
  const interior = tam - margen * 2;
  let contenido;
  if (logo && /\.(png|jpe?g)$/i.test(logo)) {
    const datos = readFileSync(`${carpetaLogos}${logo}`).toString('base64');
    contenido = `<image href="data:image/png;base64,${datos}" x="${x + margen}" y="${y + margen}" ` +
      `width="${interior}" height="${interior}" preserveAspectRatio="xMidYMid meet"/>`;
  } else if (logo && iconos[logo]) {
    contenido = icono(logo, { x: x + margen * 1.6, y: y + margen * 1.6, tam: tam - margen * 3.2 });
  } else {
    contenido = `<text x="${x + tam / 2}" y="${y + tam / 2}" dy="0.35em" text-anchor="middle" ` +
      `font-family="'${fuenteTitulo.familia}'" font-weight="${fuenteTitulo.peso}" font-size="${tam * 0.38}" ` +
      `fill="${paleta.acento}">${escapar(iniciales(nombre))}</text>`;
  }
  return `<rect x="${x}" y="${y}" width="${tam}" height="${tam}" rx="${tam * 0.24}" fill="#FFFFFF" ` +
    `stroke="${paleta.borde}"${sombra}/>` + contenido;
}
