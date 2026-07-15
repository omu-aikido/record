# セキュリティレビュー報告書

実施日: 2026-07-15

## エグゼクティブサマリー

レビュー時点では Critical / High の確定所見はなく、Medium 4件、Low 3件を確認しました。本ブランチでは SEC-001〜007 のコード上の対策を実施しました。Cloudflare の rate limit は濫用抑止であり、ロケーション単位かつ最終整合的なため、厳密な回数保証や課金制御には使えません。また、Clerk のプロフィール画像アップロードと CAPTCHA を含む本番 E2E はデプロイ後に確認が必要です。

優先度が高いのは、Clerk セッショントークンの `azp`（authorized party）を検証していないこと、Clerk Backend API の `User` オブジェクトをそのままブラウザへ返していること、活動記録 API がクライアントの上限をサーバー側で強制していないことです。いずれも直ちに匿名の第三者が侵入できる類ではありませんが、認証境界、バックエンド専用データ、ランキングの完全性という重要な境界が将来の設定変更や悪用に弱い状態です。

一方、以下は確認できました。

- 管理 API とユーザー API はサーバー側ミドルウェアで認証・認可されており、Vue Router のガードだけには依存していません。
- ユーザー入力を `v-html`、`innerHTML`、`eval` 等へ渡すコードは見つかりませんでした。
- DB クエリは Drizzle の式ビルダーを使用しており、未検証入力を SQL 文字列へ直接連結する箇所は見つかりませんでした。
- Clerk webhook は Svix 署名を検証しています。
- 追跡対象ファイルから実値らしい秘密情報は検出されず、`bun audit` は `No vulnerabilities found` でした。

## 対象と方法

対象は `apps/client`（Vue 3 SPA）、`apps/server`（Hono / Cloudflare Workers）、`apps/share`、デプロイ設定、依存関係です。ソース、テスト、ロックファイル、生成されるレスポンスヘッダー、およびインストール済み SDK の型・実装を確認しました。実運用の Cloudflare Dashboard、Clerk Dashboard、DNS、WAF、実データは対象外です。

## Medium

### SEC-001: Clerk の許可オリジンとユーザートークン種別が制約されていない

- Rule ID: AUTH-ORIGIN-001
- Severity: Medium
- Location: `apps/server/src/index.ts:45-51`、`apps/server/src/middleware/signedIn.ts:4-9`、`apps/server/src/middleware/admin.ts:14-24`、`apps/server/package.json:18`
- Evidence:

  ```ts
  const middleware = clerkMiddleware({
    publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
    secretKey: c.env.CLERK_SECRET_KEY,
  });
  ```

  `authorizedParties` がありません。また、採用中の `@hono/clerk-auth@3.1.1` は非推奨で、インストール済み実装は `authenticateRequest(..., { acceptsToken: "any" })` を使用します。ユーザー向けミドルウェアは `auth.isAuthenticated` だけを確認し、`tokenType === "session_token"` と有効な `userId` を明示的には要求していません。

- Impact: 同一ルートドメイン上の別サブドメインが侵害された場合などに、想定外の origin で発行された有効な Clerk セッショントークンを API が受理する余地があります。Clerk は `authorizedParties` 未設定を CSRF / subdomain cookie leaking 対策上のリスクとして明示しています。また、機械トークンをユーザーセッションとして処理する設計は、現状では多くの経路が `userId` 不在で失敗するものの、将来のエンドポイント追加時に認可バイパスへ発展しやすい状態です。
- Fix: 公式の `@clerk/hono` へ移行し、環境ごとの正規 origin を `authorizedParties` に設定してください。ユーザー API と管理 API は `session_token` のみを許可し、`isAuthenticated` に加えて `tokenType` と `userId` を確認する共通ミドルウェアに寄せます。機械トークンが必要な API は別ルート・別認可ポリシーに分離します。
- Mitigation: Hono の CSRF ミドルウェアを webhook より後、cookie 認証を受ける状態変更ルートより前に置き、同一 origin を検証します。SEC-005 の CORS 制限も併用します。
- False positive notes: 信頼できない兄弟サブドメインが存在せず、Clerk cookie が常に厳密にホストスコープされ、API が機械トークンを受け取らない運用なら直近の悪用可能性は下がります。ただし Clerk 自身が本番設定で `authorizedParties` を強く推奨しており、防御を省略する根拠にはなりません。

