# Decisions

Newest last. Format: decision — reason.

## Setup
- **Location:** `~/Desktop/projects/edufrontfront/proofgraph-app/` — user instruction.
- **Library fork:** the original `~/Desktop/projects/libraries/edufront/ui-library` is never modified. Library changes (hex skin, new elements, animations) are made in a fork at `~/Desktop/projects/edufrontfront/ui-library-hex/`, copied from the original on 2026-10-10 (identical at copy time, verified with `diff -r`; excludes node_modules, dist, .screenshots). — user instruction.
- **Library to app:** `scripts/sync-ui.sh` copies the fork's `ui blocks layout hooks lib skins tokens test tailwind.css` into `src/ui` (playground, scripts and examples stay in the fork). `src/ui` is never edited by hand: fix in the fork, then `npm run sync:ui`. First sync: 2026-10-10 (script stamps UTC date 2026-10-09), library state = original ui-library at its current PROGRESS.md (all steps done, 86 test files / 314 tests passing in the app).
- **Skins:** the fork keeps the default and alt skins and adds hex; the app ships only hex.
- **Product name:** `PRODUCT_NAME` in `src/lib/config.ts` — single constant, one-line rename.
- **Versions:** exact pins copied from the library (React 19.3.0, Tailwind 4.3.3, TS 6.0.3, zod 4.6.5); Next 16.4.0 and TanStack Query 5.104.1 resolved from npm on 2026-10-10.
- **Tailwind in Next:** `@tailwindcss/postcss` plugin; `src/app/globals.css` imports `src/ui/tailwind.css` (library tokens + theme mapping unchanged).
- **Tests:** vitest runs the library's own element tests inside the app (`src/**/*.test.*`) so a bad sync is caught.
- **API:** `/api/*` rewrites to `http://localhost:8000/*` in `next.config.ts`; mode switch `NEXT_PUBLIC_API_MODE=mock|live` (see `.env.example`), wired in Phase 4.
- **Browser for Playwright:** system `/usr/bin/google-chrome-stable`.
- **Scope (user answers):** 12 foundational pages + dev page + shared "Coming soon"; core pages wait for the backend. Landing uses HeroWaves only; sign-in uses DotField; HxCheckbox only for checklists (Switch for settings toggles). Fixtures: eight concepts (REST APIs, Authentication, Database Design, Asynchronous Work, Caching, Automated Tests, CI/CD, Error Handling); concept status only verified/weak/unverified; evidence states accepted/rejected/superseded/replaced; Honesty and Readiness 0-100.
- **Process:** stop and report after every phase; pause for taste approval after Phase A (Hex playground page); no commits.

## Phase 4
- **Library fix, upstream first:** Next Server Components failed on the library because 49 modules used hooks/useRecipe without `"use client"`. Fixed in the fork (not in `src/ui`), guarded by a test, re-synced.
- **Sync now copies** `fonts/` and `vendor/` too; fontsource deps dropped from the app.
- **Mock state** lives in localStorage (session, read notifications, settings per role) so refresh keeps you signed in; no network in mock mode.
- **Planned pages** are statically generated from the nav config, so a typo URL is a genuine 404.
- **Sign-out** marks intent (`markSigningOut`) so the login redirect does not carry a `next` to a page the user left.
- Endpoint paths in `client.ts` are provisional until the backend is final.

## Phase 5
- **Hero text is not placed on the waves.** Light waves have a pale crest, so headline text on them is unreadable; the waves sit masked behind the lower part of the hero and the copy stays on the paper background.
- **Onboarding sits outside the app frame** (no sidebar) but requires a session; creating an account goes there, signing in goes to the requested page or the role home.
- **Role chosen in onboarding** is applied with `switchRole` at finish (mock auth only; the live backend decides roles).
- **Privacy tab** binds one row (Proof Profile) to the three consent audiences; finer rows wait for the privacy page. `PermissionMatrix` placeholder per the brief.
- **Density** is stored in settings and applied as `data-density` on `<html>`; theme uses the library's `useTheme` (same key as the boot script).
- **Mock persistence is asynchronous** (it writes after its simulated delay), so tests wait before reloading.
- **/dev/ui** returns 404 when `NODE_ENV=production`.

## Student pages (Validater backend)
- **Scope:** student pages only; college, company and admin stay "Coming soon" — user instruction.
- **No session endpoint:** the backend is not an auth server, so the student id (from the GitHub device flow) and connected repositories live in localStorage (`pg.validater.workspace`). Pages without a student show "Connect GitHub first".
- **Contract replay for mocks:** the backend's own JSON responses are copied into `src/lib/api/contracts/` and replayed stage by stage, so mock mode cannot drift from the real shapes. Schemas are lenient (zod with defaults) and normalise `metadata_json`/`created_at` on scan events.
- **Scoring is the backend's:** the UI never recomputes scores. Readiness for other roles reuses the backend formula with weights (`lib/domain/roles.ts`); the job-description parser is keyword-based, with no model.
- **Display status** comes from the score's status: Verified (viva passed), Evidence-backed (code evidence only), Unverified.
- **Not-yet-served features** (viva sessions, opportunities, LeetCode, privacy, appeals) use one generic `getProduct`/`saveProduct` pair with provisional paths, so wiring them later is a path change.
- **Scan stream:** live mode reads `/scans/{id}/stream` (SSE, `scan_event`, id = sequence number); mock mode replays stored events with `?live=1`.
- **Search params** are read in the server page and passed as props, avoiding a Suspense boundary for `useSearchParams`.
- **Public profile** renders the browser's own student (owner preview) until the backend has a handle lookup, and shows a warning while the profile is private.
