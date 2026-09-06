## Procedure When Starting Work on the Project

1. **Check the working location and current changes**

   ```bash
   pwd
   git status --short --branch
   git worktree list
   ```

   Do not confuse the target worktree or branch with another one. Do not treat existing changes as your own, and do not discard or overwrite them.

2. **Prepare only the required local configuration**

   For work that requires environment variables, confirm the private key and `AGE_IDENTITY_FILE` configuration before proceeding. Do not commit plaintext environment variables or credentials.

   When using a local database, create the database only on the first setup.

3. **Check the verification state before making changes**

   Select verification commands appropriate to the files or functionality being changed, and, when possible, run them before making changes to establish a baseline. If there are existing failures, record them before starting so they are not mistaken for failures introduced by your changes. Available commands are listed under "Verification."

## Project Invariants

1. **Respect boundaries:** `apps/client` must not import `drizzle-orm` directly. All database operations must go through the API in `apps/server`.
2. **Shared logic:** Type definitions and validation logic should be placed in `apps/share` whenever possible and shared by importing them from both `apps/server` and `apps/client`.
3. **Build principle:** `apps/client` is served as an SPA. Do not use SSR.
4. **API communication:** Use Hono RPC (`hc<AppType>`). Manual `fetch` calls and hard-coded URL strings are prohibited.
5. **Authentication:** Use Clerk for authentication logic and enforce authorization at the Hono middleware layer. Client-side permission checks are for UX purposes only.
6. **Tests:** When adding new functionality, always propose corresponding tests together with the change (`apps/share`: Unit, `apps/server`: API/Integration, `apps/client`: Component).
7. **Styling:** Use UnoCSS. Prefer Tailwind-compatible utility classes.
8. **Components:** Use HeadlessUI to ensure accessibility.

## Development Guidelines

### API Design

- Follow RESTful principles.
- Prefix endpoints with `/api/`.
- Use JSON responses (use TanStack Query and Hono RPC).

### Component Design

- Place components under `apps/client/src/components/`.
- Use PascalCase file names (e.g. `UserProfile.vue`).
- Define Props and Emits explicitly.

### Styling

- Use UnoCSS utility classes.
- Use TailwindCSS-compatible syntax, but avoid writing utility combinations inline where possible; prefer semantic abstractions using shortcuts, rules, and similar mechanisms.
- Define custom themes in `uno.config.ts` when needed.

### Testing

- `apps/share`: Unit tests (`bun:test`)
- `apps/server`: Unit and API/Integration tests (`bun:test`, Hono `app.request`)
- `apps/client`: Unit / Composable tests (`bun:test`)

## Commands

```bash
# Start development servers
vp run dev

# Production build
vp run build

# Start Frontend only
cd apps/client && bun run dev

# Start Backend only
cd apps/server && bun run dev

# Verify Backend deployment (dry-run)
cd apps/server && bun run deploy
```

## Verification

Use the repository's existing Vite+ task definitions for verification.

- Build: `vp build apps/client`
- Typecheck: `vp run --filter './apps/*' --cache typecheck`
- Lint: `vp lint apps/client/src`
- Tests: `bun test --isolate`

Prefer these repository-level commands over invoking `vite`, `vue-tsc`,
or package-local scripts directly unless debugging the command itself.

A verification is considered clean only when the command succeeds and
produces no linter warnings introduced by the change.

Lint must complete without warnings in files changed by the task.
