/* Catálogos públicos do sistema TED (sem dados de processos).
   Fontes: EAOAB (Lei 8.906/94, texto compilado), CED, RG, Provimento 200/2020, Portarias OAB/MG, Súmulas CFOAB. */

/* ---------- Julgadores (nomes constam das pastas compartilhadas do TED Regional) ---------- */
window.TED_RELATORES = [
  { id:'eclair',     nome:'Eclair Gonçalves Gomes',               tr:'Dra.', h:330 },
  { id:'cintia',     nome:'Cintia Alves da Cunha Guedes',         tr:'Dra.', h:262 },
  { id:'felicissimo',nome:'José Felicissimo Filho',               tr:'Dr.',  h:205 },
  { id:'mauricio',   nome:'Maurício da Silva',                    tr:'Dr.',  h:160, oab:'OAB/MG 100.793' },
  { id:'heverton',   nome:'Heverton Alvim Nascimento',            tr:'Dr.',  h:28,  oab:'OAB/MG 63.847' },
  { id:'alexandre',  nome:'Alexandre Magno de Macedo',            tr:'Dr.',  h:352 },
  { id:'vania',      nome:'Vânia Maria Alves Costa',              tr:'Dra.', h:292, oab:'OAB/MG 125.350' },
  { id:'gerson',     nome:'Gerson Peixoto de Carvalho',           tr:'Dr.',  h:186, oab:'OAB/MG 156.391' },
  { id:'guilherme',  nome:'Guilherme Stylianoudakis de Carvalho', tr:'Dr.',  h:245 },
];
window.TED_MEU = { nome:'Jonathan Silva Fonseca', oab:'OAB/MG 163.443', turma:'1ª Turma Regional do TED — Triângulo Mineiro' };

/* ---------- Infrações (EAOAB art. 34) e sanção-base (arts. 36 a 38) ---------- */
window.TED_INFRACOES = [
  ['I','Exercício profissional impedido','censura'],['II','Sociedade fora das normas','censura'],['III','Uso de agenciador','censura'],['IV','Captação de causas','censura'],
  ['V','Assinar escrito alheio','censura'],['VI','Advogar contra a lei','censura'],['VII','Violação de sigilo','censura'],['VIII','Acordo sem autorização','censura'],
  ['IX','Prejuízo por culpa grave','censura'],['X','Nulidade provocada dolosamente','censura'],['XI','Abandono da causa','censura'],['XII','Recusa de nomeação dativa','censura'],
  ['XIII','Publicação de alegações forenses','censura'],['XIV','Deturpação de lei ou julgado','censura'],['XV','Imputação de crime sem autorização','censura'],['XVI','Descumprir determinação da OAB','censura'],
  ['XVII','Concurso para ato ilícito','suspensão'],['XVIII','Valores para fim ilícito','suspensão'],['XIX','Recebimento da parte contrária','suspensão'],['XX','Locupletamento','suspensão'],
  ['XXI','Recusa de prestar contas','suspensão'],['XXII','Retenção abusiva de autos','suspensão'],['XXIII','Inadimplência com a OAB','suspensão'],['XXIV','Inépcia profissional reiterada','suspensão'],
  ['XXV','Conduta incompatível','suspensão'],['XXVI','Falsa prova para inscrição','exclusão'],['XXVII','Inidoneidade moral','exclusão'],['XXVIII','Crime infamante','exclusão'],
  ['XXIX','Estagiário: ato excedente','censura'],['XXX','Assédio ou discriminação','suspensão']
].map(function(a){ return { inc:a[0], art:'Art. 34, '+a[0]+', EAOAB', label:a[1], sancao:a[2] }; });

