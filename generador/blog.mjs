const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };

function texto(item, etiqueta) {
  const valor = item.match(new RegExp(String.raw`<${etiqueta}>([\s\S]*?)</${etiqueta}>`))?.[1] ?? '';
  return valor
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1')
    .replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, nombre) => ENTIDADES[nombre])
    .trim();
}

export function leerRss(xml, cantidad = 3) {
  const escritos = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => ({
    titulo: texto(item, 'title'),
    url: texto(item, 'link'),
    fecha: new Date(texto(item, 'pubDate')).toISOString().slice(0, 10),
  }));
  if (!escritos.length) throw new Error('El RSS llegó sin escritos');
  return escritos.sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, cantidad);
}

async function descargar(url) {
  const respuesta = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!respuesta.ok) throw new Error(`${url} respondió ${respuesta.status}`);
  return leerRss(await respuesta.text());
}

export async function obtenerEscritos(perfil) {
  const [es, en] = await Promise.all([
    descargar(`${perfil.sitio}/blog/rss.xml`),
    descargar(`${perfil.sitio}/en/blog/rss.xml`),
  ]);
  return { es, en };
}
