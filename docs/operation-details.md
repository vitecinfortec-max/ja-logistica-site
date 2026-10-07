# Detalhes das operações

A seção Estrutura e Operação mantém as seis fotos e os filtros existentes. Cada cartão inclui Ver detalhes da operação. Com JavaScript, esse controle abre a mesma janela usada para ampliar a foto, com contexto e ações; sem JavaScript, expande o conteúdo diretamente no cartão.

## Conteúdo e manutenção

- Fonte das fichas: data/operations.json. O id corresponde ao nome do arquivo da foto existente, service referencia um slug de data/services.json, facts reúne os dados exibidos e planning orienta a cotação.
- Os textos usam as legendas já publicadas e os serviços descritos em data/services.json. São apresentações de operações e estrutura: não atribuem cliente, data, trajeto específico ou resultado quantitativo que não tenha sido informado.
- Para acrescentar um relato específico, confirmar os fatos e a autorização de divulgação antes de incluir nome de cliente ou resultados.
- Execute node scripts/build-operations.js para atualizar somente as fichas no index.html. Os pontos de inserção são delimitados por OPERATION_DETAIL:id.
- node scripts/build-service-pages.js também atualiza as fichas. As páginas de serviço não carregam o CSS exclusivo da galeria.
- Estilos em css/operations.css; interação em js/interactions.js. Ao publicar alterações nesses recursos, atualizar suas versões no index.html.

## Interações

A janela apresenta foto sem corte, miniaturas, categoria, descrição, fatos, orientações de cotação e link ao serviço correspondente. Anterior/próxima e as miniaturas percorrem somente os itens do filtro selecionado.

Enter ou espaço no controle do cartão abre a janela. As miniaturas permitem setas, Home e End. Escape e Fechar devolvem o foco ao controle que abriu a janela. O diálogo nativo impede a interação com o conteúdo de fundo, e o cabeçalho de fechamento permanece acessível durante a rolagem.

Solicitar cotação seleciona o serviço, fecha a janela e leva o foco ao formulário. Nome, origem, destino e descrição existentes são preservados. A ação não envia mensagem. Links continuam com destinos nativos para abertura em outra aba.

As descrições e ações continuam disponíveis se a foto ampliada falhar. A animação de troca respeita movimento reduzido, inclusive se a preferência mudar com a janela aberta.

## Verificação

Conferidos as seis fichas e seus links, seleção de serviço sem perda de dados, filtros com 6/2/3/3 itens, teclado, restauração de foco, erros de imagem, conteúdo sem JavaScript e movimento reduzido. Layout verificado em 320, 390, 768, 1024, 1440 e 1920 pixels, além de paisagem 844 × 390. As demais seções da página inicial permanecem inalteradas.
