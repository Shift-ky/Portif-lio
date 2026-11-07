const repo = 'Shift-ky/Portif-lio';
const ownerId = 103571578;
const publicUrl = 'https://shift-ky.github.io/Portif-lio/';
const api = 'https://api.github.com/repos/' + repo;
const bytes = new TextEncoder();
const decoder = new TextDecoder();
const maxHtmlBytes = 3_000_000;

function b64(data) {
  let value = '';
  for (let i = 0; i < data.length; i += 8192) {
    value += String.fromCharCode(...data.subarray(i, i + 8192));
  }
  return btoa(value);
}
const unb64 = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
const random = () => b64(crypto.getRandomValues(new Uint8Array(32))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const cookie = (name, value, age) => name + '=' + value + '; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=' + age;
const response = (body, status = 200, type = 'text/plain; charset=utf-8', extra = {}) =>
  new Response(body, {status, headers: {'Content-Type':type, 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY', ...extra}});
const json = (value, status = 200) => response(JSON.stringify(value),status,'application/json; charset=utf-8');
const redirect = (location, cookies = []) => {
  const result = response(null,303,undefined,{Location:location});
  for (const value of cookies) result.headers.append('Set-Cookie',value);
  return result;
};
const readCookie = (request,name) => (request.headers.get('Cookie') || '').split('; ').find(value => value.startsWith(name+'='))?.slice(name.length+1);
const github = (url, token, options = {}) => fetch(url,{...options,headers:{
  'Authorization':'Bearer '+token, 'Accept':'application/vnd.github+json', 'User-Agent':'Robson-Portfolio-Editor',
  'X-GitHub-Api-Version':'2022-11-28', ...options.headers
}});
async function sessionKey(env) {
  const material = unb64(env.SESSION_KEY);
  if (material.length !== 32) throw Error('Chave de sessão inválida');
  return crypto.subtle.importKey('raw',material,'AES-GCM',false,['encrypt','decrypt']);
}
async function seal(env, token) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = bytes.encode(JSON.stringify({token, expires:Date.now()+30*60*1000}));
  const encrypted = await crypto.subtle.encrypt({name:'AES-GCM',iv},await sessionKey(env),data);
  return b64(iv)+'.'+b64(new Uint8Array(encrypted));
}
async function session(request,env) {
  try {
    const [iv,data] = readCookie(request,'__Host-portfolio-session').split('.');
    const plain = await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(iv)},await sessionKey(env),unb64(data));
    const value = JSON.parse(decoder.decode(plain));
    return value.expires > Date.now() ? value.token : null;
  } catch { return null; }
}
async function file(token,path) {
  const result = await github(api+'/contents/'+path+'?ref=main',token);
  if (!result.ok) return null;
  const data = await result.json();
  if (data.encoding === 'base64') return {sha:data.sha,html:decoder.decode(unb64(data.content))};
  if (data.encoding !== 'none' || !/^[a-f0-9]{40}$/.test(data.sha)) return null;
  const blob = await github(api+'/git/blobs/'+data.sha,token);
  if (!blob.ok) return null;
  const payload = await blob.json();
  return payload.encoding === 'base64' ? {sha:data.sha,html:decoder.decode(unb64(payload.content))} : null;
}
const loginPage = '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Editor do portfólio</title><h1>Editor do portfólio</h1><p>Área de edição da conta Shift-ky.</p><a href="/login">Entrar com GitHub</a></html>';
const publishScript = '<script>' + (() => {
  document.getElementById('publish').onclick = async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const result = await fetch('/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({html:build(),sha:baseSha})});
      const data = await result.json();
      if (!result.ok) throw Error(data.error);
      baseSha = data.sha;
      status('Commit salvo. O GitHub Pages ainda precisa implantar esta versão.');
      document.getElementById('public-page').hidden = false;
    } catch (error) { status(error.message || 'Falha na publicação.'); }
    finally { button.disabled = false; }
  };
}).toString().replace(/^\(\) => \{\n|\n\}$/g,'') + '</script>';

