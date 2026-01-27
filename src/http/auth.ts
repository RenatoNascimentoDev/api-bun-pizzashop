import jwt from '@elysiajs/jwt'
import Elysia, { type Static, t } from 'elysia'
import { env } from '../env'
import cookie from '@elysiajs/cookie'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const auth = new Elysia()
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayload,
    }),
  )
  .use(cookie())
  .derive({ as: 'global' }, ({ jwt, cookie, removeCookie }) => {
    // Cookie jar returns a Cookie instance for any key at runtime.
    const authCookie = cookie.auth!

    return {
      signUser: async (payload: Static<typeof jwtPayload>) => {
        const token = await jwt.sign(payload)

        authCookie.value = token
        authCookie.httpOnly = true
        authCookie.maxAge = 60 * 60 * 24 * 7 // 7 days
        authCookie.path = '/'
      },

      signOut: () => {
        removeCookie('auth')
      },
    }
  })
