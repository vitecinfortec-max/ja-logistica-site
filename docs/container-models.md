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
