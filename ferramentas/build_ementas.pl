#!/usr/bin/perl
# Extrai ementas disciplinares do Diario Eletronico da OAB (CFOAB) -> data/ementario.js
use strict; use warnings; use utf8;
use Encode qw(decode);
use JSON::PP;
binmode(STDOUT,':utf8');
my $SP=$ENV{SP}; my $OUT=$ENV{OUT};
my $json = JSON::PP->new->utf8(0)->canonical(1);
sub slurp { my ($f)=@_; open(my $fh,'<:raw',$f) or die "$f: $!"; local $/; my $c=<$fh>; close $fh; return decode('UTF-8',$c); }

my @files = (
  ['Ementas - diario-eletronico-oab-13-03-2026.txt', 'DEOAB de 13/03/2026'],
  ['Ementas - diario-eletronico-oab-07-04-2026.txt', 'DEOAB de 07/04/2026'],
);
my %meses = (janeiro=>1,fevereiro=>2,'março'=>3,abril=>4,maio=>5,junho=>6,julho=>7,agosto=>8,setembro=>9,outubro=>10,novembro=>11,dezembro=>12);
my @out; my %seen;
foreach my $f (@files) {
  my $t = slurp("$SP/normas/$f->[0]");
  my @lines = split /\n/, $t;
  my @keep;
  foreach my $l (@lines) {
    $l =~ s/^\s+|\s+$//g;
    next if $l eq '';
    next if $l =~ /^Documento assinado digitalmente/; next if $l =~ /^instituiu a Infraestrutura/;
    next if $l =~ /\| P[aá]gina: ?\d+/i; next if $l =~ /^Ano [IVX]+ N\.?º/;
    push @keep, $l;
  }
  my $s = join(' ', @keep); $s =~ s/\s+/ /g;
  while ($s =~ /((?:RECURSO|Recurso|Embargos de Declara[çc][ãa]o)[^\.]{0,30}?n\.\s*[\d\.\/A-Za-z-]+\.?)\s*(.{0,900}?)EMENTA N\.\s*(\d+)\/(\d{4})\/([A-Z]+(?:-[A-Z]+)?)\.\s*(.*?)\s*Acórdão:\s*(.{0,900}?)(?:Bras[ií]lia,\s*(\d{1,2})\s*de\s*(\w+)\s*de\s*(\d{4}))/g) {
    my ($rec,$pre,$num,$ano,$org,$body,$acord,$d,$m,$y) = ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);
    next unless $body =~ /DISCIPLIN|[ÉE]TIC|EXCLUS|CENSURA|SUSPENS|CED|PRESCRI|EAOAB/i;
    my ($relator) = $pre =~ /Relator(?:a)?:\s*(?:Conselheir[oa] Federal\s*)?(.*?)(?:\s*\(\w{2}\))?(?:\.|$)/;
    $relator = '' unless defined $relator; $relator =~ s/\s*\(\w{2}\)\s*$//;
    my $id = sprintf('Ementa %03d/%s/%s', $num, $ano, $org);
    next if $seen{$id}++;
    my ($cab,$corpo) = $body =~ /^(.*?[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{3,}\.)\s+(1\).*)$/;
    ($cab,$corpo) = ($body,'') unless $corpo;
    my $data = sprintf('%04d-%02d-%02d', $y, $meses{lc $m}||0, $d);
    my $turma = $acord =~ /(Primeira|Segunda|Terceira) Turma da Segunda Câmara/ ? "$1 Turma da Segunda Câmara" : ($acord =~ /Órgão Especial/ ? 'Órgão Especial' : ($acord =~ /Conselho Pleno/ ? 'Conselho Pleno' : 'Conselho Federal'));
    my $full = "$cab $corpo";
    my @tags;
    push @tags, 'prescrição' if $full =~ /PRESCRI/i;
    push @tags, 'prescrição intercorrente' if $full =~ /intercorrente/i;
    push @tags, 'constatação oficial' if $full =~ /constata[çc][ãa]o oficial/i;
    push @tags, 'nulidade' if $full =~ /NULIDADE/i;
    push @tags, 'notificação/citação' if $full =~ /NOTIFICA[ÇC]|CITA[ÇC]/i;
    push @tags, 'defensor dativo' if $full =~ /DEFENSOR DATIVO/i;
    push @tags, 'revelia' if $full =~ /REVELIA|revel/i;
    push @tags, 'razões finais' if $full =~ /RAZ[ÕO]ES FINAIS/i;
    push @tags, 'parecer preliminar' if $full =~ /PARECER PRELIMINAR/i;
    push @tags, 'cerceamento de defesa' if $full =~ /CERCEAMENTO|AMPLA DEFESA|CONTRADIT/i;
    push @tags, 'TAC' if $full =~ /\bTAC\b|AJUSTAMENTO DE CONDUTA/i;
    push @tags, 'honorários' if $full =~ /HONOR[ÁA]RIOS/i;
    push @tags, 'captação/publicidade' if $full =~ /CAPTA[ÇC]|PUBLICIDADE|MERCANTILIZA/i;
    push @tags, 'retenção de autos' if $full =~ /RETEN[ÇC][ÃA]O.*AUTOS|AUTOS.*RETEN/i;
    push @tags, 'sigilo profissional' if $full =~ /SIGILO PROFISSIONAL/i;
    push @tags, 'prestação de contas' if $full =~ /PRESTA[ÇC][ÃA]O DE CONTAS/i;
    push @tags, 'abandono da causa' if $full =~ /ABANDONO/i;
    push @tags, 'conflito de interesses' if $full =~ /INTERESSES CONFLITANTES|CONFLITO DE INTERESSES/i;
    push @tags, 'exclusão' if $full =~ /EXCLUS[ÃA]O/i;
    push @tags, 'suspensão' if $full =~ /SUSPENS[ÃA]O/i;
    push @tags, 'censura' if $full =~ /CENSURA/i;
    push @tags, 'revisão' if $full =~ /REVIS[ÃA]O/i;
    push @out, { id=>$id, orgao=>$turma, recurso=>$rec, relator=>$relator, data=>$data, fonte=>$f->[1], cabecalho=>$cab, corpo=>$corpo, tags=>\@tags };
  }
}
@out = sort { $b->{data} cmp $a->{data} or $a->{id} cmp $b->{id} } @out;
printf STDERR "%d ementas\n", scalar @out;
open(my $o,'>:utf8',$OUT) or die; print $o "/* Ementário do CFOAB — ementas disciplinares extraídas do Diário Eletrônico da OAB (13/03/2026 e 07/04/2026). Partes identificadas apenas por iniciais na fonte. */\nwindow.TED_EMENTAS = " . $json->encode(\@out) . ";\n"; close $o;
