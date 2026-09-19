#!/usr/bin/perl
# Gera data/legislacao.js a partir das normas (texto publico).
use strict; use warnings; use utf8;
use Encode qw(decode encode);
use JSON::PP;
binmode(STDOUT, ':utf8');

my $SP = $ENV{SP};
my $OUT = $ENV{OUT};
my $json = JSON::PP->new->utf8(0)->canonical(1);

sub slurp { my ($f,$enc)=@_; open(my $fh,'<:raw',$f) or die "$f: $!"; local $/; my $c=<$fh>; close $fh; my $s = decode($enc||'UTF-8',$c); $s =~ s///g; return $s; }

sub norm_ws { my $s=shift; $s =~ s/[ \t\x{00a0}]+/ /g; $s =~ s/^ //; $s =~ s/ $//; return $s; }

# ---------- 1. Estatuto (Planalto HTML) ----------
sub parse_eaoab_html {
  my $h = slurp("$SP/l8906.htm", 'cp1252');
  $h =~ s{<!--.*?-->}{}gs;
  $h =~ s{<script.*?</script>}{}gis; $h =~ s{<style.*?</style>}{}gis;
  $h =~ s{<strike>.*?</strike>}{}gis; $h =~ s{<s>.*?</s>}{}gis; $h =~ s{<del>.*?</del>}{}gis;
  $h =~ s/\s+/ /g;
  $h =~ s{</p>|<br\s*/?>|</h\d>|</div>|</tr>|</li>}{\n}gi;
  $h =~ s/<[^>]+>//g;
  my %ent = (nbsp=>' ',amp=>'&',lt=>'<',gt=>'>',quot=>'"',ordm=>'º',ordf=>'ª',sect=>'§');
  $h =~ s/&#(\d+);/chr($1)/ge; $h =~ s/&(\w+);/exists $ent{$1}?$ent{$1}:''/ge;
  my @lines = grep { length } map { norm_ws($_) } split /\n/, $h;
  return parse_articles(\@lines, {eaoab=>1});
}

# ---------- generic ----------
sub note_re { qr/\((?:Redação dada|Incluíd[oa]|Renumerad[oa]|Revogad[oa]|Vide|Vigência|Regulamento|Vetad[oa]|Alterad[oa]|Acrescid[oa]|Suprimid[oa]|Nova redação|Ver )[^)]*\)/i }

sub parse_articles {
  my ($lines,$opt)=@_; $opt ||= {};
  my @items; my $cur; my $sec=''; my $expect = 1; my $await_title = 0; my ($tit,$cap,$hk) = ('','','tit');
  my $note_re = note_re();
  foreach my $l (@$lines) {
    if ($await_title and $l !~ /^Art\.?\s*\d/ and $l !~ /^(T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|LIVRO)\s+[IVXLCDM0-9]+/i and length($l) < 95 and $l !~ /[.;:]\s*$/) {
      if ($hk eq 'tit') { $tit .= ($await_title==2 ? " — " : " ") . $l; } else { $cap .= ($await_title==2 ? " — " : " ") . $l; }
      $sec = join(' · ', grep { length } ($tit,$cap)); $await_title--; next; }
    $await_title = 0;
    if ($l =~ /^(T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|LIVRO)\s+[IVXLCDM0-9]+(?:-[A-Z])?\s*$/i) {
      if ($l =~ /^(T[ÍI]TULO|LIVRO)/i) { $tit = $l; $cap = ''; $hk = 'tit'; } else { $cap = $l; $hk = 'cap'; }
      $sec = join(' · ', grep { length } ($tit,$cap)); $await_title = 2; next; }
    if ($l =~ /^Art\.?\s*(\d{1,3})\s*([ºo°O0]?)\s*(-\s*[A-Z])?\s*[\.\-–]?\s*(.*)$/) {
      my ($num,$ord,$suf,$rest)=($1,$2,$3,$4);
      # OCR: "º" lido como "0" -> "Art. 10" quando esperado 1
      if ($opt->{ocr} and !$suf and $ord eq '' and $num =~ /^(\d)0$/ and $1 == $expect) { $num=$1; $ord='º'; }
      elsif ($opt->{ocr} and !$suf and $ord eq '0' and $num == $expect) { $ord='º'; }
      elsif ($opt->{ocr} and !$suf and $num =~ /^(\d)0$/ and $1 == $expect and $num != $expect) { $num=$1; $ord='º'; }
      $suf = $suf ? $suf : ''; $suf =~ s/\s+//g;
      my $label = "Art. $num" . ($ord =~ /[ºo°O0]/ && $num < 10 ? 'º' : '') . $suf;
      $expect = $num + 1 if $suf eq '';
      $cur = { r=>$label, t=>[], s=>$sec, n=>[] };
      push @items, $cur;
      push @{$cur->{t}}, $rest if length $rest;
      next;
    }
    if ($cur) { push @{$cur->{t}}, $l; }
  }
  foreach my $it (@items) {
    my $txt = join("\n", @{$it->{t}});
    my @notes;
    while ($txt =~ /($note_re)/g) { push @notes, $1; }
    $txt =~ s/$note_re//g; $txt =~ s/\s*\(NR\)\s*\d*//g;
    $txt =~ s/[ \t]+\n/\n/g; $txt =~ s/\n{2,}/\n/g; $txt =~ s/[ \t]{2,}/ /g;
    # reflow: junta linhas que nao comecam com marcador de dispositivo
    my @out;
    foreach my $ln (split /\n/, $txt) {
      $ln = norm_ws($ln); next unless length $ln;
      if (!@out or $ln =~ /^(§|Parágrafo único|[IVXL]+\s*[-–—]|[a-z]\)|\d+\.|[A-Z]{2,}\b.*:$)/) { push @out, $ln; }
      else { $out[-1] .= ' ' . $ln; }
    }
    $it->{t} = join("\n", @out);
    $it->{n} = join(' ', map { norm_ws($_) } @notes);
    delete $it->{n} unless length $it->{n};
    delete $it->{s} unless length($it->{s}//'');
  }
  return [ grep { length $_->{t} } @items ];
}

sub clean_pdf_text {
  my ($txt,$opt)=@_;
  $opt ||= {};
  my @raw = split /\n/, $txt;
  # cabecalhos/rodapes repetidos
  my %freq; $freq{norm_ws($_)}++ for grep { length } @raw;
  my @lines; my @foot;
  for (my $i=0; $i<@raw; $i++) {
    my $l = norm_ws($raw[$i]);
    next if $l eq '';
    next if $freq{$l} >= 6 and length($l) < 110 and $l !~ /^Art\./ and $l !~ /^§/;
    next if $l =~ /^\d{1,3}$/ and !($raw[$i+1] and $raw[$i+1] =~ /^\s*(Ver|Alterad|Inserid|Revogad|Renumerad|Redação|Acrescentad|Vide|Nova reda|Inclu|Suprimid|Modificad|Republicad)/i);
    if ($l =~ /^\d{1,3}$/) { # rodape: numero seguido de nota
      my $note = '';
      my $j = $i+1;
      while ($j<@raw and $raw[$j] !~ /^\s*$/) { $note .= ' ' . norm_ws($raw[$j]); $j++; }
      $i = $j;
      push @lines, "(Ver ) " if 0;
      push @lines, '(' . norm_ws($note) . ')' if $opt->{keepnotes};
      next;
    }
    push @lines, $l;
  }
  return \@lines;
}

sub chunk_paragraphs {
  my ($lines,$max)=@_; $max ||= 1600;
  my @chunks; my $buf=''; my $n=0;
  foreach my $l (@$lines) {
    if (length($buf)+length($l) > $max and length($buf) > 300) { $n++; push @chunks, { r=>"Trecho $n", t=>$buf }; $buf=''; }
    if ($l =~ /^(\d+(\.\d+)*\.?\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][^.]{3,80}|[A-ZÁÉÍÓÚÂÊÔÃÕÇ ]{8,80})$/ and length($buf) > 300) { $n++; push @chunks, { r=>"Trecho $n", t=>$buf }; $buf=''; }
    $buf .= ($buf eq '' ? '' : ' ') . $l;
  }
  if (length $buf) { $n++; push @chunks, { r=>"Trecho $n", t=>$buf }; }
  return \@chunks;
}

