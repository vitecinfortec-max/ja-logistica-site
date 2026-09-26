# J.A Logística — site institucional

O site é estático e publicado pela Vercel. Os arquivos HTML gerados ficam versionados; não é necessário instalar dependências nem configurar um build na hospedagem.

## Atualização

1. Edite os textos, perguntas e fotos em `data/services.json`. O campo `homeDescription` controla o resumo na página inicial.
2. Ajuste a estrutura das páginas em `scripts/build-service-pages.js`, os cartões em `scripts/build-home-services.js` e o visual nos arquivos CSS correspondentes, se necessário.
3. Na raiz do projeto, execute:

```sh
node scripts/build-site.js
```

4. Confira as páginas no navegador, os links de cotação e `git diff --check` antes de publicar.

O gerador reaproveita o cabeçalho, o rodapé, as ações rápidas, o script principal e os metadados da empresa de `index.html`. Execute-o também quando esses trechos compartilhados mudarem. Títulos, descrições, canonical, dados estruturados e sitemap são gerados por serviço.

As URLs públicas não têm extensão nem barra final, conforme `vercel.json`. O sitemap inclui a página inicial e os serviços cadastrados.

A cotação abre `/?servico=<slug>#cotacao`. Os quatro slugs aceitos são mapeados para as opções do formulário em `js/interactions.js`; qualquer slug desconhecido é ignorado. Ao cadastrar outro serviço, atualize esse mapeamento e as opções do formulário.

As fotos existentes são usadas em JPEG e WebP responsivo, sem alteração da proporção. Os contatos e as áreas de atendimento devem refletir apenas dados confirmados pela empresa.

## Identidade visual e página inicial

Consulte [o guia visual](docs/DESIGN.md) para a divisão dos estilos, os componentes, a conferência de entrega e os cuidados ao reutilizar esta base em outros projetos. Cores, fontes e medidas compartilhadas ficam em `css/tokens.css`; a composição da inicial está em `css/home.css`.
