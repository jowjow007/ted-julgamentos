/* Papeleta de julgamento — mesmo layout das papeletas do escritório (Ademar/Gisele): cabeçalho bordô/dourado, grade de campos,
   colegiado, partes, síntese, análise, votação com caixas de marcação. */
(function(){
"use strict"; var T=window.TED, esc=T.esc;

var CSS = [
".pap{--paper:#fff;--ink:#100d0a;--muted:#453c31;--faint:#6f6252;--rule:#d8cdb8;--rule-strong:#b7a888;--bordo:#7A2B25;--bordo-soft:#F1E1DD;--gold:#8f6a12;--gold-soft:#F5E9CF;--parchment:#FBF9F4;--serif:'Spectral',Georgia,serif;--display:'Fraunces','Spectral',Georgia,serif;--sans:'Archivo','Segoe UI',Arial,sans-serif;--mono:'IBM Plex Mono',Consolas,monospace;font-family:var(--serif);color:var(--ink);font-size:12.6px;line-height:1.4}",
".pap *{box-sizing:border-box}",
".pap .sheet{background:var(--paper);border:1.5px solid var(--ink);position:relative;box-shadow:0 1px 2px rgba(0,0,0,.08),0 10px 30px rgba(0,0,0,.14);margin:0 auto;max-width:900px}",
".pap .head{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:start;padding:12px 20px 9px;border-bottom:2.5px solid var(--bordo);background:linear-gradient(180deg,var(--parchment),transparent)}",
".pap .head h1{font-family:var(--display);font-size:21px;font-weight:700;margin:0 0 3px;letter-spacing:.01em}",
".pap .head .sub{font-family:var(--sans);font-size:10.6px;color:var(--muted);line-height:1.5;max-width:58ch}",
".pap .badge{width:56px;height:56px;border-radius:10px;background:#fff;border:1px solid var(--rule-strong);display:flex;align-items:center;justify-content:center;overflow:hidden;font-family:var(--display);font-weight:700;font-size:15px;color:var(--bordo);flex:none;box-shadow:0 1px 3px rgba(0,0,0,.12)}",
".pap .badge img{width:100%;height:100%;object-fit:contain;padding:4px}",
".pap .stamp{font-family:var(--mono);font-size:10px;color:var(--faint);text-align:right;line-height:1.55}",
".pap .stamp .aud{font-family:var(--sans);background:var(--bordo);color:#fff;padding:3px 8px;border-radius:4px;display:inline-block;margin-top:3px;font-size:10.2px;font-weight:700;letter-spacing:.02em;white-space:nowrap}",
".pap .cliente{display:flex;align-items:center;gap:8px;padding:6px 14px;background:var(--gold-soft);border-bottom:1px solid var(--rule-strong);font-family:var(--sans);font-size:10.6px}",
".pap .cliente b{color:var(--bordo);text-transform:uppercase;font-size:9px;letter-spacing:.06em}",
".pap .fields{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--rule)}",
".pap .f{padding:5px 14px;border-right:1px solid var(--rule);border-bottom:1px solid var(--rule)}",
".pap .f:nth-child(3n){border-right:none}",
".pap .f .k{display:block;font-family:var(--sans);font-size:8.6px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--bordo);margin-bottom:2px}",
".pap .f .v{font-size:12px;line-height:1.34}",
".pap .f .v.mono{font-family:var(--mono);font-size:11.4px}",
".pap .f.wide{grid-column:span 3}.pap .f.w2{grid-column:span 2}",
".pap .sec{font-family:var(--sans);font-size:9.4px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#fff;background:var(--bordo);padding:3px 14px;margin:0}",
".pap .sec.alt{background:var(--gold)}",
".pap .panel{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--rule)}",
".pap .panel .p{padding:6px 14px;border-right:1px solid var(--rule);text-align:center}.pap .panel .p:last-child{border-right:none}",
".pap .panel .role{font-family:var(--sans);font-size:8.2px;text-transform:uppercase;letter-spacing:.09em;color:var(--gold);font-weight:700}",
".pap .panel .name{font-family:var(--display);font-size:13px;font-weight:600;margin-top:2px}",
".pap table.partes{width:100%;border-collapse:collapse;font-size:11px}",
".pap table.partes th{font-family:var(--sans);font-size:8px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);text-align:left;padding:3px 10px;border-bottom:1px solid var(--rule-strong);background:var(--parchment)}",
".pap table.partes td{padding:4px 10px;border-bottom:1px solid var(--rule);vertical-align:top;line-height:1.3;font-size:10.8px}",
".pap table.partes tr:last-child td{border-bottom:none}",
".pap table.partes .polo{font-family:var(--sans);font-weight:700;font-size:9.4px;text-transform:uppercase;color:var(--bordo);white-space:nowrap}",
".pap .box{padding:6px 14px;border-bottom:1px solid var(--rule)}",
".pap .box ul{margin:0;padding-left:16px}.pap .box li{margin-bottom:2px;line-height:1.34;font-size:10.8px}.pap .box li b{color:var(--bordo)}",
".pap .box .lead{font-family:var(--display);font-style:italic;font-weight:600;font-size:12px;margin:0 0 5px;padding:5px 10px;background:var(--gold-soft);border-left:3px solid var(--gold);line-height:1.38}",
".pap .refs{font-family:var(--mono);font-size:9.8px;color:var(--muted);line-height:1.55;margin-top:4px}",
".pap .refs b{font-family:var(--sans);font-weight:700;color:var(--ink);font-size:8.6px;text-transform:uppercase;letter-spacing:.06em}",
".pap .alerta{margin:5px 14px;padding:6px 11px;background:#fdeee9;border-left:3px solid var(--bordo);font-family:var(--sans);font-size:10.3px;color:var(--bordo);line-height:1.5}",
".pap .alerta.ok{background:#e9f6ec;border-left-color:#1f7a45;color:#1f5a37}",
".pap table.an{width:100%;border-collapse:collapse;font-size:10.8px}",
".pap table.an td{padding:4px 10px;border-bottom:1px dotted var(--rule);vertical-align:top;line-height:1.36}",
".pap table.an td.k{font-family:var(--sans);font-weight:700;font-size:9.2px;text-transform:uppercase;letter-spacing:.05em;color:var(--bordo);white-space:nowrap;width:19%}",
".pap table.an td.s{width:15%;font-family:var(--sans);font-weight:700;font-size:9.6px;white-space:nowrap}",
".pap .st-ok{color:#1f7a45}.pap .st-bad{color:#a3162d}.pap .st-warn{color:#8a5a00}.pap .st-na{color:var(--faint)}",
".pap table.linha{width:100%;border-collapse:collapse;font-size:10.6px}",
".pap table.linha td{padding:3px 14px;border-bottom:1px dotted var(--rule);line-height:1.36;vertical-align:top}",
".pap table.linha td.data{font-family:var(--mono);font-size:10.2px;white-space:nowrap;color:var(--bordo);font-weight:600;width:17%}",
".pap table.linha tr.mk td{background:var(--gold-soft)}",
".pap .voto{padding:6px 14px 8px}",
".pap .vrow{display:grid;grid-template-columns:1.5fr 2.5fr;gap:10px;align-items:center;padding:4px 0;border-bottom:1px dashed var(--rule)}",
".pap .vrow:last-of-type{border-bottom:none}",
".pap .vrow .who{font-size:11px}.pap .vrow .who b{font-family:var(--sans);font-size:10px}",
".pap .vrow .who span{display:block;font-family:var(--sans);font-size:8.3px;color:var(--gold);text-transform:uppercase;letter-spacing:.06em;font-weight:700}",
".pap .opts{font-family:var(--sans);font-size:9.8px;display:flex;gap:11px;flex-wrap:wrap}",
".pap .chk{display:inline-flex;align-items:center;gap:4px}",
".pap .box-sq{width:10px;height:10px;border:1.3px solid var(--ink);display:inline-block;flex:none}",
".pap .box-sq.on{background:var(--bordo);border-color:var(--bordo);box-shadow:inset 0 0 0 1.5px #fff}",
".pap .resline{display:flex;gap:20px;align-items:center;margin-top:6px;padding-top:6px;border-top:1.5px solid var(--ink);font-family:var(--sans);font-size:10px;flex-wrap:wrap}",
".pap .resline b{text-transform:uppercase;letter-spacing:.06em;font-size:8.6px;color:var(--bordo)}",
".pap .obsline{flex:1 1 200px;border-bottom:1px solid var(--ink);min-width:150px;height:12px}",
".pap .foot{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:5px 14px;font-family:var(--sans);font-size:8.6px;color:var(--faint);border-top:1px solid var(--rule)}",
".pap .foot .firm{font-family:var(--display);font-style:italic;color:var(--muted);font-size:10.4px}",
".pap .pend{padding:10px 14px;font-family:var(--sans);font-size:11px;color:var(--bordo);background:#fdeee9}",
/* isolamento: classes homônimas do app (.sec, .panel, .chk, .who, .stamp) não vazam para a papeleta */
".pap .sec{border:0;border-radius:0;box-shadow:none;margin:0;padding:3px 14px;display:block}",
".pap .panel{background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;margin:0;display:grid}",
".pap .chk{background:none;border:0;border-radius:0;padding:0;display:inline-flex}",
".pap .who{display:block;flex:none;gap:0;align-items:initial}",
".pap h1{letter-spacing:.01em}",
".pap .box{background:transparent}",
".pap table{background:transparent}"
].join('\n');
var FONTS='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,600&family=Archivo:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">';

function br(iso){ return T.isoToBR(iso); }
var STATUS_TXT={ ok:'✔ ', bad:'✖ ', warn:'⚠ ', na:'— ' };
function stCell(o){ if(!o) return '<td class="s st-na">Não apurado</td>'; return '<td class="s st-'+(o.k||'na')+'">'+STATUS_TXT[o.k||'na']+esc(o.rotulo||'')+'</td>'; }

function logoURL(){ try{ return new URL('assets/logo-light.png', location.href).href; }catch(e){ return ''; } }

function veredictoRotulo(p){
  var m={punivel:'Punível',nao_punivel:'Não punível',prescrito:'Prescrição — extinção da punibilidade',nulo:'Nulidade a reconhecer',tac:'Cabível TAC / suspensão condicional',pendente:'A definir'}; return m[p.veredito]||'A definir';
}

/* html interno da papeleta (sem <html>) */
function build(p,rel,opts){
  opts=opts||{}; var nota=opts.nota||{}; var vog=(window.TED_MEU||{}); var meRel=(p.relatorId==='jonathan');
  var colegiado='<div class="panel"><div class="p"><div class="role">Relator</div><div class="name">'+esc(rel?(rel.tr+' '+rel.nome):(p.relatorNome||'—'))+'</div></div>'+
    '<div class="p"><div class="role">Vogal</div><div class="name"'+(meRel?' style="color:var(--faint)">—':'>Dr. '+esc(vog.nome||'—'))+'</div></div>'+
    '<div class="p"><div class="role">Vogal</div><div class="name" style="color:var(--faint)">—</div></div></div>';
  var partes='<table class="partes"><tr><th style="width:15%">Polo</th><th style="width:38%">Parte</th><th>Advogado(s) / OAB</th></tr>';
  (p.representantes||[]).forEach(function(r){ partes+='<tr><td class="polo">Representante</td><td>'+esc(r.nome||'—')+(r.obs?'<br><span style="font-size:9px;color:var(--muted)">'+esc(r.obs)+'</span>':'')+'</td><td>'+esc(r.adv||'—')+'</td></tr>'; });
  (p.representados||[]).forEach(function(r){ partes+='<tr><td class="polo">Representado</td><td>'+esc(r.nome||'—')+(r.oab?' — '+esc(r.oab):'')+'</td><td>'+esc(r.adv||'—')+'</td></tr>'; });
  partes+='</table>';
  var head='<div class="head"><div><h1>Papeleta de Julgamento</h1><div class="sub">Ficha de consulta rápida elaborada por Fonseca e Braga Sociedade de Advogados como subsídio ao Relator e ao Vogal — processo sigiloso (EAOAB, art. 72, §2º); não é peça oficial dos autos.</div></div>'+
    '<div style="display:flex;gap:10px;align-items:flex-start"><div class="stamp">'+(p.sessao?'Sessão de julgamento<br><b style="color:var(--bordo);font-size:12px">'+esc(p.sessao)+'</b><br>':'')+'<span class="aud">'+esc(vog.turma||'TED — OAB/MG')+'</span></div>'+
    '<div class="badge"><img src="'+logoURL()+'" alt="F&amp;B" onerror="this.replaceWith(document.createTextNode(\'FB\'))"></div></div></div>';
  var d=p.datas||{};
  var fields='<div class="fields">'+
    '<div class="f"><span class="k">Órgão Julgador</span><span class="v">'+esc(vog.turma||'TED — OAB/MG')+'</span></div>'+
    '<div class="f"><span class="k">Processo Disciplinar nº</span><span class="v mono">'+esc(p.pd||p.id)+'</span></div>'+
    '<div class="f"><span class="k">Subseção / origem</span><span class="v">'+esc(p.subsecao||'—')+(p.origemNum?' <span style="color:var(--muted)">(rep. '+esc(p.origemNum)+')</span>':'')+'</span></div>'+
    '<div class="f"><span class="k">Fatos / constatação oficial</span><span class="v">'+esc(br(d.fato))+' <span style="color:var(--muted)">· protocolo '+esc(br(d.protocolo))+'</span></span></div>'+
    '<div class="f"><span class="k">Autuação OAB / TED</span><span class="v">'+esc(br(d.autuacaoOAB))+' <span style="color:var(--muted)">/ '+esc(br(d.autuacaoTED))+'</span></span></div>'+
    '<div class="f"><span class="k">Situação</span><span class="v">'+esc(veredictoRotulo(p))+'</span></div>'+
    '<div class="f w2"><span class="k">Infração (síntese)</span><span class="v"><b>'+esc(p.infracao||'—')+'</b></span></div>'+
    '<div class="f"><span class="k">Sanção proposta</span><span class="v"><b style="color:var(--bordo)">'+esc(p.sancao||'—')+'</b></span></div>'+
    '<div class="f wide"><span class="k">Artigo(s) invocado(s)</span><span class="v mono">'+esc((p.artigos||[]).join(' · ')||'—')+'</span></div>'+
    '</div>';
  var out='<section class="sheet">'+head+fields+'<p class="sec">Composição do Colegiado</p>'+colegiado+'<p class="sec">Partes e Advogados</p>'+partes;

  if(p.status==='pendente'){
    out+='<div class="pend"><b>Autos ainda não lidos.</b> '+esc(p.motivoPendencia||'Os autos deste processo ainda não foram analisados — papeleta em branco para preenchimento manual.')+'</div>';
  } else {
    out+='<p class="sec">Síntese do Caso</p><div class="box">'+(p.lead?'<p class="lead">“'+esc(p.lead)+'”</p>':'')+'<ul>'+(p.pontos||[]).map(function(x){ return '<li>'+esc(x).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')+'</li>'; }).join('')+'</ul></div>';
    var an='<table class="an">'; var pa=p.analise||{};
    [['prescricao','Prescrição'],['intercorrente','Intercorrente'],['citacao','Notificação / citação'],['defesa','Defesa e instrução'],['razoes','Razões finais'],['parecer','Parecer preliminar']].forEach(function(k){
      var o=pa[k[0]]; if(!o) return; an+='<tr><td class="k">'+k[1]+'</td>'+stCell(o)+'<td>'+esc(o.txt||'')+'</td></tr>'; });
    an+='</table>';
    out+='<p class="sec alt">Análise Técnica</p>'+an;
    if((p.teses||[]).length){
      out+='<p class="sec">Teses apuradas</p><div class="box"><ul>'+p.teses.map(function(t){ return '<li><b>'+esc(t.parte||'')+':</b> '+esc(t.tese)+' — <i>'+esc(t.analise||'')+'</i>'+(t.resultado?' <b>['+esc(t.resultado)+']</b>':'')+'</li>'; }).join('')+'</ul></div>';
    }
    if((p.cronologia||[]).length){
      out+='<p class="sec">Cronologia</p><table class="linha">'+p.cronologia.map(function(c){ return '<tr'+(c.marco?' class="mk"':'')+'><td class="data">'+esc(br(c.data))+'</td><td>'+esc(c.evento)+(c.fls?' <span style="color:var(--faint)">(fls. '+esc(c.fls)+')</span>':'')+'</td></tr>'; }).join('')+'</table>';
    }
    out+='<p class="sec">Enquadramento e Proposta de Voto</p><div class="box"><ul>'+
      '<li><b>Conclusão:</b> '+esc(veredictoRotulo(p))+' — <b>'+esc(p.sancao||'—')+'</b>.</li>'+
      (p.dosimetria?'<li><b>Dosimetria:</b> '+esc(p.dosimetria)+'</li>':'')+
      (p.votoSugerido?'<li><b>Voto sugerido:</b> '+esc(p.votoSugerido)+'</li>':'')+
      '</ul><div class="refs"><b>Fundamentos</b> '+esc((p.fundamentos||[]).join(' · ')||'—')+(p.precedentes&&p.precedentes.length?'<br><b>Precedentes/ementário</b> '+esc(p.precedentes.join(' · ')):'')+'</div></div>';
    (p.alertas||[]).forEach(function(a){ out+='<div class="alerta'+(/^✓/.test(a)?' ok':'')+'">'+esc(a)+'</div>'; });
  }
  if(nota.obs) out+='<p class="sec">Minhas anotações</p><div class="box"><p style="margin:0;white-space:pre-line;font-size:11px">'+esc(nota.obs)+'</p></div>';
  var relN=rel?(rel.tr+' '+rel.nome):'Relator', vd=nota.votoVogal||'';
  function cb(on){ return '<i class="box-sq'+(on?' on':'')+'"></i>'; }
  out+='<p class="sec">Votação</p><div class="voto">'+
   '<div class="vrow"><div class="who"><span>Relator</span><b>'+esc(relN)+'</b></div><div class="opts"><span class="chk">'+cb()+' Procedente</span><span class="chk">'+cb()+' Improcedente</span><span class="chk">'+cb()+' Prescrição</span><span class="chk">'+cb()+' Nulidade</span><span class="chk">'+cb()+' TAC</span></div></div>'+
   '<div class="vrow"><div class="who"><span>Vogal</span><b>Dr. '+esc(vog.nome||'')+'</b></div><div class="opts"><span class="chk">'+cb(vd==='acompanha')+' Acompanhou o relator</span><span class="chk">'+cb(vd==='diverge')+' Divergiu</span><span class="chk">'+cb(vd==='vista')+' Pediu vista</span></div></div>'+
   '<div class="vrow"><div class="who"><span>Vogal</span><b>—</b></div><div class="opts"><span class="chk">'+cb()+' Acompanhou o relator</span><span class="chk">'+cb()+' Divergiu</span></div></div>'+
   '<div class="resline"><span><b>Resultado</b></span><span class="chk">'+cb()+' Unânime</span><span class="chk">'+cb()+' Por maioria</span><span><b>Sanção aplicada</b></span><span class="obsline"></span></div></div>';
  out+='<div class="foot"><span>Fonseca e Braga Sociedade de Advogados — ficha de apoio à sessão, sigilosa e sem caráter oficial</span><span class="firm">P.D. '+esc(p.pd||p.id)+' · TED-OAB/MG</span></div></section>';
  return out;
}

function fullHTML(p,rel,opts){
  return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Papeleta — P.D. '+esc(p.pd||p.id)+'</title>'+FONTS+
   '<style>body{margin:0;background:#e9e4d8}.wrap{max-width:940px;margin:0 auto;padding:22px 16px 40px}@media print{@page{size:A4;margin:9mm}body{background:#fff}.wrap{padding:0;max-width:none}.pap .sheet{box-shadow:none}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}'+CSS+'</style></head><body><div class="wrap"><div class="pap">'+build(p,rel,opts)+'</div></div></body></html>';
}
function printWin(p,rel,opts){
  var w=window.open('','_blank'); if(!w){ T.toast('Permita pop-ups para imprimir a papeleta.'); return; }
  w.document.open(); w.document.write(fullHTML(p,rel,opts).replace('</body>','<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},700)})<\/script></body>')); w.document.close();
}
function downloadHTML(p,rel,opts){
  var b=new Blob([fullHTML(p,rel,opts)],{type:'text/html'}); var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='Papeleta_PD_'+String(p.pd||p.id).replace(/[^\d]/g,'-')+'.html'; document.body.appendChild(a); a.click(); a.remove();
}

T.papeleta={
  open:function(p,rel,opts){
    var v=T.openModal('<div class="mh"><div><b style="font-family:var(--display);font-size:18px">Papeleta — P.D. '+esc(p.pd||p.id)+'</b><div style="font-size:12.5px;color:var(--muted)">Pré-visualização. Use “Imprimir / PDF” e escolha “Salvar como PDF”.</div></div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" id="pp">'+T.icon('print')+' Imprimir / PDF</button><button class="btn ghost sm" id="pd">'+T.icon('file')+' Baixar HTML</button><button class="btn ghost sm" data-close>'+T.icon('x')+' Fechar</button></div></div>'+
      '<div class="mb" style="background:#e9e4d8"><style>'+CSS+'</style><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,600&family=Archivo:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"><div class="pap">'+build(p,rel,opts)+'</div></div>');
    T.$('#pp',v).addEventListener('click',function(){ printWin(p,rel,opts); });
    T.$('#pd',v).addEventListener('click',function(){ downloadHTML(p,rel,opts); });
  },
  build:build, fullHTML:fullHTML, print:printWin
};
})();