参考: [Clerk: Configure authorizedParties for secure request authorization](https://clerk.com/docs/guides/development/deployment/production)、[Clerk: authenticateRequest()](https://clerk.com/docs/reference/backend/authenticate-request)

### SEC-002: Clerk Backend User オブジェクトをレスポンスへそのまま直列化している

- Rule ID: DATA-MIN-001
- Severity: Medium
- Location: `apps/server/src/app/user/clerk.ts:13-18`、`apps/server/src/clerk/profile.ts:86-97`、`apps/client/src/components/account/UserHeader.vue:75-80`
- Evidence:

  ```ts
  const user = await getUser(c);
  if (!user) return c.json({ error: "User not found" }, 404);
  return c.json(user, 200);
  ```

  `getUser()` は Clerk Backend API の `User` を返します。この型には `privateMetadata`、`unsafeMetadata`、メール・電話・外部アカウント、MFA 状態などが含まれます。一方、クライアントが実際に使用するのは `username`、`lastName`、`firstName`、`imageUrl` だけです。

- Impact: 現在または将来 `privateMetadata` に格納されるバックエンド専用フラグ、内部メモ、連携 ID 等が、認証済み本人のブラウザへ漏れる可能性があります。本人向け API でも、Backend API 専用データを返してよいとは限りません。不要な認証状態・PII もレスポンス、ブラウザメモリ、クライアントログの露出面を増やします。
- Fix: サーバーで明示的なレスポンス DTO を作り、現在 UI が必要とする4フィールドだけを抽出してください。DTO の共有型と Arktype スキーマを `apps/share` に置き、API テストで `privateMetadata`、`unsafeMetadata`、`emailAddresses` 等がレスポンスに存在しないことを検証します。
- Mitigation: Clerk の `privateMetadata` にはブラウザへ返って困る値を置く前提を維持し、この API の修正が完了するまで特に秘密値を格納しないでください。
- False positive notes: 実運用の全ユーザーで `privateMetadata` と他の不要フィールドが空なら現在の実データ漏えいは発生していない可能性があります。ただしレスポンス契約自体が過剰である点は変わりません。

### SEC-003: 活動記録の業務制約をクライアントだけが持ち、API は異常値を受理する

- Rule ID: INPUT-INTEGRITY-001
- Severity: Medium
- Location: `apps/share/src/records.ts:23-26`、`apps/client/src/components/record/ActivityForm.vue:40-48`、`apps/server/src/app/user/record.ts:50-74`、`apps/server/src/app/admin/stats.ts:26-35`
- Evidence:

  ```ts
  export const createActivitySchema = type({
    date: /^\d{4}-\d{2}-\d{2}$/u,
    period: "number > 0",
  }).narrow((input) => isStrictIsoDate(input.date));
  ```

  UI は `min="0.5" max="8" step="0.5"` ですが、共有/API スキーマは正数であることしか検証しません。実行確認では `period: 0.1`、`8.5`、`1e100` と `date: "9999-12-31"` がすべて accepted でした。

- Impact: 認証済みユーザーはブラウザ制約を迂回して月間ランキング、昇級進捗、合計時間を任意に汚染できます。さらに管理者ダッシュボードは「3週間前以降の記録があるユーザー」を active とみなすため、遠い未来の日付を1件登録すると inactive 判定から長期間外れます。
- Fix: 期待仕様が UI と同じなら、共有スキーマで `0.5 <= period <= 8` と 0.5 単位を強制し、日付に許容範囲（少なくとも未来日禁止）を設けてください。時刻依存の未来日判定はサーバー側で JST の基準日を渡して行い、境界テストを先に追加します。異常な既存データの監査・補正も必要です。
- Mitigation: ランキング集計時にも妥当な範囲外の値を除外または警告し、管理画面で異常値を検出できるようにします。
- False positive notes: 8時間超、0.5時間未満、未来の予定入力が正式要件なら上限は要件に合わせる必要があります。その場合でも、実績ランキング・inactive 判定に予定値を混ぜないデータモデルが必要です。

### SEC-004: CSP がインラインスクリプトを全面許可している

- Rule ID: JS-CSP-002
- Severity: Medium
- Location: `apps/client/public/_headers:2`、`apps/server/src/index.ts:18-35`
- Evidence:

  ```text
  script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev ...
  ```

  SPA の静的レスポンスと Worker の CSP の両方で `script-src 'unsafe-inline'` を許可しています。さらに本番用カスタムドメインと開発用の `https://*.clerk.accounts.dev` が同時に許可されています。

- Impact: 将来 HTML 注入が発生した場合、インライン `<script>` やイベントハンドラを CSP が止められず、CSP の XSS 緩和効果が大きく下がります。現レビューでは直接の HTML 注入 sink は見つからなかったため、単独で即時 XSS になる所見ではありません。
- Fix: Vue SPA の本番ビルドと Clerk サインイン、Cloudflare challenge を検証しながら、まず `script-src` から `'unsafe-inline'` を削除してください。必要なインラインスクリプトが判明した場合は nonce / hash を用います。`style-src 'unsafe-inline'` は Clerk が現在要求しているため同列に削除しません。`form-action 'self'` と `base-uri 'self'` も追加し、本番では自身の Clerk FAPI ホストだけに絞ります。
- Mitigation: 先に Report-Only で違反を収集し、Clerk の認証・CAPTCHA を含む E2E を通してから enforce へ移行します。
- False positive notes: Clerk Vue SDK または別の本番機能がインラインスクリプトを必要とする可能性は、実環境で確認が必要です。その場合も blanket な `'unsafe-inline'` より nonce / hash を優先してください。

参考: [Clerk: Configure Content-Security-Policy headers](https://clerk.com/docs/guides/secure/best-practices/csp-headers)

## Low

### SEC-005: 同一 origin 構成なのに CORS が全 origin・全主要メソッドを許可している

- Rule ID: CORS-001
- Severity: Low
- Location: `apps/server/src/index.ts:41`、`apps/client/src/lib/honoClient.ts:4`
- Evidence:

  ```ts
  .use("*", cors())
  ```

  Hono のデフォルトは `Access-Control-Allow-Origin: *` です。実行確認でも攻撃者 origin の preflight に `204`、`ACAO: *`、`GET,HEAD,PUT,POST,DELETE,PATCH`、要求した `content-type` が返りました。クライアントは相対 URL `/` を使っており、本番 API は同一 origin 構成です。

- Impact: 現在は `Access-Control-Allow-Credentials` がないため、第三者 origin が cookie 付きレスポンスを読む直接の経路にはなっていません。ただし不要な cross-origin 契約が残り、将来 `credentials: true` や公開トークン API を追加した際に、設定の組み合わせでデータ露出へ変わりやすくなります。
- Fix: cross-origin クライアントが不要なら CORS ミドルウェアを削除してください。必要なら production/development の正確な origin、必要な method/header だけを allowlist します。
- Mitigation: SEC-001 の `authorizedParties` と CSRF origin 検証を独立して適用します。CORS は CSRF 対策そのものではありません。
- False positive notes: リポジトリ外に正当な別 origin クライアントが存在する場合は CORS 自体が必要です。その origin とユースケースを明文化した allowlist にしてください。

参考: [Hono CORS middleware（default origin は `*`）](https://hono.dev/docs/middleware/builtin/cors)、[Hono CSRF protection](https://hono.dev/docs/middleware/builtin/csrf)

### SEC-006: 認証・プロフィールオブジェクトをブラウザコンソールへ出力している

- Rule ID: VUE-HTTP-001
- Severity: Low
- Location: `apps/client/src/pages/SignUpVerify.vue:50-56`、`apps/client/src/composable/useSignUpVerify.ts:25-33`、`apps/client/src/components/account/ProfileCard.vue:220-225,275-286`
- Evidence:

  ```ts
  const signUp = clerk.value.client?.signUp;
  console.log(signUp);
  ```

  Clerk の sign-up attempt 全体と、誕生日等を含むプロフィール検証エラーが production bundle からコンソールへ出力されます。

- Impact: 共用端末、リモートデバッグ、ブラウザ拡張、将来導入される console 収集 SDK を通じて、本人の PII や認証フロー状態が不要に残る可能性があります。
- Fix: raw object の `console.log/error` を削除してください。必要な運用ログは機密値を含まない固定イベント名とエラーコードだけにし、development 限定にします。
- Mitigation: クライアントのログ収集サービスを導入する場合は console 自動収集を無効化し、送信フィールドの allowlist と保持期間を設定します。
- False positive notes: 現在 console を外部送信しておらず端末が専有なら影響は限定的ですが、不要なデバッグ出力であることは変わりません。

### SEC-007: 配列・multipart upload のアプリケーション上限がない

- Rule ID: RESOURCE-LIMIT-001
- Severity: Low
- Location: `apps/share/src/records.ts:28`、`apps/share/src/clerkClient.ts:3-8`、`apps/server/src/app/user/clerk.ts:20-59`、`apps/server/src/app/user/record.ts:80-101`
- Evidence:

  ```ts
  export const deleteActivitiesSchema = type({ ids: "string[]" });
  profileImage: "unknown?",
  ```

  削除 ID 数、文字列長、プロフィール画像の MIME type/サイズをアプリ側で制限していません。リポジトリ内には Hono `bodyLimit` やルート単位の rate limit も見当たりません。

- Impact: 認証済みユーザーが大きな `IN (...)` 条件や multipart body を繰り返し送信し、Worker CPU、DB、Clerk Backend API のコストや失敗率を上げられます。プラットフォーム上限は最終防壁ですが、アプリに適した小さい上限にはなりません。
- Fix: 削除件数、各 ID 長、画像サイズ、許可 MIME type を共有/API スキーマで制限し、Hono の body limit をルートに適用してください。高コストな更新にはユーザー単位の rate limit も検討します。
- Mitigation: Cloudflare WAF / rate limiting と Clerk 側の upload 制限が実運用で有効か確認し、413/429 を監視します。
- False positive notes: Cloudflare や Clerk の未確認設定ですでに厳しい制限がある場合、DoS の余地は小さくなります。ただし repo 内の契約としては保証されていません。

## 検証結果

- `bun audit`: 成功、既知脆弱性 0 件
- workspace ごとの typecheck:
  - `apps/share`: 成功
  - `apps/server`: 成功
  - `apps/client`: 失敗（既存の `apps/client/src/composable/useActivity.ts:31` で `data` が `unknown`、TS18046）。このタスクでは機能コードを変更しないため未修正。
- `bun test --isolate`: 183 pass / 0 fail
- `git diff --check`: 成功
- 管理者のユーザー削除テストで発見した authorization 条件の反転も修正済みです。
- `vp run typecheck`: sandbox の共有メモリ IPC 作成失敗で実行できなかったため、上記3 workspace を個別実行しました。したがって全workspace型検査は未完了です。

## 実装状況（2026-07-15）

| ID      | 状態           | 実施内容                                                                                                                                             |
| ------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-001 | 対応済み       | `@hono/clerk-auth` から `@clerk/hono` へ移行し、`CLERK_AUTHORIZED_PARTIES` を必須化。ユーザー・管理APIは `getAuth(c, { acceptsToken: "session_token" })` と有効な `userId` を要求する。 |
| SEC-002 | 対応済み       | account API を必要最小限の共有 DTO に変更し、private metadata 等を返さないAPIテストを追加。                                                          |
| SEC-003 | 対応済み       | `period` を 0.5〜8 時間・30分単位、日付を JST 基準で未来禁止にサーバー側でも制約。                                                                   |
| SEC-004 | コード対応済み | CSP の `script-src` から `'unsafe-inline'` を除去し、`base-uri` と `form-action` を追加。本番の Clerk / CAPTCHA を含むE2E確認が残る。                |
| SEC-005 | 対応済み       | 同一 origin 構成のため全許可 CORS ミドルウェアを削除。                                                                                               |
| SEC-006 | 対応済み       | 認証・プロフィールオブジェクトの生ログを削除し、開発時もメッセージだけを出力。                                                                       |
| SEC-007 | コード対応済み | Worker 全体に 10 MiB の body limit、一括削除を100件までに制限。画像は Worker を経由せず Clerk SDK で直接アップロードし、クライアントでは PNG/JPEG/WebP と 2 MiB をUXとして検証する。MIME type だけで画像内容の安全性は証明できないが、Worker は画像バイトを受け取らず、Clerk がアップロード処理を担う。アカウント更新（5回/60秒）、活動作成（20回/60秒）、一括削除（5回/60秒）には `userId:operation` キーの Cloudflare binding を適用する。binding はロケーション単位・最終整合的であり、厳密な上限保証ではない。 |

## 推奨修正順

1. SEC-001: Clerk middleware 移行、`authorizedParties`、session-token 限定
2. SEC-002: account response DTO と漏えい防止 API テスト
3. SEC-003: 活動記録の上限・未来日テストとサーバー検証
4. SEC-004: CSP を Report-Only で検証後に強化
5. SEC-005〜007: CORS、ログ、resource limit の整理
