/**
 * NextAuth v5 — substitui Supabase Auth
 *
 * Estratégia: Credentials (email + password com bcrypt)
 * Sessão: JWT armazenado em cookie HttpOnly
 */
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { users, profiles } from './schema'

import { authConfig } from './auth.config'
import { credenciaisRevisor } from './revisor'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          const login = (credentials.email as string).toLowerCase().trim()
          const password = credentials.password as string

          // O mesmo usuário/senha da porta (CRM_BASIC_USER/PASS) entra na tela de
          // login como o usuário da entrada automática: uma credencial só pra
          // decorar, em vez da senha aleatória do seed que ninguém sabe.
          const porta = process.env.CRM_BASIC_USER?.toLowerCase()
          const usarPorta = !!porta && !!process.env.CRM_BASIC_PASS && !!process.env.LOGIN_AUTOMATICO_EMAIL
            && login === porta && password === process.env.CRM_BASIC_PASS
          // Usuário do revisor da Meta (lib/revisor) também entra pelo apelido; a
          // senha é conferida normalmente contra o hash do usuário dele.
          const revisor = credenciaisRevisor()
          const email = usarPorta
            ? process.env.LOGIN_AUTOMATICO_EMAIL!.toLowerCase()
            : revisor && login === revisor.usuario ? revisor.email : login

          const [user] = await db
            .select({
              id: users.id,
              email: users.email,
              passwordHash: users.passwordHash,
              fullName: profiles.fullName,
              avatarUrl: profiles.avatarUrl,
              isSuperadmin: profiles.isSuperadmin,
            })
            .from(users)
            .leftJoin(profiles, eq(profiles.id, users.id))
            .where(eq(users.email, email))
            .limit(1)

          if (!user) return null

          const valid = usarPorta || await bcrypt.compare(password, user.passwordHash)

          if (!valid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.fullName || user.email,
            image: user.avatarUrl,
            isSuperadmin: user.isSuperadmin || false,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
})