my @docs;
sub add_doc { my ($meta,$items)=@_; $meta->{itens}=$items; push @docs, $meta; printf STDERR "%-12s %4d itens\n", $meta->{id}, scalar @$items; }

# 1. Estatuto
add_doc({ id=>'eaoab', sigla=>'EAOAB', titulo=>'Estatuto da Advocacia e da OAB — Lei nº 8.906/1994', esfera=>'nacional', tipo=>'Lei federal',
  fonte=>'Planalto (texto compilado, consultado em 18/09/2026) — inclui as Leis 13.688/2018, 14.365/2022 e 14.612/2023; a nota "Vide ADI 7020" acompanha o texto oficial',
  destaque=>1 }, parse_eaoab_html());

# 2. CED
{ my $t = slurp("$SP/normas/CodEticaDisciplina.txt");
  add_doc({ id=>'ced', sigla=>'CED', titulo=>'Código de Ética e Disciplina da OAB — Resolução CFOAB nº 02/2015', esfera=>'nacional', tipo=>'Resolução CFOAB',
    fonte=>'Arquivo da pasta NORMAS do TED (versão com as alterações da Res. 04/2020 — TAC, arts. 47-A e 58-A)', destaque=>1 },
    parse_articles(clean_pdf_text($t)) ); }

# 3. Regulamento Geral
{ my $t = slurp("$SP/normas/RegulamentoGeral.txt");
  add_doc({ id=>'rg', sigla=>'RG', titulo=>'Regulamento Geral do Estatuto da Advocacia e da OAB', esfera=>'nacional', tipo=>'Resolução CFOAB',
    fonte=>'Arquivo da pasta NORMAS do TED (versão anotada) — conferir alterações posteriores no site do CFOAB', destaque=>1 },
    parse_articles(clean_pdf_text($t)) ); }

