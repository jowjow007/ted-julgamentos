/* Aba 4 — Calculadora de prescrição (EAOAB, art. 43), prazos em dias úteis, prescrição/decadência civil e tabela de referência. */
(function(){
"use strict"; var T=window.TED, esc=T.esc, icon=T.icon;
var DAY=86400000;

/* ---------- datas (UTC) ---------- */
function pISO(s){ var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||''); return m? new Date(Date.UTC(+m[1],+m[2]-1,+m[3])) : null; }
function fISO(d){ return d.toISOString().slice(0,10); }
function br(d){ return d? T.isoToBR(fISO(d)) : '—'; }
function addDays(d,n){ return new Date(d.getTime()+n*DAY); }
function addMonths(d,n){ var y=d.getUTCFullYear(), m=d.getUTCMonth()+n, day=d.getUTCDate(); var t=new Date(Date.UTC(y,m,day)); if(t.getUTCMonth()!==((m%12)+12)%12){ t=new Date(Date.UTC(y,m+1,0)); } return t; }
function addYears(d,n){ return addMonths(d,n*12); }
function diff(a,b){ return Math.round((b.getTime()-a.getTime())/DAY); }
function today(){ var n=new Date(); return new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())); }
function merge(iv){ var a=iv.filter(function(x){return x[0]&&x[1]&&x[1]>=x[0];}).map(function(x){return [x[0].getTime(),x[1].getTime()];}).sort(function(p,q){return p[0]-q[0];}); var o=[]; a.forEach(function(x){ var l=o[o.length-1]; if(l&&x[0]<=l[1]+DAY) l[1]=Math.max(l[1],x[1]); else o.push(x.slice()); }); return o; }
function suspDays(iv,start,end){ /* dias de suspensão dentro de [start,end] (inclusive) */
  var s=start.getTime(), e=end.getTime(), n=0; merge(iv).forEach(function(x){ var a=Math.max(x[0],s), b=Math.min(x[1],e); if(b>=a) n+=Math.round((b-a)/DAY)+1; }); return n; }
function fimPrazo(start,years,iv){ /* fim do prazo com prorrogação pelas suspensões incidentes */
  var base=addYears(start,years), e0=base, n=0;
  for(var i=0;i<12;i++){ n=suspDays(iv,addDays(start,1),e0); var e1=addDays(base,n); if(e1.getTime()===e0.getTime()) break; e0=e1; }
  return { fim:e0, dias:n };
}

/* ---------- estado ---------- */
var S={ tab:'presc', marco:'', ref:'', ev:[], atos:[], custom:[], sel:null };
function defaults(){
  S.marco=''; S.ref=fISO(today()); S.ev=[]; S.atos=[]; S.custom=[]; S.sel={};
  (window.TED_SUSP||[]).forEach(function(s){ S.sel[s.id]=!!s.padrao; });
}
defaults();
function applyPreset(p){
  defaults(); if(!p) return;
  S.marco=p.marco||''; if(p.ref) S.ref=p.ref; S.ev=(p.eventos||[]).map(function(e){ return {data:e.data,tipo:e.tipo||'notificacao',desc:e.desc||''}; });
  S.atos=(p.atos||[]).map(function(a){ return {data:a.data,desc:a.desc||''}; });
  if(p.suspensoes) (window.TED_SUSP||[]).forEach(function(s){ S.sel[s.id]=p.suspensoes.indexOf(s.id)>-1; });
}

var TIPOS={ instauracao:'Instauração do processo disciplinar (art. 43, §2º, I)', notificacao:'Notificação válida ao representado (art. 43, §2º, I)', condenatoria:'Decisão condenatória recorrível (art. 43, §2º, II)', outro:'Outro marco interruptivo' };

