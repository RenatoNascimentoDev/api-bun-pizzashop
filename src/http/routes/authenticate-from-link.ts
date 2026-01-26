import Elysia, { t } from 'elysia'
import { db } from '../../db/connection'
import { auth } from '../auth'
import dayjs from 'dayjs'
import { authLinks } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const authenticateFromLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  async ({ query, jwt, cookie: { auth }, redirect }) => {
    const { code, redirect: redirectTo } = query

    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code.trim())
      },
    })

    if (!authLinkFromCode) {
      throw new Error('Auth link not found.')
    }

    const aysSinceAuthLinkWasCreated = dayjs().diff(
      authLinkFromCode.createdAt,
      'days',
    )

    if (aysSinceAuthLinkWasCreated > 7) {
      throw new Error('Auth Link expired, please generate a new one.')
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinkFromCode.userId)
      },
    })

    const token = await jwt.sign({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurant?.id,
    })

    auth.value = token
    auth.httpOnly = true
    auth.maxAge = 60 * 60 * 24 * 7 // 7 days
    auth.path = '/'

    await db.delete(authLinks).where(eq(authLinks.code, code.trim()))

    return redirect(redirectTo)
  },
  {
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
    cookie: t.Cookie({
      auth: t.Optional(t.String()),
    }),
  },
)
