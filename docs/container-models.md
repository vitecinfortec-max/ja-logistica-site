# Modelos de contêineres em 3D

O catálogo reúne sete representações ilustrativas. As medidas usadas na geometria são externas e nominais, em metros; a interface arredonda para duas casas decimais. Não representam uma unidade em estoque nem substituem a especificação do equipamento oferecido na venda.

| Modelo | Comprimento | Largura | Altura |
| --- | ---: | ---: | ---: |
| Dry Box 20 pés | 6,058 | 2,438 | 2,591 |
| Dry Box 40 pés | 12,192 | 2,438 | 2,591 |
| High Cube (HC) 40 pés | 12,192 | 2,438 | 2,896 |
| Open Top 20 pés | 6,058 | 2,438 | 2,591 |
| Open Top 40 pés | 12,192 | 2,438 | 2,591 |
| Reefer (HC) 20 pés | 6,058 | 2,438 | 2,896 |
| Reefer (HC) 40 pés | 12,192 | 2,438 | 2,896 |

## Referências consultadas em 5 de outubro de 2026

- [Hapag-Lloyd — Container Specification](https://static-cf.hapag-lloyd.com/content/dam/website/downloads/press_and_media/publications/15211_Container_Specification_engl_Gesamt_web.pdf): tabela de dimensões externas na página impressa 5; famílias General Purpose, High Cube, Open Top e High Cube Refrigerated. As páginas de Open Top descrevem arcos, lona removível e acesso superior. A tabela de 20 pés refrigerado desse catálogo é da versão padrão, não da variante HC.
- [Cubner — 20-foot High Cube reefer](https://cubner.com/en/Containers/refrigerated/reefer-refrigerated-container-20-feet-hc/): tabela de medidas externas usada para a variante Reefer HC de 20 pés, incluindo a altura de 2,896 m.

A geometria e o acabamento foram criados por código para este visualizador. Cores, quantidade e desenho de peças, painéis e equipamentos de refrigeração são representativos. Não são reproduzidas marcas de fabricantes, números de série, certificações ou faixas de temperatura.

## Manutenção

- O catálogo de nomes, descrições, medidas e identificadores fica em `js/container-viewer.js`. Ele também sincroniza a seleção por botões no computador e por lista no celular, as medidas exibidas e a mensagem específica de WhatsApp.
- `js/container-geometry.js` constrói as chapas, portas, travas, cantos e diferenças de cada tipo. O Open Top tem interior vazio, piso, arcos e lona recolhida. O Reefer tem paredes isoladas e uma unidade de refrigeração oposta às portas.
- `js/container-scene.js` controla iluminação, câmera, rotação, zoom e recursos gráficos. A troca de modelo reutiliza o renderizador e libera os recursos do modelo anterior. O enquadramento inicial considera uma volta completa, inclusive para os modelos longos.
- Three.js e a geometria só são importados após abrir o visualizador. Não há animação contínua quando o visitante está parado. Fechar libera o contexto gráfico.
- A consulta usa o contato de vendas do destaque e inclui o nome e o tamanho selecionados. Mesmo sem WebGL ou com falha no carregamento 3D, a seleção, as informações e o link de WhatsApp continuam disponíveis.
- Ao alterar arquivos importados, atualize as versões em seus importadores. Alterações nos scripts e CSS de entrada exigem atualizar `index.html` e executar `node scripts/build-service-pages.js`.

## Verificações desta alteração

Sete variantes conferidas visualmente e em telas de 320, 390, 768, 1440 e 1920 px. Verificados seleção, descrição, medidas, WhatsApp com modelo e contato corretos, teclado, arraste, zoom, fechamento/reabertura, falha de rede e WebGL. A contagem de buffers, texturas e contextos retorna ao valor inicial ao percorrer os modelos. Um teste de interseção confirma a abertura real até o piso do Open Top.

## Comparador integrado — 6 de outubro de 2026

O destaque de venda oferece as ações **Explorar 3D** e **Comparar**. Ambas abrem o mesmo catálogo, também disponível na página do serviço de contêineres. As abas permitem alternar entre um modelo individual e dois modelos para comparação.

- Os dois seletores usam os mesmos sete registros do catálogo. Um modelo já selecionado não pode ser repetido no outro lado. Ao entrar na comparação a partir da exploração, o modelo atual ocupa a primeira posição.
- Comprimento, largura, altura externa, tipo de teto, refrigeração e uso comum aparecem em cada cartão. Diferenças são destacadas e descritas em um resumo acessível. As características por família ficam junto ao catálogo, em `js/container-viewer.js`, com base nas referências acima.
- As câmeras da comparação compartilham a referência de enquadramento (12,192 × 2,438 × 2,896 m) e a direção inicial. Isso evita que o ajuste automático de cada modelo faça um contêiner de 20 pés parecer tão longo quanto um de 40 pés. Giro e zoom continuam independentes; a indicação de escala refere-se à vista inicial.
- Cada cartão tem um link próprio de consulta, derivado do contato de venda do destaque e preenchido com o nome e o tamanho escolhidos. Nenhuma mensagem é enviada automaticamente.
- Em telas de até 640 px, os cartões aparecem em sequência; acima disso, ficam lado a lado. As abas têm navegação por setas, Home e End, e o fechamento devolve o foco ao botão de origem.
- Somente o modo visível mantém renderizadores: um na exploração ou dois na comparação. A troca de modelo reutiliza o renderizador; a troca de modo e o fechamento encerram os contextos anteriores. O carregamento 3D permanece sob demanda, com renderização apenas ao interagir ou redimensionar.
- Se uma visualização falhar, as medidas, a seleção e o contato desse cartão continuam funcionando. A perda de um contexto não interrompe o outro modelo.

### Validação do comparador

Verificados os sete modelos, as diferenças exibidas, os dois contatos específicos, o impedimento de seleções repetidas, a integração com a página de contêineres, os layouts em 320, 390, 768, 1440 e 1920 px, o teclado, os controles independentes, o fechamento durante carregamento, as falhas de importação/WebGL e a perda isolada de um contexto. Buffers e texturas retornam ao patamar inicial ao percorrer os modelos. No fechamento, os contextos ficam perdidos e todos os buffers são descartados; texturas internas do renderizador também são invalidadas pela perda do contexto, mesmo quando não há chamada explícita a deleteTexture.