/* ---------- cálculo da prescrição ---------- */
function ativos(mode){
  var iv=[], lista=[];
  (window.TED_SUSP||[]).forEach(function(s){ var on= mode==='nenhuma'?false : mode==='maxima'?true : !!S.sel[s.id]; if(on){ iv.push([pISO(s.ini),pISO(s.fim)]); lista.push(s); } });
  S.custom.forEach(function(c){ if(mode==='nenhuma') return; var a=pISO(c.ini), b=pISO(c.fim); if(a&&b){ iv.push([a,b]); lista.push({id:'custom',nome:c.nome||'Suspensão informada',ini:c.ini,fim:c.fim,status:'oficial',desc:c.desc||'Período informado manualmente (ex.: TAC — Provimento 200/2020, art. 4º, §4º: durante a suspensão não fluem os prazos prescricionais).'}); } });
  return { iv:iv, lista:lista };
}
function calcPresc(mode){
  var M=pISO(S.marco), R=pISO(S.ref); if(!M||!R) return null;
  var A=ativos(mode), evs=S.ev.map(function(e){ return {d:pISO(e.data),t:e.tipo,desc:e.desc}; }).filter(function(e){ return e.d; }).sort(function(a,b){ return a.d-b.d; });
  var start=M, out={ mode:mode, passos:[], prescritaAntes:null, avisos:[] };
  for(var i=0;i<evs.length;i++){
    var e=evs[i]; if(e.d<M){ out.avisos.push('O marco de '+br(e.d)+' é anterior ao termo inicial e foi ignorado.'); continue; }
    if(e.d>R){ out.avisos.push('O marco de '+br(e.d)+' é posterior à data de referência e não foi considerado.'); continue; }
    var f=fimPrazo(start,5,A.iv);
    out.passos.push({ini:start,fim:f.fim,susp:f.dias,fechou:e.d});
    if(e.d>f.fim){ out.prescritaAntes={quando:f.fim,marco:e}; out.fim=f.fim; out.susp=f.dias; out.start=start; out.prescrita=true; out.lista=A.lista; return out; }
    start=e.d;
  }
  var ff=fimPrazo(start,5,A.iv);
  out.start=start; out.fim=ff.fim; out.susp=ff.dias; out.lista=A.lista; out.prescrita=R>ff.fim;
  out.folga=diff(R,ff.fim); out.pct=Math.max(0,Math.min(100,Math.round(diff(start,R)/Math.max(1,diff(start,ff.fim))*100)));
  return out;
}
function calcInter(mode){
  var R=pISO(S.ref), A=ativos(mode); if(!R) return null;
  var ats=S.atos.map(function(a){ return {d:pISO(a.data),desc:a.desc}; }).filter(function(a){ return a.d; }).sort(function(a,b){ return a.d-b.d; });
  if(ats.length<1) return null; var res=[], flagged=false;
  for(var i=0;i<ats.length;i++){
    var prev=ats[i], next=ats[i+1]||{d:R,desc:'data de referência',ref:true};
    var f=fimPrazo(prev.d,3,A.iv);
    var over= next.d>f.fim;
    res.push({de:prev,ate:next,limite:f.fim,dias:diff(prev.d,next.d),over:over}); if(over) flagged=true;
  }
  return { gaps:res, flagged:flagged };
}

function scenario(label,mode,cls){
  var p=calcPresc(mode); if(!p) return '<div class="sc"><small>'+esc(label)+'</small><span>Preencha as datas.</span></div>';
  var st= p.prescrita?'bad':'ok';
  return '<div class="sc '+(p.prescrita?'warn':'ok')+'"><small>'+esc(label)+'</small><b>'+esc(br(p.fim))+'</b><span>'+(p.prescrita?'<b style="color:var(--warn-ink)">PRESCRITA</b> — venceu há '+Math.abs(diff(pISO(S.ref),p.fim))+' dia(s)':'não prescrita — faltam '+p.folga+' dia(s)')+'<br>'+p.susp+' dia(s) de suspensão somados</span></div>';
}

/* ---------- texto para o voto ---------- */
function votoTxt(pB){
  if(!pB) return '';
  var t=[]; var M=pISO(S.marco), R=pISO(S.ref);
  t.push('Em atenção ao art. 43 do EAOAB, a pretensão à punibilidade das infrações disciplinares prescreve em cinco anos, contados da data da constatação oficial do fato, interrompendo-se pela instauração do processo disciplinar ou pela notificação válida feita diretamente ao representado e pela decisão condenatória recorrível (§ 2º).');
  t.push('No caso, a constatação oficial do fato ocorreu em '+br(M)+'.');
  var evs=S.ev.filter(function(e){ return pISO(e.data); }).sort(function(a,b){ return a.data<b.data?-1:1; });
  evs.forEach(function(e){ t.push('Houve interrupção em '+br(pISO(e.data))+' ('+(TIPOS[e.tipo]||'marco').replace(/\s*\(.*\)/,'').toLowerCase()+(e.desc?': '+e.desc:'')+').'); });
  if(pB.prescritaAntes) t.push('Entre '+br(pB.start)+' e '+br(pB.prescritaAntes.marco.d)+' transcorreram mais de cinco anos, de modo que a pretensão já estava prescrita antes do marco de '+br(pB.prescritaAntes.marco.d)+'.');
  else t.push('Sem nova interrupção, o prazo quinquenal fluiu de '+br(pB.start)+' até '+br(pB.fim)+(pB.susp?' (já acrescidos '+pB.susp+' dia(s) de suspensão)':'')+'.');
  if(pB.lista&&pB.lista.length){ t.push('Consideraram-se suspensos os prazos nos seguintes períodos: '+pB.lista.map(function(s){ return s.nome+' ('+T.isoToBR(s.ini)+' a '+T.isoToBR(s.fim)+')'; }).join('; ')+'.'); }
  if(!S.sel.rjet) t.push('Não se aplica ao processo disciplinar a suspensão da Lei 14.010/2020, por regular relações de Direito Privado, prevalecendo o art. 43 do EAOAB (CFOAB, Consulta 49.0000.2020.005420-1/OEP, Ementa 018/2021/OEP).');
  t.push(pB.prescrita? 'Assim, na data de '+br(R)+', encontra-se ultrapassado o lapso prescricional (termo final em '+br(pB.fim)+'), impondo-se o reconhecimento da prescrição da pretensão punitiva e a extinção da punibilidade.' : 'Assim, na data de '+br(R)+', não se consumou a prescrição da pretensão punitiva, cujo termo final ocorre em '+br(pB.fim)+'.');
  return t.join(' ');
}

