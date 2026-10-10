# Progress

Legend: `[ ]` todo · `[~]` in progress · `[x]` done. Resume from the first unfinished item; read DECISIONS.md first.

## Phase 0 — Setup  `[x]`
- [x] Fork library to `../ui-library-hex` (identical to original, original untouched)
- [x] Next.js 16 App Router, TS strict, Tailwind 4 (postcss), vitest, eslint — `proofgraph-app/`
- [x] `scripts/sync-ui.sh` copies the fork into `src/ui`
- [x] `PRODUCT_NAME` config, `/api` rewrite, `.env.example`
- [x] Gate: tsc, eslint, vitest (86 files / 314 tests), `next build` pass

## Phase 1 — Hex tokens + skin (in fork)  `[x]`
- [x] Hex tokens (light, 2 dark blocks), self-hosted fonts, skin registry, playground switcher — fork `ui-library-hex`
- [x] 24 recipe overrides; 86 elements token-only (list in the fork's PROGRESS.md)
- [x] Gate: tsc, eslint, vitest x3 skins, Playwright 336 renders under hex (0 problems)
- [ ] Re-sync into `src/ui` and switch the app to `data-skin="hex"` (Phase 4, with the shell)
## Phase 2 — New hex elements (in fork)  `[x]`
- [x] PaperGrain, PageFrame + GuideLine, Arcs, CropMarks, HexBadge, LabelTab, AppWindow, Quote, Composer, Terminal, DisplayHeading — each with recipe, test and playground page (fork, group "Hex pieces")
- [x] Gate: tsc, eslint, vitest 98 files / 339 tests x3 skins; Playwright on new pages (hex + default) clean
## Phase 3 — Animations + Hex playground page (in fork)  `[x]`  → waiting for taste approval
- [x] 6 animations vendored (hex-ui 0.8.1 dist, licences kept) and wrapped under `blocks/motion/`; default-skin animation tokens
- [x] Playground: "Hex" page (top of sidebar) + "Motion" group (6 pages)
- [ ] Taste approval before Phase 4. Then: `npm run sync:ui` must also copy `vendor/` (update `scripts/sync-ui.sh`)
## Phase 4 — Data layer + shell  `[x]`
- [x] `src/lib/api`: zod schemas, errors (FastAPI `{detail}`), `client.ts` (only `fetch` caller, enforced by eslint), `mock-client.ts` (300-800 ms, localStorage state), `index.ts` mode switch
- [x] `src/lib/queries`: TanStack hooks (session, notifications with optimistic read, settings, home)
- [x] `src/lib/nav/nav-config.ts`: nav for 4 roles, all planned pages listed; catch-all `[role]/[...slug]` renders ComingSoon, unknown slugs are real 404s
- [x] AppFrame (AppShell + WorkspaceSwitcher flagged in `FEATURES`), RoleGate, NoAccess (403), ComingSoon, minimal login
- [x] Library fork: `"use client"` added to 49 hook-using modules + guard test `lib/use-client.test.ts`
- [x] Gate: tsc, eslint, vitest 111 files / 387 tests, `next build`, `scripts/check-shell.mjs` 16 browser checks (redirects, 403, 404, role switch, 360px, sign out)
## Phase 5 — Pages  `[x]`
- [x] Landing `/` (HeroWaves masked behind the hero, StaggeredText lead, GlassPillNav, problem, claims→evidence→viva, three audiences, CTA)
- [x] `/login` (tabs: sign in / create account; GitHub for students, validated email for others; DotField backdrop)
- [x] `/onboarding` (Wizard: role → connect accounts → upload profile with ThoughtLine analysis → target role → done with AnimatedCheckbox tasks)
- [x] Role homes `/student /college /company /admin` (one `RoleHome`: PageHeader, StatCard row, What's next, Timeline) via `AsyncBoundary`
- [x] `/notifications` (unread state, optimistic mark read / all, empty), `/settings` (Profile, Connected accounts, Appearance, Privacy; toggles are Switch)
- [x] 404, 403 (`/no-access` + RoleGate), 500 (`error.tsx`), `/maintenance`, `/dev/ui` (404 in production), shared ComingSoon
- [x] Gate: tsc, eslint, vitest 114 files / 397 tests, `next build`; `check-routes.mjs` 68 renders (17 routes x light/dark x 1280/360) 0 problems; `check-shell.mjs` 16 and `check-flows.mjs` 17 browser checks pass
## Phase 6 — Gate, README, final report  `[x]`
- [x] README (run in mock/live, where pages and nav config are, how to add a core page, library sync, checks)
- [x] `npm run check` = typecheck + lint + vitest + build + routes + shell + flows: all pass (114 files / 397 tests; 68 route renders, 16 + 17 browser checks)
- [x] `src/ui` verified identical to the fork

## Phase 7 — Student pages on the Validater backend  `[x]`
- [x] Evidence API in `Api` (live + contract-replay mock): GitHub device flow, repositories, watcher, claims, scans + SSE stream, scores, score events, headline, proof graph, evidence source
- [x] Student pages: home, repositories, claims, live scan (list + detail with agent trace), skill graph (+ concept detail), missions, viva, integrity and appeals, resume studio, repo readiness, role fit, interview prep, DSA insights, growth timeline, opportunities, privacy and consent; public Proof Profile `/p/[handle]`
- [x] Tests for the mock evidence API, headline and role readiness
- [x] Gate: tsc, eslint, vitest, `next build`, `check-routes.mjs` over every student route
- [ ] College, company and admin pages (not requested)

## Final report
**Built**
- Library fork `../ui-library-hex` (original `ui-library` untouched): hex skin (tokens light + 2 identical dark blocks, self-hosted fonts, 24 recipe overrides, 86 elements token-only), 11 new elements (PaperGrain, PageFrame/GuideLine, Arcs, CropMarks, HexBadge, LabelTab, AppWindow, Quote, Composer, Terminal, DisplayHeading), six hex animations vendored and wrapped under `blocks/motion` (HeroWaves, DotFieldBackground, ThoughtLine, AnimatedCheckbox, GlassPillNav, StaggeredText), a "Hex" playground page and a "Motion" group. Default and alt skins still work; the suite passes under all three (105 files / 349 tests).
- App: data layer (zod, live + mock clients, mode switch, TanStack hooks), nav config for four roles, AppFrame/RoleGate/ComingSoon, and the 12 foundational pages plus `/dev/ui`.

**Gates passed** (app): tsc, eslint, vitest 114 files / 397 tests, next build, routes 68 renders 0 problems, shell 16, flows 17. Fork: tsc, eslint, vitest x3 skins, Playwright screenshot gate under hex, default, alt (see fork PROGRESS.md for the final run).

**Skipped / not done, and why**
- hex.tech was not fetched: the style was taken from hex-ui and its previews (the prompt allows this fallback). No logo, wording or imagery was copied.
- 86 library elements have no hex recipe override; they take the hex look from tokens (list in the fork's PROGRESS.md). Add overrides where a taste review wants more.
- Core feature pages, real auth and real endpoints: out of scope until the backend is final. Endpoint paths in `client.ts` are provisional.
- No commits were made.

**Open decisions**
- Privacy page granularity (per concept / repository) beyond the single Proof Profile row.
- Whether to keep `FEATURES.demoWorkspaceSwitcher` on outside demos (it should be off for real deployments).
- Licence review of the vendored animations (React Bits Commons Clause, GSAP standard licence) before any commercial release.
- Whether to give the 86 token-only elements their own hex recipes.

