const DIA = 86400000;
// El 1 de enero de 1970 fue jueves. El desplazamiento hace que cada
// semana del perfil empiece en lunes.
const DESPLAZAMIENTO_LUNES = 3 * DIA;

export function temaDeLaSemana(temas, fecha) {
  if (temas.length === 0) throw new Error('perfil.json no declara temas en rotación.');
  const semanas = Math.floor((fecha.getTime() + DESPLAZAMIENTO_LUNES) / (7 * DIA));
  return temas[semanas % temas.length];
}
