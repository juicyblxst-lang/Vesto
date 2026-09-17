import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, ssl: { rejectUnauthorized: false } });
  return pool;
}

export async function query<T = any>(text: string, values: unknown[] = []) {
  const db = getDb();
  if (!db) throw new Error('DATABASE_NOT_CONFIGURED');
  return db.query<T>(text, values);
}