# 4. Provimento 200/2020
{ my $t = slurp("$SP/normas/PROVIMENTO 200-2020 (TAC).txt");
  my $l = clean_pdf_text($t);
  @$l = grep { $_ !~ /^\d{2}\/\d{2}\/\d{2}, / and $_ !~ /^https?:/ } @$l;
  add_doc({ id=>'prov200', sigla=>'Prov. 200/2020', titulo=>'Provimento CFOAB nº 200/2020 — Termo de Ajustamento de Conduta (TAC)', esfera=>'nacional', tipo=>'Provimento CFOAB',
    fonte=>'Arquivo da pasta NORMAS do TED (DEOAB 03/11/2020)', destaque=>1 }, parse_articles($l)); }

# 5. Manual de Procedimentos (CFOAB 2023)
{ my $t = slurp("$SP/normas/Manual de Procedimentos do Processo Disciplinar.txt");
  my $l = clean_pdf_text($t);
  add_doc({ id=>'manual', sigla=>'Manual PED', titulo=>'Manual de Procedimentos do Processo Ético-Disciplinar — CFOAB (2023)', esfera=>'nacional', tipo=>'Manual',
    fonte=>'Arquivo da pasta NORMAS do TED' }, chunk_paragraphs($l, 1500)); }

# 6. RI TED 2024 (OCR)
{ my $t = slurp("$SP/normas/NOVO_RI_TED_ocr.txt");
  $t =~ s/^=====PAGINA \d+=====\n//mg;
  $t =~ s/^.*?(DISPOSIÇÃO INICIAL)/$1/s;
  my @l = grep { length } map { norm_ws($_) } split /\n/, $t;
  @l = grep { $_ !~ /^(07\/01\/2025|Diário Eletrônico OAB|DIÁRIO ELETRÔNICO|Ordem dos Advogados do Brasil|Ano VI N|https?:\/\/deoab)/i and $_ !~ /^\d+\/18$/ } @l;
  add_doc({ id=>'ri_ted_2024', sigla=>'RI-TED/MG 2024', titulo=>'Regimento Interno do TED da OAB/MG — Resolução nº 04-CP/2024', esfera=>'MG', tipo=>'Resolução do Conselho Seccional',
    fonte=>'DEOAB 20/12/2024, p. 153 ss. (texto obtido por OCR do PDF da pasta NORMAS — conferir numeração de artigos e incisos no original)', destaque=>1 },
    parse_articles(\@l, {ocr=>1}) ); }

