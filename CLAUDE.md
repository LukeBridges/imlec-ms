# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

Multi-tenant event site (IMLEC). Four parts:

- `app/` — Angular 22 SPA (NgRx store, Angular Material). Own `package.json`.
- `api/` — Express 5 + TypeScript API (own `package.json`). Serves JSON config/content and parses Excel data.
- `common/models/` — TS types shared by `app` and `api` (e.g. `Config`). Imported by relative path (`../../../../../common/models/...`).
- `config/`, `data/` — per-event files keyed by a **hash** (e.g. `mmes`). `config/<hash>.json` = feature flags, colour, data filenames. `config/content/<hash>.json` = page content. `data/<hash>/*.xlsx` = entries and scores spreadsheets (`data/` is gitignored).
- `backend/upload/` — PHP file manager for uploading spreadsheets (needs untracked `backend/auth_users.php`).

## Commands

App (run in `app/`):

- `npm run serve` — dev server on :4200 (`environment.ts` points at API `http://localhost:4201`)
- `npm run serve:api` — starts API (`cd ../api && npm run serve`, nodemon + ts-node)
- `npm run build` / `npm run build:prod`
- `npm test` — `vitest --run` (Vitest 5, Analog vite plugin, jsdom, specs `src/**/*.spec.ts`)
- `npm run test:coverage` — v8 coverage; thresholds are 100% globally and per file (`vitest.config.ts`), so new code needs tests
- Single test: `npx vitest --run src/app/core/models/score.model.spec.ts` or `-t "name"`

API (run in `api/`): `npm run serve` (dev), `npm run build` (tsc to `api/dist`), `npm start`. Port from `PORT`, default 4201.

Build output goes to `dist/` at the repo root (gitignored); builders are `@angular/build` (application, dev-server, extract-i18n). Prod API URL is `https://bridges82.uk/imlec`.

## Architecture

**Hash-driven tenancy.** The host page defines `window.IMLEC = {hash}`. `ContextService` reads it; services append the hash to API URLs (`/api/config/:hash`, `/api/content/:hash`, `/api/entries/:hash`, `/api/scores/:hash`). The API does a dynamic `import('../config/<hash>.json')`; unknown hash → 404. Entries/scores endpoints read the xlsx named in `config.data` from `data/<hash>/` via `read-excel-file` (header row dropped). Note: API paths are relative to cwd, so run it from `api/`.

**Feature modules** under `app/src/app/`: `about`, `food`, `hotels`, `listings`, `rules`, `scoreboard`, `welcome`, `winners`, plus `core` (shell, routing, root reducers) and `components` (shared UI). Which sections show is gated by `Config.features` flags.

**State.** NgRx root reducers are in `core/reducers/index.ts`: `router`, `scores`, `entries`, `config`, `content`. `scores`/`entries` reducers live in their feature modules (`scoreboard/`, `listings/`); each feature follows `actions/ components/ containers/ effects/ reducers/ selectors/ services/`. Containers select from the store; components are presentational.

**Data fetching.** Services extend `core/services/base-fetch-from-json.service.ts` (`fetchFromJson` adds a cache-busting `?timestamp`, and converts array-of-objects rows into arrays of values via `Object.values`). Effects call services and dispatch results into the store. Spreadsheet column order therefore matters: models such as `core/models/score.model.ts` and `loco.model.ts` map by array position.

## Notes

- Tests use `globals: true` (no imports for `describe`/`it`/`expect`).
- Working tree on `feature/IMLEC-52` has a large uncommitted Angular/package upgrade; commits reference Jira-style keys (`IMLEC-NN`).
