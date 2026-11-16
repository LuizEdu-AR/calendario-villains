# Calendário Villains

Calendário público e painel de administração da fraternidade Villains (GTA V RP / FiveM).

## Tecnologias

React + Vite, Firebase Authentication, Cloud Firestore e deploy na Vercel.

## Executar localmente

1. Instale Node.js 20.19+ ou 22+.
2. Execute `npm install`.
3. Copie `.env.example` para `.env` e preencha as variáveis do Firebase.
4. Execute `npm run dev`.
5. Abra o endereço mostrado pelo Vite.

Sem Firebase configurado, o site abre com calendário vazio, mas não permite salvar eventos ou entrar como administrador.

## Configurar Firebase

1. Crie um projeto no console Firebase.
2. Ative **Authentication > Sign-in method > Email/Password**.
3. Crie um usuário administrativo em **Authentication > Users**.
4. Crie um banco **Cloud Firestore**.
5. Publique as regras de `firestore.rules` no console ou com `firebase deploy --only firestore:rules` (requer Firebase CLI e projeto selecionado).
6. No Firestore, crie a coleção `admins` e um documento com ID **exatamente igual ao UID do usuário criado**. O conteúdo pode ser `{ "role": "admin" }`. A coleção `admins` não permite escrita pelo cliente, para evitar autopromoção de privilégios.
7. Acesse `/login`, entre com o e-mail e a senha criados, abra `/admin` e clique em **Categorias > Cadastrar categorias iniciais ausentes**.

Não compartilhe suas credenciais nem coloque chaves privadas de serviço no frontend. As variáveis `VITE_FIREBASE_*` são configuração pública do aplicativo; a proteção dos dados depende das regras do Firestore.

## Deploy na Vercel

1. Envie a pasta do projeto para um repositório Git.
2. Importe o repositório na Vercel, com framework **Vite**.
3. Configure as mesmas variáveis `VITE_FIREBASE_*` no projeto da Vercel.
4. Faça o deploy. O arquivo `vercel.json` permite abrir `/login` e `/admin` diretamente.
5. No Firebase Authentication, inclua o domínio da Vercel em **Authorized domains** se necessário.

## Estrutura

- `src/components/`: peças reutilizáveis da interface.
- `src/contexts/`: autenticação e dados compartilhados.
- `src/pages/`: calendário público, login e administração.
- `src/services/`: configuração e operações Firebase.
- `src/utils/`: funções de data e status.
- `src/styles/`: estilo global.
- `public/`: logos oficiais fornecidas.

## Modelo de dados

`categories`: `{ name, color }`.

`events`: `{ title, description, categoryId, startDate, endDate, startTime, endTime, allDay, status }`.

Datas usam `YYYY-MM-DD`; horários usam `HH:mm` no fuso de Brasília. `status` aceita `scheduled`, `completed` ou `cancelled`.

## Funcionalidades

- Leitura pública, sem login, em modos Mês e Lista.
- Filtro por categoria, eventos do mês e detalhes ao passar o mouse.
- Modal de evento e link para adicionar ao Google Agenda.
- Administração restrita por autenticação e documento `admins/{uid}`.
- Criar, editar e excluir eventos e categorias.
- Calendário compacto e busca no painel administrativo.

## Observações

- A lista inicial de categorias é cadastrada pelo administrador para evitar escrita pública no banco.
- Não há dados fictícios inseridos na base de produção.
- Exclusão de categoria com eventos vinculados é bloqueada pela interface; em produção, para consistência sob concorrência, considere reforçar essa regra por backend confiável.
- O link do Google Agenda usa o fuso `America/Sao_Paulo`.

## Autenticação por ID e administradores (atualização)

- O login usa um ID numérico, convertido internamente em e-mail técnico (`ID@admins.villains.invalid`) para o Firebase Authentication. O usuário nunca precisa digitar e-mail.
- Para iniciar a conta principal, instale `firebase-admin` localmente (`npm install --no-save firebase-admin`) e configure `GOOGLE_APPLICATION_CREDENTIALS` com o caminho absoluto de uma chave de conta de serviço do seu projeto Firebase, além de `VILLAINS_INITIAL_PASSWORD` com a senha inicial desejada. Execute `node scripts/bootstrap-admin.cjs` na raiz do projeto. **Não inclua a chave nem a senha no repositório ou na Vercel.**
- Para que administradores possam cadastrar, editar e excluir outros administradores, instale as dependências de `functions/` e implante as Cloud Functions com `firebase deploy --only functions` (é necessário um plano Firebase compatível com Cloud Functions). Implante também as regras atualizadas: `firebase deploy --only firestore:rules`.
- Ative o provedor **E-mail/senha** no Firebase Authentication. As contas são criadas exclusivamente no backend com Firebase Admin SDK. Não há cadastro público de administradores.
- Senhas têm mínimo de **6 caracteres**, exigência mínima do Firebase Authentication. Não exigimos maiúsculas ou caracteres especiais.
- Novos administradores recebem uma modal opcional de mudança de senha no primeiro acesso. O botão “Agora não” encerra a apresentação da modal sem alterar a senha.
- O login não estará disponível até a configuração do Firebase. Nenhuma credencial real está incluída no código-fonte.
