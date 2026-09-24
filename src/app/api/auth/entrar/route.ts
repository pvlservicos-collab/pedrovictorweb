/**
 * GET /api/auth/entrar
 *
 * ENTRADA AUTOMATICA -- o "sem login" que o Tel pediu.
 *
 * Por que nao arrancar a autenticacao: 17 arquivos do app chamam auth() para
 * saber quem e o usuario e de qual organizacao sao os dados. Sem sessao eles
 * nao ficam vazios -- o proprio middleware do projeto modelo registra que, da
 * ultima vez que desativaram o login, o app passou a servir leads e conversas
 * de EXEMPLO indistinguiveis dos reais na tela. Isso e pior que uma tela vazia.
 *
 * Entao a sessao continua existindo e sendo de verdade. O que sai e a TELA de
 * login: quem chega aqui e logado no usuario unico da casa e devolvido para
 * onde queria ir.
 *
 * A porta e protegida pela senha do navegador no middleware (CRM_BASIC_USER /
 * CRM_BASIC_PASS) -- esta rota fica de fora da lista publica de /api/auth
 * justamente por isso. Sem essa senha, este endpoint seria uma porta aberta.
 */
import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/auth'
import { BASE_PATH, comBase } from '@/lib/base-path'
import { credenciaisRevisor } from '@/lib/revisor'

export async function GET(req: NextRequest) {
  // Interruptor: LOGIN_AUTOMATICO=nao volta a tela de login (cada pessoa com o
  // seu usuário — o caminho quando houver mais de um cliente ou atendente, e o
  // que se entrega ao revisor da Meta). Sem a variável, segue a entrada automática.
  if (process.env.LOGIN_AUTOMATICO === 'nao') {
    const login = req.nextUrl.clone()
    login.pathname = '/login'
    login.search = ''
    return NextResponse.redirect(login)
  }

  // Quem passou pela porta com a credencial do revisor da Meta entra no usuário
  // dele (lib/revisor), nunca no do dono — a cota de envio vale por usuário.
  const revisor = credenciaisRevisor()
  let usuarioDaPorta = ''
  try { usuarioDaPorta = atob((req.headers.get('authorization') || '').replace(/^Basic\s+/i, '')).split(':')[0].toLowerCase() } catch {}
  const ehRevisor = !!revisor && usuarioDaPorta === revisor.usuario

  const email = ehRevisor ? revisor!.email : process.env.LOGIN_AUTOMATICO_EMAIL
  const senha = ehRevisor ? revisor!.senha : process.env.LOGIN_AUTOMATICO_SENHA

  if (!email || !senha) {
    return new NextResponse(
      'LOGIN_AUTOMATICO_EMAIL e LOGIN_AUTOMATICO_SENHA nao estao no .env. ' +
        'Sem eles nao ha como entrar sem a tela de login.',
      { status: 500 },
    )
  }

  // Para onde a pessoa queria ir. So caminho interno: um callbackUrl absoluto
  // viraria redirecionamento aberto, e isto aqui responde sem sessao.
  // x-crm-destino vem do middleware (rewrite); callbackUrl, do AuthGuard.
  const pedido = req.nextUrl.searchParams.get('callbackUrl') || req.headers.get('x-crm-destino') || '/'
  // Chega com o /crm (AuthGuard, middleware) ou sem; sai sempre com ele.
  const pedidoInterno = pedido.startsWith('/') && !pedido.startsWith('//') ? pedido : '/'
  // Quem entra pela porta principal (/crm, sem página específica) cai no chat:
  // é onde o atendimento começa. Link direto pra outra página continua indo pra ela.
  const naRaiz = ['/', BASE_PATH, `${BASE_PATH}/`].includes(pedidoInterno.split('?')[0])
  const destino = comBase(naRaiz ? '/chat' : pedidoInterno)

  try {
    // signIn com redirectTo lanca NEXT_REDIRECT, que o Next trata sozinho.
    return await signIn('credentials', { email, password: senha, redirectTo: destino })
  } catch (erro) {
    // O redirect do Next passa por aqui como excecao: deixa subir.
    if (erro && typeof erro === 'object' && 'digest' in erro) throw erro

    return new NextResponse(
      'Nao consegui entrar com o usuario automatico. Confira se ele existe no ' +
        'banco (scripts/criar-usuario.mjs) e se a senha no .env bate.',
      { status: 500 },
    )
  }
}
