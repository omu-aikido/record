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
| Build      | Vite+                                           |
| PM         | Bun                                             |
| DevEnv     | Nix                                             |

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
cd apps/database/
bun run generate
```

### 2. 環境変数設定

環境変数は age で暗号化した `secrets/*.env.age` から復号します。
秘密鍵はリポジトリ外に置き、必要なら `AGE_IDENTITY_FILE` で指定してください。開発者を追加する場合は、公開鍵を `secrets/dev.recipients` に1行追加して再暗号化します。

```bash
bun run env:decrypt
```

復号先は `.env.example` のとおりです。アプリとE2Eの環境変数をまとめて復号します。

暗号化済みファイルを更新する場合は、まず復号して平文の `.env` を編集してから実行します。

```bash
bun run env:encrypt
```

### 3. 開発サーバー起動

```bash
vp run dev
```

`vp run dev` は起動時にアプリ用の環境変数を自動で復号します。

ブラウザで http://localhost:5173 を開く

## アーキテクチャ

```
apps/
├── client/     # Vue 3 SPA (Vite)
├── database/   # ローカルTurso DB・マイグレーション
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
vp run build
```

### 2. Backend デプロイ確認（dry-run）

```bash
cd apps/server && bun run deploy
```

`apps/server` の `deploy` script は `--dry-run` で実行されます。

### 3. SPA モード

`wrangler.toml` の `[assets].not_found_handling = "single-page-application"` により、API以外のリクエストはSPAとして配信されます。

## テスト

### テスト戦略

| アプリ        | テストタイプ             |
| ------------- | ------------------------ |
| `apps/share`  | Unit テスト              |
| `apps/server` | API/Integration テスト   |
| `apps/client` | Unit / Composable テスト |

### テスト実行

root の統一テストタスクとして、以下を実行します。

```bash
bun test --isolate
```

## 開発ガイドライン

詳細な開発ルールは [AGENTS.md](./AGENTS.md) を参照してください。

## ライセンス

[LICENSE](LICENSE)
