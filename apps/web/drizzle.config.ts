import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: '../../packages/db/src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Renseignez SUPABASE_DB_URL dans .env.local pour utiliser les commandes drizzle
    url: process.env.SUPABASE_DB_URL ?? '',
  },
  verbose: true,
  strict: true,
});

