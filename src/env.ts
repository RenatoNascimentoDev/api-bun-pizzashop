import { config } from 'dotenv';
import { z } from 'zod';

config({ path: '.env' });
config({ path: '.env.local', override: true });

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
});
