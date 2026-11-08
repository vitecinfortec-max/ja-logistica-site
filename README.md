# Páginas de serviços

O site é estático e publicado pela Vercel. Os arquivos HTML gerados ficam versionados; não é necessário instalar dependências nem configurar um build na hospedagem.

## Atualização

1. Edite os textos, perguntas e fotos em `data/services.json`.
2. Ajuste a estrutura das páginas em `scripts/build-service-pages.js` e o visual em `css/services.css`, se necessário.
3. Na raiz do projeto, execute:

```sh
node scripts/build-service-pages.js
```

4. Confira as páginas no navegador, os links de cotação e `git diff --check` antes de publicar.

O gerador reaproveita o cabeçalho, o rodapé, as ações rápidas, o script principal e os metadados da empresa de `index.html`. Execute-o também quando esses trechos compartilhados mudarem. Títulos, descrições, canonical, dados estruturados e sitemap são gerados por serviço.

As URLs públicas não têm extensão nem barra final, conforme `vercel.json`. O sitemap inclui a página inicial e os serviços cadastrados.

A cotação abre `/?servico=<slug>#cotacao`. Os quatro slugs aceitos são mapeados para as opções do formulário em `js/interactions.js`; qualquer slug desconhecido é ignorado. Ao cadastrar outro serviço, atualize esse mapeamento e as opções do formulário.

As fotos existentes são usadas em JPEG e WebP responsivo, sem alteração da proporção. Os contatos e as áreas de atendimento devem refletir apenas dados confirmados pela empresa.

## Sugestões de cidades na cotação