# 7. RI TED 2019
{ my $t = slurp("$SP/normas/regimento_interno_ted_2019 (RESOLUÇÃO 0001-2019).txt");
  add_doc({ id=>'ri_ted_2019', sigla=>'RI-TED/MG 2019', titulo=>'Regimento Interno do TED da OAB/MG — Resolução nº 001/2019 (versão anterior)', esfera=>'MG', tipo=>'Resolução do Conselho Seccional',
    fonte=>'Arquivo da pasta NORMAS do TED — mantido para consulta histórica; o vigente é a Res. 04-CP/2024' },
    parse_articles(clean_pdf_text($t)) ); }

# 8. RI OAB/MG 2021
{ my $t = slurp("$SP/normas/Regimento Interno com indice.txt");
  my $l = clean_pdf_text($t);
  add_doc({ id=>'ri_oabmg', sigla=>'RI-OAB/MG', titulo=>'Regimento Interno da OAB/MG — Resolução nº 02/2021', esfera=>'MG', tipo=>'Resolução do Conselho Seccional',
    fonte=>'Arquivo da pasta NORMAS do TED' }, parse_articles($l)); }

# 9. RI Corregedoria 2019
{ my $t = slurp("$SP/normas/regimento_interno_corregedoria_2019.txt");
  add_doc({ id=>'ri_corr', sigla=>'RI-Corregedoria/MG', titulo=>'Regimento Interno da Corregedoria-Geral da OAB/MG — Resolução nº 002/2019', esfera=>'MG', tipo=>'Resolução do Conselho Seccional',
    fonte=>'Arquivo da pasta NORMAS do TED' }, parse_articles(clean_pdf_text($t))); }

# 10. Portarias (pandemia)
add_doc({ id=>'port_pandemia', sigla=>'Portarias 2020', titulo=>'OAB/MG — Portarias da pandemia (suspensão de prazos e de expediente)', esfera=>'MG', tipo=>'Portaria',
  fonte=>'Portaria Conjunta 001/2020 (transcrita por OCR do PDF) e Portaria 85/2020 (arquivos da pasta NORMAS); Portaria 90/2020 e Portaria Conjunta 134/2020 constam apenas como notícia do site da OAB/MG — conferir o texto oficial', destaque=>1 },
  [
   { r=>'Portaria Conjunta PRESI/CAD-TED/ÓRGÃO ESPECIAL/CGD nº 001/2020 — art. 1º', t=>"Ficam suspensos a partir de 16/03/2020 e até o dia 31 de março de 2020 todos os prazos nos processos de qualquer natureza em curso perante a OAB/MG.\n§ 1º Os prazos que se iniciarem ou encerrarem nesse período voltarão a fluir ou se encerrarão no primeiro dia útil seguinte ao período da suspensão ora determinada.\n§ 2º As intimações porventura ocorridas durante a suspensão, via DEOAB ou correios, serão consideradas realizadas no primeiro dia útil seguinte ao período da suspensão ora determinada.", n=>'Belo Horizonte, 19/03/2020. Considera a Resolução CFOAB 006/2020 (16/03/2020).' },
   { r=>'Portaria Conjunta 001/2020 — arts. 2º a 4º', t=>"Art. 2º Ficam suspensos, até 31 de março de 2020, os atendimentos presenciais no Tribunal de Ética e Disciplina, na Comissão de Admissibilidade e Instrução e na Comissão de Execução de Julgados. Parágrafo único. O atendimento durante a suspensão dar-se-á, sempre que possível, por meio eletrônico.\nArt. 3º O prazo de suspensão poderá ser prorrogado, conforme se verifiquem a continuidade ou agravamento das condições que o justificam.\nArt. 4º Esta portaria entra em vigor na data de sua assinatura." },
   { r=>'Portaria nº 85/2020 (OAB/MG) — Triênio 2019-2021', t=>"Prorroga a vigência da Portaria nº 83/2020, suspendendo o expediente na OAB/MG no período de 30 de março a 3 de abril de 2020; e prorroga, por igual período, o prazo disposto na Portaria Conjunta PRESI/CAD-TED/ÓRGÃO ESPECIAL/CGD nº 001/2020, que dispõe sobre os prazos nos processos em andamento perante a OAB/MG em face das medidas de contenção do coronavírus (Covid-19).", n=>'Belo Horizonte, 27/03/2020 — Raimundo Cândido Júnior, Presidente.' },
   { r=>'Portaria nº 90/2020 (OAB/MG) — informação de notícia oficial', t=>"Notícia do site da OAB/MG: \"Prorrogada a suspensão dos prazos processuais da OAB Minas até 31 de maio\" — suspensão dos prazos nos processos de qualquer natureza em curso perante a OAB/MG (inclui TED). O texto integral da portaria não consta da pasta NORMAS: conferir no DEOAB antes de usar em peça ou voto.", n=>'Fonte secundária — conferir.' },
   { r=>'Portaria Conjunta nº 134/2020 (OAB/MG) — informação de notícia oficial', t=>"Notícia do site da OAB/MG: \"Prazos dos processos administrativos da OAB Minas ficam suspensos até agosto\" — prorrogação da suspensão até 03/08/2020. O texto integral da portaria não consta da pasta NORMAS: conferir no DEOAB antes de usar em peça ou voto.", n=>'Fonte secundária — conferir.' },
  ]);

