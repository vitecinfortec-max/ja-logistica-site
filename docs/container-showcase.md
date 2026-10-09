# Vitrine 3D de contêineres — 8 de outubro de 2026

O destaque de venda na página inicial e em `servicos/conteineres.html` apresenta um Dry Box de 20 pés em uma vitrine integrada ao layout. A direção de movimento foi inspirada nas entradas e transformações de [Anime.js](https://animejs.com/); não foi adicionada outra biblioteca.

## Funcionamento

- O módulo `js/container-showcase.js` recebe o catálogo e a URL da cena de `js/container-viewer.js`. A geometria, os materiais e os controles são os mesmos do catálogo existente.
- Three.js é carregado quando pelo menos 15% da vitrine entra na tela. O movimento de entrada dura 2,6 segundos, desacelera e termina; não existe giro contínuo.
- Arraste e setas giram o modelo; Home restaura a vista. Interagir interrompe a animação. O botão **Rever animação** permite repetir a entrada.
- A preferência por movimento reduzido impede a entrada automática e transforma o botão em **Restaurar vista**.
- Ao sair da tela, ocultar a página ou abrir qualquer diálogo, a vitrine libera o renderizador. Ao voltar, recupera o ângulo estático. O catálogo mantém um renderizador na exploração ou dois na comparação.
- A ilustração SVG permanece disponível enquanto o módulo carrega e nos casos de JavaScript ou WebGL indisponível. As informações de venda e o contato continuam acessíveis.
- Os sete modelos permanecem no catálogo e no comparador. A vitrine não indica estoque nem especificação de uma unidade disponível.

## Arquivos e geração

- `css/showcase.css`: layout e estados visuais exclusivos desta seção.
- `assets/img/container-showcase.svg`: ilustração vetorial alternativa.
- `index.html`: conteúdo compartilhado do destaque.
- `scripts/build-service-pages.js`: replica o destaque na página de contêineres e omite o CSS nas outras páginas de serviço.

Depois de alterar o destaque, execute `node scripts/build-service-pages.js`. Atualize os parâmetros de versão dos arquivos alterados.

## Validação

Conferidos no navegador: layout sem transbordamento em 320, 390, 768, 1200, 1440 e 1920 px; giro por arraste e teclado; repetição e interrupção da entrada; abertura e fechamento do comparador com liberação da cena da vitrine; recuperação de foco; contato de venda; integração com a página de serviço.

Uma prévia local de teste simulou JavaScript desativado, WebGL indisponível e a resposta de `matchMedia` para movimento reduzido. A última simulação verifica o comportamento JavaScript, não altera a preferência do sistema. O movimento ficou desativado e o botão restaurou o ângulo zero. As alternativas sem 3D mantiveram ilustração e contato.
