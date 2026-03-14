# AuditChek Angola - Sistema de Auditoria e Contabilidade

Este é um sistema completo de contabilidade e auditoria adaptado ao PGC Angola.

## Tecnologias
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express
- **Base de Dados**: SQLite (Desenvolvimento) / Recomendado PostgreSQL ou Firebase para Produção
- **Autenticação**: JWT (JSON Web Tokens)

## Como Replicar no GitHub e Vercel

### 1. GitHub
1. Crie um novo repositório no GitHub.
2. Inicialize o git localmente: `git init`.
3. Adicione os ficheiros: `git add .`.
4. Commit: `git commit -m "Initial commit"`.
5. Adicione o remote e faça push para o seu repositório.

### 2. Vercel
O projeto já inclui um ficheiro `vercel.json` configurado.

**Nota Importante sobre Persistência:**
O Vercel utiliza um sistema de ficheiros efémero. O SQLite (`auditchek.db`) não persistirá os dados entre reinícios das funções serverless.
Para produção no Vercel, recomenda-se:
- Utilizar o **Vercel Postgres** ou **Neon**.
- Ou migrar para **Firebase** (Firestore).

**Configuração de Variáveis de Ambiente no Vercel:**
- `JWT_SECRET`: Uma string aleatória e segura para assinar os tokens.
- `SUPER_ADMIN_EMAIL`: O seu email para ter acesso total (ex: `luisarion33@gmail.com`).

## Instalação Local
1. `npm install`
2. `npm run dev`

O servidor iniciará na porta 3000.
