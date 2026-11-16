# Calendário Villains

Sistema web de gerenciamento e visualização de eventos desenvolvido para a **Villains**, uma fraternidade do universo de GTA V Roleplay (FiveM).

O projeto tem como objetivo centralizar a programação da fraternidade em uma plataforma moderna, intuitiva e acessível, permitindo que membros e visitantes acompanhem reuniões, estudos, recrutamentos, aniversários e outros acontecimentos importantes.

A aplicação oferece um calendário público, sem necessidade de autenticação, e um painel administrativo exclusivo para usuários autorizados.

## Funcionalidades

### Calendário público

- Visualização de eventos nos formatos **Mês** e **Lista**.
- Navegação entre meses e datas.
- Filtragem de eventos por categorias.
- Identificação visual das categorias por cores.
- Exibição de detalhes ao passar o mouse sobre os dias.
- Modal com informações completas dos eventos.
- Integração para adicionar eventos ao Google Agenda.
- Identificação visual de eventos cujo horário de início já passou.
- Interface responsiva para computadores e dispositivos móveis.
- Acesso público, sem necessidade de cadastro ou login.

### Painel administrativo

Área restrita aos administradores da fraternidade, destinada ao gerenciamento do calendário.

**Gerenciamento de eventos**
- Cadastro de novos eventos.
- Edição de informações e horários.
- Exclusão de eventos.
- Organização por categorias e datas.
- Visualização dos eventos cadastrados.

**Gerenciamento de categorias**
- Cadastro de novas categorias.
- Edição de nomes e cores.
- Exclusão de categorias.
- Atualização das categorias exibidas no calendário público.

**Gerenciamento de administradores**
- Autenticação por ID e senha.
- Cadastro de administradores por usuários autorizados.
- Gerenciamento de contas administrativas.
- Senha provisória para novos administradores.
- Opção de alteração de senha no primeiro acesso.
- Controle de permissões para operações administrativas.

## Categorias iniciais

O sistema conta com oito categorias predefinidas:

- Reunião
- Estudo Villains
- Lore Interna
- Recrutamento
- Evento Interno
- Aniversário
- Evento Fraternidades
- Evento Cidade

As categorias são armazenadas no Firebase Firestore e podem ser gerenciadas pelo painel administrativo.

## Tecnologias utilizadas

| Tecnologia | Utilização |
|---|---|
| React.js | Desenvolvimento da interface |
| Vite | Ambiente de desenvolvimento e build |
| JavaScript | Lógica e funcionalidades |
| CSS | Estilização e responsividade |
| Firebase Firestore | Armazenamento dos eventos, categorias e dados administrativos |
| Firebase Authentication | Autenticação dos administradores |
| Firebase Admin SDK | Operações administrativas seguras no backend |
| Vercel | Hospedagem e disponibilização da aplicação |
| GitHub | Versionamento e gerenciamento do código-fonte |

## Arquitetura do projeto

O Calendário Villains utiliza uma arquitetura baseada em componentes reutilizáveis, com separação entre interface, páginas, serviços e lógica de negócio.

O **React** é responsável pela experiência do usuário, enquanto o **Firebase** fornece os serviços de autenticação e persistência dos dados.

As operações administrativas sensíveis são protegidas por verificações de permissão e funcionalidades de backend.

A organização do código prioriza legibilidade, manutenção e escalabilidade, permitindo a implementação de novas funcionalidades sem comprometer a estrutura existente.

## Instalação e execução

### Pré-requisitos

- Node.js
- npm
- Git
- Projeto configurado no Firebase

### Clonar o repositório

```bash
git clone https://github.com/LuizEdu-AR/calendario-villains.git
```

### Acessar o diretório

```bash
cd calendario-villains
```

### Instalar as dependências

```bash
npm install
```

### Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Preencha os campos com as credenciais de configuração da aplicação web fornecidas pelo Firebase Console.

As credenciais administrativas privadas não devem ser armazenadas nesse arquivo nem expostas ao frontend.

### Iniciar o ambiente de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível, por padrão, em:

```text
http://localhost:5173
```

### Gerar a versão de produção

```bash
npm run build
```

Os arquivos de produção serão gerados no diretório `dist`.

## Segurança

O projeto utiliza Firebase Authentication e regras de segurança do Firestore para controlar o acesso aos dados.

As informações públicas do calendário podem ser consultadas sem autenticação, enquanto operações de criação, edição e exclusão exigem permissões administrativas.

O gerenciamento de contas é realizado por mecanismos protegidos no backend, evitando a exposição de credenciais privilegiadas no navegador.

## Identidade visual

A interface foi desenvolvida com base na identidade visual da fraternidade Villains, utilizando uma paleta predominantemente escura, com detalhes em verde e dourado.

O design prioriza:

- Visual moderno e minimalista.
- Hierarquia clara das informações.
- Navegação simples e intuitiva.
- Uso moderado de ícones.
- Componentes consistentes e responsivos.
- Identidade própria, alinhada à fraternidade.

## Evolução do projeto

O Calendário Villains foi estruturado para permitir futuras expansões, incluindo novas páginas, ferramentas administrativas e funcionalidades de gerenciamento da fraternidade.

A proposta inicial é oferecer um calendário completo e funcional, mantendo uma base de código preparada para o crescimento da plataforma.

## Desenvolvedor

**Luiz Eduardo de A. Rodrigues**

GitHub: [@LuizEdu-AR](https://github.com/LuizEdu-AR)

---

© 2026 Villains. Todos os direitos reservados.

*Projeto desenvolvido para a Fraternidade Villains — GTA V Roleplay (FiveM).*