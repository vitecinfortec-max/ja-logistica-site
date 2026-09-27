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
