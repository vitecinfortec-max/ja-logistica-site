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
