/* Módulo de Relatoria — deliberação humana do Relator e voto final.
   Rota: #/relatoria/{processId}
   Coleção Firestore: tedRelatoria/{processId}
   Dados de processo ficam em tedMeus. Dados de deliberação/voto ficam em tedRelatoria.
   NUNCA misturar decisão humana com sugestão da IA (p.veredito = sugestão da IA). */
(function(){
"use strict"; var T=window.TED, esc=T.esc, icon=T.icon;

/* Cores bordô/vinho exclusivas deste módulo — não alteram a paleta global */
var B1='#6b1a2a', B2='#9e2040';

/* ---------- helpers de render ---------- */
function mdx(s){ return esc(s==null?'':s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>'); }
function ulx(a){ return '<ul>'+(a||[]).map(function(x){ return '<li>'+mdx(x)+'</li>'; }).join('')+'</ul>'; }
function kvx(rows){ return '<div style="display:grid;gap:8px">'+rows.map(function(r){ return '<div style="border-left:3px solid var(--line);padding:2px 0 2px 10px"><b>'+mdx(r[0])+'</b><div style="color:var(--muted)">'+mdx(r[1])+'</div></div>'; }).join('')+'</div>'; }
function chkR(o,t){ if(!o) return '<div class="chk"><b>'+esc(t)+'</b><p style="color:var(--faint)">Não apurado.</p></div>'; var ic=o.k==='ok'?'check':(o.k==='bad'?'x':(o.k==='warn'?'alert':'clock')); return '<div class="chk '+(o.k||'')+'"><b>'+icon(ic)+' '+esc(t)+' — '+esc(o.rotulo||'')+'</b><p>'+esc(o.txt||'')+'</p></div>'; }
function sec(titulo,corpo){ return '<div class="sec"><h4>'+titulo+'</h4>'+corpo+'</div>'; }
function det(titulo,corpo){ return '<details class="rel-details"><summary>'+titulo+'</summary><div style="padding:12px 0">'+corpo+'</div></details>'; }

/* ---------- objetos vazios ---------- */
function emptyDelib(){
  return {status:'rascunho',parecer:{posicionamento:'',observacao:''},resultado:'',artigosReconhecidos:[],artigosAfastados:[],preliminares:[],sancao:{tipo:'',prazoDias:null,art37Par2:false,multaAnuidades:null},encaminhamentos:{exclusaoArt38I:false,diligencia:false,tac:false},respostasPendencias:{},observacoesRelator:'',atualizadoEm:null};
}
function emptyVoto(){
  return {status:'nao_gerado',ementa:'',relatorio:'',preliminares:'',prescricao:'',merito:'',dosimetria:'',dispositivo:'',textoIntegral:'',geradoEm:null,revisadoEm:null,versao:0};
}

/* ============================================================
   BLOCO A — Autos e Análise (somente leitura)
   ============================================================ */
function blockAutos(p){
  var an=p.analise||{}, d=p.detalhe||{};
  var h='';

  if(p.lead) h+=sec(icon('spark')+' Em uma frase','<p style="margin:0;font-family:var(--display);font-size:18px;line-height:1.35">'+esc(p.lead)+'</p>');

  var parteH='';
  (p.representantes||[]).forEach(function(r){ if(r.nome) parteH+='<div class="rel-row"><span class="rel-label">Representante</span><div>'+esc(r.nome)+'</div></div>'; });
  (p.representados||[]).forEach(function(r){ if(r.nome) parteH+='<div class="rel-row"><span class="rel-label">Representado</span><div><b>'+esc(r.nome)+'</b>'+(r.oab?' <span style="font-family:var(--mono);font-size:12px;color:var(--muted)">'+esc(r.oab)+'</span>':'')+'</div></div>'; });
  if(p.subsecao) parteH+='<div class="rel-row"><span class="rel-label">Subseção</span><div>'+esc(p.subsecao)+'</div></div>';
  if(p.infracao) parteH+='<div class="rel-row"><span class="rel-label">Infração</span><div><b>'+esc(p.infracao)+'</b></div></div>';
  if((p.artigos||[]).length) parteH+='<div class="rel-row"><span class="rel-label">Artigos</span><div>'+p.artigos.map(function(a){return '<span class="art">'+esc(a)+'</span>';}).join('')+'</div></div>';
  if(parteH) h+='<div class="sec">'+parteH+'</div>';

  (p.alertas||[]).forEach(function(a){ h+='<div class="callout '+(/^✓/.test(a)?'ok':'warn')+'">'+esc(a)+'</div>'; });

  h+=det(icon('scale')+' Roteiro de análise técnica',
    '<div class="checkgrid">'+chkR(an.prescricao,'Prescrição')+chkR(an.intercorrente,'Intercorrente')+chkR(an.citacao,'Notificação/citação')+chkR(an.defesa,'Defesa e instrução')+chkR(an.parecer,'Parecer preliminar')+chkR(an.razoes,'Razões finais')+'</div>');

  if((d.sintese||[]).length) h+=det(icon('spark')+' Síntese dos fatos',d.sintese.map(function(x){return '<p style="margin:0 0 8px">'+mdx(x)+'</p>';}).join(''));
  if((d.instrucao||[]).length) h+=det('Instrução e prova',kvx(d.instrucao.map(function(r){return[r.fonte,r.mostra];})));
  if((d.teseRep||[]).length||(d.teseDef||[]).length){
    var tp=((d.teseRep||[]).length?'<p style="margin:0 0 6px"><b>Representação</b></p>'+kvx(d.teseRep.map(function(r){return[r.peca,r.teses];})):'')+
           ((d.teseDef||[]).length?'<p style="margin:10px 0 6px"><b>Defesa</b></p>'+kvx(d.teseDef.map(function(r){return[r.peca,r.teses];})):'');
    h+=det('Teses das partes',tp);
  }
  if((d.parecerPontos||[]).length||(d.parecerCritica||[]).length){
    var pp=((d.parecerPontos||[]).length?'<p style="margin:0 0 4px"><b>O que diz o parecer</b></p>'+ulx(d.parecerPontos):'')+
           ((d.parecerCritica||[]).length?'<p style="margin:10px 0 4px"><b>Leitura crítica (não acatar por default)</b></p>'+ulx(d.parecerCritica.map(function(c){return '**'+c.t+'.** '+c.txt;})):'')+
           ((d.parecerAcertos||[]).length?'<p style="margin:10px 0 4px"><b>Onde o parecer acerta</b></p>'+ulx(d.parecerAcertos):'');
    h+=det('Parecer preliminar — leitura crítica',pp);
  }
  if((d.tesesAv||[]).length){
    h+=det('Teses em confronto e sua força',d.tesesAv.map(function(t){
      return '<div style="margin:0 0 10px"><b>'+mdx(t.t)+'</b>'+(t.f?' <span class="chip info">'+esc(t.f)+'</span>':'')+(t.base?'<div><i>Base:</i> '+mdx(t.base)+'</div>':'')+(t.prova?'<div><i>Prova:</i> '+mdx(t.prova)+'</div>':'')+(t.cuidado?'<div style="color:var(--bad-ink)"><i>Cuidado:</i> '+mdx(t.cuidado)+'</div>':'')+'</div>';
    }).join(''));
  }
  if(d.firmeza&&((d.firmeza.firme||[]).length||(d.firmeza.cuidar||[]).length)){
    h+=det('Onde ser firme — e onde cuidar',
      ((d.firmeza.firme||[]).length?'<p style="margin:0 0 4px"><b>Firmeza</b></p>'+ulx(d.firmeza.firme):'')+
      ((d.firmeza.cuidar||[]).length?'<p style="margin:10px 0 4px"><b>Cuidado</b></p>'+ulx(d.firmeza.cuidar):''));
  }
  if((d.vulnerab||[]).length) h+=det('Vulnerabilidades',ulx(d.vulnerab));
  if((p.cronologia||[]).length) h+=det(icon('cal')+' Cronologia',
    '<div class="tl">'+p.cronologia.map(function(c){return '<div class="ev'+(c.marco?' mark':'')+'"><b>'+esc(T.isoToBR(c.data))+'</b>'+esc(c.evento)+(c.fls?' <span style="color:var(--faint)">(fls. '+esc(c.fls)+')</span>':'')+'</div>';}).join('')+'</div>');
  if((p.documentos||[]).length) h+=det('Documentos e provas examinados',ulx(p.documentos));
  if((p.precedentes||[]).length) h+=det('Ementário e súmulas do CFOAB',p.precedentes.map(function(r){return '<span class="chip info" style="margin:0 4px 6px 0">'+esc(r)+'</span>';}).join(''));

  return '<div class="rel-block rel-block-autos">'+
    '<div class="rel-block-hd rel-toggle-hd" id="rl-toggle-a">'+icon('file')+' <b>I — Autos e análise</b> <span style="font-size:12px;color:var(--muted)">(somente leitura)</span><span class="rel-toggle-ic">▸</span></div>'+
    '<div class="rel-block-body" id="rl-body-a" style="display:none">'+h+'</div></div>';
}

/* ============================================================
   BLOCO B — Questões para o Relator (pendenciasRelator[])
   ============================================================ */
function blockPendencias(p, delib){
  var pends=p.pendenciasRelator||[];
  var resp=(delib&&delib.respostasPendencias)||{};

  if(!pends.length) return '<div class="rel-block rel-block-pend">'+
    '<div class="rel-block-hd rel-hd-pend">'+icon('brain')+' <b>II — Questões para o Relator</b></div>'+
    '<div class="rel-block-body"><p style="color:var(--muted);margin:0 0 4px">Nenhuma questão específica para este processo.</p></div></div>';

  var grupos={}, order=[];
  pends.forEach(function(q){ if(!grupos[q.grupo]){grupos[q.grupo]=[];order.push(q.grupo);} grupos[q.grupo].push(q); });

  var h='';
  order.forEach(function(grp){
    h+='<div style="margin-bottom:18px"><h5 style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--faint);margin:0 0 10px">'+esc(grp)+'</h5>';
    grupos[grp].forEach(function(q){
      var val=resp[q.id];
      h+='<div class="rel-quest"><label style="display:block;font-weight:700;margin-bottom:6px">'+esc(q.pergunta)+(q.obrigatoria?' <span style="color:var(--bad-ink)">*</span>':'')+'</label>';
      if(q.explicacao) h+='<p style="margin:0 0 8px;font-size:13px;color:var(--muted)">'+esc(q.explicacao)+'</p>';
      if(q.tipo==='radio'){
        h+=(q.opcoes||[]).map(function(o){ return '<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer"><input type="radio" name="pr-'+esc(q.id)+'" value="'+esc(o.valor)+'"'+((Array.isArray(val)?val[0]:val)===o.valor?' checked':'')+' data-qid="'+esc(q.id)+'" class="rel-pq"> <span>'+esc(o.rotulo)+'</span></label>'; }).join('');
      } else if(q.tipo==='checkbox'){
        var vals=Array.isArray(val)?val:[];
        h+=(q.opcoes||[]).map(function(o){ return '<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer"><input type="checkbox" value="'+esc(o.valor)+'"'+(vals.indexOf(o.valor)>-1?' checked':'')+' data-qid="'+esc(q.id)+'" class="rel-pq"> <span>'+esc(o.rotulo)+'</span></label>'; }).join('');
      } else if(q.tipo==='numero'){
        h+='<input type="number" class="input rel-pq" data-qid="'+esc(q.id)+'" value="'+esc(val!=null?val:'')+'"> ';
      } else if(q.tipo==='texto'){
        h+='<input type="text" class="input rel-pq" data-qid="'+esc(q.id)+'" value="'+esc(val||'')+'"> ';
      } else {
        h+='<textarea class="input rel-pq" data-qid="'+esc(q.id)+'">'+esc(val||'')+'</textarea>';
      }
      h+='</div>';
    });
    h+='</div>';
  });

  return '<div class="rel-block rel-block-pend">'+
    '<div class="rel-block-hd rel-hd-pend">'+icon('brain')+' <b>II — Questões para o Relator</b> <span class="chip warn" style="margin-left:8px">'+pends.length+(pends.length===1?' questão':' questões')+'</span></div>'+
    '<div class="rel-block-body"><p style="font-size:13px;color:var(--muted);margin:0 0 14px">As respostas são salvas junto com a deliberação ao clicar em "Salvar rascunho" ou "Definir deliberação".</p>'+h+'</div></div>';
}

/* ============================================================
   BLOCO C — Deliberação do Relator
   ============================================================ */
function blockDeliberacao(p, delib){
  var d=delib||emptyDelib();
  var san=d.sancao||{tipo:'',prazoDias:null,art37Par2:false,multaAnuidades:null};
  var enc=d.encaminhamentos||{};
  var par=d.parecer||{};

  var PARECERES=[['','— não definido —'],['acompanha','Acompanho o parecer'],['acompanha_parcialmente','Acompanho parcialmente'],['diverge','Divirjo do parecer']];
  var RESULTADOS=[['','— não definido —'],['procedente','Procedente'],['improcedente','Improcedente'],['parcialmente_procedente','Parcialmente procedente'],['prescrito','Prescrito'],['nulo','Nulidade'],['diligencia','Converter em diligência'],['tac','TAC']];
  var SANCOES=[['','— não definido —'],['nenhuma','Nenhuma'],['advertencia','Advertência'],['censura','Censura'],['suspensao','Suspensão'],['exclusao','Exclusão']];

  function artChecks(nome, vals){
    var h='<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px">';
    (p.artigos||[]).forEach(function(a){ h+='<label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" class="art-cb" data-name="'+esc(nome)+'" value="'+esc(a)+'"'+(vals.indexOf(a)>-1?' checked':'')+' style="accent-color:'+B1+'"> <span class="art">'+esc(a)+'</span></label>'; });
    h+='</div>';
    h+='<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><input type="text" class="input art-manual" data-name="'+esc(nome)+'" placeholder="Adicionar outro dispositivo…" style="max-width:300px"><button class="btn ghost sm" type="button" data-add-art="'+esc(nome)+'">Adicionar</button></div>';
    var extras=(vals||[]).filter(function(v){return (p.artigos||[]).indexOf(v)<0;});
    h+='<div id="art-extras-'+esc(nome)+'" style="display:flex;flex-wrap:wrap;gap:6px">'+extras.map(function(v){return '<span class="art art-extra" style="cursor:pointer" data-name="'+esc(nome)+'" data-val="'+esc(v)+'">'+esc(v)+' ✕</span>';}).join('')+'</div>';
    return h;
  }

  var defined=d.status==='definida';

  var h='<div style="display:grid;gap:16px">'+

  sec('Posicionamento sobre o parecer',
    '<label class="field"><span>Posicionamento</span><select class="select input" id="d-posicionamento">'+PARECERES.map(function(o){return '<option value="'+o[0]+'"'+(par.posicionamento===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select></label>'+
    '<label class="field"><span>Observação (opcional)</span><textarea class="input" id="d-parecer-obs" placeholder="Fundamente a divergência ou acompanhamento parcial…">'+esc(par.observacao||'')+'</textarea></label>')+

  sec('Resultado',
    '<label class="field"><span>Resultado</span><select class="select input" id="d-resultado">'+RESULTADOS.map(function(o){return '<option value="'+o[0]+'"'+(d.resultado===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select></label>')+

  sec('Artigos reconhecidos',artChecks('rec',d.artigosReconhecidos||[]))+

  sec('Artigos afastados',artChecks('af',d.artigosAfastados||[]))+

  sec('Sanção',
    '<label class="field"><span>Sanção</span><select class="select input" id="d-sancao-tipo">'+SANCOES.map(function(o){return '<option value="'+o[0]+'"'+(san.tipo===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select></label>'+
    '<div id="d-sancao-susp"'+(san.tipo==='suspensao'?'':' class="hidden"')+'>'+
      '<label class="field"><span>Prazo em dias</span><input type="number" class="input" id="d-sancao-prazo" min="0" max="365" value="'+esc(san.prazoDias!=null?san.prazoDias:'')+'"></label>'+
      '<label class="sw"><input type="checkbox" id="d-sancao-art37"'+(san.art37Par2?' checked':'')+' style="accent-color:'+B1+'"> <span><b>Aplicar art. 37, §2º</b><small>Acréscimo de 1/3 ao prazo de suspensão por reincidência</small></span></label>'+
    '</div>'+
    '<label class="field" style="margin-top:8px"><span>Multa — nº de anuidades (0 aceito, vazio = não se aplica)</span><input type="number" class="input" id="d-sancao-multa" min="0" max="20" value="'+esc(san.multaAnuidades!=null?san.multaAnuidades:'')+'"></label>')+

  sec('Encaminhamentos',
    '<label class="sw"><input type="checkbox" id="d-enc-excl"'+(enc.exclusaoArt38I?' checked':'')+' style="accent-color:'+B1+'"> <span><b>Verificar/encaminhar exclusão</b><small>Art. 38, I, EAOAB — encaminhar ao Conselho Seccional</small></span></label>'+
    '<label class="sw" style="margin-top:8px"><input type="checkbox" id="d-enc-dil"'+(enc.diligencia?' checked':'')+' style="accent-color:'+B1+'"> <span><b>Converter em diligência</b></span></label>'+
    '<label class="sw" style="margin-top:8px"><input type="checkbox" id="d-enc-tac"'+(enc.tac?' checked':'')+' style="accent-color:'+B1+'"> <span><b>TAC</b><small>Encaminhar ao Termo de Ajustamento de Conduta (Provimento 200/2020)</small></span></label>')+

  sec('Observações do Relator',
    '<label class="field"><span>Anotações livres (não fazem parte do voto)</span><textarea class="input" id="d-obs" style="min-height:100px">'+esc(d.observacoesRelator||'')+'</textarea></label>')+

  (defined?'<div class="callout ok" style="margin:0"><b>Deliberação definida.</b> Para alterar, salve novamente como rascunho. A exportação para o ChatGPT fica habilitada.</div>':'')+

  '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">'+
  '<button class="btn ghost" id="d-rascunho">'+icon('file')+' Salvar rascunho</button>'+
  '<button class="btn rel-btn-delib" id="d-definir">'+icon('check')+' Definir deliberação</button>'+
  '<span id="d-msg" style="font-size:12.5px;color:var(--muted)"></span>'+
  '</div>'+
  '</div>';

  return '<div class="rel-block rel-block-delib">'+
    '<div class="rel-block-hd rel-hd-delib">'+icon('gavel')+' <b>III — Deliberação do Relator</b>'+
      (defined?'<span class="chip rel-chip-definida" style="margin-left:auto">Definida</span>':'<span class="chip warn" style="margin-left:auto">Rascunho</span>')+
    '</div><div class="rel-block-body">'+h+'</div></div>';
}

/* ============================================================
   BLOCO D — Voto Final
   ============================================================ */
function blockVoto(votoFinal){
  var vf=votoFinal||null;
  var noVote=!vf||vf.status==='nao_gerado';

  var STATUS_MAP={gerado:'Gerado pela IA',revisado:'Revisado',aprovado:'Aprovado'};
  var ABAS=[['ementa','Ementa'],['relatorio','Relatório'],['preliminares','Preliminares'],['prescricao','Prescrição'],['merito','Mérito'],['dosimetria','Dosimetria'],['dispositivo','Dispositivo'],['textoIntegral','Texto integral']];

  var h;
  if(noVote){
    h='<div class="callout warn"><b>Voto ainda não importado.</b> Exporte a solicitação para o ChatGPT (seção abaixo), receba o JSON de volta e importe aqui.</div>'+
      '<button class="btn ghost" id="v-import-btn">'+icon('upload')+' Importar voto do ChatGPT</button>';
  } else {
    h='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px">'+
      '<span class="chip '+(vf.status==='aprovado'?'ok':(vf.status==='revisado'?'info':''))+'">'+esc(STATUS_MAP[vf.status]||vf.status)+'</span>'+
      (vf.versao?'<span style="font-size:12px;color:var(--muted)">versão '+vf.versao+'</span>':'')+
      (vf.geradoEm?'<span style="font-size:12px;color:var(--faint)">gerado em '+T.isoToBR(new Date(vf.geradoEm).toISOString().slice(0,10))+'</span>':'')+
      '</div>';
    h+='<div class="subtabs" id="vf-tabs">'+ABAS.map(function(a,i){return '<button class="back'+(i===0?' on':'')+'" data-vtab="'+a[0]+'">'+a[1]+'</button>';}).join('')+'</div>';
    ABAS.forEach(function(a,i){
      var txt=vf[a[0]]||'';
      h+='<div id="vf-'+a[0]+'" class="rel-voto-aba'+(i===0?'':' hidden')+'"><pre style="white-space:pre-wrap;font-family:var(--font);font-size:14px;line-height:1.65;margin:0;padding:16px;background:var(--surface2);border-radius:12px;border:1px solid var(--line)">'+esc(txt||'(vazio)')+'</pre></div>';
    });
    h+='<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">'+
      (vf.status!=='aprovado'&&vf.status!=='revisado'?'<button class="btn ghost" id="v-revisar">'+icon('check')+' Marcar como revisado</button>':'')+
      (vf.status==='revisado'||vf.status==='gerado'?'<button class="btn rel-btn-delib" id="v-aprovar">'+icon('check')+' Aprovar voto</button>':'')+
      (vf.status==='aprovado'?'<button class="btn teal" id="v-entendimentos">'+icon('brain')+' Gerar JSON para Meus Entendimentos</button>':'')+
      '<button class="btn ghost" id="v-import-btn">'+icon('upload')+' '+(noVote?'Importar voto':'Reimportar')+'</button>'+
      '</div>';
  }

  return '<div class="rel-block rel-block-voto">'+
    '<div class="rel-block-hd rel-hd-voto">'+icon('shield')+' <b>IV — Voto Final</b></div>'+
    '<div class="rel-block-body">'+h+'</div></div>';
}

/* ============================================================
   EXPORTAÇÃO — solicitação para o ChatGPT
   ============================================================ */
function blockExport(p, processId){
  var relData=T.state.relatoria[processId]||{};
  var defined=(relData.deliberacao&&relData.deliberacao.status==='definida');
  return '<div class="rel-block rel-block-export">'+
    '<div class="rel-block-hd" style="background:var(--surface2);border-color:var(--line2)">'+icon('out')+' <b>Integração com ChatGPT</b></div>'+
    '<div class="rel-block-body">'+
    '<p style="font-size:13px;color:var(--muted);margin:0 0 12px">A exportação só fica disponível após "Definir deliberação". Cole o JSON no ChatGPT e importe a resposta com "Importar voto".</p>'+
    '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">'+
    '<button class="btn rel-btn-delib" id="r-copiar"'+(defined?'':' disabled')+' title="'+(defined?'':'Defina a deliberação primeiro.')+'">'+icon('out')+' Copiar solicitação para ChatGPT</button>'+
    '<button class="btn ghost" id="r-baixar"'+(defined?'':' disabled')+'>'+icon('file')+' Baixar JSON</button>'+
    '<span id="r-msg" style="font-size:12.5px;color:var(--muted)"></span>'+
    '</div></div></div>';
}

function buildSolicitacao(p, processId){
  var relData=T.state.relatoria[processId]||{};
  var delib=relData.deliberacao||emptyDelib();
  return JSON.stringify({
    schema_version:'1.0',
    tipo:'solicitacao_voto_ted',
    processo:{id:p._id||p.id||'',pd:p.pd||'',representantes:(p.representantes||[]).map(function(r){return r.nome;}),representados:(p.representados||[]).map(function(r){return r.nome+(r.oab?' ('+r.oab+')':'');}),artigos:p.artigos||[]},
    analise:{lead:p.lead||'',resumoVeredito:p.resumoVeredito||'',parecerPontos:((p.detalhe||{}).parecerPontos||[]),parecerCritica:((p.detalhe||{}).parecerCritica||[]),parecerAcertos:((p.detalhe||{}).parecerAcertos||[]),tesesAv:((p.detalhe||{}).tesesAv||[]),documentos:p.documentos||[],cronologia:p.cronologia||[],precedentes:p.precedentes||[]},
    deliberacaoRelator:{posicionamentoParecer:(delib.parecer&&delib.parecer.posicionamento)||'',observacaoParecer:(delib.parecer&&delib.parecer.observacao)||'',resultado:delib.resultado||'',artigosReconhecidos:delib.artigosReconhecidos||[],artigosAfastados:delib.artigosAfastados||[],sancao:delib.sancao||{},encaminhamentos:delib.encaminhamentos||{},respostasPendencias:delib.respostasPendencias||{},observacoesRelator:delib.observacoesRelator||''}
  },null,2);
}

function downloadJSON(filename, json){
  var blob=new Blob([json],{type:'application/json;charset=utf-8'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); URL.revokeObjectURL(a.href);
}
function copyToClipboard(text, onOk, onFail){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(onOk).catch(function(){ fallbackCopy(text,onOk,onFail); });
  } else { fallbackCopy(text,onOk,onFail); }
}
function fallbackCopy(text,onOk,onFail){
  var ta=document.createElement('textarea'); ta.value=text; ta.style.cssText='position:fixed;top:-9999px;opacity:0'; document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); onOk&&onOk(); } catch(e){ onFail&&onFail(); }
  ta.remove();
}

/* ============================================================
   MODAL DE IMPORTAÇÃO DE VOTO
   ============================================================ */
function openImportModal(p, processId, onSuccess){
  T.openModal(
    '<div class="mh"><b style="font-family:var(--display);font-size:18px">'+icon('upload')+' Importar voto do ChatGPT</b><button class="btn ghost sm" data-close>'+icon('x')+' Fechar</button></div>'+
    '<div class="mb">'+
    '<p style="color:var(--muted);font-size:13.5px;margin:0 0 12px">Cole aqui o JSON retornado pelo ChatGPT. Deve ter <code>tipo: "voto_final_ted"</code> e <code>processo_id: "'+esc(processId)+'"</code>.</p>'+
    '<div class="callout warn" style="margin-bottom:12px"><b>Segurança:</b> o conteúdo colado é validado como dado, nunca executado como código.</div>'+
    '<label class="field"><span>JSON do ChatGPT</span><textarea class="input" id="imp-json" style="min-height:180px;font-family:var(--mono);font-size:12px" placeholder=\'{"schema_version":"1.0","tipo":"voto_final_ted","processo_id":"'+esc(processId)+'",...}\'></textarea></label>'+
    '<div id="imp-msg"></div>'+
    '<div style="display:flex;gap:10px;margin-top:10px">'+
    '<button class="btn rel-btn-delib" id="imp-ok">'+icon('check')+' Validar e importar</button>'+
    '<button class="btn ghost" data-close>Cancelar</button>'+
    '</div></div>'
  );
  T.$('#imp-ok').addEventListener('click',function(){
    var raw=T.$('#imp-json').value.trim();
    var msg=T.$('#imp-msg');
    msg.innerHTML='';
    var parsed;
    try{ parsed=JSON.parse(raw); } catch(e){ msg.innerHTML='<div class="msg err">JSON inválido: '+esc(e.message)+'</div>'; return; }
    /* Validações — nunca usar eval() */
    if(!parsed||typeof parsed!=='object'){ msg.innerHTML='<div class="msg err">Não é um objeto JSON válido.</div>'; return; }
    if(parsed.tipo!=='voto_final_ted'){ msg.innerHTML='<div class="msg err">Campo "tipo" deve ser "voto_final_ted". Recebido: "'+esc(parsed.tipo||'')+'".</div>'; return; }
    if(String(parsed.processo_id)!==String(processId)){ msg.innerHTML='<div class="msg err">processo_id não confere. Esperado: "'+esc(processId)+'". Recebido: "'+esc(parsed.processo_id||'')+'".</div>'; return; }
    if(!parsed.votoFinal||typeof parsed.votoFinal!=='object'){ msg.innerHTML='<div class="msg err">Campo "votoFinal" ausente ou inválido.</div>'; return; }
    var vf=parsed.votoFinal;
    var campos=['ementa','relatorio','preliminares','prescricao','merito','dosimetria','dispositivo','textoIntegral'];
    var faltando=campos.filter(function(c){ return typeof vf[c]!=='string'; });
    if(faltando.length){ msg.innerHTML='<div class="msg err">Campos ausentes ou não-string: '+esc(faltando.join(', '))+'</div>'; return; }

    var oldVoto=(T.state.relatoria[processId]||{}).votoFinal||{};
    var newVoto={
      status:'gerado',
      ementa:String(vf.ementa),relatorio:String(vf.relatorio),preliminares:String(vf.preliminares),prescricao:String(vf.prescricao),
      merito:String(vf.merito),dosimetria:String(vf.dosimetria),dispositivo:String(vf.dispositivo),textoIntegral:String(vf.textoIntegral),
      geradoEm:Date.now(),revisadoEm:null,versao:(oldVoto.versao||0)+1
    };

    T.saveRelatoria(processId,{
      processoId:processId,pd:p.pd||'',relatorId:'jonathan',schemaVersion:'1.0',votoFinal:newVoto
    }).then(function(){ T.closeOverlay(); onSuccess(); })
    .catch(function(e){ msg.innerHTML='<div class="msg err">Erro ao salvar: '+esc(e.code||e.message)+'</div>'; });
  });
}

/* ============================================================
   COLETAR DELIBERAÇÃO DO DOM
   ============================================================ */
function collectDelib(root, p, oldDelib){
  var d=Object.assign({},oldDelib||emptyDelib());
  d.parecer={ posicionamento:(T.$('#d-posicionamento',root)||{}).value||'', observacao:((T.$('#d-parecer-obs',root)||{}).value||'').trim() };
  d.resultado=(T.$('#d-resultado',root)||{}).value||'';

  d.artigosReconhecidos=[];
  T.$$('.art-cb[data-name="rec"]:checked',root).forEach(function(cb){d.artigosReconhecidos.push(cb.value);});
  T.$$('.art-extra[data-name="rec"]',root).forEach(function(el){if(el.getAttribute('data-val'))d.artigosReconhecidos.push(el.getAttribute('data-val'));});

  d.artigosAfastados=[];
  T.$$('.art-cb[data-name="af"]:checked',root).forEach(function(cb){d.artigosAfastados.push(cb.value);});
  T.$$('.art-extra[data-name="af"]',root).forEach(function(el){if(el.getAttribute('data-val'))d.artigosAfastados.push(el.getAttribute('data-val'));});

  var tipo=(T.$('#d-sancao-tipo',root)||{}).value||'';
  var prazoEl=T.$('#d-sancao-prazo',root), art37El=T.$('#d-sancao-art37',root), mulEl=T.$('#d-sancao-multa',root);
  d.sancao={ tipo:tipo, prazoDias:(tipo==='suspensao'&&prazoEl&&prazoEl.value!=='')?parseFloat(prazoEl.value):null, art37Par2:tipo==='suspensao'&&art37El&&art37El.checked||false, multaAnuidades:mulEl&&mulEl.value!==''?parseFloat(mulEl.value):null };

  var exclEl=T.$('#d-enc-excl',root), dilEl=T.$('#d-enc-dil',root), tacEl=T.$('#d-enc-tac',root);
  d.encaminhamentos={ exclusaoArt38I:exclEl&&exclEl.checked||false, diligencia:dilEl&&dilEl.checked||false, tac:tacEl&&tacEl.checked||false };
  d.observacoesRelator=((T.$('#d-obs',root)||{}).value||'').trim();

  /* coletar respostas de pendências */
  d.respostasPendencias=d.respostasPendencias||{};
  (p.pendenciasRelator||[]).forEach(function(q){
    if(q.tipo==='radio'){ var el=T.$('[name="pr-'+q.id+'"][data-qid="'+q.id+'"]:checked',root); if(el) d.respostasPendencias[q.id]=el.value; }
    else if(q.tipo==='checkbox'){ d.respostasPendencias[q.id]=T.$$('.rel-pq[data-qid="'+q.id+'"]:checked',root).map(function(e){return e.value;}); }
    else { var el2=T.$('.rel-pq[data-qid="'+q.id+'"]',root); if(el2) d.respostasPendencias[q.id]=q.tipo==='numero'&&el2.value!==''?parseFloat(el2.value):el2.value; }
  });
  return d;
}

function validatePendencias(p, respostas){
  return (p.pendenciasRelator||[]).filter(function(q){
    if(!q.obrigatoria) return false;
    var r=respostas[q.id]; return r==null||r===''||(Array.isArray(r)&&!r.length);
  }).map(function(q){return q.pergunta;});
}

/* ============================================================
   RENDER PRINCIPAL
   ============================================================ */
function renderRelatoria(root, processId){
  var p=(T.state.meus||[]).filter(function(x){return (x._id||x.id)===processId;})[0];
  if(!p){
    root.innerHTML='<div class="crumbs"><button class="back" id="bk">'+icon('back')+' Meus processos</button></div>'+
      '<div class="empty"><h3>Processo não encontrado</h3><p>O processo "'+esc(processId)+'" não foi encontrado em Meus processos. Ele pode ter sido removido ou o ID está incorreto.</p></div>';
    T.$('#bk',root).addEventListener('click',function(){location.hash='#/meus';});
    return;
  }

  var relData=T.state.relatoria[processId]||{};
  var delib=relData.deliberacao||null;
  var votoFinal=relData.votoFinal||null;

  root.innerHTML=
    '<div class="crumbs"><button class="back" id="bk">'+icon('back')+' Meus processos</button></div>'+
    '<section class="hero" style="background:linear-gradient(120deg,'+B1+' 0%,'+B2+' 60%,#c0392b 100%)">'+
      '<h2>'+icon('gavel')+' P.D. '+esc(p.pd||processId)+' — Relatoria</h2>'+
      '<p>'+esc(p.lead||p.infracao||'Processo de relatoria')+'</p>'+
      '<div class="tips">'+
        '<span class="tip">I · Autos e análise</span>'+
        '<span class="tip">II · Questões para o Relator</span>'+
        '<span class="tip">III · Deliberação</span>'+
        '<span class="tip">IV · Voto</span>'+
      '</div>'+
    '</section>'+
    blockAutos(p)+
    blockPendencias(p, delib)+
    blockDeliberacao(p, delib)+
    blockVoto(votoFinal)+
    blockExport(p, processId);

  /* --- nav --- */
  T.$('#bk',root).addEventListener('click',function(){location.hash='#/meus';});

  /* --- Bloco A: toggle --- */
  var toggleA=T.$('#rl-toggle-a',root), bodyA=T.$('#rl-body-a',root);
  if(toggleA&&bodyA){
    toggleA.addEventListener('click',function(){
      var open=bodyA.style.display!=='none'; bodyA.style.display=open?'none':''; var ic=T.$('.rel-toggle-ic',toggleA); if(ic) ic.textContent=open?'▸':'▾';
    });
  }

  /* --- Bloco C: sanção suspensão toggle --- */
  var sanTipoEl=T.$('#d-sancao-tipo',root), sanSuspEl=T.$('#d-sancao-susp',root);
  if(sanTipoEl&&sanSuspEl){ sanTipoEl.addEventListener('change',function(){ sanSuspEl.classList.toggle('hidden',sanTipoEl.value!=='suspensao'); }); }

  /* --- Bloco C: artigos manuais --- */
  T.$$('[data-add-art]',root).forEach(function(btn){
    var nome=btn.getAttribute('data-add-art');
    btn.addEventListener('click',function(){
      var inp=T.$('.art-manual[data-name="'+nome+'"]',root); var val=(inp&&inp.value||'').trim(); if(!val) return;
      var extras=T.$('#art-extras-'+nome,root); if(!extras) return;
      var existing=T.$$('.art-extra[data-name="'+nome+'"]',root).map(function(e){return e.getAttribute('data-val');});
      if(existing.indexOf(val)>-1||(p.artigos||[]).indexOf(val)>-1){T.toast('Artigo já incluído.');return;}
      var span=document.createElement('span'); span.className='art art-extra'; span.style.cursor='pointer';
      span.setAttribute('data-name',nome); span.setAttribute('data-val',val); span.textContent=val+' ✕';
      span.addEventListener('click',function(){span.remove();});
      extras.appendChild(span);
      if(inp) inp.value='';
    });
    T.$$('.art-extra[data-name="'+nome+'"]',root).forEach(function(span){ span.addEventListener('click',function(){span.remove();}); });
  });

  /* --- Bloco C: salvar rascunho --- */
  T.$('#d-rascunho',root)&&T.$('#d-rascunho',root).addEventListener('click',function(){
    var d=collectDelib(root,p,T.state.relatoria[processId]&&T.state.relatoria[processId].deliberacao);
    d.status='rascunho'; d.atualizadoEm=Date.now();
    T.saveRelatoria(processId,{processoId:processId,pd:p.pd||'',relatorId:'jonathan',schemaVersion:'1.0',deliberacao:d})
    .then(function(){ var m=T.$('#d-msg',root); if(m) m.textContent='Rascunho salvo.'; })
    .catch(function(e){ var m=T.$('#d-msg',root); if(m) m.textContent='Erro: '+esc(e.code||e.message); });
  });

  /* --- Bloco C: definir deliberação --- */
  T.$('#d-definir',root)&&T.$('#d-definir',root).addEventListener('click',function(){
    var d=collectDelib(root,p,T.state.relatoria[processId]&&T.state.relatoria[processId].deliberacao);
    var erros=validatePendencias(p,d.respostasPendencias);
    if(erros.length){T.toast('Responda: '+erros[0]+(erros.length>1?' (e mais '+(erros.length-1)+' obrigatória'+( erros.length>2?'s':'')+')':''));return;}
    if(!d.resultado){T.toast('Defina o resultado antes de confirmar.');return;}
    d.status='definida'; d.atualizadoEm=Date.now();
    T.saveRelatoria(processId,{processoId:processId,pd:p.pd||'',relatorId:'jonathan',schemaVersion:'1.0',deliberacao:d})
    .then(function(){
      var m=T.$('#d-msg',root); if(m) m.textContent='Deliberação definida.';
      var cb=T.$('#r-copiar',root), bb=T.$('#r-baixar',root);
      if(cb) cb.removeAttribute('disabled'); if(bb) bb.removeAttribute('disabled');
    })
    .catch(function(e){ var m=T.$('#d-msg',root); if(m) m.textContent='Erro: '+esc(e.code||e.message); });
  });

  /* --- Export: copiar --- */
  T.$('#r-copiar',root)&&T.$('#r-copiar',root).addEventListener('click',function(){
    var json=buildSolicitacao(p,processId);
    copyToClipboard(json,function(){T.toast('Solicitação para o ChatGPT copiada.');var m=T.$('#r-msg',root);if(m)m.textContent='Copiado!';},function(){T.toast('Não foi possível copiar. Use "Baixar JSON".');});
  });

  /* --- Export: baixar --- */
  T.$('#r-baixar',root)&&T.$('#r-baixar',root).addEventListener('click',function(){
    downloadJSON('TED-solicitacao-'+processId+'.json',buildSolicitacao(p,processId));
  });

  /* --- Import voto --- */
  T.$('#v-import-btn',root)&&T.$('#v-import-btn',root).addEventListener('click',function(){
    openImportModal(p,processId,function(){renderRelatoria(root,processId);});
  });

  /* --- Voto: abas --- */
  T.$$('[data-vtab]',root).forEach(function(btn){
    btn.addEventListener('click',function(){
      T.$$('[data-vtab]',root).forEach(function(b){b.classList.toggle('on',b===btn);});
      T.$$('.rel-voto-aba',root).forEach(function(dv){dv.classList.toggle('hidden',dv.id!=='vf-'+btn.getAttribute('data-vtab'));});
    });
  });

  /* --- Voto: revisar --- */
  T.$('#v-revisar',root)&&T.$('#v-revisar',root).addEventListener('click',function(){
    var vf=(T.state.relatoria[processId]||{}).votoFinal||{};
    T.saveRelatoria(processId,{votoFinal:Object.assign({},vf,{status:'revisado',revisadoEm:Date.now()})})
    .then(function(){renderRelatoria(root,processId);});
  });

  /* --- Voto: aprovar --- */
  T.$('#v-aprovar',root)&&T.$('#v-aprovar',root).addEventListener('click',function(){
    var vf=(T.state.relatoria[processId]||{}).votoFinal||{};
    T.saveRelatoria(processId,{votoFinal:Object.assign({},vf,{status:'aprovado',revisadoEm:Date.now()})})
    .then(function(){renderRelatoria(root,processId);});
  });

  /* --- Voto: Meus Entendimentos --- */
  T.$('#v-entendimentos',root)&&T.$('#v-entendimentos',root).addEventListener('click',function(){
    var vf=(T.state.relatoria[processId]||{}).votoFinal||{};
    var delib2=(T.state.relatoria[processId]||{}).deliberacao||{};
    var entry={id:'ted-'+processId,pd:p.pd||processId,relatorId:'jonathan',ementa:vf.ementa||'',dispositivo:vf.dispositivo||'',texto:vf.textoIntegral||'',tags:['relatoria','ted'],resultado:delib2.resultado||'',data:new Date().toISOString().slice(0,10)};
    downloadJSON('TED-voto-entendimento-'+processId+'.json',JSON.stringify({votos:[entry]},null,2));
    T.toast('JSON gerado. Importe em Acesso → Importar dados.');
  });
}

/* ---------- registro da aba ---------- */
T.registerTab({
  id:'relatoria', label:'Relatoria', icon:'gavel', hidden:true,
  render:function(root,args){
    var pid=args&&args[0];
    if(!pid){location.hash='#/meus';return;}
    renderRelatoria(root,pid);
  }
});
})();
