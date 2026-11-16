# Calendário Villains — Migração para API Vercel (Spark)

## Arquivos

Copie os arquivos deste ZIP para a raiz do repositório, mantendo as pastas `api/` e `src/`. Os arquivos `functions/` antigos não são mais utilizados pelo frontend; podem ser removidos após validar a migração.

## 1. Instalar dependências

No PowerShell, na raiz do projeto:

```powershell
npm install
```

Esse comando também atualiza o `package-lock.json` com `firebase-admin`. Envie **package.json e package-lock.json** juntos ao GitHub.

## 2. Variáveis na Vercel

Em Project > Settings > Environment Variables, mantenha as seis variáveis `VITE_FIREBASE_*` existentes e adicione as seguintes **apenas na Vercel**:

- `FIREBASE_PROJECT_ID`: `calendario-villains`
- `FIREBASE_CLIENT_EMAIL`: `client_email` do JSON da conta de serviço Firebase
- `FIREBASE_PRIVATE_KEY`: `private_key` do mesmo JSON (incluindo BEGIN/END PRIVATE KEY). Se salvar em uma linha, use `\n` para as quebras.
- `VILLAINS_OWNER_UID`: UID da conta original do Chico (194) no Firebase Authentication, **não o número 194**.

A conta de serviço pode ser encontrada no Console Firebase > Configurações do projeto > Contas de serviço > Gerar nova chave privada. Guarde o JSON em local seguro; **nunca** publique no GitHub, no `public/` ou em variáveis `VITE_`.

Depois de salvar as variáveis, faça um novo deployment na Vercel.

## 3. Autorização e segurança

A API `/api/administrators` exige token Firebase em todas as chamadas, verifica a existência do administrador no Firestore e valida a permissão no servidor.

- Todos os administradores: listar, cadastrar e excluir outros administradores comuns.
- Somente o UID principal, com e-mail de autenticação `194@admins.villains.invalid`: editar dados/senhas de outros administradores.
- Cada administrador: editar seus próprios dados e senha (a senha própria usa Firebase Auth).
- Ninguém: excluir a conta principal ou a própria conta pela API.

O cadastro também atribui a claim `admin: true` para permitir que o novo administrador gerencie eventos e categorias pelas regras atuais do Firestore. Após receber a claim, pode ser necessário sair e entrar novamente para renovar o token.

## 4. Testar

**Importante:** `npm run dev` executa somente o Vite e não hospeda as rotas `/api`. Para testar a API localmente, instale a CLI da Vercel e execute `vercel dev` (com projeto vinculado e variáveis configuradas), ou teste diretamente no endereço publicado da Vercel.

Teste: login 194, listagem, cadastro de um administrador de teste, primeiro acesso, edição do perfil, edição exclusiva do Chico, remoção de um administrador de teste e calendário público sem login.

## 5. Publicar

```powershell
git add .
git commit -m "Migra gerenciamento de administradores para API Vercel"
git push
```

Não execute `firebase deploy --only functions`: essa etapa não é mais necessária. O Firestore e o Authentication continuam no Spark.

## Observações

- A atualização não foi testada com credenciais reais; valide os fluxos em produção após configurar as variáveis.
- Se a Vercel apresentar erro de build, execute `npm install` localmente, confirme que o lockfile foi atualizado e envie-o ao GitHub.
- A API utiliza o Firebase Admin SDK **somente no servidor**; credenciais de serviço nunca devem ir ao navegador.