window.TED_SANCOES = [
  { k:'censura', nome:'Censura', base:'EAOAB art. 36', nota:'Aplicável às infrações do art. 34, I–XVI e XXIX, à violação de preceito do CED e a preceito do Estatuto sem sanção mais grave. Pode ser convertida em advertência em ofício reservado, sem registro, se houver atenuante (art. 36, par. único) — vedada se já beneficiado nos 3 anos anteriores à infração (Súmula 18/2023/OEP; Prov. 200/2020, art. 4º, §2º).' },
  { k:'suspensão', nome:'Suspensão', base:'EAOAB art. 37', nota:'Art. 34, XVII–XXV e XXX, e reincidência. Interdição do exercício de 30 dias a 12 meses (§1º). Nos incisos XXI e XXIII a suspensão perdura até a satisfação da dívida (§2º); no XXIV, até novas provas de habilitação (§3º).' },
  { k:'exclusão', nome:'Exclusão', base:'EAOAB art. 38', nota:'Três suspensões anteriores ou art. 34, XXVI–XXVIII. Exige 2/3 dos membros do Conselho Seccional (art. 38, par. único; Súmula 08/2019/COP). Período depurador de 5 anos entre suspensões: Súmula 21/2024/OEP.' },
  { k:'multa', nome:'Multa', base:'EAOAB art. 39', nota:'De 1 a 10 anuidades, cumulativa com censura ou suspensão quando houver circunstâncias agravantes.' },
  { k:'atenuantes', nome:'Atenuantes (art. 40)', base:'EAOAB art. 40', nota:'Falta cometida na defesa de prerrogativa; ausência de punição anterior; exercício assíduo de cargo na OAB; relevantes serviços à advocacia/causa pública. Antecedentes, grau de culpa, circunstâncias e consequências definem o tempo de suspensão e a multa (par. único).' },
];

/* ---------- Roteiro de análise (o que o relator/vogal deve checar em todo processo) ---------- */
window.TED_ROTEIRO = [
  { k:'prescricao', t:'Prescrição da pretensão punitiva', d:'5 anos da constatação oficial do fato (EAOAB 43). Verifique marcos interruptivos (instauração / notificação válida / decisão condenatória recorrível — 43, §2º; Súm. 13/2022/OEP) e suspensões aplicáveis.' },
  { k:'intercorrente', t:'Prescrição intercorrente', d:'Processo paralisado por mais de 3 anos pendente de despacho ou julgamento (EAOAB 43, §1º). Um ato de impulso dentro dos 3 anos afasta a intercorrente.' },
  { k:'citacao', t:'Notificação/citação válida', d:'Endereço do cadastro (RG 137-D); AR; edital só depois de frustrada a entrega; revelia → defensor dativo (CED 59, §2º; EAOAB 73, §4º). Notificar o defensor dativo/procurador de todos os atos.' },
  { k:'defesa', t:'Defesa prévia e instrução', d:'15 dias (CED 59); rol de até 5 testemunhas; despacho saneador; indeferimento de prova só motivado (CED 59, §6º).' },
  { k:'parecer', t:'Parecer preliminar', d:'CED 59, §7º. Sua ausência gera nulidade relativa, exigindo prova de prejuízo (Súmula 12/2022/OEP).' },
  { k:'razoes', t:'Razões finais', d:'Prazo sucessivo de 15 dias após o parecer preliminar (CED 59, §8º). A ausência de oportunidade é vício grave: veja o ementário do CFOAB sobre nulidade a partir das razões finais.' },
  { k:'sessao', t:'Notificação para a sessão', d:'15 dias de antecedência às partes (CED 60, §3º); sustentação oral de 15 minutos (§4º).' },
  { k:'teses', t:'Teses da defesa e da representação', d:'Apurar todas: preliminares (nulidades, prescrição, ilegitimidade, inépcia), mérito (materialidade, culpa, dolo, excludentes, boa-fé), prova documental e testemunhal.' },
  { k:'enquadramento', t:'Enquadramento e sanção', d:'Tipificar (art. 34 + CED), individualizar (arts. 36–40), verificar reincidência, atenuantes/agravantes, TAC (CED 58-A/47-A; Prov. 200/2020; Súm. 19/2023/OEP) e conversão da censura em advertência.' },
];

