# Ferramentas de geração (uso local — Perl)

Geram os arquivos **públicos** `data/legislacao.js` e `data/ementario.js` a partir das normas da pasta NORMAS do TED
(texto extraído com `pdftotext`; o Regimento Interno de 2024 foi lido por OCR do Windows) e do Estatuto no Planalto.

    export SP=<pasta com normas/ e l8906.htm>  OUT=data/legislacao.js  && perl build_legis.pl
    export SP=<pasta com normas/>              OUT=data/ementario.js   && perl build_ementas.pl

Dados de processos NUNCA passam por aqui: eles ficam em `ted-dados-privados/` (ignorado pelo Git) e vão ao Firestore pela aba **Acesso**.
