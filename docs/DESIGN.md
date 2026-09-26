# Guia visual e manutenção

## Base da identidade

O tema compartilhado fica em `css/tokens.css`: cores, famílias de fontes, largura de conteúdo, escala dos títulos, espaçamento de seções, cantos dos painéis e tamanho dos controles. A página inicial e os quatro serviços carregam o mesmo arquivo.

- Azul-petróleo: títulos, áreas institucionais e fundo de abertura.
- Laranja: ação comercial principal e pequenos destaques.
- Verde do WhatsApp: reservado ao canal de atendimento.
- Poppins: títulos. Inter: textos, formulários e navegação.
- Seções: 76 px de espaço vertical no desktop e 52 px no celular.
- Painéis: raio de 20 px; cartões: 16 px; controles: 10 px.
- Ação principal: altura mínima de 52 px. Links e ações compactas: pelo menos 44 px.

A leitura vem antes da decoração. Use bordas e fundos leves; evite adicionar outra sombra ou outro tamanho de botão para cada seção.

## Organização dos arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `css/tokens.css` | Valores centrais do tema |
| `css/style.css` | Base, cabeçalho, rodapé, formulário, contatos, FAQ e componentes compartilhados |
| `css/home.css` | Composições da página inicial |
| `css/services.css` | Layout das páginas de serviços |
| `data/services.json` | Conteúdo e fotos dos serviços, incluindo `homeDescription` |
| `index.html` | Conteúdo institucional e ordem das seções da página inicial |
| `scripts/build-site.js` | Atualiza os cartões da inicial, as páginas de serviços e o sitemap |

## Composição da página inicial

1. Abertura com foto real da frota e ação de cotação.
2. Indicadores em uma faixa compacta.
3. Quatro resumos de serviços com links para as páginas completas.
4. Diferenciais em linhas abertas.
5. Galeria com uma foto em destaque e duas complementares. As demais ficam em um bloco expansível.
6. Apresentação institucional com princípios expansíveis e acesso ao PDF.
7. Parceiros, clientes, dúvidas, cotação e contato.

Os detalhes expansíveis usam HTML nativo e funcionam sem JavaScript. Todas as seis fotos continuam disponíveis na galeria ampliada; os originais mantêm suas proporções.

Os cartões de serviço usam quatro colunas no desktop, duas no tablet e composição horizontal no celular. A imagem de cada cartão repete o destino do título; a navegação por teclado prioriza os links textuais.

## Atualizar e publicar

Execute na raiz:

```sh
node scripts/build-site.js
git diff --check
```

O script não instala dependências. A hospedagem usa os HTMLs gerados e versionados. Não edite diretamente a região `SERVICE_CARDS_START / END` nem os arquivos de `servicos/`: altere os dados ou o gerador correspondente.

Ao alterar o CSS/JS compartilhado, atualize a versão na URL do arquivo no HTML e regenere as páginas. O CSS exclusivo da inicial não é incluído nas páginas de serviços.

## Conferência de entrega

- Revisar desktop, tablet e celular, inclusive 320 px.
- Conferir títulos, imagens, links e ausência de rolagem horizontal.
- Abrir princípios, perguntas frequentes e todas as fotos.
- Usar o menu e a galeria por teclado; conferir foco ao fechar.
- Validar os quatro caminhos de cotação sem enviar mensagens de teste.
- Conferir telefone, e-mail, mapa, horário e PDF.
- Verificar as páginas de serviços, canonical, metadados e sitemap.
- Confirmar os arquivos e as rotas no domínio depois da publicação.

## Reutilização em outros projetos

Esta é uma base visual preparada para evolução, ainda com conteúdo específico da J.A Logística. Para outro cliente, ajuste os tokens e as composições à nova identidade e substitua os dados confirmados da empresa: marca, domínio, fotos, serviços, contatos, endereço, área de atendimento, números, parceiros, PDF e dados estruturados.

A estrutura visual pode ser reaproveitada. Informações comerciais, fotos e depoimentos exigem conteúdo próprio e autorização de uso. Os dados da empresa ainda presentes no HTML, nos links e no gerador devem ser revisados antes de qualquer nova publicação.