/* ---------- UI: prescrição ---------- */
function tagOf(s){ var m={oficial:['oficial','texto lido'],noticia:['noticia','notícia — conferir'],controv:['controv','controvertida'],judic:['judic','Judiciário']}[s.status]||['judic','']; return '<span class="tag '+m[0]+'">'+m[1]+'</span>'; }
function viewPresc(host){
  var suspHTML=(window.TED_SUSP||[]).map(function(s){ return '<label class="sw"><input type="checkbox" data-susp="'+s.id+'"'+(S.sel[s.id]?' checked':'')+'><span><b>'+esc(s.nome)+tagOf(s)+'</b><small>'+esc(T.isoToBR(s.ini))+' a '+esc(T.isoToBR(s.fim))+' — '+esc(s.desc)+'</small></span></label>'; }).join('');
  host.innerHTML=
   '<div class="calc"><div>'+
    '<div class="panel"><h3>1 · Datas do processo</h3><p class="hint">O termo inicial é a <b>constatação oficial do fato</b> pela OAB (em regra, o protocolo da representação), não a data em que o fato ocorreu.</p>'+
     '<div class="two"><label class="field"><span>Constatação oficial (termo inicial)</span><input class="input" type="date" id="c-marco" value="'+esc(S.marco)+'"></label>'+
     '<label class="field"><span>Data de referência (sessão / hoje)</span><input class="input" type="date" id="c-ref" value="'+esc(S.ref)+'"></label></div></div>'+
    '<div class="panel" style="margin-top:16px"><h3>2 · Marcos interruptivos</h3><p class="hint">Art. 43, §2º: instauração do PD, notificação válida ao representado e decisão condenatória recorrível. Cada marco recomeça o prazo de 5 anos.</p><div id="c-ev"></div><button class="btn ghost sm" id="c-addev">'+icon('plus')+' Adicionar marco</button></div>'+
    '<div class="panel" style="margin-top:16px"><h3>3 · Atos do processo (prescrição intercorrente)</h3><p class="hint">Despachos, decisões e atos de impulso. Se o processo ficou parado, pendente de despacho ou julgamento, por mais de 3 anos, incide o art. 43, §1º.</p><div id="c-at"></div><button class="btn ghost sm" id="c-addat">'+icon('plus')+' Adicionar ato</button></div>'+
    '<div class="panel" style="margin-top:16px"><h3>4 · Suspensões</h3><p class="hint">Marque o que <b>você</b> entende aplicável (cenário “Meu entendimento”). O sistema ainda compara com o cenário sem suspensões e com o máximo possível.</p>'+suspHTML+
     '<div class="two" style="margin-top:10px"><label class="field"><span>Outra suspensão — nome (ex.: TAC)</span><input class="input" id="c-cn"></label><div class="two"><label class="field"><span>Início</span><input class="input" type="date" id="c-ci"></label><label class="field"><span>Fim</span><input class="input" type="date" id="c-cf"></label></div></div>'+
     '<button class="btn ghost sm" id="c-addc">'+icon('plus')+' Incluir período</button><div id="c-cl"></div></div>'+
   '</div><div id="c-out"></div></div>';
  function evRow(e,i,list,key){ return '<div class="evrow"><input class="input" type="date" data-k="'+key+'" data-i="'+i+'" data-f="data" value="'+esc(e.data)+'">'+(key==='ev'?'<select class="select input" data-k="ev" data-i="'+i+'" data-f="tipo">'+Object.keys(TIPOS).map(function(k){ return '<option value="'+k+'"'+(e.tipo===k?' selected':'')+'>'+esc(TIPOS[k].split(' (')[0])+'</option>'; }).join('')+'</select>':'<input class="input" placeholder="descrição" data-k="'+key+'" data-i="'+i+'" data-f="desc" value="'+esc(e.desc||'')+'">')+'<button class="iconbtn" data-del="'+key+':'+i+'">'+icon('trash')+'</button></div>'; }
  function paintLists(){
    T.$('#c-ev',host).innerHTML=S.ev.length? S.ev.map(function(e,i){ return evRow(e,i,S.ev,'ev'); }).join('') : '<p class="hint" style="margin:0 0 8px">Nenhum marco informado.</p>';
    T.$('#c-at',host).innerHTML=S.atos.length? S.atos.map(function(e,i){ return evRow(e,i,S.atos,'atos'); }).join('') : '<p class="hint" style="margin:0 0 8px">Nenhum ato informado.</p>';
    T.$('#c-cl',host).innerHTML=S.custom.map(function(c,i){ return '<div class="evrow" style="margin-top:8px"><div style="font-size:13px"><b>'+esc(c.nome||'Suspensão')+'</b> · '+esc(T.isoToBR(c.ini))+' a '+esc(T.isoToBR(c.fim))+'</div><span></span><button class="iconbtn" data-del="custom:'+i+'">'+icon('trash')+'</button></div>'; }).join('');
  }
  function paintOut(){
    var pA=calcPresc('nenhuma'), pB=calcPresc('meu'), pC=calcPresc('maxima'), inter=calcInter('meu'), o=T.$('#c-out',host);
    if(!pB){ o.innerHTML='<div class="verdict idle"><h3>Informe as datas</h3><p>Preencha a constatação oficial do fato e a data de referência para ver o resultado.</p></div>'; return; }
    var all=pA.prescrita&&pB.prescrita&&pC.prescrita, none=!pA.prescrita&&!pB.prescrita&&!pC.prescrita, cls,tit,sub;
    if(all){ cls='warn'; tit='Prescrita em todos os cenários'; sub='Mesmo somando todas as suspensões possíveis, o prazo de 5 anos já se esgotou em '+br(pC.fim)+'. A conclusão não depende de tese sobre a pandemia.'; }
    else if(none){ cls='ok'; tit='Não prescrita'; sub='Mesmo sem qualquer suspensão, o prazo só se esgota em '+br(pA.fim)+' (faltam '+pA.folga+' dia(s)).'; }
    else { cls='bad'; tit='Depende da tese das suspensões'; sub='O resultado muda conforme as suspensões aplicadas: veja os três cenários abaixo. Fundamente expressamente a escolha no voto.'; }
    var h='<div class="verdict '+cls+'"><h3>'+esc(tit)+'</h3><p>'+esc(sub)+'</p></div>';
    h+='<div class="panel" style="margin-top:16px"><h3>Cenários</h3><div class="scen">'+scenario('A · Só o art. 43 (sem suspensões)','nenhuma')+scenario('B · Meu entendimento','meu')+scenario('C · Máximo possível','maxima')+'</div>'+
       '<p class="hint" style="margin:0">Termo inicial: '+esc(br(pISO(S.marco)))+(S.ev.length?' · último marco considerado: '+esc(br(pB.start)):'')+' · referência: '+esc(br(pISO(S.ref)))+'.</p>';
    if(!pB.prescritaAntes) h+='<div class="gauge"><i style="width:'+pB.pct+'%"></i></div><p class="hint" style="margin:0">'+pB.pct+'% do quinquênio decorrido desde '+esc(br(pB.start))+' (cenário B).</p>';
    h+='</div>';
    if(pB.prescritaAntes) h+='<div class="callout bad" style="margin-top:14px"><b>Atenção:</b> a pretensão já havia prescrito em '+esc(br(pB.prescritaAntes.quando))+', antes do marco interruptivo de '+esc(br(pB.prescritaAntes.marco.d))+'. Marco posterior não “revive” pretensão prescrita.</div>';
    pB.passos.forEach(function(x){ h+='<div class="callout" style="margin-top:10px">Período '+esc(br(x.ini))+' → '+esc(br(x.fechou))+': interrompido antes de vencer (limite era '+esc(br(x.fim))+').</div>'; });
    (pB.avisos||[]).forEach(function(a){ h+='<div class="callout warn" style="margin-top:10px">'+esc(a)+'</div>'; });
    /* mensagem do que suspendeu */
    var incid=(pB.lista||[]).filter(function(s){ var a=pISO(s.ini), b=pISO(s.fim); return suspDays([[a,b]],addDays(pB.start,1),pB.fim)>0; });
    if(incid.length){ h+='<div class="panel" style="margin-top:16px"><h3>O que suspendeu o prazo</h3>'+incid.map(function(s){ var a=pISO(s.ini), b=pISO(s.fim), n=suspDays([[a,b]],addDays(pB.start,1),pB.fim); return '<div class="callout '+(s.status==='oficial'?'ok':'warn')+'" style="margin:8px 0 0"><b>'+esc(s.nome)+'</b> ('+esc(T.isoToBR(s.ini))+' a '+esc(T.isoToBR(s.fim))+' — '+n+' dia(s) no período computado)<br>'+esc(s.desc)+'</div>'; }).join('')+'<p class="hint" style="margin:10px 0 0">Períodos sobrepostos foram contados uma só vez. Total considerado no cenário B: <b>'+pB.susp+' dia(s)</b>.</p></div>'; }
    else h+='<div class="callout" style="margin-top:14px">Nenhuma suspensão incide sobre o período computado no cenário B.</div>';
    if(!S.sel.rjet) h+='<div class="callout warn" style="margin-top:10px"><b>Lei 14.010/2020 (RJET) não aplicada:</b> o Conselho Federal entende que não alcança o processo disciplinar (Ementa 018/2021/OEP). Marque a suspensão correspondente para simular o efeito.</div>';
    if(inter){ h+='<div class="panel" style="margin-top:16px"><h3>Prescrição intercorrente (art. 43, §1º)</h3>'+(inter.flagged?'<div class="callout bad"><b>Há paralisação superior a 3 anos</b> — o processo deve ser arquivado (de ofício ou a requerimento).</div>':'<div class="callout ok"><b>Sem paralisação superior a 3 anos</b> entre os atos informados.</div>')+
        '<table class="tbl"><tr><th>De</th><th>Até</th><th>Dias</th><th>Limite</th></tr>'+inter.gaps.map(function(g){ return '<tr'+(g.over?' style="background:var(--bad-bg)"':'')+'><td class="m">'+esc(br(g.de.d))+'<br><small>'+esc(g.de.desc||'')+'</small></td><td class="m">'+esc(br(g.ate.d))+'<br><small>'+esc(g.ate.desc||'')+'</small></td><td class="m">'+g.dias+'</td><td class="m">'+esc(br(g.limite))+(g.over?' ✖':' ✔')+'</td></tr>'; }).join('')+'</table></div>'; }
    h+='<div class="panel" style="margin-top:16px"><h3>Texto sugerido para o voto</h3><p class="hint">Baseado no cenário B. Revise antes de usar.</p><textarea class="input" id="c-txt" style="min-height:170px">'+esc(votoTxt(pB))+'</textarea><div style="margin-top:8px"><button class="btn sm" id="c-cp">Copiar texto</button></div></div>';
    o.innerHTML=h; var cp=T.$('#c-cp',o); if(cp) cp.addEventListener('click',function(){ var t=T.$('#c-txt',o); t.select(); try{ document.execCommand('copy'); T.toast('Texto copiado.'); }catch(e){} });
  }
  function all(){ paintLists(); paintOut(); }
  T.$('#c-marco',host).addEventListener('input',function(e){ S.marco=e.target.value; paintOut(); });
  T.$('#c-ref',host).addEventListener('input',function(e){ S.ref=e.target.value; paintOut(); });
  T.$('#c-addev',host).addEventListener('click',function(){ S.ev.push({data:'',tipo:'notificacao',desc:''}); paintLists(); });
  T.$('#c-addat',host).addEventListener('click',function(){ S.atos.push({data:'',desc:''}); paintLists(); });
  T.$('#c-addc',host).addEventListener('click',function(){ var a=T.$('#c-ci',host).value, b=T.$('#c-cf',host).value; if(!a||!b||b<a){ T.toast('Informe início e fim válidos.'); return; } S.custom.push({nome:T.$('#c-cn',host).value.trim(),ini:a,fim:b}); T.$('#c-cn',host).value=''; T.$('#c-ci',host).value=''; T.$('#c-cf',host).value=''; all(); });
  host.addEventListener('input',function(e){ var t=e.target, k=t.getAttribute('data-k'); if(!k) return; var i=+t.getAttribute('data-i'), f=t.getAttribute('data-f'); (k==='ev'?S.ev:S.atos)[i][f]=t.value; paintOut(); });
  host.addEventListener('change',function(e){ var t=e.target; if(t.hasAttribute('data-susp')){ S.sel[t.getAttribute('data-susp')]=t.checked; paintOut(); } });
  host.addEventListener('click',function(e){ var d=e.target.closest('[data-del]'); if(!d) return; var p=d.getAttribute('data-del').split(':'), i=+p[1]; if(p[0]==='ev') S.ev.splice(i,1); else if(p[0]==='atos') S.atos.splice(i,1); else S.custom.splice(i,1); all(); });
  all();
}

