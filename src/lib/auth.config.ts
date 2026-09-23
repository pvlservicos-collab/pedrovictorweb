import type { NextAuthConfig } from 'next-auth'
import { BASE_PATH } from './base-path'

export const authConfig: NextAuthConfig = {
  // No servidor fica /api/auth mesmo: o Next tira o /crm (basePath) antes de
  // entregar a requisicao ao handler. O navegador usa /crm/api/auth, que vai no
  // <SessionProvider basePath> do layout. Explicito de proposito: se ficar
  // vazio, o NextAuth copia o caminho do AUTH_URL e passa a responder
  // "UnknownAction" pra tudo.
  basePath: '/api/auth',
  // Necessário fora da Vercel (que habilita isso sozinha via env VERCEL=1) — atrás de
  // um reverse proxy próprio (Traefik na VPS), sem isso o NextAuth rejeita o host com
  // erro "Configuration" antes mesmo de chegar no provider.
  trustHost: true,
  pages: {
    signIn: `${BASE_PATH}/login`,
    error: `${BASE_PATH}/login`,
  },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isSuperadmin = (user as any).isSuperadmin || false
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).isSuperadmin = token.isSuperadmin as boolean
      }
      return session
    },
  },
  providers: [],
}
