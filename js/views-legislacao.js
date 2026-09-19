/* Aba 3 — Legislação do TED (nacional e Minas Gerais) com pesquisa. */
(function(){
"use strict"; var T=window.TED, esc=T.esc, icon=T.icon;
var COLORS={ eaoab:'#5b4bff', ced:'#9a5cff', rg:'#2f8cff', prov200:'#10b8a4', manual:'#1fb768', sumulas:'#ffae1a', ri_ted_2024:'#f2455c', ri_ted_2019:'#ff8a5c', ri_oabmg:'#ff5ca8', ri_corr:'#c45cff', port_pandemia:'#6b7aff', ementario:'#e8590c' };

var QUICK=[
 ['Prescrição (EAOAB 43)','eaoab','Art. 43'],['Infrações (art. 34)','eaoab','Art. 34'],['Sanções (arts. 35–40)','eaoab','Art. 35'],['Processo disciplinar (arts. 70–73)','eaoab','Art. 70'],['Prazos (art. 69)','eaoab','Art. 69'],
 ['CED · processo (58–61)','ced','Art. 58'],['CED · sanções e TAC','ced','Art. 58-A'],['RG · dias úteis e recesso','rg','Art. 139'],['RG · notificação (137-D)','rg','Art. 137-D'],['TAC — Provimento 200/2020','prov200',null],['Pandemia — Portarias','port_pandemia',null],['Súmulas do CFOAB','sumulas',null]
];
var st={ sel:'eaoab', q:'', tag:'' };
var INDEX=null;
function docs(){ return window.TED_LEGIS||[]; }
function buildIndex(){
  if(INDEX) return INDEX; INDEX=[];
  docs().forEach(function(d){ d.itens.forEach(function(it,i){ INDEX.push({ d:d, it:it, i:i, hay:T.normTxt(it.r+' '+(it.s||'')+' '+it.t+' '+(it.n||'')) }); }); });
  return INDEX;
}
function terms(q){ return T.normTxt(q).split(/\s+/).filter(function(x){ return x.length>1; }); }

function itemCard(it,d,ts,open){
  var pv=it.t.split('\n')[0]; if(pv.length>150) pv=pv.slice(0,150)+'…';
  return '<details class="art-card"'+(open?' open':'')+' data-lab="'+esc(it.r)+'"><summary><span class="lab">'+T.hlSmart(it.r,ts)+'</span><span class="pv">'+(it.s?'<small>'+esc(it.s)+'</small>':'')+(d?'<small style="color:'+(COLORS[d.id]||'#888')+'">'+esc(d.sigla)+'</small>':'')+'<span>'+T.hlSmart(pv,ts)+'</span></span></summary>'+
    '<div class="txt">'+T.hlSmart(it.t,ts)+'</div>'+(it.n?'<div class="nt">'+esc(it.n)+'</div>':'')+'</details>';
}

function ementaCard(e,ts){
  return '<details class="art-card"><summary><span class="lab" style="min-width:150px">'+T.hlSmart(e.id,ts)+'</span><span class="pv"><small>'+esc(e.orgao)+' · '+esc(T.isoToBR(e.data))+' · '+esc(e.fonte)+'</small><span>'+T.hlSmart(e.cabecalho.slice(0,190)+(e.cabecalho.length>190?'…':''),ts)+'</span></span></summary>'+
    '<div class="txt"><b>'+T.hlSmart(e.cabecalho,ts)+'</b>\n'+T.hlSmart(e.corpo,ts)+'</div><div class="nt">'+esc(e.recurso)+(e.relator?' · Relator(a): '+esc(e.relator):'')+' · '+e.tags.map(esc).join(', ')+'</div></details>';
}

function render(root,args){
  var ds=docs(), ementas=window.TED_EMENTAS||[];
  var nac=ds.filter(function(d){ return d.esfera==='nacional'; }), mg=ds.filter(function(d){ return d.esfera==='MG'; });
  root.innerHTML=
   '<section class="hero blue"><h2>Legislação do TED</h2><p>Estatuto, Código de Ética, Regulamento Geral, provimentos e súmulas do Conselho Federal, mais o Regimento Interno do TED e as normas da OAB/MG — tudo em um lugar, com pesquisa por qualquer palavra, artigo ou número.</p><div class="tips"><span class="tip">Pesquisa em todas as normas</span><span class="tip">Atalhos para os artigos que mais caem em julgamento</span><span class="tip">Ementário do CFOAB (2026)</span></div></section>'+
   '<div class="toolbar"><input class="input" id="lq" style="max-width:520px" placeholder="Pesquisar em toda a legislação (ex.: razões finais, art. 43, retenção de autos)…" value="'+esc(st.q)+'"><button class="btn ghost sm" id="lc">Limpar</button></div>'+
   '<div class="qk">'+QUICK.map(function(q,i){ return '<button data-q="'+i+'">'+esc(q[0])+'</button>'; }).join('')+'</div>'+
   '<div class="leg"><aside class="side" id="sd"><h5>Nacional</h5>'+nac.map(dlBtn).join('')+'<h5>Minas Gerais</h5>'+mg.map(dlBtn).join('')+'<h5>Jurisprudência federal</h5><button class="dl" data-d="ementario"><span class="dot" style="background:'+COLORS.ementario+'"></span>Ementário CFOAB<span class="ct">'+ementas.length+'</span></button></aside><section id="lv"></section></div>';
  function dlBtn(d){ return '<button class="dl" data-d="'+d.id+'"><span class="dot" style="background:'+(COLORS[d.id]||'#888')+'"></span>'+esc(d.sigla)+'<span class="ct">'+d.itens.length+'</span></button>'; }
  var lv=T.$('#lv',root);
  function paintSide(){ T.$$('.dl',root).forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-d')===st.sel && !st.q); }); }
  function paint(){
    paintSide(); var ts=terms(st.q);
    if(ts.length){ // busca global
      var idx=buildIndex(), res=[], resE=[];
      idx.forEach(function(x){ for(var k=0;k<ts.length;k++){ if(x.hay.indexOf(ts[k])<0) return; } res.push(x); });
      ementas.forEach(function(e){ var h=T.normTxt(e.id+' '+e.cabecalho+' '+e.corpo+' '+e.tags.join(' ')); for(var k=0;k<ts.length;k++){ if(h.indexOf(ts[k])<0) return; } resE.push(e); });
      var total=res.length+resE.length;
      lv.innerHTML='<div class="callout"><b>'+total+'</b> resultado(s) para “'+esc(st.q)+'” — '+res.length+' em normas e '+resE.length+' no ementário do CFOAB.'+(total>80?' Mostrando os 80 primeiros; refine a busca.':'')+'</div>'+
        res.slice(0,60).map(function(x){ return itemCard(x.it,x.d,ts,false); }).join('')+resE.slice(0,20).map(function(e){ return ementaCard(e,ts); }).join('')+(total?'':'<div class="empty"><h3>Nada encontrado</h3><p>Tente outro termo, ou o número do artigo (ex.: “43”).</p></div>');
      return;
    }
    if(st.sel==='ementario'){
      var tags={}; ementas.forEach(function(e){ e.tags.forEach(function(t){ tags[t]=(tags[t]||0)+1; }); });
      var list=st.tag? ementas.filter(function(e){ return e.tags.indexOf(st.tag)>-1; }) : ementas;
      lv.innerHTML='<p class="srcnote">Ementas disciplinares publicadas no Diário Eletrônico da OAB de 13/03/2026 e 07/04/2026 (Segunda Câmara do Conselho Federal). Partes identificadas apenas por iniciais na fonte.</p>'+
        '<div class="qk"><button data-tag=""'+(st.tag?'':' style="border-color:var(--brand1);color:var(--brand1)"')+'>Todas ('+ementas.length+')</button>'+Object.keys(tags).sort().map(function(t){ return '<button data-tag="'+esc(t)+'"'+(st.tag===t?' style="border-color:var(--brand1);color:var(--brand1)"':'')+'>'+esc(t)+' ('+tags[t]+')</button>'; }).join('')+'</div>'+list.map(function(e){ return ementaCard(e,[]); }).join('');
      T.$$('[data-tag]',lv).forEach(function(b){ b.addEventListener('click',function(){ st.tag=b.getAttribute('data-tag'); paint(); }); });
      return;
    }
    var d=ds.filter(function(x){ return x.id===st.sel; })[0]||ds[0];
    lv.innerHTML='<h3 style="font-family:var(--display);font-size:22px;margin:0 0 4px">'+esc(d.titulo)+'</h3><p class="srcnote">'+esc(d.tipo)+' · '+esc(d.esfera==='MG'?'Minas Gerais':'Nacional')+' · '+d.itens.length+' dispositivos<br>Fonte: '+esc(d.fonte)+'</p>'+
      '<div class="toolbar"><input class="input" id="dq" style="max-width:340px" placeholder="Filtrar dentro desta norma…"></div><div id="di">'+d.itens.map(function(it){ return itemCard(it,null,[],false); }).join('')+'</div>';
    T.$('#dq',lv).addEventListener('input',T.debounce(function(e){
      var t=terms(e.target.value);
      T.$('#di',lv).innerHTML=d.itens.filter(function(it){ var h=T.normTxt(it.r+' '+it.t); return t.every(function(x){ return h.indexOf(x)>-1; }); }).map(function(it){ return itemCard(it,null,t,false); }).join('')||'<div class="empty"><p>Nada neste documento.</p></div>';
    },150));
  }
  T.$('#lq',root).addEventListener('input',T.debounce(function(e){ st.q=e.target.value; paint(); },200));
  T.$('#lc',root).addEventListener('click',function(){ st.q=''; T.$('#lq',root).value=''; paint(); });
  T.$$('.dl',root).forEach(function(b){ b.addEventListener('click',function(){ st.sel=b.getAttribute('data-d'); st.q=''; st.tag=''; T.$('#lq',root).value=''; paint(); lv.scrollIntoView({behavior:'smooth',block:'start'}); }); });
  T.$$('[data-q]',root).forEach(function(b){ b.addEventListener('click',function(){
    var q=QUICK[+b.getAttribute('data-q')]; st.sel=q[1]; st.q=''; T.$('#lq',root).value=''; paint();
    if(q[2]){ var el=T.$$('#di .art-card',lv).filter(function(x){ return x.getAttribute('data-lab')===q[2]; })[0]; if(el){ el.open=true; el.scrollIntoView({behavior:'smooth',block:'start'}); } } else lv.scrollIntoView({behavior:'smooth',block:'start'});
  }); });
  paint();
}
T.registerTab({ id:'legislacao', label:'Legislação', icon:'book', render:render });
})();
