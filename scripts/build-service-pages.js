'use strict';
// Static output is committed: Vercel does not need a build step.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const write = (file, content) => fs.writeFileSync(path.join(root, file), content);
const home = read('index.html');
const services = JSON.parse(read('data/services.json'));
const origin = 'https://www.jalogisticas.com';
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
const plus = '<span class="faq-indicator" aria-hidden="true"><svg focusable="false" viewBox="0 0 24 24"><path d="M5 12h14"/><path class="faq-plus" d="M12 5v14"/></svg></span>';
function extract(pattern, description) {
  const match = home.match(pattern);
  if (!match) throw new Error('Trecho compartilhado não encontrado: ' + description);
  return match[0];
}
function rebase(html) {
  return html.replace(/(href|src)="(assets|css|js)\//g, '$1="/$2/')
    .replace(/href="#(diferenciais|sobre|servicos|clientes|contato)"/g, 'href="/#$1"');
}
const sharedHeader = rebase(extract(/<a class="skip-link"[\s\S]*?<\/header>/, 'cabeçalho'))
  .replace('href="#topo" class="brand"', 'href="/" class="brand"');
const sharedFooter = rebase(extract(/<footer class="site-footer">[\s\S]*?<\/footer>/, 'rodapé'));
const sharedActions = rebase(home.slice(home.indexOf('</footer>') + 9, home.indexOf('<dialog id="galleryDialog"')));
const sharedMainScript = rebase(extract(/<script src="js\/main\.js[^"]*"><\/script>/, 'script principal'));
function picture(photo, eager = false) {
  const variants = photo.variants || [640, photo.width];
  for (const file of [photo.file + '.jpg', ...variants.map(width => photo.file + '-' + width + '.webp')]) {
    if (!fs.existsSync(path.join(root, 'assets/img', file))) throw new Error('Foto ausente: ' + file);
  }
  return '<picture><source type="image/webp" srcset="' + variants.map(width => '/assets/img/' + photo.file + '-' + width + '.webp ' + width + 'w').join(', ') +
    '" sizes="(max-width: 800px) calc(100vw - 64px), 560px"><img src="/assets/img/' + photo.file +
    '.jpg" alt="' + escape(photo.alt) + '" width="' + photo.width + '" height="' + photo.height +
    '" decoding="async" ' + (eager ? 'fetchpriority="high"' : 'loading="lazy"') + '></picture>';
}
const servicePath = service => '/servicos/' + service.slug;
fs.mkdirSync(path.join(root, 'servicos'), {recursive: true});
for (const service of services) {
  const url = origin + servicePath(service);
  const quote = '/?servico=' + service.slug + '#cotacao';
  const whatsapp = 'https://wa.me/5585991753831?text=' + encodeURIComponent(
    'Olá, Luiz Antonio! Vim pelo site da J.A Logística e gostaria de uma cotação.\n\nServiço: ' + service.name + '\n');
  let head = home.slice(home.indexOf('<head>'), home.indexOf('</head>') + 7);
  head = head.replace(/<title>[\s\S]*?<\/title>/, '<title>' + escape(service.metaTitle) + '</title>')
    .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="' + escape(service.description) + '">')
    .replace(/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="' + url + '">')
    .replace(/(<meta (?:property|name)="(?:og|twitter):title" content=")[^"]*"/g, '$1' + escape(service.metaTitle) + '"')
    .replace(/(<meta (?:property|name)="(?:og|twitter):description" content=")[^"]*"/g, '$1' + escape(service.description) + '"')
    .replace(/(<meta property="og:url" content=")[^"]*"/, '$1' + url + '"');
  const business = JSON.parse(extract(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, 'dados da empresa')
    .replace(/^<script[^>]*>|<\/script>$/g, ''));
  delete business['@context'];
  business['@id'] = origin + '/#empresa';
  const schema = {'@context':'https://schema.org', '@graph':[
    business,
    {'@type':'Service','@id':url + '#servico',name:service.title,serviceType:service.name,
      description:service.description,url,image:origin + '/assets/img/' + service.hero.file + '.jpg',
      provider:{'@id':origin + '/#empresa'},
      areaServed:service.slug === 'armazenagem' || service.slug === 'movimentacao-de-cargas'
        ? {'@type':'City',name:'Caucaia, Ceará'}
        : ['Nordeste do Brasil','Parte da região Norte do Brasil']},
    {'@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'Início',item:origin + '/'},
      {'@type':'ListItem',position:2,name:'Serviços',item:origin + '/#servicos'},
      {'@type':'ListItem',position:3,name:service.name,item:url}
    ]}
  ]};
  head = rebase(head.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    '<script type="application/ld+json">' + JSON.stringify(schema).replace(/</g, '\\u003c') + '</script>'))
    .replace('</head>', '<link rel="stylesheet" href="/css/services.css?v=20260925-services1">\n</head>');
  const actions = sharedActions.replace('href="#cotacao"', 'href="' + quote + '"')
    .replace(/href="https:\/\/wa\.me\/5585991753831\?text=[^"]*"/g, 'href="' + escape(whatsapp) + '"');
  const html = [
    '<!DOCTYPE html>',
    '<!-- Gerado por scripts/build-service-pages.js. Edite data/services.json ou o gerador. -->',
    '<html lang="pt-BR">', head, '<body class="service-page">', sharedHeader,
    '<main id="topo" tabindex="-1">',
    '  <section class="service-intro" aria-labelledby="serviceTitle"><div class="container">',
    '    <nav class="service-breadcrumb" aria-label="Caminho de navegação"><ol><li><a href="/">Início</a></li><li><a href="/#servicos">Serviços</a></li><li aria-current="page">' + escape(service.name) + '</li></ol></nav>',
    '    <div class="service-intro-grid"><div class="service-intro-copy">',
    '      <p class="eyebrow">' + escape(service.category) + '</p><h1 id="serviceTitle">' + escape(service.title) + '</h1>',
    '      <p class="service-lead">' + escape(service.intro) + '</p>',
    '      <div class="service-page-actions"><a class="service-primary" href="' + quote + '" aria-label="Solicitar cotação: ' + escape(service.name) + '"><span>Solicitar cotação</span>' + arrow + '</a><a class="service-text-link" href="#detalhes">Conhecer o serviço <span aria-hidden="true">↓</span></a></div>',
    '      <p class="service-location"><span aria-hidden="true"></span>' + escape(service.tag) + '</p></div>',
    '      <figure class="service-photo service-photo-hero">' + picture(service.hero, true) + '<figcaption>' + escape(service.hero.caption) + '</figcaption></figure>',
    '    </div></div></section>',
    '  <section id="detalhes" class="service-content-section" aria-labelledby="includesTitle"><div class="container">',
    '    <div class="service-section-heading"><p class="eyebrow">Como podemos ajudar</p><h2 id="includesTitle">' + escape(service.includesTitle) + '</h2><p>' + escape(service.includesIntro) + '</p></div>',
    '    <div class="service-capabilities">',
    ...service.includes.map(([title, text], index) => '      <article class="service-capability"><span class="service-capability-number" aria-hidden="true">' + String(index + 1).padStart(2,'0') + '</span><h3>' + escape(title) + '</h3><p>' + escape(text) + '</p></article>'),
    '    </div></div></section>',
    '  <section class="service-planning service-content-section" aria-labelledby="planningTitle"><div class="container service-planning-grid">',
    '    <div class="service-planning-visual"><figure class="service-photo">' + picture(service.detailPhoto) + '<figcaption>' + escape(service.detailPhoto.caption) + '</figcaption></figure>',
    '      <div class="service-location-note"><strong>Nosso terminal</strong><p>Rodovia CE 155, 16.226 · Distrito Industrial<br>Caucaia–CE, em frente à fábrica do Cimento Apodi.</p><a href="/#contato">Ver localização e contatos <span aria-hidden="true">↗</span></a></div></div>',
    '    <div class="service-planning-copy"><p class="eyebrow">Prepare sua cotação</p><h2 id="planningTitle">' + escape(service.planningTitle) + '</h2><p>' + escape(service.planningIntro) + '</p>',
    '      <ul class="service-checklist">' + service.checklist.map(([title, text]) => '<li><span aria-hidden="true">✓</span><div><strong>' + escape(title) + '</strong><p>' + escape(text) + '</p></div></li>').join('') + '</ul>',
    '      <a class="service-primary" href="' + quote + '" aria-label="Preencher cotação: ' + escape(service.name) + '"><span>Preparar minha cotação</span>' + arrow + '</a><p class="service-quote-note">Você revisa a mensagem e conclui o envio pelo WhatsApp.</p>',
    '    </div></div></section>',
    '  <section class="section faq-section" aria-labelledby="serviceFaqTitle"><div class="container faq-layout">',
    '    <div class="faq-intro"><p class="eyebrow">Antes de contratar</p><h2 id="serviceFaqTitle" class="section-title">Dúvidas sobre o serviço</h2><p>Informações para planejar sua operação com mais clareza.</p>',
    '      <div class="faq-help"><h3>Fale com Luiz Antonio</h3><p>Comercial · (85) 9 9175-3831</p><a class="faq-help-link" href="' + escape(whatsapp) + '" target="_blank" rel="noopener">Conversar pelo WhatsApp ' + arrow + '</a><a class="service-email" href="mailto:luis.antonio@jalogisticas.com">luis.antonio@jalogisticas.com</a></div></div>',
    '    <div class="faq-list">',
    ...service.faqs.map(([question, answer]) => '      <details><summary><span>' + escape(question) + '</span>' + plus + '</summary><p>' + escape(answer) + '</p></details>'),
    '    </div></div></section>',
    '  <section class="service-related service-content-section" aria-labelledby="relatedTitle"><div class="container">',
    '    <div class="service-section-heading"><p class="eyebrow">Conheça também</p><h2 id="relatedTitle">Outros serviços para sua operação</h2></div>',
    '    <div class="service-related-grid">' + services.filter(other => other.slug !== service.slug).map(other => '<a class="service-related-link" href="' + servicePath(other) + '"><div><span>' + escape(other.category) + '</span><h3>' + escape(other.name) + '</h3></div>' + arrow + '</a>').join('') + '</div>',
    '  </div></section>', '</main>', sharedFooter, actions, sharedMainScript, '</body>', '</html>', ''
  ].join('\n');
  write('servicos/' + service.slug + '.html', html);
  console.log('Gerado: ' + servicePath(service));
}
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  ['/', ...services.map(servicePath)].map(route => '  <url><loc>' + origin + route + '</loc></url>').join('\n') + '\n</urlset>\n');
