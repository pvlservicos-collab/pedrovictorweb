# TitaCRM

CRM multicanal (WhatsApp/Instagram) multi-tenant. Next.js 15 + React 19, Drizzle ORM
sobre Postgres, NextAuth v5, Pusher, Vercel Blob.

## Rodando localmente

```bash
npm install
npm run dev
```

Preencha `.env.local` com as credenciais do seu ambiente (banco, NextAuth, Pusher,
Vercel Blob — ver `CLAUDE.md` pra detalhes de arquitetura específicos deste projeto).

## Build

```bash
npm run type-check
npm run build
```

## Deploy (pedrovictorweb.com.br/crm)

O CRM roda com `basePath: '/crm'` (ver `src/lib/base-path.ts`) num projeto proprio
na Vercel, e o projeto do site repassa `/crm/*` pra ele (`vercel.json` da raiz do repo).

1. Projeto na Vercel com o nome **pvl-crm** (Root Directory = `crm`, Framework = Next.js).
   Se o nome for outro, troque `pvl-crm.vercel.app` no `vercel.json` da raiz.
2. Variaveis de ambiente, alem das de banco/Pusher/VAPID/Meta:
   - `CRM_BASIC_USER` / `CRM_BASIC_PASS`: senha do navegador na porta. Sem elas o CRM responde 503.
   - `LOGIN_AUTOMATICO_EMAIL` / `LOGIN_AUTOMATICO_SENHA`: usuario que a entrada automatica loga.
   - `AUTH_SECRET`
   - `AUTH_URL=https://pedrovictorweb.com.br/crm/api/auth`
   - `NEXT_PUBLIC_APP_URL=https://pedrovictorweb.com.br/crm`
3. Webhooks da Meta/Evolution/Z-API passam a ser `https://pedrovictorweb.com.br/crm/api/webhooks/...`.
