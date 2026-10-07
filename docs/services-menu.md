# Menu visual de serviços

O menu do cabeçalho reúne os quatro serviços com fotos reais, descrição curta, acesso à página e link de cotação. Aparece na página inicial e nas quatro páginas de serviço.

## Manutenção

- Fonte: data/services.json. Cada serviço usa name, slug, navigationSummary e a foto hero existente na versão de 640 pixels.
- Gerador: scripts/build-services-menu.js. Atualiza somente o trecho entre SERVICES_MENU_START e SERVICES_MENU_END no index.html.
- Execute node scripts/build-service-pages.js para atualizar o menu da página inicial e os cabeçalhos das quatro páginas de serviço. O gerador do menu também pode ser executado isoladamente.
- Estilos: css/navigation.css. Comportamento: js/main.js. Atualize as versões dos recursos no index.html ao publicá-los e gere novamente as páginas.

## Interação

No computador, Serviços abre um painel de quatro colunas, reduzido a duas em telas intermediárias. No celular, o painel fica dentro do menu principal, com cartões compactos e rolagem limitada à altura disponível.

O painel abre por clique ou teclado. Escape, o botão de fechar e um clique fora fecham o painel. A seta para baixo no botão Serviços abre o painel e foca o primeiro serviço. Escape devolve o foco ao botão e, no celular, uma segunda pressão fecha o menu principal.

Na página inicial, Solicitar cotação seleciona o serviço e leva ao formulário sem recarregar a página nem apagar os dados já digitados. Nas páginas de serviço, o link abre a página inicial com o parâmetro servico e a âncora cotacao. Os links mantêm destinos nativos para abertura em outra aba. Sem JavaScript, o link Serviços do cabeçalho permanece disponível para acessar a seção.

As imagens existentes usam carregamento adiado. A animação de abertura respeita a preferência por movimento reduzido. Não há nova biblioteca ou dependência de terceiros.

## Verificação

Conferidos navegação para os quatro serviços, seleção e preservação dos dados da cotação, teclado, fechamento externo, preferência por movimento reduzido e ausência de erros de JavaScript. Layout verificado em 320, 390, 768, 1024, 1440 e 1920 pixels, além de paisagem com 844 × 390 pixels. O conteúdo das seções da página inicial permanece inalterado.
