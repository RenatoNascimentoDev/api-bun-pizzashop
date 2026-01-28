import { text, pgTable, timestamp, integer } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { restaurants } from './restaurants'

export const products = pgTable('products', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  priceInCents: integer('price_in_cents').notNull(),
  restaurantId: text('restaurant_is')
    .notNull()
    .references(() => restaurants.id, {
      onDelete: 'cascade',
    }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
