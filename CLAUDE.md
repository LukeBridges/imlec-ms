# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

IMLEC event site for Maidstone Model Engineering Society: an Angular SPA (`app/`) backed by a small Express API (`api/`). The root `README.md` is empty and `app/README.md` is stale Angular CLI boilerplate (says Angular 8/Karma; actual stack is Angular 20 + Vitest).

## Commands

App (run from `app/`):
- `npm run serve` — dev server on http://localhost:4200 (uses `environment.ts`, API at `http://localhost:4201`)
- `npm run serve:api` — starts the API (delegates to `api/`)
- `npm run build` / `npm run build:prod` — output goes to `../dist` (repo root, not `app/dist`); prod swaps in `environment.prod.ts`
- `npm test` — `vitest --run` (jsdom, `src/**/*.spec.ts`, setup in `setupVitest.ts`)
- Single test: `npx vitest --run src/app/core/services/config.service.spec.ts` (or `-t "name"`)

API (run from `api/`):
- `npm run serve` — `nodemon api.ts` on port 4201 (or `$PORT`)
- `npm run build` (`tsc` → `api/dist`), `npm start`

## Architecture

**Multi-tenant by "hash".** One codebase serves different events/sites, keyed by a string hash. The host page sets `window.IMLEC = { hash: 'mmes' }` inline in `app/src/index.html`; `ContextService` reads it, and `ConfigService`, `ContentService`, `EntriesService` and `ScoresService` append it to their API URLs.

**API (`api/api.ts`, single file, Express 5)** — every route is `/api/<thing>/:hash`:
- `/api/config/:hash` → `config/<hash>.json` (typed by `common/models/config.model.ts`: primary colour, feature flags, data filenames)
- `/api/content/:hash` → `config/content/<hash>.json` (HTML content blocks)
- `/api/entries/:hash` and `/api/scores/:hash` → reads the xlsx files named in the config from `../data/<hash>/` (via `read-excel-file`), drops the header row, returns raw row arrays. `data/` is gitignored, so it is absent from a fresh checkout.
- Serves `api/public/` statically (assets, and the standalone `clock/` page).
- Config is loaded with dynamic `import()` of JSON built from the request hash; unknown hash → 404.

**`common/`** holds TypeScript models shared by both sides; the app imports them by relative path (`../../../../../common/models/...`), and `api/tsconfig.json` doesn't include it as a root, so keep it to plain types.

**App (`app/src/app`)** — NgModule-based (not standalone), NgRx for state:
- `core/` — shell (header/sidebar, `MainComponent`), routing, and the config/content NgRx slices (actions/effects/reducers/selectors), plus the shared services and models (`loco`, `score`).
- Feature modules are lazy-loaded from `core/app-routing.module.ts`: `scoreboard`, `listings`, `rules`, `hotels`, `food`, `winners`, `welcome`, `about`. `scoreboard` and `listings` have their own NgRx slices and services that fetch xlsx-derived rows and map them into the `loco`/`score` models.
- Feature flags in the config (`applicationForm`, `scoreboard`, `listings`, `fullListings`, `rules`) control which features the UI exposes.
- Test mocks live in `app/src/test/mock/`.

**Other:** `backend/upload/index.php` is a PHP file manager (auth from a gitignored `backend/auth_users.php`) used to upload the data files on the hosting server. Root `manifest.json` (PWA, scope `/imlec/`) is separate from `app/src/manifest.json`. Production API is `https://bridges82.uk/imlec`. Root `.gitignore` also ignores built output (`/*.js`, `/index.html`, etc.), which is the deployed build placed at the repo root.