/* ---------- prazos em dias úteis ---------- */
function easter(y){ var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1; return new Date(Date.UTC(y,mo-1,da)); }
function feriados(y,opt){
  var s={}; [[1,1],[4,21],[5,1],[9,7],[10,12],[11,2],[11,15],[12,25]].forEach(function(x){ s[fISO(new Date(Date.UTC(y,x[0]-1,x[1])))]='Feriado nacional'; });
  if(y>=2024) s[fISO(new Date(Date.UTC(y,10,20)))]='Consciência Negra (Lei 14.759/2023)';
  var p=easter(y); if(opt.sexta) s[fISO(addDays(p,-2))]='Sexta-feira Santa'; if(opt.carn){ s[fISO(addDays(p,-48))]='Carnaval (segunda)'; s[fISO(addDays(p,-47))]='Carnaval (terça)'; } if(opt.corpus) s[fISO(addDays(p,60))]='Corpus Christi';
  return s;
}
var P={ ini:'', kind:'deoab', dias:15, sexta:true, carn:true, corpus:true, recesso:true, extra:'' };
function viewPrazos(host){
  host.innerHTML='<div class="calc"><div class="panel"><h3>Prazo em dias úteis</h3><p class="hint">Regra do RG, art. 139 e EAOAB, art. 69: prazos de 15 dias, contados só em dias úteis, a partir do primeiro dia útil seguinte à publicação no DEOAB ou à juntada do AR. Entre 20/12 e 31/12 e em janeiro (recesso) os prazos ficam suspensos.</p>'+
   '<label class="field"><span>Ato que dá início</span><select class="select input" id="p-kind"><option value="deoab">Disponibilização no Diário Eletrônico (DEOAB)</option><option value="ar">Juntada do aviso de recebimento (AR)</option><option value="ciencia">Ciência pessoal / intimação</option></select></label>'+
   '<div class="two"><label class="field"><span>Data do ato</span><input class="input" type="date" id="p-ini"></label><label class="field"><span>Prazo (dias úteis)</span><input class="input" type="number" min="1" id="p-dias" value="15"></label></div>'+
   '<label class="sw"><input type="checkbox" id="p-rec" checked><span><b>Recesso 20/12 a 31/01 suspende os prazos</b><small>RG, art. 139, §3º.</small></span></label>'+
   '<label class="sw"><input type="checkbox" id="p-sx" checked><span><b>Sexta-feira Santa não é dia útil</b></span></label><label class="sw"><input type="checkbox" id="p-cv" checked><span><b>Carnaval (segunda e terça) não é dia útil</b><small>Confirme na portaria do TED/OAB-MG do ano.</small></span></label><label class="sw"><input type="checkbox" id="p-cc" checked><span><b>Corpus Christi não é dia útil</b></span></label>'+
   '<label class="field"><span>Outros feriados/sem expediente (dd/mm/aaaa, um por linha)</span><textarea class="input" id="p-ex" placeholder="ex.: feriado municipal, dia sem expediente por portaria"></textarea></label></div><div id="p-out"></div></div>';
  function run(){
    var o=T.$('#p-out',host), ini=pISO(T.$('#p-ini',host).value), n=+T.$('#p-dias',host).value||15, kind=T.$('#p-kind',host).value;
    P.recesso=T.$('#p-rec',host).checked; P.sexta=T.$('#p-sx',host).checked; P.carn=T.$('#p-cv',host).checked; P.corpus=T.$('#p-cc',host).checked;
    if(!ini){ o.innerHTML='<div class="verdict idle"><h3>Informe a data</h3><p>Escolha a data do ato que inicia o prazo.</p></div>'; return; }
    var ex={}; T.$('#p-ex',host).value.split(/\n+/).forEach(function(l){ var i=T.brToISO(l.trim()); if(i) ex[i]='Dia informado'; });
    var cache={}; function fer(d){ var y=d.getUTCFullYear(); if(!cache[y]) cache[y]=feriados(y,P); return cache[y][fISO(d)]||ex[fISO(d)]; }
    function rec(d){ if(!P.recesso) return false; var m=d.getUTCMonth(), day=d.getUTCDate(); return (m===11&&day>=20)||m===0; }
    function util(d){ var w=d.getUTCDay(); return w!==0&&w!==6&&!fer(d)&&!rec(d); }
    function nextBD(d){ var x=addDays(d,1); while(!util(x)) x=addDays(x,1); return x; }
    var notes=[], start;
    if(kind==='deoab'){ var pub=nextBD(ini); notes.push('Disponibilização em '+br(ini)+' → publicação considerada em '+br(pub)+' (art. 69, §2º).'); start=nextBD(pub); }
    else start=nextBD(ini);
    notes.push('Primeiro dia do prazo: '+br(start)+'.');
    var count=0, cur=addDays(start,-1), lst=[];
    while(count<n){ cur=addDays(cur,1); if(util(cur)){ count++; lst.push(cur); } }
    var skipped=[]; for(var d=start;d<=cur;d=addDays(d,1)){ if(!util(d)){ var w=d.getUTCDay(); skipped.push(br(d)+' — '+(w===0?'domingo':w===6?'sábado':fer(d)||(rec(d)?'recesso':'sem expediente'))); } }
    o.innerHTML='<div class="verdict ok"><h3>Último dia: '+esc(br(cur))+'</h3><p>'+n+' dia(s) úteis contados a partir de '+esc(br(start))+'.</p></div>'+
      '<div class="panel" style="margin-top:16px"><h3>Como foi contado</h3>'+notes.map(function(x){ return '<p style="margin:0 0 6px">'+esc(x)+'</p>'; }).join('')+(skipped.length?'<details><summary style="cursor:pointer;font-weight:700">Dias não computados ('+skipped.length+')</summary><ul>'+skipped.map(function(s){ return '<li>'+esc(s)+'</li>'; }).join('')+'</ul></details>':'')+'</div>';
  }
  host.addEventListener('input',run); host.addEventListener('change',run); run();
}

