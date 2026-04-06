# AGENTS.md

AIコーディングアシスタント向けのプロジェクトガイドライン。

## プロジェクトの憲法

1. **境界の遵守:** `apps/client` から `drizzle-orm` を直接インポートしてはならない。DB操作は常に `apps/server` のAPIを通すこと。
2. **共有ロジック:** 型定義やバリデーションロジックは可能な限り `apps/share` に記述し、`apps/server` と `apps/client` でインポートして共有すること。
3. **ビルドの原則:** `apps/client` はSPAとして配信される。SSRは行わない。
4. **API通信:** Hono RPC (`hc<AppType>`) を使用すること。手動の `fetch` やURL文字列のハードコーディングは禁止。
5. **認証:** 認証ロジックは Clerk を使用し、Honoのミドルウェア層でガードをかけること。クライアント側での権限チェックはあくまでUX目的であること。
6. **テスト:** 新しい機能を追加する際は必ず対応するテスト（`apps/share`ならUnit, `apps/server`ならAPI/Integration, `apps/client`ならComponent）をセットで提案すること。
7. **スタイリング:** UnoCSSを使用する。Tailwind互換のユーティリティクラスを優先する。
8. **コンポーネント:** HeadlessUIを使用してアクセシビリティを確保する。

## ディレクトリ構成

```
apps/
├── client/     # Frontend (Vue 3 SPA)
│   └── src/
│       ├── components/  # Vue コンポーネント
│       ├── assets/      # 静的アセット
│       └── App.vue      # ルートコンポーネント
├── server/     # Backend (Hono/Cloudflare Workers)
│   └── src/
│       └── index.ts     # API エントリポイント
└── share/      # 共有コード
    └── index.ts  # 型定義・バリデーション
```

## 技術スタック

| レイヤー   | 技術                                            |
| ---------- | ----------------------------------------------- |
| Frontend   | Vue 3, Vite, UnoCSS, HeadlessUI, TanStack Query |
| Backend    | Hono, Cloudflare Workers                        |
| DB         | Turso, Drizzle ORM                              |
| Auth       | Clerk                                           |
| Validation | Arktype, Drizzle-Arktype                        |
| Build      | Turborepo, Bun                                  |

## 開発ガイドライン

### API設計

- RESTful原則に従う
- エンドポイントは `/api/` プレフィックスを付ける
- レスポンスはJSON形式

### コンポーネント設計

- コンポーネントは `apps/client/src/components/` に配置
- ファイル名は PascalCase (例: `UserProfile.vue`)
- Props と Emit は明確に定義

### スタイリング

- UnoCSSのユーティリティクラスを使用
- TailwindCSS互換記法を使用するが、直書きは避けて、shortcut/ruleなどでセマンティックに作成
- カスタムテーマが必要な場合は `uno.config.ts` で定義

### テスト

- `apps/share`: Unit テスト (`bun:test`)
- `apps/server`: Unitテスト・API/Integration テスト（`bun:test`, `hono/testing`,）
- `apps/client`: Composable テスト

- Unit Test

## コマンド

```bash
# 開発サーバー起動
bun run dev

# 本番ビルド
bun run build

# Frontend のみ起動
cd apps/client && bun run dev

# Backend のみ起動
cd apps/server && bun run dev

# Backend デプロイ
cd apps/server && bun run deploy
```

## 環境変数

`.env.local` に以下を設定:

```env
CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***
TURSO_DB_URL=libsql://*.turso.io
TURSO_DB_AUTH_TOKEN=***
CF_ACCOUNT_ID=***
CF_API_TOKEN=***
```
