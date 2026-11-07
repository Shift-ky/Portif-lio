# Relatório técnico — redesign Hacker / Matrix

## Repositório e arquitetura

- Repositório confirmado: https://github.com/Shift-ky/Portif-lio
- Publicação atual: https://shift-ky.github.io/Portif-lio/
- Branch de revisão: `codex/hacker-matrix-reference-redesign`
- Implementação estática em HTML, CSS e JavaScript, sem framework ou build.
- O GitHub Pages serve o conteúdo do repositório.
- `pagina.js` renderiza as páginas dedicadas usando as seções do `index.html`.
- `editar.html` é o editor; o Worker autenticado do Cloudflare escreve `index.html` em `main`.
- `demonstracao.html` fornece as prévias incorporadas de Mar IA e Pocket Friends.

## Diagnóstico inicial

O site já tinha fundo de estação de trabalho hacker, chuva Matrix em SVG, retrato PNG transparente, cores escuras e verdes, cartões de projetos, media queries, `prefers-reduced-motion`, editor com prévia e páginas separadas. As páginas secundárias existiam, mas a folha de estilo escondia todas as seções após o Hero na página inicial. O resultado não exibia a hierarquia longa da referência.

O editor já permitia trocar texto, projetos, foto, tema, posição/camada e cores, mas não tinha um tema Matrix como preset nem ajuste de tamanho/espessura da moldura. O cargo e os indicadores do Hero também eram genéricos.

## Diferenças e implementação nesta branch

| Área | Antes | Nesta revisão |
| --- | --- | --- |
| Composição | A home escondia todas as seções exceto o Hero. | Home exibe Hero, ferramentas, sobre, formação, projetos, experiência e contato; as páginas do menu continuam separadas. |
| Hero | Cargo “Profissional de Tecnologia”; chamada genérica; três indicadores. | Cargo atualizado para Analista de Banco de Dados / DBA / Full Stack em evolução; descrição revisada; quatro indicadores com 3+ anos de SQL Server, 3 projetos, GitHub e foco. |
| Cores | Verde existente próximo da referência. | Variáveis ajustadas para preto profundo, verde #39FF14, texto #F5FFF7 e secundário #B8C9BD. |
| Ferramentas | Seis itens, sem distinção de experiência/estudo. | Doze itens com indicação de contexto: experiência, aprendizado, projetos ou exploração. |
| Navegação | Links separados já existiam. | Cabeçalho alinhado ao nome e identidade Dev & DBA, com alternância Matrix/claro persistida no navegador. |
| Editor | Presets coral, azul e minimalista; escala e posição da foto; camada frontal/traseira. | Matrix virou preset inicial; a cor de destaque alimenta os tons do tema; adicionados tamanho e espessura da moldura. |
| Projetos | Mar IA e Pocket Friends com links e prévias; English Study sem link público. | Estrutura e links existentes preservados; nenhuma URL foi inventada. |
| Acessibilidade | Texto alternativo e movimento reduzido já estavam presentes. | Mantidos; carregamento da imagem principal agora declara dimensões, decodificação assíncrona e prioridade. |

C# e .NET não foram incluídos porque não há evidência suficiente no conteúdo atual para apresentá-los como conhecimentos do proprietário.

## Arquivos analisados

`index.html`, `editar.html`, `pagina.js`, páginas secundárias, `demonstracao.html`, assets visuais, documentação de assets e `_admin/worker.mjs`/README.

## Validação

- Fonte da home verificada: sete seções na ordem prevista.
- Verificados links internos para as cinco páginas secundárias.
- Verificado o carregamento dos scripts compartilhados em todas as páginas.
- Verificados nomes das tecnologias e texto alternativo da foto.
- Sintaxe JavaScript conferida em `pagina.js`, `tema.js` e scripts de `editar.html`.
- Todos os checks estáticos acima passaram.
- Ainda falta conferência visual real em navegador, console e capturas desktop/mobile. Uma prévia do GitHub Pages só pode ser vista após publicação; esta branch não altera produção.

## Pendências de conteúdo e mídia

- Não há PDF de currículo no repositório; por isso nenhum arquivo foi anexado nem foi criado um link que falharia.
- O contato existente tem LinkedIn e GitHub, mas não tem e-mail. Falta o endereço que Robson quer exibir publicamente.
- O fundo e o retrato são PNGs de aproximadamente 1,67 MB cada. Foram preservados nesta revisão; otimização para WebP exige comparar a imagem convertida visualmente antes de substituir.
- Para concluir os botões de currículo e e-mail, é necessário escolher o PDF e informar o e-mail público.

## Publicação

As alterações estão somente em `codex/hacker-matrix-reference-redesign`, prontas para revisão. Não houve merge nem publicação em produção. A prévia visual final e os ajustes de conteúdo devem ser aprovados antes de integrar a branch em `main`.
