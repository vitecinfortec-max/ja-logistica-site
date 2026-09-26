'use strict';
// Regenerate only the service preview region; other homepage content stays editable.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const services=JSON.parse(fs.readFileSync(path.join(root,'data/services.json'),'utf8'));
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow='<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
const cards=services.map(service=>{
 const photo=service.hero;
 const url='/servicos/'+service.slug;
 const sizes='(max-width: 600px) 100px, (max-width: 1100px) 45vw, 280px';
 return [
  '        <article class="service-card">',
  '          <a class="service-card-media" href="'+url+'" tabindex="-1" aria-hidden="true"><picture><source type="image/webp" srcset="assets/img/'+photo.file+'-640.webp 640w, assets/img/'+photo.file+'-'+photo.width+'.webp '+photo.width+'w" sizes="'+sizes+'"><img src="assets/img/'+photo.file+'.jpg" alt="" width="'+photo.width+'" height="'+photo.height+'" loading="lazy" decoding="async"></picture></a>',
  '          <div class="service-card-copy"><p class="service-category">'+escape(service.category)+'</p><h3><a href="'+url+'">'+escape(service.name)+'</a></h3><p class="service-excerpt">'+escape(service.homeDescription)+'</p></div>',
  '          <div class="service-card-actions"><a class="service-page-link" href="'+url+'" aria-label="Conhecer o serviço: '+escape(service.name)+'">Ver serviço '+arrow+'</a><a class="service-quote" href="#cotacao" data-quote-service="'+escape(service.name)+'" aria-label="Solicitar cotação: '+escape(service.name)+'">Cotar '+arrow+'</a></div>',
  '        </article>'
 ].join('\n');
}).join('\n');
const file=path.join(root,'index.html');
const html=fs.readFileSync(file,'utf8');
const region=/<!-- SERVICE_CARDS_START -->[\s\S]*?<!-- SERVICE_CARDS_END -->/g;
if([...html.matchAll(region)].length!==1)throw new Error('Expected exactly one service preview region');
fs.writeFileSync(file,html.replace(region,'<!-- SERVICE_CARDS_START -->\n'+cards+'\n        <!-- SERVICE_CARDS_END -->'));
console.log('Página inicial: '+services.length+' serviços atualizados.');
