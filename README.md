# ProofGraph app (frontend foundation)

Next.js (App Router, TypeScript strict) frontend for ProofGraph, built on the shared UI library with the **hex** skin. It runs entirely locally: no cloud services, no outside font or asset requests.

The shell, data layer and foundational pages, plus every **student** page, wired to the Validater FastAPI backend. College, company and admin feature pages are listed in the navigation and still render "Coming soon".

## Student pages

| Page | Route | Backend |
|---|---|---|
| Home | `/student` | `/students/{id}/headline`, `/scores`, `/score-events` |
| Repositories | `/student/repositories` | `/github/status`, device flow (`/github/device-authorization`, `/github/device-attempts/{id}/poll`), `/students/{id}/github-repositories` (+ `/connect`), `PUT /students/{id}/active-repository`, `/repositories/{id}/watcher` |
| Claims | `/student/claims` | `GET`/`PUT /students/{id}/claims` |
| Live scan | `/student/scans`, `/student/scans/[scanId]` | `/repositories/{id}/scans` (list, `POST`), `/scans/{id}`, `/scans/{id}/events`, `/scans/{id}/stream` (SSE) |
| Skill graph | `/student/skill-graph`, `/student/skill-graph/[conceptId]` | `/students/{id}/proof-graph`, `/scores`, `/evidence/{id}/source` |
| Missions, Viva, Integrity and appeals, Resume studio, Repo readiness, Role fit, Interview prep, Growth timeline | `/student/<slug>` | derived from the scores, score events and proof graph |
| Opportunities, DSA insights, Privacy and consent | `/student/<slug>` | provisional product endpoints (below) |
| Public Proof Profile | `/p/[handle]` | headline and scores, filtered by the student's "public" consent |

The backend has no session or "current student" endpoint, so the student id from the GitHub device flow and the connected repositories are remembered in the browser (`pg.validater.workspace`, see `src/lib/api/workspace-store.ts`). Features the backend does not serve yet (viva sessions, opportunities, LeetCode insights, privacy, appeals) go through `getProduct`/`saveProduct` and `startViva`/`gradeViva`; their paths in `PRODUCT_PATHS` (`client.ts`) are provisional.

**Mock mode** replays the backend's own contract JSON (`src/lib/api/contracts/`): baseline, then "add caching", then "remove caching". Each "Scan now" advances a stage, so scores, events and evidence states change exactly as the real backend reports them. `?live=1` on a scan page replays its events as a stream.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000, mock mode
```

| Mode | How | What happens |
|---|---|---|
| **mock** (default) | `NEXT_PUBLIC_API_MODE=mock` or unset | Fixtures with a 300-800 ms delay. Session, read notifications and settings persist in the browser (localStorage). No network. |
| **live** | `NEXT_PUBLIC_API_MODE=live npm run dev` | Calls `/api/*`, which `next.config.ts` rewrites to `http://localhost:8000/*` (the FastAPI backend). Errors are read from FastAPI's `{ "detail": ... }`. |

Copy `.env.example` to `.env.local` to set the mode persistently. The mode is read at build time (`NEXT_PUBLIC_*`), so rebuild after changing it for `npm run build`.

In mock mode, sign in with any role from `/login` (students use GitHub, other roles an email). The sidebar's workspace switcher jumps between roles; it is a demo convenience, switched by `FEATURES.demoWorkspaceSwitcher` in `src/lib/config.ts`.

## Where things are

```
src/
  app/
    (public)/        landing /, /maintenance, /no-access, /dev/ui (dev only)
    (auth)/login/    sign in / create account
    onboarding/      5-step wizard
    (app)/           signed-in area (AppFrame: sidebar, topbar)
      [role]/        /student /college /company /admin  (home), student pages, and planned pages
    (public)/p/[handle]  public Proof Profile
      notifications/ settings/
    not-found.tsx error.tsx    404 and 500
  components/        AppFrame, AppPage, RoleHome, RoleGate, NoAccess, ComingSoon, SignInForm, Providers
  features/student/  the student pages (one module per page, shared.tsx for badges and evidence snippets)
  lib/
    config.ts        PRODUCT_NAME, roles, feature flags, API mode
    api/             schemas.ts, evidence-schemas.ts (backend shapes), product-schemas.ts (not yet served), client.ts (live),
                     mock-client.ts, mock-evidence.ts (contract replay), mock-product.ts, contracts/, errors.ts, index.ts (mode switch)
    domain/          concepts and signals, proof-graph index, role readiness, missions
    queries/         TanStack Query hooks (pages never fetch directly)
    nav/nav-config.ts   navigation per role  <- the structure is final
  ui/                COPY of the UI library (do not edit by hand, see below)
scripts/             sync-ui.sh and the browser checks
```

Rules the code follows: pages never call `fetch` (eslint enforces it outside `src/lib/api/client.ts`); no literal colours (semantic tokens only); every page has loading, empty and error states through `AsyncBoundary`.

**Rename the product** by changing `PRODUCT_NAME` in `src/lib/config.ts`.

## Add a core page later

The navigation already lists every planned page, so adding one never changes the sidebar.

1. Find its entry in `src/lib/nav/nav-config.ts` (for example `student` → `skill-graph`, href `/student/skill-graph`).
2. Put the page in `src/features/<role>/`, then create `src/app/(app)/[role]/<slug>/page.tsx` that calls `expectRole(params, "<role>")` and renders it. Add the href to `BUILT_PAGES` in the nav config so the catch-all stops generating "Coming soon" for it.
3. Add its schemas to `src/lib/api/schemas.ts`, endpoints to `client.ts` **and** the same functions to `mock-client.ts` (both implement `Api` in `types.ts`, so the compiler checks they match), and a hook in `src/lib/queries/`.
4. `RoleGate` already protects everything under `/[role]`.

A page that is not in the nav config is a real 404.

## The UI library and the hex skin

`src/ui` is a copy of the library fork at `../ui-library-hex` (kept outside this repository; `src/ui` is committed in full, so the app builds without it, and `npm run sync:ui` only works where the fork sits next to the app or `UI_LIBRARY_PATH` points at it) (itself a fork of the original `ui-library`, which is untouched). The library is the source of truth: **fix an element there first, then re-copy** so nothing drifts.

```bash
npm run sync:ui      # copies ui, blocks, layout, hooks, lib, skins, tokens, test, fonts, vendor, tailwind.css
```

The app ships only the hex skin: `<html data-skin="hex">` selects the tokens and `Providers` supplies the hex recipes. Fonts are self-hosted (`src/ui/fonts`). The six hex animations are vendored (`src/ui/vendor/hex-animations`, with their licence file; read `VENDOR.md` there about the Commons Clause and GSAP terms).

## Checks

```bash
npm run typecheck && npm run lint && npm test      # types, lint, unit tests (includes the library's own)
npm run build
npm run check:routes   # every route, light + dark, 1280 + 360 px: console errors, failed requests, overflow
npm run check:shell    # redirects, 403/404, role switch, mobile nav, sign out
npm run check:flows    # onboarding, notifications, settings, /dev/ui hidden in production
npm run check          # all of the above
```

The browser checks start `next start` themselves, so run `npm run build` first. They use system Chrome (`/usr/bin/google-chrome-stable`, falling back to Playwright's Chromium in `/opt/pw-browsers`) and write screenshots to `.screenshots/`.

## Production notes

- `/dev/ui` returns 404 in production builds.
- Evidence endpoints in `src/lib/api/client.ts` match the Validater backend; `PRODUCT_PATHS` and the viva paths are provisional.
- Mock auth sets a role directly; it is not security. The live backend must enforce roles.
