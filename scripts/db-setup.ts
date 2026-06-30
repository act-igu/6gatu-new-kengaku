/**
 * データベースの初期セットアップ（テーブル作成 + サンプルデータ投入）
 *
 * 使い方:
 *   1. .env.local に DATABASE_URL を設定
 *   2. npm run db:setup
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { mockCandidates, staffList } from '../src/data/mockData';
import { seedCandidates, seedStaff } from '../api/_lib/repository';

config({ path: '.env.local' });
config({ path: '.env' });

neonConfig.webSocketConstructor = ws;

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL が設定されていません');
    console.error('   .env.local に Neon の接続文字列を設定してください');
    process.exit(1);
  }

  console.log('📦 データベースに接続中...');
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const schemaPath = join(root, 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    console.log('🔧 テーブルを作成中...');
    await pool.query(schema);

    console.log('👥 スタッフデータを投入中...');
    await seedStaff(staffList);

    console.log('📋 候補者サンプルデータを投入中...');
    await seedCandidates(mockCandidates);

    console.log('✅ セットアップ完了！');
    console.log(`   スタッフ: ${staffList.length} 件`);
    console.log(`   候補者: ${mockCandidates.length} 件`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('❌ セットアップ失敗:', err);
  process.exit(1);
});