/* ---------- civil: prescrição / decadência ---------- */
function viewCivil(host){
  var C=window.TED_CIVIL||[];
  host.innerHTML='<div class="calc"><div class="panel"><h3>Prescrição e decadência civis</h3><p class="hint">Para questões acessórias (ex.: cobrança de honorários, reparação civil, prestação de contas discutida no PD). <b>Não</b> se aplica à pretensão disciplinar, que segue o art. 43 do EAOAB.</p>'+
   '<label class="field"><span>Prazo</span><select class="select input" id="k-t">'+C.map(function(c){ return '<option value="'+c.id+'">'+esc(c.nome)+'</option>'; }).join('')+'</select></label>'+
   '<div id="k-mm" class="hidden"><label class="field"><span>Meses do prazo decadencial</span><input class="input" type="number" min="1" id="k-m" value="12"></label></div>'+
   '<div class="two"><label class="field"><span>Termo inicial (actio nata / término do serviço)</span><input class="input" type="date" id="k-i"></label><label class="field"><span>Data de referência</span><input class="input" type="date" id="k-r" value="'+fISO(today())+'"></label></div>'+
   '<label class="field"><span>Interrupção (CC, art. 202 — só uma vez)</span><input class="input" type="date" id="k-x"></label>'+
   '<label class="sw"><input type="checkbox" id="k-rj" checked><span><b>Suspensão da Lei 14.010/2020 (12/06 a 30/10/2020)</b><small>Vale para prazos <u>prescricionais</u> de Direito Privado (art. 3º); não para decadência (CC, art. 207).</small></span></label></div><div id="k-out"></div></div>';
  function run(){
    var c=C.filter(function(x){ return x.id===T.$('#k-t',host).value; })[0]; T.$('#k-mm',host).classList.toggle('hidden',!c.meses);
    var i=pISO(T.$('#k-i',host).value), r=pISO(T.$('#k-r',host).value), x=pISO(T.$('#k-x',host).value), o=T.$('#k-out',host);
    if(!i||!r){ o.innerHTML='<div class="verdict idle"><h3>Informe as datas</h3><p>'+esc(c.base)+'</p></div>'; return; }
    var start=i, note='';
    if(x&&c.tipo==='prescricao'&&x>=i){ start=x; note='Prazo reiniciado pela interrupção de '+br(x)+' (CC, art. 202 — uma única vez).'; }
    var iv=(c.tipo==='prescricao'&&T.$('#k-rj',host).checked)? [[pISO('2020-06-12'),pISO('2020-10-30')]] : [];
    var end, sd=0;
    if(c.meses){ end=addMonths(start,+T.$('#k-m',host).value||12); } else { var f=fimPrazo(start,c.anos,iv); end=f.fim; sd=f.dias; }
    var pres=r>end;
    o.innerHTML='<div class="verdict '+(pres?'warn':'ok')+'"><h3>'+(pres?(c.tipo==='decadencia'?'Decadência consumada':'Prescrição consumada'):(c.tipo==='decadencia'?'Direito ainda não decaiu':'Não prescrita'))+'</h3><p>Termo final: <b>'+esc(br(end))+'</b> — '+(pres?'há '+Math.abs(diff(r,end))+' dia(s)':'faltam '+diff(r,end)+' dia(s)')+'.</p></div>'+
     '<div class="panel" style="margin-top:16px"><h3>Fundamento</h3><p style="margin:0">'+esc(c.base)+'</p>'+(note?'<p style="margin:8px 0 0">'+esc(note)+'</p>':'')+(sd?'<div class="callout ok" style="margin-top:10px"><b>Suspensão aplicada:</b> Lei 14.010/2020, art. 3º — prazos prescricionais impedidos ou suspensos de 12/06/2020 a 30/10/2020 ('+sd+' dia(s) no período).</div>':'')+(c.tipo==='decadencia'?'<div class="callout" style="margin-top:10px">Decadência: não se suspende nem se interrompe, salvo disposição legal (CC, art. 207); pode ser conhecida de ofício se legal (art. 210).</div>':'')+'</div>';
  }
  host.addEventListener('input',run); host.addEventListener('change',run); run();
}

