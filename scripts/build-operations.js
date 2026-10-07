'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow='<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
function buildOperations(){
 const entries=JSON.parse(fs.readFileSync(path.join(root,'data/operations.json'),'utf8'));
 const services=JSON.parse(fs.readFileSync(path.join(root,'data/services.json'),'utf8'));
 const file=path.join(root,'index.html');
 let html=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
 const seen=new Set();
 entries.forEach(entry=>{
  const service=services.find(s=>s.slug===entry.service);
  if(!service||seen.has(entry.id)||!entry.facts.length||!entry.planning)throw Error('Invalid operation: '+entry.id);
  seen.add(entry.id);
  const marker='<!-- OPERATION_DETAIL:'+entry.id+' -->',end='<!-- /OPERATION_DETAIL:'+entry.id+' -->';
  const startAt=html.indexOf(marker),endAt=html.indexOf(end);
  if(startAt<0||endAt<startAt)throw Error('Missing operation insertion point: '+entry.id);
  const detail='<details class="operation-story"><summary>Ver detalhes da operação '+arrow+'</summary><div class="operation-story-content">'+
   '<dl class="operation-facts">'+entry.facts.map(([label,text])=>'<div><dt>'+escape(label)+'</dt><dd>'+escape(text)+'</dd></div>').join('')+'</dl>'+
   '<div class="operation-planning"><h3>Para uma operação como esta</h3><p>'+escape(entry.planning)+'</p></div>'+
   '<div class="operation-actions"><a class="operation-quote" href="/?servico='+encodeURIComponent(service.slug)+'#cotacao" data-operation-service="'+escape(service.name)+'">Solicitar cotação '+arrow+'</a>'+
   '<a class="operation-service" href="/servicos/'+service.slug+'">Conhecer este serviço '+arrow+'</a></div></div></details>';
  html=html.slice(0,startAt)+marker+'\n            '+detail+'\n            '+html.slice(endAt);
 });
 fs.writeFileSync(file,html);
}
module.exports=buildOperations;
if(require.main===module){buildOperations();console.log('Detalhes das seis operações atualizados.');}
