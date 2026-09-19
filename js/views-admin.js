/* Aba Acesso (administrador): membros liberados, importação dos dados sigilosos e regras do Firestore. */
(function(){
"use strict"; var T=window.TED, esc=T.esc, icon=T.icon;

var RULES=[
"rules_version = '2';",
"service cloud.firestore {",
"  match /databases/{database}/documents {",
"",
"    // >>> TROQUE pelo e-mail do DONO do sistema (o mesmo que você usará para entrar), em minúsculas <<<",
"    function isOwner() {",
"      return request.auth != null",
"        && request.auth.token.email_verified == true",
"        && request.auth.token.email.lower() == 'troque-por-seu-email@exemplo.com';",
"    }",
"    function tedListed() {",
"      return exists(/databases/$(database)/documents/tedUsuarios/$(request.auth.token.email.lower()));",
"    }",
"    function tedOk() {",
"      return request.auth != null && (isOwner() ||",
"        (request.auth.token.email_verified == true && tedListed()));",
"    }",
"    function tedAdmin() {",
"      return request.auth != null && (isOwner() ||",
"        (request.auth.token.email_verified == true && tedListed() &&",
"         get(/databases/$(database)/documents/tedUsuarios/$(request.auth.token.email.lower())).data.papel == 'admin'));",
"    }",
"",
"    // usado pelo app para saber se quem entrou é administrador",
"    match /tedAdmin/{id} { allow read: if tedAdmin(); }",
"",
"    match /tedUsuarios/{email} {",
"      allow read: if tedOk() || (request.auth != null && request.auth.token.email.lower() == email);",
"      allow write: if tedAdmin();",
"    }",
"    match /tedProcessos/{id} { allow read: if tedOk(); allow write: if tedAdmin(); }",
"    match /tedMeus/{id}      { allow read: if tedOk(); allow write: if tedAdmin(); }",
"    match /tedVotos/{id}     { allow read: if tedOk(); allow write: if tedAdmin(); }",
"    match /tedNotas/{uid}/itens/{id} {",
"      allow read, write: if tedOk() && request.auth.uid == uid;",
"    }",
"  }",
"}"
].join('\n');
T.TED_RULES=RULES;

function usersPanel(host){
  host.innerHTML='<div class="panel"><h3>Membros liberados</h3><p class="hint">Só e-mails desta lista entram no sistema. Cada pessoa cria a própria senha na tela de entrada (“Primeiro acesso?”) e confirma o e-mail. <b>Leitor</b> vê tudo e guarda anotações próprias; <b>Administrador</b> também importa dados e cadastra Meus processos.</p>'+
    '<div class="two"><label class="field"><span>E-mail</span><input class="input" id="u-mail" type="email" placeholder="colega@exemplo.com.br"></label><label class="field"><span>Nome</span><input class="input" id="u-nome"></label></div>'+
    '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:end"><label class="field" style="margin:0"><span>Papel</span><select class="select input" id="u-pap"><option value="leitor">Leitor</option><option value="admin">Administrador</option></select></label><button class="btn" id="u-add">'+icon('plus')+' Liberar acesso</button></div><div id="u-msg"></div>'+
    '<div id="u-list" style="margin-top:16px"><span class="spin"></span></div></div>';
  function list(){
    T.fs.collection('tedUsuarios').get().then(function(qs){
      var rows=[]; qs.forEach(function(d){ rows.push(Object.assign({_id:d.id},d.data())); });
      T.$('#u-list',host).innerHTML=rows.length? '<table class="users"><tr><th>E-mail</th><th>Nome</th><th>Papel</th><th></th></tr>'+rows.map(function(r){ return '<tr><td>'+esc(r._id)+'</td><td>'+esc(r.nome||'')+'</td><td><span class="chip '+(r.papel==='admin'?'info':'')+'">'+esc(r.papel==='admin'?'administrador':'leitor')+'</span></td><td><button class="btn ghost sm" data-rm="'+esc(r._id)+'">Remover</button></td></tr>'; }).join('')+'</table>' : '<p class="hint">Ninguém liberado ainda (o dono definido nas regras entra sempre).</p>';
      T.$$('[data-rm]',host).forEach(function(b){ b.addEventListener('click',function(){ if(confirm('Remover o acesso de '+b.getAttribute('data-rm')+'?')) T.fs.collection('tedUsuarios').doc(b.getAttribute('data-rm')).delete().then(list); }); });
    }).catch(function(e){ T.$('#u-list',host).innerHTML='<div class="callout bad">Sem permissão para listar (as regras do TED foram publicadas?). '+esc(e.code||e.message)+'</div>'; });
  }
  T.$('#u-add',host).addEventListener('click',function(){
    var m=T.$('#u-mail',host).value.trim().toLowerCase(), msg=T.$('#u-msg',host);
    if(!/^\S+@\S+\.\S+$/.test(m)){ msg.innerHTML='<div class="msg err">E-mail inválido.</div>'; return; }
    T.fs.collection('tedUsuarios').doc(m).set({ nome:T.$('#u-nome',host).value.trim(), papel:T.$('#u-pap',host).value, criadoEm:Date.now(), criadoPor:T.user.email }).then(function(){ msg.innerHTML='<div class="msg ok">Acesso liberado para '+esc(m)+'.</div>'; T.$('#u-mail',host).value=''; T.$('#u-nome',host).value=''; list(); }).catch(function(e){ msg.innerHTML='<div class="msg err">Erro: '+esc(e.code||e.message)+'</div>'; });
  });
  list();
}

function importPanel(host){
  host.innerHTML='<div class="panel"><h3>Importar dados sigilosos</h3><p class="hint">Envie o arquivo <span class="kbd">TED-importacao.json</span> (gerado no seu computador, fora do GitHub). Ele grava as análises dos julgadores, seus votos e os processos no Firestore — nada disso fica no código público do site. Reimportar substitui os itens de mesmo número.</p>'+
   '<label class="field"><span>Arquivo</span><input class="input" type="file" accept=".json,application/json" id="i-file"></label>'+
   '<label class="sw"><input type="checkbox" id="i-clean"><span><b>Apagar antes o que já existe nestas coleções</b><small>Use se removeu processos do arquivo e quer que sumam do sistema.</small></span></label>'+
   '<button class="btn teal" id="i-go" disabled>'+icon('upload')+' Importar</button><div class="progress" style="margin-top:14px"><i id="i-bar"></i></div><div id="i-log" style="margin-top:10px;font-size:13px;color:var(--muted)"></div></div>';
  var data=null, log=T.$('#i-log',host), bar=T.$('#i-bar',host);
  T.$('#i-file',host).addEventListener('change',function(e){
    var f=e.target.files[0]; if(!f) return; var r=new FileReader();
    r.onload=function(){ try{ data=JSON.parse(r.result); log.innerHTML='Arquivo lido: <b>'+(data.processos||[]).length+'</b> processos, <b>'+(data.meus||[]).length+'</b> meus processos, <b>'+(data.votos||[]).length+'</b> votos/acórdãos.'; T.$('#i-go',host).disabled=false; }catch(err){ log.innerHTML='<span style="color:var(--bad-ink)">JSON inválido: '+esc(err.message)+'</span>'; } };
    r.readAsText(f,'utf-8');
  });
  function chunks(a,n){ var o=[]; for(var i=0;i<a.length;i+=n) o.push(a.slice(i,i+n)); return o; }
  T.$('#i-go',host).addEventListener('click',function(){
    if(!data) return; var btn=this; btn.disabled=true;
    var jobs=[['tedProcessos',data.processos||[],200],['tedMeus',data.meus||[],200],['tedVotos',data.votos||[],40]];
    var total=jobs.reduce(function(s,j){ return s+j[1].length; },0), done=0, clean=T.$('#i-clean',host).checked;
    function step(){ bar.style.width=Math.round(done/Math.max(1,total)*100)+'%'; }
    function delAll(name){ return T.fs.collection(name).get().then(function(qs){ var ds=[]; qs.forEach(function(d){ ds.push(d.ref); }); return chunks(ds,300).reduce(function(p,ch){ return p.then(function(){ var b=T.fs.batch(); ch.forEach(function(r){ b.delete(r); }); return b.commit(); }); },Promise.resolve()); }); }
    var p=Promise.resolve();
    if(clean) jobs.forEach(function(j){ p=p.then(function(){ log.textContent='Limpando '+j[0]+'…'; return delAll(j[0]); }); });
    jobs.forEach(function(j){ chunks(j[1],j[2]).forEach(function(ch){ p=p.then(function(){ log.textContent='Gravando '+j[0]+'… ('+done+'/'+total+')'; var b=T.fs.batch(); ch.forEach(function(x){ var id=String(x.id||x.pd).replace(/[\/\s]+/g,'-'); b.set(T.fs.collection(j[0]).doc(id),x); }); return b.commit().then(function(){ done+=ch.length; step(); }); }); }); });
    p.then(function(){ log.innerHTML='<div class="msg ok">Importação concluída: '+total+' documentos.</div>'; bar.style.width='100%'; T.state.votos=null; return T.reload(); })
     .catch(function(e){ log.innerHTML='<div class="msg err">Falhou: '+esc(e.code||e.message)+' — confira se as regras do TED foram publicadas.</div>'; btn.disabled=false; });
  });
}

function rulesPanel(host){
  host.innerHTML='<div class="panel"><h3>Publicar as regras do banco (uma vez)</h3><p class="hint">Sem isto o Firestore recusa a leitura. No Firebase Console do projeto do TED → Firestore → <b>Regras</b>, apague o que estiver lá, cole o texto abaixo, troque <span class="kbd">troque-por-seu-email@exemplo.com</span> pelo seu e-mail (em minúsculas) e clique em <b>Publicar</b>.</p><pre class="code" id="rl"></pre><button class="btn ghost sm" id="rc" style="margin-top:10px">Copiar regras</button>'+
   '<div class="callout warn" style="margin-top:14px"><b>Confidencialidade:</b> o repositório deste sistema no GitHub é público. Por isso o código não contém nenhum dado de processo — só a legislação (pública). Os processos, análises e votos ficam no Firestore, atrás de login, e só são lidos por e-mails liberados e confirmados.</div></div>';
  T.$('#rl',host).textContent=RULES;
  T.$('#rc',host).addEventListener('click',function(){ var ta=document.createElement('textarea'); ta.value=RULES; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); T.toast('Regras copiadas.'); }catch(e){} ta.remove(); });
}

T.registerTab({ id:'acesso', label:'Acesso', icon:'key', admin:true, render:function(root){
  root.innerHTML='<section class="hero teal" style="background:linear-gradient(120deg,#1a2a6c,#3a5bd9 55%,#10b8a4)"><h2>Acesso e dados</h2><p>Libere colegas, importe os dados sigilosos e publique as regras de segurança. Esta aba só aparece para administradores.</p></section><div class="cols"><div id="a1"></div><div id="a2"></div></div><div id="a3" style="margin-top:18px"></div>';
  usersPanel(T.$('#a1',root)); importPanel(T.$('#a2',root)); rulesPanel(T.$('#a3',root));
}});
})();