async function handle(request,env) {
  const url = new URL(request.url);
  const callback = url.origin + '/callback';
  if (request.method === 'GET' && url.pathname === '/login') {
    const state = random();
    const params = new URLSearchParams({client_id:env.GITHUB_CLIENT_ID,redirect_uri:callback,state});
    return redirect('https://github.com/login/oauth/authorize?'+params,[cookie('__Host-portfolio-state',state,600)]);
  }
  if (request.method === 'GET' && url.pathname === '/callback') {
    const clear = cookie('__Host-portfolio-state','',0);
    const state = readCookie(request,'__Host-portfolio-state');
    const code = url.searchParams.get('code');
    if (!code || !state || state !== url.searchParams.get('state')) {
      return response('Autorização inválida ou vencida. Volte à página inicial e tente novamente.',400,undefined,{'Set-Cookie':clear});
    }
    const exchange = await fetch('https://github.com/login/oauth/access_token',{
      method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},
      body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code,redirect_uri:callback})
    });
    const {access_token:token} = await exchange.json();
    if (!exchange.ok || !token) return response('GitHub não autorizou a sessão.',403,undefined,{'Set-Cookie':clear});
    const user = await github('https://api.github.com/user',token);
    if (!user.ok || (await user.json()).id !== ownerId) return response('Esta conta não pode editar o portfólio.',403,undefined,{'Set-Cookie':clear});
    const access = await github(api,token);
    if (!access.ok || !(await access.json()).permissions?.push) return response('Instale o GitHub App no repositório Portif-lio com permissão de escrita.',403,undefined,{'Set-Cookie':clear});
    return redirect('/',[clear,cookie('__Host-portfolio-session',await seal(env,token),1800)]);
  }
  if (request.method === 'POST' && request.headers.get('Origin') !== url.origin) return json({error:'Origem inválida.'},403);
  if (request.method === 'POST' && url.pathname === '/logout') return redirect('/',[cookie('__Host-portfolio-session','',0)]);

  const token = await session(request,env);
  if (!token) {
    if (request.method === 'GET' && url.pathname === '/') return response(loginPage,200,'text/html; charset=utf-8');
    return json({error:'Entre com GitHub novamente para continuar.'},401);
  }
  if (request.method === 'GET' && url.pathname === '/') {
    const editor = await file(token,'editar.html');
    if (!editor) return response('Editor indisponível no repositório.',502);
    const html = editor.html
      .replace('As mudanças ficam neste navegador. Para publicar, baixe o HTML e substitua o index.html no GitHub.', 'Salve um rascunho neste navegador ou publique direto no GitHub.')
      .replace('<button id="save"', '<form action="/logout" method="post"><button>Sair do GitHub</button></form><button id="publish" disabled>Publicar</button> <a id="public-page" hidden href="'+publicUrl+'">Abrir site público</a> <button id="save"')
      .replace('<a href="./">Voltar ao portfólio</a>','<a href="'+publicUrl+'">Voltar ao portfólio</a>')
      .replace("let source, draft, frame, recognition;", "let source, draft, frame, recognition, baseSha;")
      .replace("if (!response.ok) throw Error('Portfólio indisponível');","if (!response.ok) throw Error('Portfólio indisponível');\n  baseSha = response.headers.get('X-Portfolio-Sha');")
      .replace("el('save').disabled = el('download').disabled = false;","el('save').disabled = el('download').disabled = el('publish').disabled = false;")
      .replace('</script></html>','</script>'+publishScript+'</html>');
    if (!html.includes("baseSha = response.headers.get") || !html.includes("id=\"publish\"") || !html.includes("fetch('/publish'")) {
      return response('O formato do editor mudou. Revise a integração antes de publicar.',502);
    }
    return response(html,200,'text/html; charset=utf-8');
  }
  if (request.method === 'GET' && url.pathname === '/index.html') {
    const page = await file(token,'index.html');
    return page ? response(page.html,200,'text/plain; charset=utf-8',{'X-Portfolio-Sha':page.sha}) : response('Portfólio indisponível.',502);
  }
  if (request.method === 'POST' && url.pathname === '/publish') {
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({error:'Formato inválido.'},415);
    if (Number(request.headers.get('Content-Length')) > maxHtmlBytes+100_000) return json({error:'Arquivo grande demais.'},413);
    const raw = await request.text();
    if (raw.length > maxHtmlBytes+100_000) return json({error:'Arquivo grande demais.'},413);
    let data;
    try { data = JSON.parse(raw); } catch { return json({error:'Formato inválido.'},400); }
    if (!data || typeof data.html !== 'string' || !/^<!doctype html>/i.test(data.html) || !/^[a-f0-9]{40}$/.test(data.sha)) return json({error:'HTML ou versão inválida.'},400);
    const content = bytes.encode(data.html);
    if (content.length > maxHtmlBytes) return json({error:'Reduza o tamanho da foto e tente novamente.'},413);
    const result = await github(api+'/contents/index.html',token,{
      method:'PUT',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:'Atualiza portfólio pelo editor',content:b64(content),sha:data.sha,branch:'main'})
    });
    if (result.status === 409 || result.status === 422) return json({error:'O GitHub recusou esta versão. Salve o rascunho e recarregue o editor para verificar se o arquivo mudou.'},409);
    if (result.status === 401 || result.status === 403) return json({error:'Sessão expirada ou acesso de escrita indisponível. Entre novamente com GitHub.'},403);
    if (!result.ok) return json({error:'O GitHub não conseguiu salvar a alteração.'},502);
    const saved = await result.json();
    return json({sha:saved.content.sha,commit:saved.commit.sha});
  }
  return json({error:'Página não encontrada.'},404);
}
export default {
  async fetch(request,env) {
    try { return await handle(request,env); }
    catch { return json({error:'Serviço temporariamente indisponível.'},502); }
  }
};
