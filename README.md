# record

Vue 3 SPA + Hono Backend on Cloudflare Workers

## 技術スタック

|            |                                                 |
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
echo "use flake" > .envrc && direnv allow
```

```bash
bun install
```

ローカル開発用のsqliteファイルを準備

```bash
cat migrations/20260331022512_certain_sunspot/migration.sql | sqlite3 local.db
```

### 2. 環境変数設定

.env.exampleを参考に。
`apps/server`,`apps/client`それぞれに必要な変数を記述して配置

### 3. 開発サーバー起動

```bash
bun run dev
```

ブラウザで http://localhost:5173 を開く

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
bun run test
```

## 開発ガイドライン

詳細な開発ルールは [AGENTS.md](./AGENTS.md) を参照してください。

## ライセンス

[LICENSE](LICENSE)