/* ---------- Prazos legais de referência ---------- */
window.TED_PRAZOS = [
  ['Prescrição da pretensão punitiva','5 anos','Da data da constatação oficial do fato (protocolo/ciência formal pela OAB).','EAOAB, art. 43, caput'],
  ['Prescrição intercorrente','3 anos','Processo paralisado, pendente de despacho ou julgamento; arquivamento de ofício ou a requerimento.','EAOAB, art. 43, §1º'],
  ['Interrupção da prescrição','reinicia 5 anos','Instauração do PD; notificação válida ao representado; decisão condenatória recorrível (inclui decisões do CFOAB que inadmitem recurso contra acórdão condenatório).','EAOAB, art. 43, §2º; Súmula 13/2022/OEP'],
  ['Parecer do relator (admissibilidade)','30 dias','Instauração ou arquivamento liminar; sob pena de redistribuição.','CED, art. 58, §3º'],
  ['Defesa prévia / esclarecimentos','15 dias','Contados em dias úteis; prorrogável por motivo relevante.','CED, art. 59; EAOAB, art. 73, §3º; RG, art. 139'],
  ['Razões finais','15 dias (sucessivos)','Após o parecer preliminar, para representante e representado.','CED, art. 59, §8º'],
  ['Notificação para a sessão de julgamento','15 dias de antecedência','Representante e representado notificados pela Secretaria.','CED, art. 60, §3º'],
  ['Sustentação oral','15 minutos','Primeiro o representante, depois o representado.','CED, art. 60, §4º'],
  ['Recursos e demais manifestações','15 dias úteis','Início no primeiro dia útil seguinte à publicação no DEOAB ou à juntada do AR.','EAOAB, art. 69; RG, art. 139'],
  ['Recesso','20/12 a 31/12 e janeiro','Prazos processuais suspensos, retomando no 1º dia útil após o término.','RG, art. 139, §3º'],
  ['Suspensão preventiva','processo em 90 dias','Após sessão especial; o PD deve ser concluído em no máximo 90 dias.','EAOAB, art. 70, §3º'],
  ['Suspensão (sanção)','30 dias a 12 meses','Interdição do exercício em todo o território nacional.','EAOAB, art. 37, §1º'],
  ['Multa','1 a 10 anuidades','Cumulativa com censura/suspensão, se houver agravantes.','EAOAB, art. 39'],
  ['TAC — manifestação de interesse','15 dias','Ausência de manifestação = recusa.','Prov. 200/2020, art. 3º, §1º'],
  ['TAC — suspensão condicional','3 anos','Processo suspenso; prescrição não flui; cumprido, arquivamento sem anotações.','Prov. 200/2020, art. 4º, §§1º e 4º'],
  ['Reabilitação','1 ano após o cumprimento','Prova efetiva de bom comportamento (e reabilitação criminal se a sanção decorreu de crime).','EAOAB, art. 41'],
  ['Período depurador (exclusão)','5 anos','Entre o cumprimento da suspensão anterior e o novo fato.','Súmula 21/2024/OEP; CP, art. 64, I'],
];

