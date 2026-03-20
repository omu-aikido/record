# OMU Aikido App

大阪公立大学合気道部の稽古管理アプリ

## Tech Stack

- **Frontend**: Vue 3 + Vite + UnoCSS
- **Backend**: Hono (Cloudflare Workers)
- **Database**: Drizzle ORM + libSQL (Turso)
- **Authentication**: Clerk
- **Validation**: Arktype
- **Observability**: Cloudflare Workers Observability

## Observability & Error Monitoring

### ログの確認方法

```sh
# ローカル開発時のログ
pnpm dev
```

## Prerequisites

### セットアップ方法

#### nix/flake（推奨）

```sh
# nixがインストールされている場合
nix develop
```

または

```sh
# flakeが有効な場合
direnv allow
```

## Quick Start

### ローカル

```sh
# 依存関係のインストール
pnpm install --frozen-lockfile

# libSQLサーバーを起動
docker compose up -d libsql-server

# DBスキーマをプッシュ
pnpm db:push

# 開発サーバーを起動
pnpm dev
```

### E2Eテスト・CI/CD向け

```sh
docker compose up

# Wranglerを使用してアプリサービスを起動（libSQL + アプリ）
MODE=preview docker compose up
```

## Scripts

### Development

| Command        | Description          |
| -------------- | -------------------- |
| `pnpm dev`     | 開発サーバーを起動   |
| `pnpm build`   | プロダクションビルド |
| `pnpm preview` | ビルドをプレビュー   |

### Code Quality

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `pnpm check`      | format, lint, type-check, knipを一括実行 |
| `pnpm check:all`  | check + audit + testを一括実行            |
| `pnpm lint`       | oxlintでコード品質チェック               |
| `pnpm lint:fix`   | lint問題を自動修正                       |
| `pnpm format`     | oxfmtでコードをフォーマット              |
| `pnpm type-check` | TypeScriptの型チェック                   |
| `pnpm knip`       | 未使用コードをチェック                   |
| `pnpm knip:fix`   | 未使用コードを修正                       |

### Testing

| Command              | Description              |
| -------------------- | ------------------------ |
| `pnpm test`          | Vitestでテストを実行     |
| `pnpm test:ui`       | テストUIを起動           |
| `pnpm test:coverage` | カバレッジレポートを生成 |
| `pnpm test:e2e`      | PlaywrightでE2Eテストを実行 |
| `pnpm test:e2e:ui`   | Playwright E2EテストをUIで実行 |

### Database

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `pnpm db:push`     | スキーマをDBにプッシュ         |
| `pnpm db:migrate`  | マイグレーションを実行         |
| `pnpm db:generate` | マイグレーションファイルを生成 |
| `pnpm db:studio`   | Drizzle Studioを起動           |
| `pnpm db:check`    | データベーススキーマをチェック |

### Deployment

| Command       | Description                             |
| ------------- | --------------------------------------- |
| `pnpm deploy` | Cloudflare Workersにデプロイ（dry-run） |

## Environment Variables

プロジェクトのルートに `.dev.vars` ファイルを作成し、以下の変数を設定してください（`.env.example` 参照）。

```ini
# Client (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Server (Clerk)
CLERK_SECRET_KEY=sk_test_...
CLERK_FRONTEND_API_URL=https://...
CLERK_WEBHOOK_SECRET=whsec_...

# Server (Database)
TURSO_AUTH_TOKEN=...
TURSO_DATABASE_URL=http://localhost:8080
```

## CI/CD Workflow

GitHub Actions を使用して、CI/CDを管理しています。

### CI: Validation (`ci.yml`)

- **Trigger**: プルリクエストの作成または更新
- **Jobs**:
  - Format (`pnpm format`)
  - Lint (`pnpm lint`)
  - Knip (`pnpm knip`)
  - Type Check (`pnpm type-check`)
  - Build (`pnpm build-only`)
  - Test (`pnpm test`)

### E2E Tests (`e2e.yml`)

- **Trigger**: プルリクエストの作成または更新、手動実行
- **Jobs**:
  - E2Eテスト (`pnpm test:e2e`)

## Project Structure

```
├── src/                  # Vueフロントエンド (tsconfig.app.json)
│   ├── components        # UIコンポーネント
│   ├── composable        # Vueコンポーザブル
│   ├── views             # ページコンポーネント
│   ├── router            # ルーティング
│   └── lib               # ユーティリティ関数
├── server/               # Honoバックエンド (tsconfig.worker.json)
├── share/                # 共有型定義・ユーティリティ
├── tests/                # ユニットテスト・統合テスト
├── e2e/                  # E2Eテストファイル
├── migrations/           # DBマイグレーション
├── .github/workflows/    # CI/CD設定
├── uno.config.ts         # UnoCSS設定
├── wrangler.jsonc        # Wrangler設定
├── drizzle.config.ts     # Drizzle設定
├── knip.json             # 未使用コード検出設定
├── vitest.config.ts      # Vitest設定
├── playwright.config.ts  # Playwright設定
├── tsconfig.json         # TypeScript構成のエントリポイント
├── tsconfig.app.json     # フロントエンド用TS設定
├── tsconfig.worker.json  # Cloudflare Workers用TS設定
└── tsconfig.node.json    # ビルドツール用TS設定
```

## License

[Apache License 2.0](LICENSE)
