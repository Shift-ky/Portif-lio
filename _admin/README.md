# Editor autenticado do portfólio

O GitHub Pages continua servindo o portfólio público. Este Worker serve o editor em outro endereço, valida a conta GitHub Shift-ky e grava somente o arquivo index.html na branch main. A sessão expira após 30 minutos e usa um cookie criptografado. Não é necessário criar um banco de dados.

## Ativação

1. Implante esta pasta como um Cloudflare Worker com o Wrangler. A partir de _admin, execute npx wrangler deploy e anote o endereço HTTPS do Worker.
2. Crie um GitHub App na conta Shift-ky. Use o endereço do Worker como URL da aplicação e acrescente /callback para a URL de retorno. Desative webhooks e permita instalação somente na sua conta.
3. Conceda acesso de leitura e escrita a Contents. Instale o App selecionando somente o repositório Shift-ky/Portif-lio.
4. Configure GITHUB_CLIENT_ID com o Client ID do App. Configure GITHUB_CLIENT_SECRET com o segredo do App e SESSION_KEY com 32 bytes aleatórios em Base64. Use npx wrangler secret put NOME para cada valor. Mantenha os valores no Worker.
5. Abra o Worker, entre com Shift-ky e faça uma publicação de teste. Confira se o commit foi gravado em main e se o GitHub Pages disponibilizou a versão no endereço público.

O Worker usa editar.html do repositório como interface. Depois de validar o novo editor, o acesso ao editor antigo no Pages pode ser retirado mantendo o HTML como modelo dentro de _admin e ajustando o caminho de leitura no Worker.
