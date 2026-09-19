/* Aba 5 — Meus entendimentos: pesquisa nos meus votos/acórdãos, no ementário do CFOAB e nas súmulas. */
(function(){
"use strict"; var T=window.TED, esc=T.esc, icon=T.icon;
var RC={ 'Prescrição':'#ffae1a','Improcedente':'#1fb768','Procedente':'#f2455c','Censura':'#f2455c','Suspensão':'#e8590c','Exclusão':'#b4237d','Advertência':'#2f8cff','Arquivamento':'#8b91ad','':'#9a5cff' };
var SUG=['prescrição','retenção de autos','honorários','abandono da causa','prestação de contas','locupletamento','revelia defensor dativo','razões finais','captação de clientela','multa anuidades','TAC ajustamento de conduta','sigilo profissional'];
var st={ q:'', src:'votos', tag:'', res:'', ano:'' };
var HAY=null;

function terms(q){ return T.normTxt(q).split(/\s+/).filter(function(x){ return x.length>1; }); }
function buildHay(v){ return v.map(function(x){ return { v:x, e:T.normTxt(x.ementa||''), d:T.normTxt(x.dispositivo||''), t:T.normTxt((x.texto||'')+' '+(x.representado||'')+' '+x.pd+' '+(x.tags||[]).join(' ')+' '+(x.artigos||[]).join(' ')) }; }); }
function count(s,t){ var n=0,i=0; while((i=s.indexOf(t,i))>-1){ n++; i+=t.length; } return n; }

function search(ts){
  return HAY.map(function(h){
    var sc=0; for(var k=0;k<ts.length;k++){ var a=count(h.e,ts[k]),b=count(h.d,ts[k]),c=count(h.t,ts[k]); if(!(a||b||c)) return null; sc+=a*6+b*3+Math.min(c,10); }
    return { v:h.v, s:sc };
  }).filter(Boolean);
}
function passF(v){ if(st.tag&&(v.tags||[]).indexOf(st.tag)<0) return false; if(st.res&&v.resultado!==st.res) return false; if(st.ano&&String(v.ano)!==st.ano) return false; return true; }

function votoCard(x,ts){
  var v=x.v, rc=RC[v.resultado]||RC[''];
  return '<article class="res" data-vid="'+esc(v.id)+'" style="--rc:'+rc+'"><h4>'+esc(v.kind==='acórdão'?'Acórdão':v.kind==='parecer'?'Parecer':v.kind==='despacho'?'Despacho':'Voto')+' P.D. '+esc(v.pd)+(v.resultado?' <span class="chip" style="background:'+rc+'22;color:'+rc+'">'+esc(v.resultado)+'</span>':'')+(v.pasta_hint?' <span class="chip">'+esc(v.pasta_hint.toLowerCase())+'</span>':'')+'</h4>'+
    '<div>'+(v.artigos||[]).slice(0,5).map(function(a){ return '<span class="art">'+esc(a)+'</span>'; }).join('')+(v.sessao?'<span class="chip info">'+esc(v.sessao.replace(/ - \d+ PROCESSOS/,''))+'</span>':'')+'</div>'+
    '<p>'+T.hlSmart(T.snippet(v.ementa||v.dispositivo||v.texto,ts,300),ts)+'</p></article>';
}
function ementaCard(e,ts){
  return '<article class="res" data-eid="'+esc(e.id)+'" style="--rc:#e8590c"><h4>'+esc(e.id)+' <span class="chip warn">CFOAB</span></h4><div><span class="chip info">'+esc(e.orgao)+'</span> <span class="chip">'+esc(T.isoToBR(e.data))+'</span></div><p>'+T.hlSmart(T.snippet(e.cabecalho+' '+e.corpo,ts,320),ts)+'</p></article>';
}
function sumCard(it,ts){ return '<article class="res" style="--rc:#5b4bff;cursor:default"><h4>'+esc(it.r)+' <span class="chip info">'+esc(it.n||'')+'</span></h4><p style="color:var(--ink)">'+T.hlSmart(it.t,ts)+'</p></article>'; }

function openVoto(v,ts){
  var d=T.openDrawer('<div class="dhead" style="--dh1:#5b4bff;--dh2:#ff5ca8"><div><small>'+esc(v.arquivo||'')+'</small><h3>P.D. '+esc(v.pd)+' — '+esc(v.resultado||'sem classificação')+'</h3></div><button class="x" data-close>'+icon('x')+'</button></div><div class="dbody">'+
    '<div class="sec"><h4>Identificação</h4><p style="margin:0"><b>Representante:</b> '+esc(v.representante||'—')+'<br><b>Representado:</b> '+esc(v.representado||'—')+'<br>'+(v.sessao?'<b>Sessão:</b> '+esc(v.sessao)+'<br>':'')+(v.artigos&&v.artigos.length?'<b>Artigos citados:</b> '+v.artigos.map(function(a){ return '<span class="art">'+esc(a)+'</span>'; }).join(''):'')+'</p></div>'+
    (v.ementa?'<div class="sec"><h4>Ementa</h4><p style="margin:0;font-family:var(--display);font-size:16.5px;line-height:1.45">'+T.hlSmart(v.ementa,ts)+'</p></div>':'')+
    (v.dispositivo?'<div class="sec"><h4>Dispositivo (final do voto)</h4><p style="margin:0">'+T.hlSmart(v.dispositivo,ts)+'</p></div>':'')+
    '<div class="sec"><h4>Texto do voto</h4><p style="margin:0;white-space:pre-line;font-size:14px;line-height:1.65">'+T.hlSmart(v.texto,ts)+'</p></div></div>');
  return d;
}
function openEmenta(e,ts){
  T.openDrawer('<div class="dhead" style="--dh1:#e8590c;--dh2:#ffae1a"><div><small>'+esc(e.orgao)+' · '+esc(T.isoToBR(e.data))+'</small><h3>'+esc(e.id)+'</h3></div><button class="x" data-close>'+icon('x')+'</button></div><div class="dbody"><div class="sec"><h4>'+esc(e.recurso)+(e.relator?' · Relator(a): '+esc(e.relator):'')+'</h4><p style="margin:0 0 8px"><b>'+T.hlSmart(e.cabecalho,ts)+'</b></p><p style="margin:0;white-space:pre-line;line-height:1.65">'+T.hlSmart(e.corpo,ts)+'</p></div><p class="srcnote">'+esc(e.fonte)+' — partes identificadas por iniciais na fonte.</p></div>');
}

function dash(V){
  function tally(fn){ var m={}; V.forEach(function(v){ var k=fn(v); (Array.isArray(k)?k:[k]).forEach(function(x){ if(x!=null&&x!=='') m[x]=(m[x]||0)+1; }); }); return Object.keys(m).map(function(k){ return [k,m[k]]; }).sort(function(a,b){ return b[1]-a[1]; }); }
  function bars(arr,max,onk){ var mx=arr.length?arr[0][1]:1; return '<div class="bars">'+arr.slice(0,max).map(function(a){ return '<div class="bar"><span>'+esc(a[0])+'</span><div class="tr"><i style="width:'+Math.round(a[1]/mx*100)+'%"></i></div><b>'+a[1]+'</b></div>'; }).join('')+'</div>'; }
  var r=tally(function(v){ return v.resultado||'Sem classificação'; }), y=tally(function(v){ return v.ano; }).sort(function(a,b){ return a[0]-b[0]; }), tg=tally(function(v){ return v.tags; }), ar=tally(function(v){ return (v.artigos||[]).slice(0,3); });
  return '<div class="cols" style="margin-bottom:22px"><div class="panel"><h3>Como tenho decidido</h3><p class="hint">Resultado dos '+V.length+' votos/acórdãos lidos</p>'+bars(r,8)+'</div><div class="panel"><h3>Temas mais frequentes</h3><p class="hint">Tags detectadas no texto</p>'+bars(tg,8)+'</div><div class="panel"><h3>Artigos mais citados</h3><p class="hint">EAOAB e CED</p>'+bars(ar,8)+'</div><div class="panel"><h3>Por ano</h3><p class="hint">Quantidade de votos</p>'+bars(y.map(function(a){ return [String(a[0]),a[1]]; }),8)+'</div></div>';
}

T.registerTab({ id:'entendimentos', label:'Meus entendimentos', icon:'brain', render:function(root){
  root.innerHTML='<section class="hero pink"><h2>Meus entendimentos</h2><p>Pesquise como você já decidiu casos parecidos — nos seus votos e acórdãos (pasta TED do Drive), no ementário do Conselho Federal e nas súmulas. Digite qualquer palavra, artigo ou número de processo.</p><div class="tips"><span class="tip">Busca com tolerância a acentos</span><span class="tip">Resultados ordenados por relevância</span><span class="tip">Painel de tendências</span></div></section>'+
   '<div class="toolbar"><input class="input" id="eq" style="max-width:560px" placeholder="Pesquisar (ex.: prescrição notificação válida, art. 34 XXI, 1830/2025)…" value="'+esc(st.q)+'"><div class="seg" id="es">'+[['votos','Meus votos'],['ementas','Ementário CFOAB'],['sumulas','Súmulas']].map(function(s){ return '<button data-s="'+s[0]+'"'+(st.src===s[0]?' class="on"':'')+'>'+s[1]+'</button>'; }).join('')+'</div></div>'+
   '<div class="qk" id="sg">'+SUG.map(function(s){ return '<button data-s="'+esc(s)+'">'+esc(s)+'</button>'; }).join('')+'</div><div id="ed"></div><div id="eo"></div>';
  var eo=T.$('#eo',root), ed=T.$('#ed',root);
  function head(V){
    var res={},tg={},an={}; V.forEach(function(v){ if(v.resultado) res[v.resultado]=1; (v.tags||[]).forEach(function(t){ tg[t]=1; }); an[v.ano]=1; });
    function sel(id,lab,opts,cur){ return '<select class="select input" id="'+id+'" style="max-width:190px"><option value="">'+lab+'</option>'+opts.map(function(o){ return '<option'+(o===cur?' selected':'')+'>'+esc(o)+'</option>'; }).join('')+'</select>'; }
    return '<div class="toolbar">'+sel('fr','Resultado: todos',Object.keys(res).sort(),st.res)+sel('ft','Tema: todos',Object.keys(tg).sort(),st.tag)+sel('fa','Ano: todos',Object.keys(an).sort(),st.ano)+'</div>';
  }
  function paint(){
    var ts=terms(st.q);
    T.$$('#es button',root).forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-s')===st.src); });
    if(st.src==='ementas'){ ed.innerHTML=''; var L=(window.TED_EMENTAS||[]).filter(function(e){ var h=T.normTxt(e.id+' '+e.cabecalho+' '+e.corpo+' '+e.tags.join(' ')); return ts.every(function(t){ return h.indexOf(t)>-1; }); });
      eo.innerHTML='<div class="callout"><b>'+L.length+'</b> ementa(s) do CFOAB.</div>'+L.slice(0,40).map(function(e){ return ementaCard(e,ts); }).join(''); T.$$('[data-eid]',eo).forEach(function(c){ c.addEventListener('click',function(){ openEmenta(L.filter(function(e){ return e.id===c.getAttribute('data-eid'); })[0],ts); }); }); return; }
    if(st.src==='sumulas'){ ed.innerHTML=''; var sd=(window.TED_LEGIS||[]).filter(function(d){ return d.id==='sumulas'; })[0]; var SL=sd.itens.filter(function(it){ var h=T.normTxt(it.r+' '+it.t+' '+(it.n||'')); return ts.every(function(t){ return h.indexOf(t)>-1; }); });
      eo.innerHTML='<div class="callout"><b>'+SL.length+'</b> súmula(s) do CFOAB.</div>'+SL.map(function(it){ return sumCard(it,ts); }).join(''); return; }
    /* meus votos */
    if(!T.state.votos){ eo.innerHTML='<div class="empty"><span class="spin"></span><p>Carregando seus votos…</p></div>'; T.loadVotos().then(function(v){ HAY=buildHay(v); paint(); }).catch(function(){ eo.innerHTML='<div class="empty"><h3>Não foi possível carregar os votos</h3><p>Verifique se as regras do Firestore foram publicadas e se os dados foram importados (aba Acesso).</p></div>'; }); return; }
    var V=T.state.votos; if(!HAY) HAY=buildHay(V);
    if(!V.length){ ed.innerHTML=''; eo.innerHTML='<div class="empty"><h3>Seus votos ainda não foram importados</h3><p>'+(T.perfil.admin?'Vá em <b>Acesso → Importar dados</b> e envie o arquivo TED-importacao.json.':'Peça ao administrador para importar os dados.')+'</p></div>'; return; }
    if(!ed.innerHTML) { ed.innerHTML=dash(V)+head(V); T.$$('select',ed).forEach(function(s){ s.addEventListener('change',function(){ st.res=T.$('#fr',ed).value; st.tag=T.$('#ft',ed).value; st.ano=T.$('#fa',ed).value; paint(); }); }); }
    var R= ts.length? search(ts).filter(function(x){ return passF(x.v); }).sort(function(a,b){ return b.s-a.s||b.v.ano-a.v.ano; }) : V.filter(passF).sort(function(a,b){ return b.ano-a.ano||b.pd.localeCompare(a.pd,undefined,{numeric:true}); }).map(function(v){ return {v:v,s:0}; });
    eo.innerHTML='<div class="callout"><b>'+R.length+'</b> voto(s)'+(ts.length?' para “'+esc(st.q)+'”':' (todos)')+(R.length>50?' — mostrando os 50 primeiros':'')+'.</div>'+(R.slice(0,50).map(function(x){ return votoCard(x,ts); }).join('')||'<div class="empty"><h3>Nada encontrado</h3><p>Tente outros termos ou limpe os filtros.</p></div>');
    T.$$('[data-vid]',eo).forEach(function(c){ c.addEventListener('click',function(){ openVoto(V.filter(function(v){ return v.id===c.getAttribute('data-vid'); })[0],ts); }); });
  }
  T.$('#eq',root).addEventListener('input',T.debounce(function(e){ st.q=e.target.value; paint(); },220));
  T.$$('#es button',root).forEach(function(b){ b.addEventListener('click',function(){ st.src=b.getAttribute('data-s'); paint(); }); });
  T.$$('#sg button',root).forEach(function(b){ b.addEventListener('click',function(){ st.q=b.getAttribute('data-s'); T.$('#eq',root).value=st.q; paint(); }); });
  paint();
}});
})();
