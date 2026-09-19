# TED · Julgamentos

Painel de julgamentos do Tribunal de Ética e Disciplina da OAB/MG (1ª Turma Regional — Triângulo Mineiro).
Sistema **independente**, com login próprio e **projeto Firebase próprio**. Site estático (GitHub Pages) + Firebase Auth/Firestore.

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

## Configuração (uma vez) — projeto Firebase próprio
1. **Criar o projeto:** https://console.firebase.google.com → *Adicionar projeto* → nome `ted-julgamentos` (Google Analytics pode ficar desligado).
2. **Authentication** → *Começar* → *Método de login* → **E-mail/senha** → ativar → salvar.
3. **Authentication → Settings → Authorized domains** → *Add domain* → `jowjow007.github.io`.
4. **Firestore Database** → *Criar banco de dados* → local `southamerica-east1` (São Paulo) → **modo de produção**.
5. **Firestore → Regras:** apague o conteúdo, cole as regras abaixo, troque o e-mail do dono e clique em *Publicar*.
6. **⚙ Configurações do projeto → Seus apps → Web (`</>`)** → registrar o app → copie o `firebaseConfig` para `firebase-config.js` (commit e push).
7. Abra o site → **Primeiro acesso? Criar senha** com o e-mail do dono → confirme o e-mail recebido → entre.
8. Aba **Acesso** → libere os colegas → **Importar dados** com o `TED-importacao.json`.

### Regras do Firestore
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // >>> TROQUE pelo e-mail do DONO do sistema (o mesmo que você usará para entrar), em minúsculas <<<
    function isOwner() {
      return request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email.lower() == 'troque-por-seu-email@exemplo.com';
    }
    function tedListed() {
      return exists(/databases/$(database)/documents/tedUsuarios/$(request.auth.token.email.lower()));
    }
    function tedOk() {
      return request.auth != null && (isOwner() ||
        (request.auth.token.email_verified == true && tedListed()));
    }
    function tedAdmin() {
      return request.auth != null && (isOwner() ||
        (request.auth.token.email_verified == true && tedListed() &&
         get(/databases/$(database)/documents/tedUsuarios/$(request.auth.token.email.lower())).data.papel == 'admin'));
    }

    // usado pelo app para saber se quem entrou é administrador
    match /tedAdmin/{id} { allow read: if tedAdmin(); }

    match /tedUsuarios/{email} {
      allow read: if tedOk() || (request.auth != null && request.auth.token.email.lower() == email);
      allow write: if tedAdmin();
    }
    match /tedProcessos/{id} { allow read: if tedOk(); allow write: if tedAdmin(); }
    match /tedMeus/{id}      { allow read: if tedOk(); allow write: if tedAdmin(); }
    match /tedVotos/{id}     { allow read: if tedOk(); allow write: if tedAdmin(); }
    match /tedNotas/{uid}/itens/{id} {
      allow read, write: if tedOk() && request.auth.uid == uid;
    }
  }
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
