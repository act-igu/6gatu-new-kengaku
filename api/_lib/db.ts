import { neon } from '@neondatabase/serverless';

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL が設定されていません');
  }
  return neon(url);
}

export async function checkDbConnection(): Promise<boolean> {
  const sql = getSql();
  await sql`SELECT 1 AS ok`;
  return true;
}
