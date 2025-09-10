import { pgTable, uuid, varchar, text, timestamp, doublePrecision, index } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})


export const plants = pgTable('plants', {
  id: uuid('id').defaultRandom().primaryKey(),
  pid: varchar('pid', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  userId: uuid('user_id').notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_plants_pid').on(t.pid),
  index('idx_plants_user_id').on(t.userId),
  index('idx_plants_created_at').on(t.createdAt),
  index('idx_plants_name').on(t.name),
])
