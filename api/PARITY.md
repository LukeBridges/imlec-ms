# PHP file manager -> Express parity

Source: `backend/upload/index.php`. Target: `api/src` (routes under `/files/api`, UI at `/backend/`).
Tests: `api/src/routes/files.spec.ts` (HTTP), `api/src/files/safePath.spec.ts`, `api/src/routes/hash.spec.ts`.

| PHP action | Endpoint | Test group |
|---|---|---|
| Login / logout / session, 1s fail delay, readonly users | `POST /login`, `POST /logout`, `GET /session` | auth, readonly user |
| List (folders first, natural sort, hidden shown) | `GET /list?path=` | list / search |
| Search (recursive, skips dotfiles) | `GET /search?path=&q=` | list / search |
| Delete (recursive, multi) | `POST /delete` | mkdir / new / rename / delete |
| New file / folder | `POST /new`, `POST /mkdir` | mkdir / new / rename / delete |
| Rename (no overwrite) | `POST /rename` | mkdir / new / rename / delete |
| Copy (overwrites) / move (no overwrite), dest auto-created | `POST /copy`, `POST /move` | copy / move |
| Download (attachment) | `GET /download` | view / download / raw |
| Upload (multi, overwrite same name) | `POST /upload` | upload |
| Zip (`<name>_ymd_His.zip` / `archive_ymd_His.zip`) | `POST /zip` | zip / unzip |
| Unzip (here / to folder) | `POST /unzip` | zip / unzip |
| Chmod (not on Windows) | `POST /chmod` | chmod |
| View (zip, image, audio, video, text) | `GET /view`, `GET /raw` | view / download / raw |
| Edit / save | `POST /save` | backup / save |
| Backup (`name-dMy-His.bak`) | `POST /backup` | backup / save |
| `/api/entries`, `/api/scores` (header row dropped) | unchanged | hash routes |

## Intentional differences (security fixes)
- Every path resolved by `resolveInRoot` (lexical + symlink check). PHP `fm_clean_path` was bypassable; upload names, mass actions and `savedata` were unsanitised.
- Readonly users cannot save/edit (PHP allowed `savedata`). They can still view and download.
- Fail closed: missing/empty `auth_users.json` means nobody can log in (PHP disabled auth).
- CSRF token required on all writes; session id regenerated on login; httpOnly, SameSite=Lax cookie.
- Unzip rejects entries escaping the target (zip slip).
- `/api/content/:hash` now returns content (was returning config); unknown hash no longer double-responds.

## Not ported
- Mail file (`$send_mail`, disabled in PHP config).
- CDN-loaded Ace/highlight.js: UI uses a plain textarea and `<pre>`.
- Auth file format: `backend/auth_users.php` replaced by untracked `api/auth_users.json` (see `auth_users.example.json`; MD5 hex kept per decision).
- Sessions use the in-memory store: users must log in again after an API restart.

## Browser coverage (Playwright, `api/e2e/filemanager.e2e.ts`)
Run `cd api && npm run test:e2e` (starts its own server on :4310 over a throwaway data folder, Chromium).
Covers: login, wrong password, reload persistence, logout, expired session, listing order, breadcrumbs, select all, search, upload (chooser, drag and drop, overwrite), uploaded `Entries.xlsx` served by `/api/entries`, new folder/file, rename (and conflict), delete (confirm/cancel, recursive), bulk delete/copy/move/zip, view text/image/zip/audio/video/binary, edit+save, download bytes, backup, unzip (here / to folder), chmod (Windows 501 message, POSIX modes), read-only user UI and server enforcement, auth/CSRF/traversal rejection, XSS-safe rendering, public API endpoints.
`chmod` invalid-mode UI case is skipped on Windows.
