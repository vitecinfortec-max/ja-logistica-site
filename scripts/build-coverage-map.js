'use strict';
// Rebuild from the checked-in simplified IBGE geometry; no network request during site visits.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/geo/br-uf-simplified.geojson'),'utf8'));
if(data.type!=='FeatureCollection'||data.features.length!==27)throw new Error('Expected the 27 Brazilian states');
const project=([lon,lat])=>[22+(lon+74)*12.6,12+(6-lat)*12.6];
const fmt=n=>Number(n.toFixed(1));
function ring(points){return points.map((p,i)=>(i?'L':'M')+project(p).map(fmt).join(' ')).join('')+'Z';}
function shape(f){
  const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
  return polygons.map(poly=>poly.map(ring).join('')).join('');
}
const paths=data.features.map(f=>({code:f.properties.codarea,d:shape(f)}));
const draw=list=>list.map(p=>'<path class="coverage-state'+(p.code==='23'?' coverage-ceara':'')+'" data-state="'+p.code+'" pathLength="1" d="'+p.d+'"/>').join('');
let svg='<svg class="coverage-svg" viewBox="0 0 620 550" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="coverageMapTitle coverageMapDesc">'+
'<title id="coverageMapTitle">Área de atuação da J.A Logística</title><desc id="coverageMapDesc">Terminal em Caucaia, Ceará. Atendimento no Nordeste e em parte da região Norte, mediante consulta de rota. As demais regiões aparecem apenas como referência geográfica.</desc>'+
'<defs><pattern id="coverageNorthHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="7" height="7" fill="#e9eeed"/><path d="M0 0v7" stroke="#8b9e9d" stroke-width="2"/></pattern></defs>'+
'<g class="coverage-other" aria-hidden="true">'+draw(paths.filter(p=>!['1','2'].includes(p.code[0])))+'</g>'+
'<g class="coverage-region coverage-north" data-coverage-target="norte" aria-label="Região Norte: cobertura sob consulta">'+draw(paths.filter(p=>p.code[0]==='1'))+'</g>'+
'<g class="coverage-region coverage-northeast" data-coverage-target="nordeste" aria-label="Nordeste: área de atendimento">'+draw(paths.filter(p=>p.code[0]==='2'))+'</g>';
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const business=JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const [x,y]=project([business.geo.longitude,business.geo.latitude]).map(fmt);
svg+='<g class="coverage-terminal" data-coverage-target="terminal" aria-label="Terminal da J.A Logística em Caucaia, Ceará">'+
'<circle class="coverage-pin-halo" cx="'+x+'" cy="'+y+'" r="17"/><circle class="coverage-pin" cx="'+x+'" cy="'+y+'" r="7"/>'+
'<path class="coverage-callout-line" d="M'+x+' '+y+'l20 -36h100"/>'+
'<rect class="coverage-callout" x="'+fmt(x-8)+'" y="'+fmt(y-84)+'" width="154" height="45" rx="9"/>'+
'<text class="coverage-callout-title" x="'+fmt(x+6)+'" y="'+fmt(y-64)+'">Caucaia–CE</text><text class="coverage-callout-sub" x="'+fmt(x+6)+'" y="'+fmt(y-48)+'">Nosso terminal</text></g></svg>';
const pattern=/<!-- COVERAGE_MAP_START -->[\s\S]*?<!-- COVERAGE_MAP_END -->/;
if(!pattern.test(home))throw new Error('Coverage map insertion point missing');
fs.writeFileSync(path.join(root,'index.html'),home.replace(pattern,'<!-- COVERAGE_MAP_START -->\n          '+svg+'\n          <!-- COVERAGE_MAP_END -->'));
console.log('Mapa atualizado: 27 estados, terminal no ponto cadastrado; '+Buffer.byteLength(svg)+' bytes de SVG.');