Origem, destino e local da operação usam um autocomplete em `js/cities.js`, com estilos isolados em `css/cities.css`. A lista de municípios e UFs vem da [API de localidades do IBGE](https://servicodados.ibge.gov.br/api/docs/localidades) e fica salva em `data/cities.json`. A busca ignora acentos e aceita a sigla da UF; cidades com nomes iguais permanecem separadas por estado. Os campos continuam opcionais e permitem digitação livre.

A lista é carregada uma vez, ao usar um desses campos, pelo próprio site. Não há consultas ao IBGE durante a digitação nem armazenamento dos dados do visitante. Para atualizar a base, use Node.js 18 ou superior e execute `node scripts/update-cities.js`; confira o diff, atualize a versão do JSON em `js/cities.js` e a versão do script em `index.html`, teste e publique os arquivos. Em caso de falha no download, a base anterior é preservada.

## Layout para computador

`css/desktop.css` adapta a home e as páginas de serviços a partir de 1.200 px, com ponteiro preciso e suporte a hover. O conteúdo ocupa 92% da largura, limitado a 1.520 px e centralizado (em telas maiores, só as margens crescem); serviços e diferenciais passam a quatro colunas a partir de 1.360 px, a galeria usa três e o carrossel mostra seis logos a partir de 1.600 px. Os textos longos mantêm limites de leitura. As regras de celulares e tablets com tela sensível ao toque permanecem em `css/style.css` e `css/services.css`.

Após alterações no link ou na versão desse CSS, execute `node scripts/build-service-pages.js`. Verifique as larguras de 1.280, 1.366, 1.440, 1.920 e 2.560 px, além de 390, 768 e 1.024 px e tablet em paisagem.

## Carrossel de fotos nos serviços

Para adicionar fotos ao destaque de um serviço, preencha `heroGallery` em `data/services.json` com os mesmos campos de `hero` (arquivo, dimensões, variantes, texto alternativo e legenda). A foto de `hero` continua sendo a primeira. Execute o gerador após cada alteração. Só as páginas com fotos adicionais carregam `js/service-carousel.js`.

O carrossel troca a foto a cada cinco segundos, permite escolher pelos indicadores, pelas setas do teclado e por gesto de deslizar, e pausa durante interação, fora da tela ou com redução de movimento ativada. As imagens mantêm a proporção e a primeira foto continua visível sem JavaScript. Ao alterar o CSS ou o script, atualize sua versão no gerador antes de publicar.

## Venda de contêineres

O destaque de venda fica em `index.html`, no bloco `#venda-conteineres`, numa seção própria logo após os serviços e com item no menu principal; o mapa de atendimento vem em seguida, na seção `#cobertura`. O bloco é reaproveitado pelo gerador na página de contêineres. O WhatsApp específico de vendas é `5585991751472`; o comercial dos serviços continua em `5585991753831`. Para alterar o destaque ou seu contato, edite esse bloco e execute `node scripts/build-service-pages.js`.

## Acabamento visual e movimento

`css/experience.css` reúne os estados de interação e o acabamento das superfícies. `js/main.js` controla o menu ativo, a linha de progresso, as entradas em sequência e a abertura das perguntas. Os tamanhos de texto e a distribuição responsiva continuam nos arquivos de base.

As entradas usam Web Animations e IntersectionObserver: o conteúdo permanece visível sem JavaScript, com falha de execução ou com redução de movimento. O título e a primeira foto da abertura ficam disponíveis imediatamente. As animações de entrada acontecem uma vez; a sequência de cada linha é limitada a 195 ms. Focar um controle encerra sua animação de entrada. Perguntas mantêm o elemento nativo `details` como alternativa sem animação.

A abertura usa uma foto fixa da frota própria (`transporte-conteiner-carreta`), integrada ao fundo. Para voltar a girar fotos, acrescente outros `picture.hero-slide` no bloco da abertura: o script em `js/main.js` troca a cada três segundos e pausa fora da tela, durante interação, com a aba oculta ou redução de movimento ativada. As animações de entrada e o acabamento das demais seções continuam ativos. As animações da interface usam CSS e APIs nativas. A visualização 3D opcional descrita abaixo carrega Three.js somente ao ser aberta.

Referências de direção visual: [Motion](https://motion.dev/) (transições e gestos), [Anime.js](https://animejs.com/) (sequências), [GSAP](https://gsap.com/) (ritmo durante a navegação) e [Three.js](https://threejs.org/) (profundidade visual). O refinamento usa CSS e APIs nativas, mantendo as fotografias reais e a identidade da empresa.


## Galeria e resumo da cotação

Os estilos dessas interações ficam em `css/features.css`, com comportamento em `js/interactions.js`.

- A galeria ampliada monta as miniaturas a partir das seis fotos existentes, somente na primeira abertura. A seleção funciona por clique e pelas teclas de direção, Home e End. Fechar devolve o foco à foto de origem; os links das imagens continuam disponíveis sem JavaScript.
- O resumo da cotação acompanha os campos preenchidos e usa a mesma função de leitura de dados que prepara a mensagem do WhatsApp. Campos opcionais vazios são omitidos; armazenagem e movimentação mostram o local da operação e não incluem destino. Valores são inseridos como texto, sem HTML e sem armazenamento dos dados do visitante.
## Modelos de contêineres em 3D

O botão “Explorar modelos em 3D” fica no destaque de venda da página inicial e da página de contêineres. O catálogo oferece Dry Box de 20 e 40 pés, High Cube de 40 pés, Open Top de 20 e 40 pés e Reefer HC de 20 e 40 pés. A seleção mostra nome, descrição, medidas externas de referência e prepara o link de WhatsApp com o modelo escolhido.

O visitante pode girar por arraste, botões ou teclado, aproximar e afastar e voltar à vista inicial. O carregamento de Three.js 0.180.0 e dos modelos acontece somente ao abrir. A cena é renderizada apenas ao interagir ou redimensionar, e os recursos gráficos são liberados nas trocas e no fechamento. Sem WebGL ou em caso de falha de rede, as informações e a consulta por WhatsApp permanecem disponíveis.

As referências técnicas, diferenças de geometria, arquivos responsáveis e orientações de atualização estão em [docs/container-models.md](docs/container-models.md). A licença MIT e a origem da biblioteca acompanham `js/vendor/three-0.180.0/`. Não há dependência de CDN durante o uso.

O contato de venda de contêineres permanece no final 1472; a cotação dos serviços continua no final 3831. Nenhuma mensagem é enviada automaticamente.

A prévia 3D do destaque de venda carrega sozinha quando aparece na tela em computadores. Em celulares e telas de toque, `js/container-showcase.js` mostra a ilustração e o botão “Ver em 3D”, e Three.js só é baixado depois desse toque.

## Imagem de compartilhamento e apresentação

A imagem usada por WhatsApp, LinkedIn e redes sociais (`og:image`) é gerada a partir de `scripts/share-image.html`: abra o arquivo a 1200 × 630 px, capture a tela e salve em `assets/social/` com a data no nome, atualizando as tags em `index.html` e executando o gerador das páginas de serviço.

O PDF comercial é gerado por `scripts/build_presentation.py` (requer `reportlab` e `pypdf`). Depois de gerá-lo, atualize a miniatura da capa em `assets/img/apresentacao-capa-v3.webp` e a versão `?v=` dos links do PDF em `index.html`.

## Cache e cabeçalhos

`vercel.json` guarda CSS, JS e dados por 7 dias e as imagens de `assets/` por 30 dias, além de cabeçalhos básicos de segurança. Por isso, toda alteração em CSS ou JS precisa trocar o `?v=` da referência, e uma imagem alterada deve ganhar um nome novo.

## Sistema visual

`css/refresh.css` é carregado por último, na home e nas páginas de serviço (o gerador coloca `services.css` antes dele), e concentra o visual atual: títulos em Archivo condensada, cantos de 6 a 10 px, superfícies sem sombra, laranja só nas ações, Diferenciais em lista, serviços em linhas alternadas, galeria em mosaico (descrição e detalhes ficam no visualizador) e logos de clientes em grade fixa. A fonte reserva `Archivo Fallback` usa a Arial com `size-adjust: 72%` para os títulos não mudarem de quebra de linha quando a Archivo carrega.

O gerador também cria `404.html`, com o cabeçalho e o rodapé do site e `noindex`.

## Medição de resultados

- **Visitas:** `index.html` carrega o Vercel Web Analytics (sem cookies) apenas em `jalogisticas.com` e nas prévias `*.vercel.app`. Ele precisa estar ativado no painel da Vercel (projeto → Analytics).
- **Contatos:** ao clicar em qualquer link de WhatsApp, `js/main.js` acrescenta à mensagem a linha "(Origem no site: página · bloco)"; o formulário de cotação acrescenta "(Origem no site: formulário de cotação)". O comercial conta as conversas buscando "Origem no site".
- **Relatório:** o modelo para enviar ao cliente está em [docs/relatorio-mensal.md](docs/relatorio-mensal.md).

## Busca no Google

A home publica um `@graph` com `LocalBusiness` (endereço, coordenadas, horários, área atendida) e `FAQPage` montado a partir das perguntas da página. As páginas de serviço reaproveitam a empresa desse grafo e acrescentam `Service`, `BreadcrumbList` e `FAQPage` com as perguntas de `data/services.json`. Ao mudar horários ou perguntas, atualize o JSON-LD da home e execute o gerador.

As informações a pedir ao cliente (frota, credenciais, rotas, depoimentos, Perfil da Empresa no Google, Search Console) estão em [docs/pedido-dados-cliente.md](docs/pedido-dados-cliente.md).