/* ---------- Suspensões/impedimentos catalogados para a calculadora ---------- */
/* status: oficial = texto lido nos arquivos da pasta NORMAS; noticia = só notícia oficial (conferir); controv = controvertido; judic = normas do Judiciário (não se aplicam ao PD da OAB) */
window.TED_SUSP = [
  { id:'pc001', nome:'Portaria Conjunta PRESI/CAD-TED/ÓRGÃO ESPECIAL/CGD nº 001/2020 — OAB/MG', ini:'2020-03-16', fim:'2020-03-31', status:'oficial', padrao:true,
    desc:'Suspende todos os prazos nos processos de qualquer natureza em curso na OAB/MG (art. 1º). Texto lido (PDF da pasta NORMAS, 19/03/2020).' },
  { id:'p85', nome:'Portaria nº 85/2020 — OAB/MG (prorrogação)', ini:'2020-03-30', fim:'2020-04-03', status:'oficial', padrao:true,
    desc:'Prorroga, por igual período, a suspensão da Portaria Conjunta 001/2020 (e o expediente, de 30/03 a 03/04). Texto lido. Períodos sobrepostos são contados uma só vez.' },
  { id:'p90', nome:'Portaria nº 90/2020 — OAB/MG (prorrogação até 31/05)', ini:'2020-04-04', fim:'2020-05-31', status:'noticia', padrao:false,
    desc:'Notícia do site da OAB/MG informa prorrogação da suspensão dos prazos processuais até 31/05/2020. Portaria não consta da pasta NORMAS: conferir o texto no DEOAB. Início presumido (dia seguinte ao fim da anterior).' },
  { id:'pc134', nome:'Portaria Conjunta nº 134/2020 — OAB/MG (até 03/08)', ini:'2020-06-01', fim:'2020-08-03', status:'noticia', padrao:false,
    desc:'Notícia do site da OAB/MG informa suspensão dos prazos dos processos administrativos até 03/08/2020. Conferir o texto e se alcança o TED. Início presumido.' },
  { id:'rjet', nome:'Lei 14.010/2020 (RJET), art. 3º — prazos prescricionais', ini:'2020-06-12', fim:'2020-10-30', status:'controv', padrao:false,
    desc:'Impede/suspende prazos prescricionais de 12/06 a 30/10/2020. O Conselho Federal decidiu que NÃO se aplica ao processo disciplinar da OAB (Consulta 49.0000.2020.005420-1/OEP, Ementa 018/2021/OEP, 09/02/2021): lei restrita a relações de Direito Privado; prevalece o art. 43 do EAOAB.' },
  { id:'cfoab', nome:'CFOAB — Resoluções 05, 06, 08, 12, 17 e 20/2020 (processos do Conselho Federal)', ini:'2020-03-16', fim:'2020-05-03', status:'noticia', padrao:false,
    desc:'Suspensão de prazos nos processos do Conselho Federal, com retomada em 04/05/2020 (Res. 20/2020). Vale só para processos no CFOAB; não alcança o TED seccional. Datas conforme notícias/DEOAB — conferir.' },
  { id:'cnj313', nome:'CNJ, Res. 313/2020 — suspensão de prazos no Judiciário', ini:'2020-03-19', fim:'2020-04-30', status:'judic', padrao:false,
    desc:'Judiciário (plantão extraordinário). Não se aplica ao PD da OAB. Incluída só para o “teste de robustez”. Conferir datas.' },
  { id:'cnj314', nome:'CNJ, Res. 314/2020 e 318/2020 — prorrogação (autos físicos)', ini:'2020-05-01', fim:'2020-05-31', status:'judic', padrao:false,
    desc:'Judiciário. Prorrogações da suspensão para processos físicos. Não se aplica ao PD da OAB. Conferir datas.' },
];

/* ---------- Prescrição/decadência civil (modelos) ---------- */
window.TED_CIVIL = [
  { id:'cc206-5-II', nome:'Honorários de profissionais liberais/advogados — 5 anos', anos:5, tipo:'prescricao', base:'CC, art. 206, §5º, II (do término dos serviços/contrato ou mandato)' },
  { id:'cc206-5-I',  nome:'Dívidas líquidas em instrumento — 5 anos', anos:5, tipo:'prescricao', base:'CC, art. 206, §5º, I' },
  { id:'cc206-3-V',  nome:'Reparação civil — 3 anos', anos:3, tipo:'prescricao', base:'CC, art. 206, §3º, V' },
  { id:'cc205',      nome:'Prazo geral — 10 anos', anos:10, tipo:'prescricao', base:'CC, art. 205' },
  { id:'dec-custom', nome:'Decadência (prazo à escolha, em meses)', meses:true, tipo:'decadencia', base:'CC, arts. 207 a 211 — não se suspende nem se interrompe, salvo disposição legal (art. 207)' },
];
