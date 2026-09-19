# TED · Julgamentos

Painel de julgamentos do Tribunal de Ética e Disciplina da OAB/MG (1ª Turma Regional — Triângulo Mineiro).
Sistema **independente**, com login próprio. Site estático (GitHub Pages) + Firebase Auth/Firestore.

**Endereço:** https://jowjow007.github.io/ted-julgamentos/

## Abas
| Aba | O que faz |
|---|---|
| Julgadores | Um bloco por relator → blocos dos processos (partes, infração em ≤4 palavras, artigo, punível?, sanção) → papeleta e análise completa |
| Meus processos | Processos em que o usuário é relator (cadastro e edição) |
| Legislação | Estatuto, CED, Regulamento Geral, Prov. 200/2020, súmulas do CFOAB, regimentos do TED e da OAB/MG, portarias da pandemia e ementário do CFOAB — com busca |
| Calculadora | Prescrição (EAOAB art. 43) com suspensões, prazos em dias úteis, prescrição/decadência civil e tabela de prazos |
| Meus entendimentos | Busca nos votos do usuário, no ementário e nas súmulas |
| Acesso *(admin)* | Libera e-mails, importa os dados sigilosos e mostra as regras do banco |

## Confidencialidade
O repositório é **público**; processos disciplinares são sigilosos (EAOAB, art. 72, §2º). Por isso o código só contém legislação e catálogos.
Processos, votos e análises ficam no **Firestore**, atrás de login, e só são lidos por e-mails liberados e confirmados.
Os arquivos de dados ficam em `ted-dados-privados/` (ignorada pelo Git) e são enviados pela aba **Acesso → Importar dados**.

## Configuração (uma vez)
1. **Firebase Console → Firestore → Regras:** cole o bloco abaixo **dentro** de `match /databases/{database}/documents { … }`, ao lado das funções `isSignedIn()` e `isAdmin()` (este sistema usa o mesmo projeto Firebase do Portal Fonseca e Braga; **mantenha este bloco sempre que republicar as regras do projeto**) e clique em *Publicar*.
2. **Firebase Console → Authentication → Settings → Authorized domains:** confirme que `jowjow007.github.io` está na lista.
3. Entre com uma conta que seja administradora (`users/{uid}.role == 'admin'`) ou crie o primeiro registro em `tedUsuarios/{email}` com `papel: "admin"`.
4. Na aba **Acesso**, libere os colegas (e-mail); cada um cria a própria senha em "Primeiro acesso?" e confirma o e-mail.
5. Envie `TED-importacao.json` em **Acesso → Importar dados**.

```
    // ===== TED — Tribunal de Ética e Disciplina =====
    function tedListed() {
      return exists(/databases/$(database)/documents/tedUsuarios/$(request.auth.token.email.lower()));
    }
    function tedOk() {
      return isSignedIn() && (isAdmin() ||
        (request.auth.token.email_verified == true && tedListed()));
    }
    function tedAdmin() {
      return isSignedIn() && (isAdmin() ||
        (request.auth.token.email_verified == true && tedListed() &&
         get(/databases/$(database)/documents/tedUsuarios/$(request.auth.token.email.lower())).data.papel == 'admin'));
    }
    match /tedUsuarios/{email} {
      allow read: if tedOk() || (isSignedIn() && request.auth.token.email.lower() == email);
      allow write: if tedAdmin();
    }
    match /tedProcessos/{id} { allow read: if tedOk(); allow write: if tedAdmin(); }
    match /tedMeus/{id}      { allow read: if tedOk(); allow write: if tedAdmin(); }
    match /tedVotos/{id}     { allow read: if tedOk(); allow write: if tedAdmin(); }
    match /tedNotas/{uid}/itens/{id} {
      allow read, write: if tedOk() && request.auth.uid == uid;
    }
```

## Estrutura
```
index.html · app.css · firebase-config.js
js/        core (login, roteador), papeleta, views-* (uma por aba)
data/      legislacao.js, ementario.js, catalogo.js  (públicos)
ferramentas/  geradores (Perl) dos arquivos de data/
assets/    logo usado na papeleta
```
