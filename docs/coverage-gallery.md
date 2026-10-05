# Mapa de cobertura e filtros da galeria

## Conteúdo e escopo

A página inicial oferece um mapa de cobertura e filtros na galeria de operações. O restante do layout, incluindo a abertura do site, permanece como aprovado.

O mapa distingue o Nordeste, a região Norte sob consulta e o terminal em Caucaia–CE. A região Norte inteira aparece hachurada apenas como referência regional: **a empresa atende parte da região Norte**, e o texto exige consulta da rota. Não existe lista de estados do Norte com atendimento garantido. Os demais estados aparecem apenas como contexto geográfico.

Os controles acima do painel e as regiões do mapa selecionam a mesma informação. O botão de consulta leva ao formulário sem alterar serviço, origem ou destino já preenchidos. O marcador usa as coordenadas cadastradas no JSON-LD da página inicial; a geometria simplificada e a projeção servem para apresentação, não para navegação.

## Base geográfica

- Fonte: Instituto Brasileiro de Geografia e Estatística (IBGE), API de Malhas, versão 3.
- Documentação: https://servicodados.ibge.gov.br/api/docs/malhas?versao=3
- Consulta em 05/10/2026: https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&intrarregiao=UF&qualidade=minima
- Cópia local: `data/geo/br-uf-simplified.geojson`, com 27 unidades da federação.
- Geração: `scripts/build-coverage-map.js` converte a cópia local em SVG entre os marcadores `COVERAGE_MAP_START` e `COVERAGE_MAP_END` da página inicial.
- Não há consulta ao IBGE, serviço de mapas ou geolocalização durante a visita. O SVG tem descrição textual e atribuição visível.

## Galeria

As categorias são definidas em `data-gallery-categories` em cada figura de `index.html`:

| Foto | Categorias |
| --- | --- |
| Transporte de bobinas | Transporte |
| Carregamento de container | Terminal |
| Armazenagem de granéis | Armazenagem |
| Amplo armazém fechado | Armazenagem e Terminal |
| Espaço para Depot de containers | Armazenagem e Terminal |
| Carregamentos portuários | Transporte |

A mesma foto pode aparecer em categorias diferentes; os totais de categorias não devem ser somados. São seis fotos únicas. Contagens, visibilidade e tamanho das imagens são atualizados pelo script. Quando o filtro exibe duas fotos em computador, a grade usa duas colunas e solicita imagens adequadas à largura maior.

`js/interactions.js` recria miniaturas, contador e navegação da foto ampliada a partir da seleção atual. Fechar a ampliação devolve o foco à foto de origem. A navegação anterior/próxima não inclui fotos ocultas pelo filtro.

## Implementação e manutenção

- `css/explore.css` e `js/explore.js` são exclusivos da página inicial.
- `js/main.js` não reaplica a animação de entrada em cartões já controlados pelos filtros.
- As transições usam recursos nativos do navegador e respeitam `prefers-reduced-motion`. O contorno do mapa aparece uma vez; não há movimento contínuo.
- Sem JavaScript, o mapa e as informações permanecem visíveis e a galeria mostra as seis fotos com seus links originais. Os controles dependentes do script ficam ocultos.
- Após editar o mapa ou os elementos compartilhados, executar:

```sh
node scripts/build-coverage-map.js
node scripts/build-service-pages.js
```

Os arquivos HTML gerados são versionados; a publicação não exige etapa de build. Atualizar as versões das URLs de CSS/JS quando alterar os arquivos.

## Validação realizada

Navegador Edge/Chromium nas larguras 320, 390, 768, 1024, 1440 e 1920 pixels; inspeção visual de computador, tablet e celular; navegação por teclado no mapa e nos filtros; preservação do formulário; categorias com 6/2/3/3 fotos; navegação e miniaturas da ampliação por categoria; alternância rápida dos filtros; preferência por movimento reduzido; fallback sem JavaScript; ausência de carregamento antecipado do módulo 3D. A abertura da página foi comparada com a versão anterior e não mudou.
