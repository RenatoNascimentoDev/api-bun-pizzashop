import jwt from '@elysiajs/jwt'
import Elysia, { type Static, t, type Cookie } from 'elysia'
import { env } from '../env'
import { UnauthorizedError } from './errors/unauthorized-error'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const auth = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case 'UNAUTHORIZED': {
        set.status = 401
        return { code, message: error.message }
      }
    }
  })
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayload,
    }),
  )
  .derive({ as: 'global' }, ({ jwt, cookie }) => {
    const getAuthCookie = () => {
      const authCookie = cookie.auth as Cookie<string> | undefined
      if (!authCookie) {
        throw new Error('Auth cookie jar not available.')
      }
      return authCookie
    }

    return {
      signUser: async (payload: Static<typeof jwtPayload>) => {
        const token = await jwt.sign(payload)

        getAuthCookie().set({
          value: token,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        })
      },

      signOut: () => {
        getAuthCookie().remove()
      },

      getCurrentUser: async () => {
        const token = getAuthCookie().value

        if (!token || typeof token !== 'string') {
          throw new UnauthorizedError()
        }

        const payload = await jwt.verify(token)

        if (!payload) {
          throw new UnauthorizedError()
        }

        return {
          userId: payload.sub,
          restaurantId: payload.restaurantId,
        }
      },
    }
  })
