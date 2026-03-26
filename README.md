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
bun dev
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
bun install --frozen-lockfile

# libSQLサーバーを起動
docker compose up -d libsql-server

# DBスキーマをプッシュ
bun db:push

# 開発サーバーを起動
bun dev
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
| `bun dev`     | 開発サーバーを起動   |
| `bun build`   | プロダクションビルド |
| `bun preview` | ビルドをプレビュー   |

### Code Quality

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `bun check`      | format, lint, type-check, knipを一括実行 |
| `bun check:all`  | check + audit + testを一括実行            |
| `bun lint`       | oxlintでコード品質チェック               |
| `bun lint:fix`   | lint問題を自動修正                       |
| `bun format`     | oxfmtでコードをフォーマット              |
| `bun type-check` | TypeScriptの型チェック                   |
| `bun knip`       | 未使用コードをチェック                   |
| `bun knip:fix`   | 未使用コードを修正                       |

### Testing

| Command              | Description              |
| -------------------- | ------------------------ |
| `bun test`          | Vitestでテストを実行     |
| `bun test:ui`       | テストUIを起動           |
| `bun test:coverage` | カバレッジレポートを生成 |
| `bun test:e2e`      | PlaywrightでE2Eテストを実行 |
| `bun test:e2e:ui`   | Playwright E2EテストをUIで実行 |

### Database

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `bun db:push`     | スキーマをDBにプッシュ         |
| `bun db:migrate`  | マイグレーションを実行         |
| `bun db:generate` | マイグレーションファイルを生成 |
| `bun db:studio`   | Drizzle Studioを起動           |
| `bun db:check`    | データベーススキーマをチェック |

### Deployment

| Command       | Description                             |
| ------------- | --------------------------------------- |
| `bun deploy` | Cloudflare Workersにデプロイ（dry-run） |

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
  - Format (`bun format`)
  - Lint (`bun lint`)
  - Knip (`bun knip`)
  - Type Check (`bun type-check`)
  - Build (`bun build-only`)
  - Test (`bun test`)

### E2E Tests (`e2e.yml`)

- **Trigger**: プルリクエストの作成または更新、手動実行
- **Jobs**:
  - E2Eテスト (`bun test:e2e`)

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
