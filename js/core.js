/* TED · núcleo: Firebase, autenticação por e-mail/senha com lista de liberados, estado, roteador e utilitários. */
(function(){
"use strict";

/* ---------- utilitários ---------- */
var ICONS = {
  scale:'<path d="M12 3v18M5 7h14M7 7l-3 7a3 3 0 0 0 6 0L7 7zM17 7l-3 7a3 3 0 0 0 6 0l-3-7zM8 21h8"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 0 2 2h13"/>',
  calc:'<rect x="4" y="2" width="16" height="20" rx="3"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/>',
  brain:'<path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 4 3 3 0 0 0 5 1V5a2 2 0 0 0-2-1zM15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 4 3 3 0 0 1-5 1V5a2 2 0 0 1 2-1z"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  x:'<path d="M18 6L6 18M6 6l12 12"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  print:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  back:'<path d="M15 18l-6-6 6-6"/>',
  check:'<path d="M20 6L9 17l-5-5"/>',
  alert:'<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18v.5"/>',
  gavel:'<path d="M14 13l-8.5 8.5a2.1 2.1 0 0 1-3-3L11 10M16 16l6-6M8 8l6-6M10 6l8 8"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  spark:'<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3z"/>',
  cal:'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/>'
};
function icon(n,cls){ return '<svg class="i '+(cls||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICONS[n]||'')+'</svg>'; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function $(sel,root){ return (root||document).querySelector(sel); }
function $$(sel,root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
function isoToBR(iso){ if(!iso) return '—'; var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(iso); return m? m[3]+'/'+m[2]+'/'+m[1] : iso; }
function brToISO(br){ var m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec((br||'').trim()); return m? m[3]+'-'+m[2]+'-'+m[1] : ''; }
function normTxt(s){ return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); }
function hl(text,terms){
  var t=esc(text); if(!terms||!terms.length) return t;
  terms.forEach(function(q){ if(!q) return; var re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'); t=t.replace(re,'<mark>$1</mark>'); });
  return t;
}
/* realce tolerante a acentos: procura em texto normalizado e marca no original */
function hlSmart(text,terms){
  text=String(text==null?'':text); if(!terms||!terms.length) return esc(text);
  var norm=normTxt(text), spans=[];
  terms.forEach(function(q){ q=normTxt(q); if(!q) return; var i=0; while((i=norm.indexOf(q,i))>-1){ spans.push([i,i+q.length]); i+=q.length; } });
  if(!spans.length) return esc(text);
  spans.sort(function(a,b){return a[0]-b[0];});
  var merged=[spans[0]]; for(var k=1;k<spans.length;k++){ var l=merged[merged.length-1]; if(spans[k][0]<=l[1]) l[1]=Math.max(l[1],spans[k][1]); else merged.push(spans[k]); }
  var out='',pos=0; merged.forEach(function(s){ out+=esc(text.slice(pos,s[0]))+'<mark>'+esc(text.slice(s[0],s[1]))+'</mark>'; pos=s[1]; });
  return out+esc(text.slice(pos));
}
function snippet(text,terms,len){
  text=String(text||''); len=len||260; var n=normTxt(text), best=-1;
  for(var i=0;i<(terms||[]).length;i++){ var p=n.indexOf(normTxt(terms[i])); if(p>-1){ best=p; break; } }
  if(best<0) return text.slice(0,len)+(text.length>len?'…':'');
  var a=Math.max(0,best-Math.floor(len/3)), b=Math.min(text.length,a+len);
  return (a>0?'…':'')+text.slice(a,b)+(b<text.length?'…':'');
}
function toast(msg,ms){ var t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(function(){ t.remove(); },ms||2600); }
function debounce(fn,ms){ var h; return function(){ var a=arguments,c=this; clearTimeout(h); h=setTimeout(function(){ fn.apply(c,a); },ms||180); }; }

/* ---------- overlays ---------- */
var overlayEl=null;
function closeOverlay(){ if(overlayEl){ overlayEl.remove(); overlayEl=null; document.body.style.overflow=''; } }
function openDrawer(html,opts){
  closeOverlay(); opts=opts||{};
  var v=document.createElement('div'); v.className='veil'; v.innerHTML='<div class="drawer" role="dialog" aria-modal="true">'+html+'</div>';
  v.addEventListener('mousedown',function(e){ if(e.target===v) closeOverlay(); });
  document.body.appendChild(v); document.body.style.overflow='hidden'; overlayEl=v;
  $$('[data-close]',v).forEach(function(b){ b.addEventListener('click',closeOverlay); });
  return v;
}
function openModal(html){
  closeOverlay();
  var v=document.createElement('div'); v.className='veil center'; v.innerHTML='<div class="modalbox" role="dialog" aria-modal="true">'+html+'</div>';
  v.addEventListener('mousedown',function(e){ if(e.target===v) closeOverlay(); });
  document.body.appendChild(v); document.body.style.overflow='hidden'; overlayEl=v;
  $$('[data-close]',v).forEach(function(b){ b.addEventListener('click',closeOverlay); });
  return v;
}
document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeOverlay(); });

/* ---------- estado ---------- */
var TED = window.TED = {
  icon:icon, esc:esc, $:$, $$:$$, isoToBR:isoToBR, brToISO:brToISO, normTxt:normTxt, hl:hl, hlSmart:hlSmart, snippet:snippet, toast:toast, debounce:debounce,
  openDrawer:openDrawer, openModal:openModal, closeOverlay:closeOverlay,
  user:null, perfil:null, db:null, auth:null,
  state:{ processos:[], meus:[], notas:{}, votos:null, loaded:false },
  tabs:[], views:{}
};

/* ---------- Firebase ---------- */
var app = document.getElementById('app'), gate=document.getElementById('gate'), viewRoot=null;
function fbReady(){ return typeof firebase!=='undefined' && typeof firebaseConfig!=='undefined' && firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey!=='COLE_AQUI_SUA_API_KEY'; }

function renderGate(mode,msg,kind){
  mode=mode||'entrar';
  var t = mode==='criar'?'Criar meu acesso':mode==='reset'?'Redefinir senha':'Entrar';
  gate.classList.remove('hidden'); app.classList.add('hidden');
  gate.innerHTML =
   '<div class="login"><div class="mark">TED</div><h1>Tribunal de Ética e Disciplina</h1>'+
   '<p class="sub">Painel de julgamentos — acesso restrito aos membros liberados.</p>'+
   '<form id="lg" autocomplete="on">'+
    '<label class="field"><span>E-mail</span><input class="input" type="email" id="lg-mail" required autocomplete="username" placeholder="voce@exemplo.com.br"></label>'+
    (mode==='reset'?'':'<label class="field"><span>Senha</span><input class="input" type="password" id="lg-pass" required minlength="6" autocomplete="'+(mode==='criar'?'new-password':'current-password')+'" placeholder="mínimo 6 caracteres"></label>')+
    (mode==='criar'?'<label class="field"><span>Confirmar senha</span><input class="input" type="password" id="lg-pass2" required minlength="6" autocomplete="new-password"></label>':'')+
    '<button class="btn full" type="submit">'+t+'</button>'+
    (msg?'<div class="msg '+(kind||'err')+'">'+esc(msg)+'</div>':'')+
   '</form>'+
   '<div style="display:flex;justify-content:space-between;gap:8px;margin-top:14px;flex-wrap:wrap">'+
     (mode==='entrar'?'<button class="link" data-m="criar">Primeiro acesso? Criar senha</button><button class="link" data-m="reset">Esqueci a senha</button>':'<button class="link" data-m="entrar">← Voltar para entrar</button>')+
   '</div>'+
   '<div class="gate-note">O acesso só é concedido a e-mails previamente liberados pelo administrador. O conteúdo dos processos é sigiloso (EAOAB, art. 72, §2º) e não fica no código do site: só é carregado após o login.</div></div>';
  $$('[data-m]',gate).forEach(function(b){ b.addEventListener('click',function(){ renderGate(b.getAttribute('data-m')); }); });
  $('#lg',gate).addEventListener('submit',function(e){
    e.preventDefault();
    var mail=$('#lg-mail').value.trim().toLowerCase(), pass=$('#lg-pass')&&$('#lg-pass').value;
    var btn=$('button[type=submit]',gate); btn.disabled=true;
    function fail(err){ btn.disabled=false; renderGate(mode, traduzErro(err),'err'); $('#lg-mail').value=mail; }
    if(mode==='reset'){ TED.auth.sendPasswordResetEmail(mail).then(function(){ renderGate('entrar','Enviamos um e-mail para redefinir a senha (veja também o spam).','ok'); }).catch(fail); return; }
    if(mode==='criar'){
      if(pass!==$('#lg-pass2').value){ btn.disabled=false; renderGate('criar','As senhas não conferem.','err'); return; }
      TED.auth.createUserWithEmailAndPassword(mail,pass).then(function(cred){ return cred.user.sendEmailVerification().catch(function(){}); }).catch(fail); return;
    }
    TED.auth.signInWithEmailAndPassword(mail,pass).catch(fail);
  });
}
function traduzErro(e){
  var c=(e&&e.code)||''; var m={
   'auth/invalid-credential':'E-mail ou senha incorretos.','auth/wrong-password':'E-mail ou senha incorretos.','auth/user-not-found':'E-mail ou senha incorretos.','auth/invalid-email':'E-mail inválido.',
   'auth/email-already-in-use':'Este e-mail já tem senha cadastrada — use “Entrar” ou “Esqueci a senha”.','auth/weak-password':'Senha fraca: use ao menos 6 caracteres.','auth/too-many-requests':'Muitas tentativas. Aguarde alguns minutos.','auth/network-request-failed':'Sem conexão com a internet.'
  }; return m[c]||('Não foi possível concluir ('+(c||(e&&e.message)||'erro')+').');
}
function renderBlock(title,html,extra){
  gate.classList.remove('hidden'); app.classList.add('hidden');
  gate.innerHTML='<div class="login"><div class="mark">TED</div><h1>'+esc(title)+'</h1>'+html+'<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">'+(extra||'')+'<button class="btn ghost" id="lo">Sair</button></div></div>';
  $('#lo',gate).addEventListener('click',function(){ TED.auth.signOut(); });
}

/* Administrador = quem passa na regra tedAdmin() do Firestore (dono definido nas regras ou papel "admin" em tedUsuarios).
   A leitura de tedAdmin/probe só é permitida a administradores; não precisa existir o documento. */
function probeAdmin(){
  return TED.fs.collection('tedAdmin').doc('probe').get().then(function(){ return true; }).catch(function(){ return false; });
}

function afterLogin(user){
  TED.user=user; var mail=(user.email||'').toLowerCase();
  /* renova o token: sem isso, logo após confirmar o e-mail a sessão ainda carrega email_verified=false e as regras negam */
  user.getIdToken(true).catch(function(){}).then(probeAdmin).then(function(admin){
    if(!admin && !user.emailVerified){
      renderBlock('Confirme seu e-mail','<p class="sub">Enviamos um link de confirmação para <b>'+esc(mail)+'</b>. Depois de clicar no link, volte aqui e toque em “Já confirmei”.</p>',
        '<button class="btn" id="ok">Já confirmei</button><button class="btn ghost" id="rs">Reenviar e-mail</button>');
      $('#ok',gate).addEventListener('click',function(){ user.reload().then(function(){ afterLogin(TED.auth.currentUser); }); });
      $('#rs',gate).addEventListener('click',function(){ user.sendEmailVerification().then(function(){ toast('E-mail reenviado.'); }).catch(function(e){ toast(traduzErro(e)); }); });
      return;
    }
    TED.fs.collection('tedUsuarios').doc(mail).get().then(function(s){
      if(s.exists){ start({ admin: admin || s.data().papel==='admin', papel:s.data().papel||'leitor', nome:s.data().nome||mail }); }
      else if(admin){ start({ admin:true, papel:'admin', nome:mail }); }
      else denied(mail);
    }).catch(function(err){
      if(admin){ start({ admin:true, papel:'admin', nome:mail }); return; }
      denied(mail,err);
    });
  });
}
function denied(mail,err){
  var perm = err && /permission|insufficient/i.test(err.code||err.message||'');
  renderBlock('Acesso ainda não liberado','<p class="sub">O e-mail <b>'+esc(mail)+'</b> ainda não está na lista de membros liberados'+(perm?' (ou as regras do banco ainda não foram publicadas)':'')+'. Peça ao administrador para cadastrá-lo em <b>Acesso</b> e entre novamente.</p>');
}

/* ---------- shell ---------- */
function start(perfil){
  TED.perfil=perfil; gate.classList.add('hidden'); app.classList.remove('hidden');
  var ini=(TED.user.email||'?').charAt(0).toUpperCase();
  app.innerHTML =
   '<header class="topbar"><div class="topin">'+
     '<div class="brand"><div class="mark">TED</div><div><b>Julgamentos</b><small>OAB/MG · 1ª Turma Regional</small></div></div>'+
     '<nav class="nav" id="nav"></nav>'+
     '<div class="who"><button class="iconbtn" id="thm" title="Alternar tema">'+icon('moon')+'</button>'+
       '<div class="avatar">'+esc(ini)+'</div><div class="nm"><b>'+esc(perfil.nome.split('@')[0])+'</b><small>'+(perfil.admin?'administrador':'membro')+'</small></div>'+
       '<button class="iconbtn" id="out" title="Sair">'+icon('out')+'</button></div>'+
   '</div></header><main id="main"></main>';
  viewRoot=$('#main');
  $('#out').addEventListener('click',function(){ TED.auth.signOut(); });
  $('#thm').addEventListener('click',toggleTheme); syncThemeIcon();
  buildNav(); loadData().then(function(){ route(); });
  window.addEventListener('hashchange',route);
}
function buildNav(){
  var nav=$('#nav'); nav.innerHTML='';
  TED.tabs.filter(function(t){ return !t.admin || TED.perfil.admin; }).forEach(function(t){
    var b=document.createElement('button'); b.className='navbtn'; b.setAttribute('data-tab',t.id); b.innerHTML=icon(t.icon)+'<span>'+esc(t.label)+'</span>';
    b.addEventListener('click',function(){ location.hash='#/'+t.id; }); nav.appendChild(b);
  });
}
function route(){
  var h=(location.hash||'#/julgadores').replace(/^#\//,'').split('/'); var id=h[0]||'julgadores';
  var tab=TED.tabs.filter(function(t){ return t.id===id; })[0] || TED.tabs[0];
  $$('.navbtn').forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-tab')===tab.id); });
  var b=$('.navbtn.on'); if(b&&b.scrollIntoView) b.scrollIntoView({inline:'center',block:'nearest'});
  closeOverlay(); viewRoot.innerHTML='<div class="view" id="vw"></div>';
  window.scrollTo(0,0);
  try{ tab.render($('#vw'),h.slice(1)); }catch(e){ console.error(e); $('#vw').innerHTML='<div class="empty"><h3>Algo deu errado nesta aba</h3><p>'+esc(e.message)+'</p></div>'; }
}
TED.route=route;
TED.registerTab=function(t){ TED.tabs.push(t); };

/* ---------- tema ---------- */
function curTheme(){ var t=document.documentElement.getAttribute('data-theme'); if(t) return t; return matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'; }
function syncThemeIcon(){ var b=$('#thm'); if(b) b.innerHTML=icon(curTheme()==='dark'?'sun':'moon'); }
function toggleTheme(){ var n=curTheme()==='dark'?'light':'dark'; document.documentElement.setAttribute('data-theme',n); try{ localStorage.setItem('ted-theme',n); }catch(e){} syncThemeIcon(); }
try{ var st=localStorage.getItem('ted-theme'); if(st) document.documentElement.setAttribute('data-theme',st); }catch(e){}

/* ---------- dados ---------- */
function getAll(name){
  var ref = (typeof name==='string') ? TED.fs.collection(name) : name;
  return ref.get().then(function(qs){ var a=[]; qs.forEach(function(d){ var x=d.data(); x._id=d.id; a.push(x); }); return a; });
}
function notasRef(){ return TED.fs.collection('tedNotas').doc(TED.user.uid).collection('itens'); }
function loadData(){
  var S=TED.state;
  viewRoot.innerHTML='<div class="empty"><span class="spin"></span><p>Carregando os autos e análises…</p></div>';
  return Promise.all([ getAll('tedProcessos').catch(fail('tedProcessos')), getAll('tedMeus').catch(fail('tedMeus')), getAll(notasRef()).catch(fail('tedNotas')) ]).then(function(r){
    S.processos=r[0]||[]; S.meus=r[1]||[]; S.notas={}; (r[2]||[]).forEach(function(n){ S.notas[n._id]=n; }); S.loaded=true;
  });
  function fail(n){ return function(e){ console.warn('Falha ao ler '+n,e); if(e&&/permission/i.test(e.code||e.message||'')) S.permFail=true; return []; }; }
}
TED.reload=function(){ return loadData().then(route); };
TED.loadVotos=function(){
  if(TED.state.votos) return Promise.resolve(TED.state.votos);
  return getAll('tedVotos').then(function(a){ TED.state.votos=a; return a; });
};
TED.saveNota=function(id,patch){
  patch.atualizadoEm=Date.now(); patch.por=(TED.user.email||'');
  return notasRef().doc(id).set(patch,{merge:true}).then(function(){ TED.state.notas[id]=Object.assign(TED.state.notas[id]||{_id:id},patch); });
};

/* ---------- boot ---------- */
function boot(){
  if(!fbReady()){ gate.innerHTML='<div class="login"><div class="mark">TED</div><h1>Configuração pendente</h1><p class="sub">O arquivo firebase-config.js não foi preenchido.</p></div>'; return; }
  firebase.initializeApp(firebaseConfig);
  TED.auth=firebase.auth(); TED.fs=firebase.firestore(); TED.db=TED.fs;
  TED.auth.onAuthStateChanged(function(u){ if(u) afterLogin(u); else { TED.user=null; window.removeEventListener('hashchange',route); renderGate('entrar'); } });
}
TED.boot=boot;
})();
