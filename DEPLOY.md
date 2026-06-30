# 公開手順ガイド（Neon + Vercel）

このガイドでは、入居問い合わせ管理ツールを **Neon（データベース）** と **Vercel（公開）** で動かす手順を、初めての方でも迷わないように説明します。

---

## 全体の流れ

```
① Neon でデータベースを作る
        ↓
② 手元の PC で DB を初期化する（npm run db:setup）
        ↓
③ GitHub にコードをアップロードする
        ↓
④ Vercel でサイトを公開する（DATABASE_URL を設定）
        ↓
⑤ 公開 URL にアクセスして動作確認
```

所要時間の目安：**30〜60 分**

---

## 事前準備

以下のアカウントを無料で作成してください。

| サービス | 用途 | URL |
|---------|------|-----|
| **GitHub** | ソースコード管理 | https://github.com |
| **Neon** | PostgreSQL データベース | https://neon.tech |
| **Vercel** | サイト公開 | https://vercel.com |

また、PC に以下がインストールされている必要があります。

- **Node.js** 18 以上（https://nodejs.org）
- **Git**（https://git-scm.com）

---

## ステップ 1：Neon でデータベースを作る

### 1-1. Neon にログイン

1. https://neon.tech を開く
2. 「Sign up」から GitHub アカウント等で登録

### 1-2. プロジェクトを作成

1. ダッシュボードで **「New Project」** をクリック
2. プロジェクト名（例：`move-in-inquiry`）を入力
3. リージョンは **Asia Pacific (Tokyo)** を選ぶと日本から速いです
4. **「Create Project」** をクリック

### 1-3. 接続文字列（DATABASE_URL）をコピー

1. プロジェクト画面の **「Connect」** ボタンをクリック
2. **「Connection string」** タブを選択
3. 表示された文字列をコピー（`postgresql://...` で始まる文字列）

> ⚠️ この文字列にはパスワードが含まれます。**絶対に GitHub にアップロードしないでください。**

---

## ステップ 2：手元の PC で初期セットアップ

### 2-1. 依存パッケージをインストール

プロジェクトフォルダでターミナルを開き、実行します。

```bash
npm install
```

### 2-2. 環境変数ファイルを作成

```bash
# Windows（PowerShell）
copy .env.example .env.local

# Mac / Linux
cp .env.example .env.local
```

`.env.local` をテキストエディタで開き、先ほどコピーした Neon の接続文字列を貼り付けます。

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

### 2-3. データベースを初期化

```bash
npm run db:setup
```

成功すると次のような表示になります。

```
✅ セットアップ完了！
   スタッフ: 2 件
   候補者: 4 件
```

> テーブル作成とサンプルデータの投入が一度に行われます。  
> 再実行しても問題ありません（候補者データは上書きされます）。

### 2-4. ローカルで動作確認

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

- 候補者リストが表示されれば成功
- 編集・保存してリロードしてもデータが残ることを確認

> `npm run dev` は Vercel CLI を使い、画面（Vite）と API（`/api/*`）を同時に起動します。

---

## ステップ 3：GitHub にコードをアップロード

### 3-1. GitHub でリポジトリを作成

1. https://github.com/new を開く
2. リポジトリ名（例：`move-in-inquiry-tool`）を入力
3. **「Create repository」** をクリック

### 3-2. コードをプッシュ

ターミナルで以下を実行（`YOUR_USERNAME` と `REPO_NAME` は自分のものに置き換え）。

```bash
git init
git add .
git commit -m "Neon + Vercel 対応"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

> `.env.local` は `.gitignore` に含まれているため、GitHub にはアップロードされません。

---

## ステップ 4：Vercel で公開

### 4-1. プロジェクトをインポート

1. https://vercel.com にログイン
2. **「Add New...」→「Project」** をクリック
3. GitHub リポジトリを選んで **「Import」**

### 4-2. 環境変数を設定

「Environment Variables」セクションで以下を追加します。

| Name | Value |
|------|-------|
| `DATABASE_URL` | Neon でコピーした接続文字列 |

> Production / Preview / Development すべてにチェックを入れておくと便利です。

### 4-3. デプロイ

**「Deploy」** をクリックします。2〜3 分で完了します。

---

## ステップ 5：本番 DB の初期化

Vercel へのデプロイ後、**本番の Neon データベース** にテーブルとサンプルデータを入れます。

手元の PC で、`.env.local` の `DATABASE_URL` が本番 Neon を指していることを確認し（ステップ 1 で作った DB と同じ）、再度実行します。

```bash
npm run db:setup
```

> ローカル開発用と本番用で **別の Neon プロジェクト** を使う場合は、本番用の `DATABASE_URL` を一時的に `.env.local` に設定してから実行してください。

---

## ステップ 6：動作確認

1. Vercel のダッシュボードに表示された URL（例：`https://xxx.vercel.app`）を開く
2. 候補者リストが表示されることを確認
3. データの編集・保存ができることを確認
4. リロードしてもデータが残ることを確認

API の接続確認：

```
https://あなたのURL.vercel.app/api/health
```

`{"ok":true,"message":"データベース接続 OK"}` と表示されれば DB 接続成功です。

---

## よくあるトラブル

### 「接続エラー」と表示される

| 原因 | 対処 |
|------|------|
| `DATABASE_URL` 未設定 | Vercel の Environment Variables を確認 |
| DB 未初期化 | `npm run db:setup` を実行 |
| 接続文字列の typo | Neon から再コピー |

### 保存してもデータが消える

- Vercel の `DATABASE_URL` が正しく設定されているか確認
- `/api/health` が OK を返すか確認

### ローカルで `npm run dev` が動かない

```bash
npx vercel login
npm run dev
```

Vercel CLI へのログインが必要な場合があります。

### `npm run db:setup` でエラー

- `.env.local` に `DATABASE_URL` があるか確認
- Neon プロジェクトが起動中（Suspended でない）か確認

---

## ファイル構成（バックエンド関連）

```
api/                  ← Vercel Serverless API
  health.ts           ← DB 接続確認
  staff.ts            ← スタッフ一覧
  candidates/         ← 候補者 CRUD
db/
  schema.sql          ← テーブル定義
lib/
  db.ts               ← Neon 接続
  repository.ts       ← DB 操作
scripts/
  db-setup.ts         ← 初期化スクリプト
src/api/
  client.ts           ← フロントから API を呼ぶ
```

---

## 次のステップ（任意）

- **独自ドメイン** … Vercel の Settings → Domains から設定
- **本番認証** … Clerk / Auth0 等でログイン機能を追加
- **自動デプロイ** … GitHub に push するたびに Vercel が自動更新

---

## サポート

- Neon ドキュメント：https://neon.com/docs
- Vercel ドキュメント：https://vercel.com/docs
- このプロジェクトの README.md も参照してください
