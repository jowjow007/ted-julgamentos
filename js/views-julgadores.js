/* Aba 1 — Julgadores: blocos grandes por relator → blocos fixos por processo → análise completa e papeleta.
   O mesmo quadro de processos é reaproveitado pela aba "Meus processos". */
(function(){
"use strict"; var T=window.TED, esc=T.esc, icon=T.icon;

var VER={
  punivel:{cls:'v-punivel',rot:'Punível',ic:'gavel',chip:'bad'},
  nao_punivel:{cls:'v-nao',rot:'Não punível',ic:'check',chip:'ok'},
  prescrito:{cls:'v-prescrito',rot:'Prescrito',ic:'clock',chip:'warn'},
  nulo:{cls:'v-nulo',rot:'Nulidade',ic:'alert',chip:'info'},
  tac:{cls:'v-tac',rot:'TAC',ic:'shield',chip:'info'},
  pendente:{cls:'v-pendente',rot:'Aguardando leitura dos autos',ic:'clock',chip:''}
};
function ver(p){ return VER[p.veredito||'pendente']||VER.pendente; }
function words4(s){ var w=String(s||'').trim().split(/\s+/); return w.length>4? w.slice(0,4).join(' ')+'…' : w.join(' '); }
function driveUrl(id,isFile){ return isFile? 'https://drive.google.com/file/d/'+id+'/view' : 'https://drive.google.com/drive/folders/'+id; }
function relById(id){ return (window.TED_RELATORES||[]).filter(function(r){ return r.id===id; })[0]; }
function ini(nome){ var p=String(nome).split(/\s+/).filter(function(x){ return x.length>2; }); return (p[0]||'?').charAt(0)+(p[p.length-1]||'').charAt(0); }
function counts(list){ var c={total:list.length,punivel:0,nao_punivel:0,prescrito:0,nulo:0,tac:0,pendente:0,analisado:0}; list.forEach(function(p){ var v=p.veredito||'pendente'; c[v]=(c[v]||0)+1; if(p.status!=='pendente') c.analisado++; }); return c; }

function card(p,i,rel){
  var v=ver(p), pend=p.status==='pendente';
  var partes=(p.representantes&&p.representantes.length||p.representados&&p.representados.length)?
    '<div class="row"><i>Partes</i><div>'+
      (p.representantes||[]).map(function(r){ return '<div><span style="color:var(--faint);font-size:12px">Rep.</span> <b>'+esc(r.nome)+'</b></div>'; }).join('')+
      (p.representados||[]).map(function(r){ return '<div><span style="color:var(--faint);font-size:12px">Repdo.</span> <b>'+esc(r.nome)+'</b>'+(r.oab?' <span style="font-family:var(--mono);font-size:11.5px;color:var(--muted)">'+esc(r.oab)+'</span>':'')+'</div>'; }).join('')+
    '</div></div>' : '<div class="row"><i>Partes</i><div style="color:var(--faint)">— serão preenchidas após a leitura dos autos —</div></div>';
  var infr=pend? '<div class="row"><i>Infração</i><div class="infr" style="color:var(--faint)">A apurar</div></div>' : '<div class="row"><i>Infração</i><div class="infr">'+esc(words4(p.infracao))+'</div></div>';
  var arts=(p.artigos&&p.artigos.length)? '<div class="row"><i>Artigo</i><div>'+p.artigos.map(function(a){ return '<span class="art">'+esc(a)+'</span>'; }).join('')+'</div></div>' : '';
  var verd;
  if(pend){
    verd='<div class="verd"><b>'+icon('clock')+' Aguardando leitura dos autos</b><p>'+esc(p.motivoPendencia||'Autos ainda não analisados.')+'</p></div>';
  } else {
    verd='<div class="verd"><b>'+icon(v.ic)+' '+esc(v.rot)+(p.sancao?' — '+esc(p.sancao):'')+'</b>'+(p.resumoVeredito?'<p>'+esc(p.resumoVeredito)+'</p>':'')+'</div>';
  }
  var meta=pend&&p.arquivo? '<div class="row"><i>Arquivo</i><div style="font-size:12.5px;color:var(--muted)">'+esc(p.arquivo)+(p.tamanhoMB?' · '+esc(p.tamanhoMB)+' MB':'')+(p.atualizadoDrive?' · atualizado em '+esc(T.isoToBR(p.atualizadoDrive)):'')+'</div></div>' : '';
  var chip=pend?'<span class="chip">pendente</span>':(p.status==='parcial'?'<span class="chip warn">análise parcial</span>':'<span class="chip '+v.chip+'">'+esc(v.rot)+'</span>');
  return '<article class="pc '+v.cls+(pend?' pending':'')+'" style="--i:'+i+'"><div class="bar"></div>'+
    '<div class="hd"><div><div class="num">P.D. '+esc(p.pd||p.id)+'</div><div class="sub">'+esc(p.subsecao||(rel?rel.tr+' '+rel.nome:''))+'</div></div>'+chip+'</div>'+
    '<div class="body">'+partes+infr+arts+meta+'</div>'+verd+
    '<div class="ft"><button class="btn sm" data-act="pap" data-id="'+esc(p._id||p.id)+'">'+icon('file')+' Papeleta</button>'+
    '<button class="btn ghost sm" data-act="ana" data-id="'+esc(p._id||p.id)+'">'+icon('search')+' Análise completa</button>'+
    (p.driveId?'<a class="btn ghost sm" target="_blank" rel="noopener" href="'+driveUrl(p.driveId,p.driveTipo!=='pasta')+'">'+icon('ext')+' Autos no Drive</a>':'')+
    (p.editavel?'<button class="btn ghost sm" data-act="edt" data-id="'+esc(p._id||p.id)+'">Editar</button>':'')+'</div></article>';
}

function board(host,list,rel,opts){
  opts=opts||{}; var filt='todos', q='';
  var c=counts(list);
  host.innerHTML=
   '<div class="stats stagger">'+
    [['Processos',c.total,'#5b4bff'],['Puníveis',c.punivel,'#f2455c'],['Não puníveis',c.nao_punivel,'#1fb768'],['Prescritos',c.prescrito,'#ffae1a'],['Nulidade / TAC',c.nulo+c.tac,'#2f8cff'],['Aguardando autos',c.pendente,'#8b91ad']].map(function(s,i){ return '<div class="stat" style="--c:'+s[2]+';--i:'+i+'"><b>'+s[1]+'</b><span>'+s[0]+'</span></div>'; }).join('')+'</div>'+
   '<div class="toolbar"><input class="input" id="bq" placeholder="Buscar por número, parte, infração…"><div class="seg" id="bf">'+
     [['todos','Todos'],['punivel','Puníveis'],['nao_punivel','Não puníveis'],['prescrito','Prescritos'],['pendente','Pendentes']].map(function(f){ return '<button data-f="'+f[0]+'"'+(f[0]==='todos'?' class="on"':'')+'>'+f[1]+'</button>'; }).join('')+'</div>'+(opts.toolbarExtra||'')+'</div>'+
   '<div class="board stagger" id="bg"></div>';
  function paint(){
    var t=T.normTxt(q);
    var arr=list.filter(function(p){
      if(filt!=='todos'){ var v=p.veredito||'pendente'; if(filt==='nao_punivel'? (v!=='nao_punivel'):(filt==='pendente'? p.status!=='pendente' : v!==filt)) return false; }
      if(!t) return true;
      var hay=T.normTxt([p.pd,p.id,p.infracao,(p.artigos||[]).join(' '),(p.representantes||[]).map(function(r){return r.nome;}).join(' '),(p.representados||[]).map(function(r){return r.nome+' '+(r.oab||'');}).join(' '),p.subsecao].join(' '));
      return hay.indexOf(t)>-1;
    });
    $bg.innerHTML=arr.length? arr.map(function(p,i){ return card(p,i,rel||relById(p.relatorId)); }).join('') : '<div class="empty" style="grid-column:1/-1"><h3>Nenhum processo neste filtro</h3><p>Ajuste a busca ou o filtro acima.</p></div>';
  }
  var $bg=T.$('#bg',host); paint();
  T.$('#bq',host).addEventListener('input',T.debounce(function(e){ q=e.target.value; paint(); },150));
  T.$$('#bf button',host).forEach(function(b){ b.addEventListener('click',function(){ filt=b.getAttribute('data-f'); T.$$('#bf button',host).forEach(function(x){ x.classList.toggle('on',x===b); }); paint(); }); });
  host.addEventListener('click',function(e){
    var b=e.target.closest('[data-act]'); if(!b) return; var id=b.getAttribute('data-id'), act=b.getAttribute('data-act');
    var p=list.filter(function(x){ return (x._id||x.id)===id; })[0]; if(!p) return;
    if(act==='pap') T.papeleta.open(p,rel||relById(p.relatorId),{nota:T.state.notas[p._id||p.id]||{}});
    if(act==='ana') openAnalise(p,rel||relById(p.relatorId));
    if(act==='edt'&&opts.onEdit) opts.onEdit(p);
  });
}

/* ---------- análise completa ---------- */
var STK={ok:'ok',bad:'bad',warn:'warn',na:''};
function chk(o,titulo){
  if(!o) return '<div class="chk"><b>'+esc(titulo)+'</b><p style="color:var(--faint)">Não apurado nesta leitura.</p></div>';
  var ic=o.k==='ok'?'check':(o.k==='bad'?'x':(o.k==='warn'?'alert':'clock'));
  return '<div class="chk '+(STK[o.k]||'')+'"><b>'+icon(ic)+' '+esc(titulo)+' — '+esc(o.rotulo||'')+'</b><p>'+esc(o.txt||'')+'</p></div>';
}
function lookupPrec(ref){
  var e=(window.TED_EMENTAS||[]).filter(function(x){ return ref.indexOf(x.id)>-1 || x.id.indexOf(ref)>-1; })[0];
  if(e) return { titulo:e.id+' — '+e.orgao+' ('+T.isoToBR(e.data)+')', texto:e.cabecalho+' '+e.corpo, fonte:e.fonte };
  var s=(window.TED_LEGIS||[]).filter(function(d){ return d.id==='sumulas'; })[0]; if(s){ var it=s.itens.filter(function(x){ return ref.indexOf(x.r)>-1 || x.r.indexOf(ref)>-1; })[0]; if(it) return { titulo:it.r+' — '+(it.n||''), texto:it.t, fonte:'CFOAB' }; }
  return null;
}
function openAnalise(p,rel){
  var v=ver(p), h=rel?rel.h:262, pa=p.analise||{}, nota=T.state.notas[p._id||p.id]||{};
  var html='<div class="dhead" style="--dh1:hsl('+h+' 78% 44%);--dh2:hsl('+(h+40)+' 80% 56%)"><div><small>'+esc(rel?rel.tr+' '+rel.nome+' · relator':'Processo')+'</small><h3>P.D. '+esc(p.pd||p.id)+'</h3></div><div style="display:flex;gap:8px"><button class="btn sm" style="background:rgba(255,255,255,.22);box-shadow:none" data-act2="pap">'+icon('file')+' Papeleta</button><button class="x" data-close aria-label="Fechar">'+icon('x')+'</button></div></div><div class="dbody">';
  if(p.status==='pendente'){
    html+='<div class="callout warn"><b>Autos ainda não lidos.</b> '+esc(p.motivoPendencia||'')+'</div>';
    html+='<div class="sec"><h4>Como liberar a análise</h4><ol style="margin:0;padding-left:18px"><li>Torne os PDFs deste relator acessíveis no computador (Drive para computadores → “Disponibilizar off-line” ou baixar a pasta).</li><li>Peça a análise pelo Claude Code informando o caminho — os PDFs escaneados passam por OCR local e a análise é gravada aqui.</li></ol></div>';
  } else {
    html+='<div class="sec"><h4>'+icon('spark')+' Em uma frase</h4><p style="margin:0;font-family:var(--display);font-size:18px;line-height:1.35">'+esc(p.lead||'')+'</p></div>';
    html+='<div class="verd '+v.cls+'" style="margin:0"><b style="font-size:15px">'+icon(v.ic)+' '+esc(v.rot)+(p.sancao?' — '+esc(p.sancao):'')+'</b>'+(p.dosimetria?'<p>'+esc(p.dosimetria)+'</p>':'')+(p.votoSugerido?'<p style="margin-top:8px"><b>Voto sugerido:</b> '+esc(p.votoSugerido)+'</p>':'')+'</div>';
    if(p.cobertura) html+='<div class="callout warn"><b>Cobertura da leitura:</b> '+esc(p.cobertura)+'</div>';
    html+='<div class="sec"><h4>'+icon('scale')+' Roteiro de análise</h4><div class="checkgrid">'+
      chk(pa.prescricao,'Prescrição')+chk(pa.intercorrente,'Intercorrente')+chk(pa.citacao,'Notificação/citação')+chk(pa.defesa,'Defesa e instrução')+chk(pa.parecer,'Parecer preliminar')+chk(pa.razoes,'Razões finais')+'</div>'+
      (p.calc?'<div style="margin-top:12px"><button class="btn teal sm" data-act2="calc">'+icon('calc')+' Abrir esta contagem na calculadora</button></div>':'')+'</div>';
    if((p.teses||[]).length) html+='<div class="sec"><h4>Teses apuradas</h4><ul>'+p.teses.map(function(t){ return '<li><b>'+esc(t.parte||'')+':</b> '+esc(t.tese)+'<br><span style="color:var(--muted)">'+esc(t.analise||'')+'</span>'+(t.resultado?' <span class="chip '+(/acolh|proced/i.test(t.resultado)&&!/improc|não/i.test(t.resultado)?'ok':'')+'">'+esc(t.resultado)+'</span>':'')+'</li>'; }).join('')+'</ul></div>';
    if((p.artigos||[]).length) html+='<div class="sec"><h4>Enquadramento</h4><p style="margin:0 0 8px">'+p.artigos.map(function(a){ return '<span class="art">'+esc(a)+'</span>'; }).join('')+'</p>'+(p.enquadramento?'<p style="margin:0;color:var(--muted)">'+esc(p.enquadramento)+'</p>':'')+'</div>';
    if((p.cronologia||[]).length) html+='<div class="sec"><h4>'+icon('cal')+' Cronologia</h4><div class="tl">'+p.cronologia.map(function(c){ return '<div class="ev'+(c.marco?' mark':'')+'"><b>'+esc(T.isoToBR(c.data))+'</b>'+esc(c.evento)+(c.fls?' <span style="color:var(--faint)">(fls. '+esc(c.fls)+')</span>':'')+'</div>'; }).join('')+'</div></div>';
    if((p.documentos||[]).length) html+='<div class="sec"><h4>Documentos e provas examinados</h4><ul>'+p.documentos.map(function(d){ return '<li>'+esc(d)+'</li>'; }).join('')+'</ul></div>';
    if((p.precedentes||[]).length) html+='<div class="sec"><h4>Ementário e súmulas do CFOAB</h4><p style="margin:0 0 8px;color:var(--muted);font-size:13px">Clique para ler o texto.</p>'+p.precedentes.map(function(r,i){ return '<button class="chip info" style="border:0;cursor:pointer;margin:0 6px 6px 0" data-prec="'+i+'">'+esc(r)+'</button>'; }).join('')+'<div id="precbox"></div></div>';
    (p.alertas||[]).forEach(function(a){ html+='<div class="callout '+(/^✓/.test(a)?'ok':'warn')+'">'+esc(a)+'</div>'; });
  }
  html+='<div class="sec"><h4>'+icon('brain')+' Minhas anotações e voto</h4><label class="field"><span>Meu voto como vogal</span><select class="select input" id="nv"><option value="">— ainda não decidi —</option><option value="acompanha">Acompanho o relator</option><option value="diverge">Divirjo</option><option value="vista">Peço vista</option></select></label>'+
    '<label class="field"><span>Anotações</span><textarea class="input" id="no" placeholder="Dúvidas, pontos a perguntar na sessão, fundamentos da divergência…"></textarea></label><button class="btn sm" id="ns">Salvar</button> <span id="nmsg" style="font-size:12.5px;color:var(--muted)"></span></div>';
  html+='</div>';
  var d=T.openDrawer(html);
  T.$('#nv',d).value=nota.votoVogal||''; T.$('#no',d).value=nota.obs||'';
  T.$('#ns',d).addEventListener('click',function(){ T.saveNota(p._id||p.id,{votoVogal:T.$('#nv',d).value,obs:T.$('#no',d).value}).then(function(){ T.$('#nmsg',d).textContent='Salvo.'; }).catch(function(){ T.$('#nmsg',d).textContent='Não foi possível salvar (verifique as regras).'; }); });
  d.addEventListener('click',function(e){
    var a=e.target.closest('[data-act2]'); if(a){ var k=a.getAttribute('data-act2'); if(k==='pap') T.papeleta.open(p,rel,{nota:T.state.notas[p._id||p.id]||{}}); if(k==='calc'){ T.calcPreset=p.calc; location.hash='#/calculadora'; } }
    var b=e.target.closest('[data-prec]'); if(b){ var r=lookupPrec(p.precedentes[+b.getAttribute('data-prec')]); T.$('#precbox',d).innerHTML= r? '<div class="callout" style="margin-top:8px"><b>'+esc(r.titulo)+'</b><br>'+esc(r.texto)+'<br><small>'+esc(r.fonte||'')+'</small></div>' : '<div class="callout warn" style="margin-top:8px">Texto não localizado na base local — conferir no site do CFOAB.</div>'; }
  });
}
T.openAnalise=openAnalise; T.board=board; T.counts=counts;

/* ---------- home ---------- */
function home(root){
  var S=T.state, rels=window.TED_RELATORES||[];
  var byRel={}; S.processos.forEach(function(p){ (byRel[p.relatorId]=byRel[p.relatorId]||[]).push(p); });
  var tot=counts(S.processos);
  root.innerHTML=
   '<section class="hero"><h2>Julgadores</h2><p>Escolha o relator para ver os processos em que você atuará como vogal: número, partes, infração em até quatro palavras, artigo invocado, se o caso é punível e a sanção que se entende necessária — com a papeleta pronta para imprimir e a análise completa (prescrição, citação, razões finais e teses).</p>'+
   '<div class="tips"><span class="tip">1 · Clique no bloco do relator</span><span class="tip">2 · Veja os blocos dos processos</span><span class="tip">3 · Abra a papeleta ou a análise</span></div></section>'+
   (S.permFail?'<div class="callout bad"><b>Sem permissão de leitura.</b> As regras do Firestore do TED ainda não foram publicadas (ou seu e-mail não está liberado). Veja a aba <b>Acesso</b> (administrador) ou o README-SETUP.md.</div>':'')+
   (!S.processos.length&&!S.permFail?'<div class="callout warn"><b>Nenhum processo carregado ainda.</b> '+(T.perfil.admin?'Vá em <b>Acesso → Importar dados</b> e envie o arquivo <span class="kbd">TED-importacao.json</span>.':'Peça ao administrador para importar os dados.')+'</div>':'')+
   '<div class="stats stagger">'+[['Processos como vogal',tot.total,'#5b4bff'],['Já analisados',tot.analisado,'#10b8a4'],['Puníveis',tot.punivel,'#f2455c'],['Não puníveis',tot.nao_punivel,'#1fb768'],['Prescritos',tot.prescrito,'#ffae1a'],['Aguardando autos',tot.pendente,'#8b91ad']].map(function(s,i){ return '<div class="stat" style="--c:'+s[2]+';--i:'+i+'"><b>'+s[1]+'</b><span>'+s[0]+'</span></div>'; }).join('')+'</div>'+
   '<div class="relgrid stagger">'+rels.map(function(r,i){ var l=byRel[r.id]||[], c=counts(l);
     return '<button class="rel" style="--h:'+r.h+';--i:'+i+'" data-rel="'+r.id+'"><div class="big">'+l.length+'</div><div><div class="ini">'+esc(ini(r.nome))+'</div><h3>'+esc(r.tr+' '+r.nome)+'</h3><small>'+(r.oab?esc(r.oab)+' · ':'')+'relator</small></div>'+
       '<div class="pills"><span class="pill">'+c.analisado+' '+(c.analisado===1?'analisado':'analisados')+'</span>'+(c.punivel?'<span class="pill">'+c.punivel+' '+(c.punivel===1?'punível':'puníveis')+'</span>':'')+(c.nao_punivel?'<span class="pill">'+c.nao_punivel+' '+(c.nao_punivel===1?'não punível':'não puníveis')+'</span>':'')+(c.prescrito?'<span class="pill">'+c.prescrito+' '+(c.prescrito===1?'prescrito':'prescritos')+'</span>':'')+(c.pendente?'<span class="pill">'+c.pendente+' '+(c.pendente===1?'pendente':'pendentes')+'</span>':'')+'</div></button>'; }).join('')+'</div>';
  T.$$('[data-rel]',root).forEach(function(b){ b.addEventListener('click',function(){ location.hash='#/julgadores/'+b.getAttribute('data-rel'); }); });
}
function relatorView(root,id){
  var rel=relById(id); if(!rel){ location.hash='#/julgadores'; return; }
  var list=T.state.processos.filter(function(p){ return p.relatorId===id; }).sort(function(a,b){ return String(a.pd).localeCompare(String(b.pd),undefined,{numeric:true}); });
  root.innerHTML=
   '<div class="crumbs"><button class="back" id="bk">'+icon('back')+' Todos os julgadores</button>'+(list[0]&&list[0].relatorDrive?'<a class="back" target="_blank" rel="noopener" href="'+driveUrl(list[0].relatorDrive)+'">'+icon('ext')+' Pasta no Drive</a>':'')+'</div>'+
   '<section class="hero" style="background:linear-gradient(120deg,hsl('+rel.h+' 78% 40%),hsl('+(rel.h+42)+' 82% 58%))"><h2>'+esc(rel.tr+' '+rel.nome)+'</h2><p>'+(rel.oab?esc(rel.oab)+' · ':'')+'Relator. Você atua como <b>vogal</b> nos processos abaixo. Cada bloco traz o essencial; abra a <b>papeleta</b> para levar à sessão ou a <b>análise completa</b> para o detalhamento.</p></section><div id="bd"></div>';
  T.$('#bk',root).addEventListener('click',function(){ location.hash='#/julgadores'; });
  if(!list.length){ T.$('#bd',root).innerHTML='<div class="empty"><h3>Nenhum processo cadastrado para este relator</h3><p>Importe os dados em Acesso → Importar dados.</p></div>'; return; }
  board(T.$('#bd',root),list,rel);
}
T.registerTab({ id:'julgadores', label:'Julgadores', icon:'users', render:function(root,args){ if(args&&args[0]) relatorView(root,args[0]); else home(root); } });
})();
