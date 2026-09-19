/* Aba 2 — Meus processos (os que Jonathan julga como relator). Quadro editável + papeleta. */
(function(){
"use strict"; var T=window.TED, esc=T.esc, icon=T.icon;
var EMPTY_MSG='Os processos que você julgará como relator entram aqui. Cadastre-os manualmente pelo botão acima ou, quando você me apresentar a pasta, eu monto os blocos com a análise completa.';

function slug(pd){ return String(pd||'').replace(/[^\d]+/g,'-').replace(/^-|-$/g,''); }
function toLines(a){ return (a||[]).join('\n'); }
function fromLines(s){ return String(s||'').split(/\n+/).map(function(x){ return x.trim(); }).filter(Boolean); }

function form(p){
  p=p||{}; var novo=!p._id;
  var v=T.openModal('<div class="mh"><b style="font-family:var(--display);font-size:19px">'+(novo?'Novo processo':'Editar P.D. '+esc(p.pd))+'</b><button class="btn ghost sm" data-close>'+icon('x')+' Fechar</button></div>'+
   '<div class="mb"><div class="two">'+
   '<label class="field"><span>Processo disciplinar nº (ex.: 1234/2026)</span><input class="input" id="f-pd" value="'+esc(p.pd||'')+'"></label>'+
   '<label class="field"><span>Sessão de julgamento</span><input class="input" id="f-sessao" placeholder="ex.: 22/10/2026 · 13h30" value="'+esc(p.sessao||'')+'"></label>'+
   '<label class="field"><span>Representante</span><input class="input" id="f-rt" value="'+esc(((p.representantes||[])[0]||{}).nome||'')+'"></label>'+
   '<label class="field"><span>Representado (nome)</span><input class="input" id="f-rd" value="'+esc(((p.representados||[])[0]||{}).nome||'')+'"></label>'+
   '<label class="field"><span>OAB do representado</span><input class="input" id="f-oab" placeholder="OAB/MG 000.000" value="'+esc(((p.representados||[])[0]||{}).oab||'')+'"></label>'+
   '<label class="field"><span>Subseção de origem</span><input class="input" id="f-sub" value="'+esc(p.subsecao||'')+'"></label>'+
   '<label class="field"><span>Infração (até 4 palavras)</span><input class="input" id="f-inf" value="'+esc(p.infracao||'')+'"></label>'+
   '<label class="field"><span>Artigo(s) — um por linha</span><textarea class="input" id="f-art" style="min-height:64px">'+esc(toLines(p.artigos))+'</textarea></label>'+
   '<label class="field"><span>Conclusão</span><select class="select input" id="f-ver">'+[['pendente','A definir'],['punivel','Punível'],['nao_punivel','Não punível'],['prescrito','Prescrito'],['nulo','Nulidade'],['tac','TAC']].map(function(o){ return '<option value="'+o[0]+'"'+((p.veredito||'pendente')===o[0]?' selected':'')+'>'+o[1]+'</option>'; }).join('')+'</select></label>'+
   '<label class="field"><span>Sanção proposta</span><input class="input" id="f-san" placeholder="ex.: Censura + multa de 3 anuidades" value="'+esc(p.sancao||'')+'"></label>'+
   '</div><label class="field"><span>Síntese (uma frase)</span><input class="input" id="f-lead" value="'+esc(p.lead||'')+'"></label>'+
   '<label class="field"><span>Pontos do caso — um por linha</span><textarea class="input" id="f-pts">'+esc(toLines(p.pontos))+'</textarea></label>'+
   '<label class="field"><span>Link dos autos no Drive (opcional)</span><input class="input" id="f-drv" value="'+esc(p.driveUrl||'')+'"></label>'+
   '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px"><button class="btn" id="f-ok">Salvar</button>'+(novo?'':'<button class="btn danger" id="f-del">Excluir</button>')+'<span id="f-msg" class="msg" style="display:none"></span></div></div>');
  function msg(t,k){ var m=T.$('#f-msg',v); m.style.display='block'; m.className='msg '+(k||'err'); m.textContent=t; }
  T.$('#f-ok',v).addEventListener('click',function(){
    var pd=T.$('#f-pd',v).value.trim(); if(!/^\d+\s*[\/-]\s*\d{2,4}$/.test(pd)){ msg('Informe o número no formato 1234/2026.'); return; }
    var id=p._id||slug(pd);
    var doc={ id:id, pd:pd.replace(/\s+/g,''), sessao:T.$('#f-sessao',v).value.trim(), subsecao:T.$('#f-sub',v).value.trim(),
      representantes:[{nome:T.$('#f-rt',v).value.trim()}].filter(function(x){return x.nome;}), representados:[{nome:T.$('#f-rd',v).value.trim(),oab:T.$('#f-oab',v).value.trim()}].filter(function(x){return x.nome;}),
      infracao:T.$('#f-inf',v).value.trim(), artigos:fromLines(T.$('#f-art',v).value), veredito:T.$('#f-ver',v).value, sancao:T.$('#f-san',v).value.trim(),
      lead:T.$('#f-lead',v).value.trim(), pontos:fromLines(T.$('#f-pts',v).value), driveUrl:T.$('#f-drv',v).value.trim(), status:(T.$('#f-ver',v).value==='pendente'?'pendente':'analisado'), relatorId:'jonathan', editavel:true, atualizadoEm:Date.now() };
    if(doc.status==='pendente') doc.motivoPendencia='Cadastro manual — análise ainda não registrada.';
    T.fs.collection('tedMeus').doc(id).set(doc).then(function(){ T.toast('Processo salvo.'); T.reload(); }).catch(function(e){ msg('Erro ao salvar: '+(e.code||e.message)); });
  });
  var del=T.$('#f-del',v); if(del) del.addEventListener('click',function(){ if(confirm('Excluir este processo?')) T.fs.collection('tedMeus').doc(p._id).delete().then(function(){ T.toast('Excluído.'); T.reload(); }); });
}

T.registerTab({ id:'meus', label:'Meus processos', icon:'folder', render:function(root){
  var list=T.state.meus.slice().sort(function(a,b){ return String(a.sessao||'z').localeCompare(String(b.sessao||'z')) || String(a.pd).localeCompare(String(b.pd),undefined,{numeric:true}); });
  var canEdit=T.perfil&&T.perfil.admin;
  root.innerHTML='<section class="hero teal"><h2>Meus processos</h2><p>Os processos em que você é <b>relator</b> e que serão julgados na próxima sessão. Cada bloco tem os principais dados, a conclusão (punível ou não, com a sanção) e a papeleta no mesmo padrão dos processos dos demais julgadores.</p><div class="tips"><span class="tip">Papeleta pronta para imprimir</span><span class="tip">Voto sugerido e análise de prescrição</span><span class="tip">Edição direta no bloco</span></div></section>'+
   (canEdit?'<div class="toolbar"><button class="btn" id="nv">'+icon('plus')+' Novo processo</button></div>':'')+'<div id="bd"></div>';
  if(canEdit) T.$('#nv',root).addEventListener('click',function(){ form(); });
  if(!list.length){ T.$('#bd',root).innerHTML='<div class="empty"><h3>Nenhum processo cadastrado ainda</h3><p>'+esc(EMPTY_MSG)+'</p></div>'; return; }
  T.board(T.$('#bd',root),list,{id:'jonathan',tr:'Dr.',nome:'Jonathan Silva Fonseca',h:262},{ onEdit:canEdit?form:null });
}});
})();
