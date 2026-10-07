'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow='<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
function buildServicesMenu(){
  const services=JSON.parse(fs.readFileSync(path.join(root,'data/services.json'),'utf8'));
  const cards=services.map(service=>{
    const photo='/assets/img/'+service.hero.file+'-640.webp';
    if(!service.navigationSummary||!fs.existsSync(path.join(root,photo)))throw Error('Navigation data or image missing: '+service.slug);
    const page='/servicos/'+service.slug,quote='/?servico='+encodeURIComponent(service.slug)+'#cotacao';
    return '<li class="services-menu-card"><a class="services-menu-link" href="'+page+'"><img src="'+photo+'" alt="" width="640" height="'+Math.round(640*service.hero.height/service.hero.width)+'" loading="lazy" decoding="async"><div class="services-menu-copy"><h3>'+escape(service.name)+'</h3><p>'+escape(service.navigationSummary)+'</p><span class="services-menu-discover">Conhecer serviço '+arrow+'</span></div></a><a class="services-menu-quote" href="'+quote+'" data-nav-service="'+escape(service.name)+'" aria-label="Solicitar cotação: '+escape(service.name)+'">Solicitar cotação '+arrow+'</a></li>';
  }).join('\n            ');
  const html='<div class="services-nav">\n'+
    '        <a href="#servicos" class="services-nav-fallback">Serviços</a>\n'+
    '        <button type="button" id="servicesNavToggle" class="services-nav-toggle" aria-expanded="false" aria-controls="servicesMenu" hidden>Serviços<svg aria-hidden="true" focusable="false" viewBox="0 0 20 20"><path d="m5 7.5 5 5 5-5"/></svg></button>\n'+
    '        <div id="servicesMenu" class="services-menu" aria-labelledby="servicesMenuTitle" hidden>\n'+
    '          <div class="services-menu-heading"><div><p class="eyebrow">Soluções para sua operação</p><h2 id="servicesMenuTitle">Como podemos ajudar?</h2></div><button class="services-menu-close" type="button" aria-label="Fechar menu de serviços"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>\n'+
    '          <ul class="services-menu-grid">\n            '+cards+'\n          </ul>\n'+
    '          <div class="services-menu-footer"><p>Transporte, armazenagem e apoio no terminal em Caucaia–CE.</p><a class="services-menu-overview" href="#servicos">Ver todos os serviços '+arrow+'</a></div>\n'+
    '        </div>\n      </div>';
  const file=path.join(root,'index.html');
  let home=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
  const marker=/<!-- SERVICES_MENU_START -->[\s\S]*?<!-- SERVICES_MENU_END -->/;
  if(!marker.test(home))throw Error('Missing services menu insertion point');
  home=home.replace(marker,'<!-- SERVICES_MENU_START -->\n      '+html+'\n      <!-- SERVICES_MENU_END -->');
  fs.writeFileSync(file,home);
}
module.exports=buildServicesMenu;
if(require.main===module){buildServicesMenu();console.log('Menu visual atualizado com os quatro serviços do catálogo.');}
