# imlec-ms

Multi-event website for IMLEC: event information, entry listings and a live scoreboard. Each event is identified by a hash (for example `mmes`) that selects its configuration, content and spreadsheets.

## Structure

| Path | Purpose |
| --- | --- |
| `app/` | Angular single-page app (NgRx, Angular Material) |
| `api/` | Express API serving config, content, entries and scores |
| `common/models/` | TypeScript types shared by `app` and `api` |
| `config/<hash>.json` | Per-event feature flags, primary colour and spreadsheet file names |
| `config/content/<hash>.json` | Per-event page content |
| `data/<hash>/` | Per-event Excel files (entries and scores). Not committed |
| `api/backend/`, `api/src/files/` | File manager (UI at `/backend/`, JSON at `/files/api`) for uploading spreadsheets. Needs an untracked `api/auth_users.json` (see `api/auth_users.example.json`). Replaces PHP `backend/upload/` (see `api/PARITY.md`) |

## Getting started

Install dependencies in both projects:

```bash
cd api && npm install
cd ../app && npm install
```

Run the API (port 4201, or `PORT`) from `api/`:

```bash
npm run serve
```

Run the app (http://localhost:4200) from `app/`:

```bash
npm run serve
```

The page that hosts the app must define `window.IMLEC = { hash: '<hash>' }`. The app uses this to request `/api/config/<hash>`, `/api/content/<hash>`, `/api/entries/<hash>` and `/api/scores/<hash>`. See `app/README.md` for app commands and `api/` scripts for building the API.

## Adding an event

1. Add `config/<hash>.json` (copy `config/mmes.json`).
2. Add `config/content/<hash>.json`.
3. Put the entries and scores spreadsheets in `data/<hash>/`, using the file names set in `data` in the config.
