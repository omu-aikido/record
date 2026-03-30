# record

Vue 3 SPA + Hono Backend on Cloudflare Workers

## 技術スタック

| レイヤー   | 技術                                            |
| ---------- | ----------------------------------------------- |
| Frontend   | Vue 3, Vite, UnoCSS, HeadlessUI, TanStack Query |
| Backend    | Hono, Cloudflare Workers                        |
| DB         | Turso, Drizzle ORM                              |
| Auth       | Clerk                                           |
| Validation | Arktype, Drizzle-Arktype                        |
| Build      | Turborepo, Bun                                  |
| DevEnv     | Nix                                             |

## 前提条件

- Bun 1.3.11+
- Node.js 24+ (Nix利用時)
- Cloudflare アカウント (デプロイ時)
- Turso アカウント (DB利用時)
- Clerk アカウント (認証利用時)

## セットアップ

### 1. 依存関係インストール

```bash
bun install
```

### 2. 環境変数設定

```bash
cp .env .env.local
```

`.env.local` を編集して必要な環境変数を設定:

```env
# Clerk認証
CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***

# Turso DB
TURSO_DB_URL=libsql://*.turso.io
TURSO_DB_AUTH_TOKEN=***

# Cloudflare
CF_ACCOUNT_ID=***
CF_API_TOKEN=***
```

### 3. 開発サーバー起動

```bash
# 全体開発サーバー起動 (client + server)
bun run dev

# 個別起動
cd apps/client && bun run dev  # Frontend: http://localhost:5173
cd apps/server && bun run dev  # Backend:  http://localhost:8787
```

## 開発コマンド

| コマンド                           | 説明                          |
| ---------------------------------- | ----------------------------- |
| `bun run dev`                      | 開発サーバー起動 (Turborepo)  |
| `bun run build`                    | 本番ビルド (Turborepo)        |
| `cd apps/client && bun run dev`    | Frontend のみ起動             |
| `cd apps/server && bun run dev`    | Backend のみ起動              |
| `cd apps/server && bun run deploy` | Cloudflare Workers にデプロイ |

## アーキテクチャ

```
apps/
├── client/     # Vue 3 SPA (Vite)
├── server/     # Hono API (Cloudflare Workers)
└── share/      # 共有型・バリデーション
```

### データフロー

1. **Client → Server**: Hono RPC (`hc<AppType>`) を使用
2. **Server → DB**: Drizzle ORM 経由で Turso にアクセス
3. **Auth**: Clerk 認証を Hono ミドルウェアでガード

## デプロイ

### 1. Frontend ビルド

```bash
cd apps/client && bun run build
```

### 2. Backend デプロイ

```bash
cd apps/server && bun run deploy
```

### 3. SPA モード

`wrangler.jsonc` の `assets.not_found_handling: "single-page-application"` により、API以外のリクエストはSPAとして配信されます。

## テスト

### テスト戦略

| アプリ        | テストタイプ           |
| ------------- | ---------------------- |
| `apps/share`  | Unit テスト            |
| `apps/server` | API/Integration テスト |
| `apps/client` | Component テスト       |

### テスト実行

```bash
# 各appsで Vitest を使用 (今後設定予定)
bun run test
```

## 開発ガイドライン

詳細な開発ルールは [AGENTS.md](./AGENTS.md) を参照してください。

## ライセンス

MIT
