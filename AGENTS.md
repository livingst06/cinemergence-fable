<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Package manager is pnpm `10.12.1` (`packageManager` in `package.json`). Install with `pnpm install --frozen-lockfile`.
- Local Postgres listens on `127.0.0.1:5433` with database, user, and password `cinemergence` (same URL as `.env.example`). Cloud agents use the system PostgreSQL 16 cluster, not Docker. `docker compose up -d` remains the laptop path.
- If `.env.local` is missing, copy `.env.example`. Do not set `S3_*` locally. Public pages render without Clerk keys; `/admin` needs a Clerk account.
- Payload schema push is disabled in `src/payload.config.ts`. An empty database is restored from `/opt/cinemergence-schema.sql`. After the dev server is up, `pnpm seed` loads editorial content.
- Dev server: `pnpm dev --hostname 0.0.0.0 --port 3000`. Site: http://localhost:3000. Admin: http://localhost:3000/admin.
- `pnpm test` runs the Vitest unit suite. `pnpm build` is the production build. `pnpm lint` currently reports existing violations in the app.
- Accepter une PR seulement sur demande explicite : squash sur `main` (`gh pr merge <n> --squash --delete-branch`), puis supprimer la branche sur GitHub, en local sur le PC et dans le Cloud. Détail dans `.cursor/rules/pr-squash-delete-branch.mdc`. `pnpm install` active le hook `.githooks/post-merge`, qui enlève les branches locales déjà parties du remote au prochain `git pull`.