# 11. Sumulas CFOAB (em texto)
{ my @s;
  my $sm = "$SP/sumulas";
  my @meta = (
    ['Súmula 08/2019/COP','COP','Processo de exclusão — instrução e julgamento', "$SP/normas/Súmula 08 - 2019 - CFOAB (EXCLUSÃO).txt"],
    ['Súmula 01/2007/OEP','OEP','Nulidade — matéria ético-disciplinar — órgão julgador', "$sm/s1.txt"],
    ['Súmula 08/2016/OEP','OEP','Execução de sanção ético-disciplinar — competência', "$sm/s2.txt"],
    ['Súmula 12/2022/OEP','OEP','Ausência de parecer preliminar (CED 59, §7º) gera nulidade relativa', "$sm/s3.txt"],
    ['Súmula 13/2022/OEP','OEP','Interrupção da prescrição', "$sm/s4.txt"],
    ['Súmula 15/2023/OEP','OEP','Retenção abusiva de autos', "$sm/s5.txt"],
    ['Súmula 18/2023/OEP','OEP','Conversão da censura em advertência', "$sm/s6.txt"],
    ['Súmula 19/2023/OEP','OEP','Termo de Ajustamento de Conduta — de ofício ou a requerimento', "$sm/s7.txt"],
    ['Súmula 21/2024/OEP','OEP','Exclusão — período depurador', "$sm/s8.txt"],
  );
  foreach my $m (@meta) {
    my $t = slurp($m->[3]); my @l = grep { length } map { norm_ws($_) } split /\n/, $t;
    my $full = join(' ', @l);
    my ($enun) = $full =~ /enunciado[:,]?\s*[“"](.*?)[”"]\s*\.?\s*(?:Bras[ií]lia|$)/i;
    $enun = $full unless $enun;
    push @s, { r=>$m->[0], t=>$enun, n=>$m->[2] };
  }
  add_doc({ id=>'sumulas', sigla=>'Súmulas CFOAB', titulo=>'Súmulas do Conselho Federal da OAB em matéria ético-disciplinar (COP e OEP)', esfera=>'nacional', tipo=>'Súmulas',
    fonte=>'COP 08/2019: arquivo da pasta NORMAS. OEP: PDFs oficiais em oab.org.br/jurisprudencia/sumulas (consultado em 18/09/2026)', destaque=>1 }, \@s); }

open(my $o,'>:utf8',$OUT) or die; print $o "/* Gerado automaticamente — legislação pública (Estatuto, CED, RG, Regimentos, Provimentos, Súmulas). Sem dados de processos. */\nwindow.TED_LEGIS = " . $json->encode(\@docs) . ";\n"; close $o;
print STDERR "escrito $OUT\n";