/* ---------- referência ---------- */
function viewRef(host){
  host.innerHTML='<div class="panel"><h3>Prazos legais do processo ético-disciplinar</h3><p class="hint">Consulta rápida — cada linha indica o dispositivo.</p><div style="overflow:auto"><table class="tbl"><tr><th>Instituto</th><th>Prazo</th><th>Regra</th><th>Base</th></tr>'+(window.TED_PRAZOS||[]).map(function(r){ return '<tr><td><b>'+esc(r[0])+'</b></td><td class="m">'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td class="m">'+esc(r[3])+'</td></tr>'; }).join('')+'</table></div></div>'+
   '<div class="panel" style="margin-top:16px"><h3>Suspensões catalogadas (pandemia e correlatas)</h3><p class="hint">Meu entendimento (Voto 1830/2025): a suspensão de prazos na OAB/MG limitou-se a 16/03/2020 a 03/04/2020 (Portaria Conjunta 001/2020 + Portarias 83 e 85/2020), e a Lei 14.010/2020 não alcança o processo disciplinar. As demais estão catalogadas para conferência e simulação.</p>'+
   (window.TED_SUSP||[]).map(function(s){ return '<div class="callout '+(s.status==='oficial'?'ok':(s.status==='controv'?'bad':'warn'))+'"><b>'+esc(s.nome)+'</b> '+tagOf(s)+'<br>'+esc(T.isoToBR(s.ini))+' a '+esc(T.isoToBR(s.fim))+' — '+esc(s.desc)+'</div>'; }).join('')+'</div>'+
   '<div class="panel" style="margin-top:16px"><h3>Como o sistema conta a prescrição</h3><ol style="margin:0;padding-left:18px"><li>Parte da <b>constatação oficial do fato</b> (art. 43, caput).</li><li>Cada marco do §2º <b>reinicia</b> o prazo de 5 anos; marco posterior a prescrição já consumada não a revive.</li><li>A pretensão vence no mesmo dia/mês, 5 anos depois; considera-se prescrita a partir do dia seguinte.</li><li>As suspensões marcadas <b>prorrogam</b> o termo final em tantos dias quantos incidirem dentro do prazo em curso (períodos sobrepostos contam uma vez).</li><li>A prescrição intercorrente verifica lacunas superiores a 3 anos entre os atos informados (e até a data de referência).</li><li>Se o processo for <b>anulado</b> e voltar a fase anterior, refaça a contagem: o ementário do CFOAB mostra vários casos em que a anulação leva à prescrição declarada de ofício.</li></ol></div>';
}

/* ---------- casca ---------- */
T.registerTab({ id:'calculadora', label:'Calculadora', icon:'calc', render:function(root){
  if(T.calcPreset){ applyPreset(T.calcPreset); T.calcPreset=null; S.tab='presc'; }
  root.innerHTML='<section class="hero amber"><h2>Calculadora de prescrição e prazos</h2><p>Prescrição da pretensão punitiva e intercorrente (EAOAB, art. 43), já configurada com as suspensões da pandemia da OAB/MG e a posição do Conselho Federal sobre a Lei 14.010/2020. Compara três cenários e diz o que suspendeu o prazo.</p></section>'+
   '<div class="subtabs seg" id="st">'+[['presc','Prescrição (art. 43)'],['prazos','Prazos em dias úteis'],['civil','Prescrição/decadência civil'],['ref','Tabela de referência']].map(function(t){ return '<button data-t="'+t[0]+'"'+(S.tab===t[0]?' class="on"':'')+'>'+t[1]+'</button>'; }).join('')+'</div><div id="cv"></div>';
  function paint(){ T.$$('#st button',root).forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-t')===S.tab); }); var h=T.$('#cv',root); ({presc:viewPresc,prazos:viewPrazos,civil:viewCivil,ref:viewRef})[S.tab](h); }
  T.$$('#st button',root).forEach(function(b){ b.addEventListener('click',function(){ S.tab=b.getAttribute('data-t'); paint(); }); });
  paint();
}});
T.calc={ fimPrazo:fimPrazo, calcPresc:calcPresc, S:S, applyPreset:applyPreset };
})();
