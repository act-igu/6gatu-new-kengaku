# 入居問い合わせ・見学進捗管理ツール

共同生活援助などの福祉施設向け、入居問い合わせ〜見学〜契約までの進捗を管理する Web アプリです。

## 技術構成

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React + Vite + TypeScript |
| API | Vercel Serverless Functions |
| データベース | Neon（PostgreSQL） |
| ホスティング | Vercel |

## クイックスタート（ローカル開発）

```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数（Neon の DATABASE_URL を設定）
copy .env.example .env.local   # Windows
# cp .env.example .env.local   # Mac/Linux

# 3. DB 初期化（テーブル作成 + サンプルデータ）
npm run db:setup

# 4. 開発サーバー起動（画面 + API）
npm run dev
```

http://localhost:5173 を開いてください。

## 公開方法

**Neon + Vercel への公開手順**は [DEPLOY.md](./DEPLOY.md) を参照してください。  
初心者向けにステップごとに説明しています。

## 画面構成

| ペイン | 役割 |
|--------|------|
| 左 | 進捗ステータス一覧（件数バッジ付き） |
| 中 | 候補者リスト（検索・フィルタ） |
| 広 | 詳細情報（受け入れ判定・スケジュール等） |
| 右 | 運用（ステータス操作・書類チェック・面談記録） |

## ディレクトリ

```
src/
  components/     # UI コンポーネント
  api/            # API クライアント
  data/           # マスタデータ・初期サンプル
  types.ts        # 型定義
api/              # Vercel Serverless API
lib/              # DB 接続・リポジトリ
db/               # SQL スキーマ
scripts/          # DB セットアップ
```

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | ローカル開発（API + 画面を同時起動） |
| `npm run dev:api` | API サーバーのみ（ポート 3001） |
| `npm run dev:ui` | 画面のみ（API なし・通常は使わない） |
| `npm run build` | 本番ビルド |
| `npm run db:setup` | DB テーブル作成 + サンプルデータ投入 |

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL 接続文字列 |

`.env.local` に設定してください（Git には含めません）。

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/health` | DB 接続確認 |
| GET | `/api/staff` | スタッフ一覧 |
| GET | `/api/candidates` | 候補者一覧 |
| POST | `/api/candidates` | 新規候補者作成 |
| PATCH | `/api/candidates/:id` | 候補者更新 |
| POST | `/api/candidates/:id/memos` | 面談記録追記 |
