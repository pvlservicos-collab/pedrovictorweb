# pedrovictorweb

Site da PVL Webdesign (pedrovictorweb.com.br) e o CRM (pedrovictorweb.com.br/crm)
num app Next.js só, num projeto só na Vercel.

## Site

O site é HTML estático em `public/site/`: `index.html`, as páginas legais
(`termos-de-uso.html`, `politica-de-privacidade.html`, `exclusao-de-dados.html`) e
`assets/`. O `vercel.json` serve tudo na raiz do domínio, com endereços sem `.html`:
`/`, `/termos-de-uso`, `/politica-de-privacidade`, `/exclusao-de-dados`, `/assets/*`.
Os endereços antigos (`/paginas-legais/*.html`) redirecionam para os novos.
Para editar o site, mexa só nesses arquivos.

## CRM

CRM multicanal (WhatsApp/Instagram) multi-tenant. Next.js 15 + React 19, Drizzle ORM
sobre Postgres, NextAuth v5, Pusher, Vercel Blob. Roda com `basePath: '/crm'`
(ver `src/lib/base-path.ts`).

## Rodando localmente

```bash
npm install
npm run dev
```

Preencha `.env.local` com as credenciais do seu ambiente (banco, NextAuth, Pusher,
Vercel Blob — ver `CLAUDE.md` pra detalhes de arquitetura específicos deste projeto).
Localmente o CRM abre em `http://localhost:3000/crm`; o site na raiz só funciona na
Vercel (os rewrites dele estão no `vercel.json`), mas abre em `/crm/site/index.html`.

## Build

```bash
npm run type-check
npm run build
```

## Deploy

Projeto **pedrovictorweb** na Vercel, ligado a este repositório (Root Directory = raiz,
Framework = Next.js). Todo `git push` na main publica site e CRM juntos.

Variáveis de ambiente, além das de banco/Pusher/VAPID/Meta:

- `CRM_BASIC_USER` / `CRM_BASIC_PASS`: senha do navegador na porta. Sem elas o CRM responde 503.
- `LOGIN_AUTOMATICO_EMAIL` / `LOGIN_AUTOMATICO_SENHA`: usuário que a entrada automática loga.
- `AUTH_SECRET`, `AUTH_URL=https://pedrovictorweb.com.br/crm/api/auth`
- `NEXT_PUBLIC_APP_URL=https://pedrovictorweb.com.br/crm`
- `FACEBOOK_WEBHOOK_VERIFY_TOKEN`, `FACEBOOK_APP_SECRET`, `META_WEBHOOK_ATIVO=sim`

Webhooks: `https://pedrovictorweb.com.br/crm/api/webhooks/...`.
