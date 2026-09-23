import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { BASE_PATH } from '@/lib/base-path'

/**
 * Senha do navegador na porta do CRM -- faz o papel que o basicauth do traefik
 * fazia na VPS. Na Vercel nao ha proxy na frente, e a entrada automatica
 * (api/auth/entrar) loga qualquer um no usuario da casa: sem esta checagem o
 * CRM inteiro ficaria aberto pra quem achasse o link.
 *
 * Usuario e senha vem de CRM_BASIC_USER / CRM_BASIC_PASS. Sem eles o CRM
 * fica fechado (503) em vez de aberto -- esquecer a env nao pode expor dados.
 */
function portaLiberada(req: NextRequest): boolean | null {
  const usuario = process.env.CRM_BASIC_USER
  const senha = process.env.CRM_BASIC_PASS
  if (!usuario || !senha) return null
  const cabecalho = req.headers.get('authorization') || ''
  if (!cabecalho.startsWith('Basic ')) return false
  try {
    return atob(cabecalho.slice(6).trim()) === `${usuario}:${senha}`
  } catch {
    return false
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const publicPaths = [
    '/login', '/ativar-conta', '/api/auth', '/api/webhooks', '/api/funnels/tick', '/api/integrations/instagram/check-tokens',
    // Entrada de leads: o handler autentica sozinho (chave `atl_` no cabeçalho
    // OU em ?key=, porque plugin de formulário do WordPress muitas vezes não
    // deixa mandar cabeçalho). O bypass de Bearer logo abaixo não cobre o caso
    // do ?key=, então sem esta linha o webhook do site caía no redirect de
    // login e o lead se perdia.
    '/api/ingest',
    // Formulário de aplicação do site: roda no navegador de quem se inscreve,
    // sem sessão e sem token nenhum (a rota valida origem, fonte e limite por
    // IP sozinha). Sem esta linha o envio caía no redirect de login e a
    // aplicação da pessoa se perdia. O arquivo dela é
    // public/formulario-aplicacao.html, que também precisa abrir sem sessão.
    '/api/public/',
    '/formulario-aplicacao.html',
    '/codigo-do-formulario.html',
    // Cron da Vercel não manda cookie de sessão nem Authorization (CRON_SECRET não está
    // configurado no projeto) — sem isso na lista, toda chamada do cron caía no redirect
    // de login e a reconciliação nunca rodou de verdade desde que foi criada (13/07).
    '/api/cron/evolution-reconcile',
    // Manifest/service worker/ícones do PWA: o navegador busca isso sem sessão
    // (checagem de instalabilidade), então não pode cair no redirect de login.
    '/manifest.webmanifest', '/sw.js', '/icons/',
    // Assets estáticos de public/ servidos na raiz (logos, fontes, imagens de fundo) —
    // o matcher abaixo só livra _next/static e afins, então sem isso qualquer imagem
    // usada numa tela sem sessão (ex: login) cairia no redirect também.
    '/logos/', '/fonts/', '/chat-bg.svg',
  ]
  // A entrada automatica mora dentro de /api/auth mas NAO e publica: ela loga
  // quem chegar, entao so passa depois da senha da porta (logo abaixo).
  const ehEntrada = pathname.startsWith('/api/auth/entrar')
  const isPublic = !ehEntrada && publicPaths.some((p) => pathname.startsWith(p))

  if (isPublic) return NextResponse.next()

  // Requisições com Bearer token (API externa, n8n, etc.) passam direto — auth é validada no handler
  if (req.headers.get('authorization')?.startsWith('Bearer ')) return NextResponse.next()

  const porta = portaLiberada(req)
  if (porta === null) {
    return new NextResponse('CRM fechado: defina CRM_BASIC_USER e CRM_BASIC_PASS nas variaveis de ambiente.', { status: 503 })
  }
  if (!porta) {
    return new NextResponse('Acesso restrito.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="PVL CRM", charset="UTF-8"' },
    })
  }
  if (ehEntrada) return NextResponse.next()

  // NextAuth v5 usa "authjs.session-token" (v4 usava "next-auth.session-token")
  const sessionToken =
    req.cookies.get('__Secure-authjs.session-token') ??
    req.cookies.get('authjs.session-token') ??
    req.cookies.get('next-auth.session-token') ??
    req.cookies.get('__Secure-next-auth.session-token')

  // Sem sessão vai pro login. Ficou desativado durante a revisão visual do
  // redesign, com uma identidade "demo" sintetizada no cliente pra as telas não
  // renderizarem vazias. Isso saiu junto: em produção, o app servia dados falsos
  // (leads e conversas de exemplo) pra quem abrisse sem logar — indistinguíveis
  // dos reais na tela, o que é pior que uma tela vazia.
  // SEM TELA DE LOGIN (Tel, 20/09): manda para a entrada automatica, que faz
  // o signIn do usuario unico da casa e devolve a pessoa para ca. A sessao
  // continua real -- o que sai e so a tela. A porta e a senha do navegador
  // (portaLiberada, acima). Ver src/app/api/auth/entrar/route.ts.
  if (!sessionToken) {
    // Rewrite, nao redirect: atras do proxy do site, req.url traz o host
    // *.vercel.app, e um redirect absoluto tiraria a pessoa do dominio. O
    // entrar responde com o redirect certo (origem do AUTH_URL). O pathname
    // do middleware vem sem o /crm; o destino volta com ele.
    // O destino vai num cabecalho: a query de um rewrite nao chega no handler
    // (ele ve a da requisicao original), e a pessoa caia sempre no /crm/.
    const entrada = req.nextUrl.clone()
    entrada.pathname = '/api/auth/entrar'
    const headers = new Headers(req.headers)
    headers.set('x-crm-destino', BASE_PATH + pathname + req.nextUrl.search)
    return NextResponse.rewrite(entrada, { request: { headers } })
  }

  return NextResponse.next()
}

export const config = {
  // '/' explicito: com o basePath, a raiz exata (/crm) nao casa com o padrao de
  // baixo e passava sem a senha da porta.
  matcher: ['/', '/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
