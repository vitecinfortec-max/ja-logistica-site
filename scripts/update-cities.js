'use strict';
// Run manually to refresh the snapshot; visitors search a local static file.
const fs = require('node:fs');
const path = require('node:path');
const api = 'https://servicodados.ibge.gov.br/api/v1/localidades/';
async function get(resource) {
  const response = await fetch(api + resource + '?orderBy=nome', {signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(resource + ': HTTP ' + response.status);
  return response.json();
}
(async () => {
  const [states, municipalities] = await Promise.all([get('estados'), get('municipios')]);
  if (states.length !== 27 || municipalities.length < 5500) throw new Error('Resposta incompleta do IBGE.');
  const ufById = new Map(states.map(state => [String(state.id), state.sigla]));
  const ids = new Set();
  const cities = municipalities.map(city => {
    // The first two digits of the IBGE municipality code identify its UF.
    // Older microrregiao metadata is null for some new municipalities.
    const uf = ufById.get(String(city.id).slice(0, 2));
    if (!uf || !city.nome || ids.has(city.id)) throw new Error('Município inválido: ' + city.id);
    ids.add(city.id);
    return [city.nome, uf];
  }).sort((a, b) => a[0].localeCompare(b[0], 'pt-BR') || a[1].localeCompare(b[1]));
  if (new Set(cities.map(city => city[1])).size !== 27) throw new Error('UF ausente.');
  if (new Set(cities.map(city => city.join(' — '))).size !== cities.length) throw new Error('Cidade duplicada.');
  const snapshot = {
    source: api + 'municipios?orderBy=nome',
    retrievedAt: new Date().toISOString().slice(0, 10),
    count: cities.length,
    cities
  };
  fs.writeFileSync(path.join(__dirname, '../data/cities.json'), JSON.stringify(snapshot) + '\n');
  console.log(cities.length + ' municípios salvos em data/cities.json.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
