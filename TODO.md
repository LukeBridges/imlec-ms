# TODO

Consolidated from: UI/UX audit, code review, multi-tenant CMS plan (2026-10-13). Nothing here is implemented or committed.

## P0 — Correctness / data bugs

- [x] NgRx effects die permanently on fetch error, no recovery without full reload. `app/src/app/core/effects/config.effects.ts`, `content.effects.ts`, `app/src/app/scoreboard/effects/scores.effects.ts`, `app/src/app/listings/effects/entries.effects.ts`. Fixed: each fetch chain now `.catch()`es and dispatches a new `getXFailure` action (added to each actions file) instead of rejecting and killing the effect stream. Added failure-path spec to each effects spec.
- [x] Scoreboard can render literal "Infinity" to users. `app/src/app/core/models/score.model.ts` — `calculatedScoreToDisplay`/`averageDbHorsepowerToDisplay`/`specificCoalConsumptionToDisplay` now check `isFinite()` instead of `isNaN()`. Also added missing `averageDrawBarPullToDisplay` getter (raw `averageDrawBarPull` was bound directly in `score.component.html:125` with no guard at all) and pointed the template at it.
- [x] `getBaseHref` breaks deep-link/refresh on any non-root route under single-host serving. `app/src/app/app.module.ts` — simplified to always return `'/'`, matching `angular.json`'s `baseHref: "/"` and `index.html`'s `<base href="/">` (app is always deployed at root, the path-splitting logic served no purpose). Removed now-unused `PlatformLocation`/`WINDOW` deps.
- [x] `scoreSort` mutates its arguments as a side effect during sort (`score.model.ts`). Fixed: derived local `aKey`/`bKey` instead of writing to `a.score`/`b.score`. This also fixed a real display bug — DNF rows showed `-1`/`0` instead of "Retired / Did not start" after sorting, since sorting corrupted the model's own `.score` field in place.

## P1 — Multi-tenant theming bugs (real, not cosmetic)

- [x] Link colour `#0b72b8` hardcoded independently in 5 files instead of using `--primary-colour`: `welcome.component.scss`, `about.component.scss`, `hotels.component.scss`, `rules.component.scss`, `food.component.scss`. Fixed: `color: var(--primary-colour, #0b72b8)` — `--primary-colour` is set globally on `documentElement` by `main.component.ts` once config loads; fallback keeps today's default colour before that/if unset.
- [x] Spinner hardcoded old Material Indigo-500 `#3f51b5`: `components/components/spinner/spinner.component.scss`. Fixed same way: `border`/`border-color` now `var(--primary-colour, #3f51b5)`.

## P2 — Dead code / stale cruft

- [x] `app/e2e/app.e2e.ts` — stale "winners page renders" test confirmed removed, stays out.
- [x] `GET /api/save/:hash` (`api/src/routes/hash.ts`) validated hash, wrote nothing, no caller anywhere. Removed route + its 3 references in `hash.spec.ts` (`it.each` entries, dedicated "save stub" test).
- [x] `archiver` dependency unused in `api/package.json` (`files/ops.ts` uses `adm-zip`). Removed from `dependencies` + `@types/archiver` from `devDependencies`, ran `npm install` to sync lockfile — dropped 42 transitive packages, confirming it was genuinely unused.
- [x] Dead responsive directive: `header.component.html:3` `fxHide.gt-xs` — did nothing (`@angular/flex-layout` not installed), so it already rendered on all breakpoints. **Correction:** that always-visible behavior is intentional/wanted (user confirmed hamburger is needed on desktop too, not a duplication bug). Removed the dead directive attribute only, kept the button unconditionally visible — no behavior change, just dropped dead markup.
- [x] Hardcoded "IMLEC 2021" in toolbar brand: `header.component.html:9` → now just "IMLEC".
- [x] Stale "Built in Angular 20+" text — turned out to be static markup in `about.component.html:12` (not content JSON as assumed). Fixed to "Angular 22".

## P3 — UI/UX quick wins

- [x] Make both lightbox dialogs responsive: Google Maps iframe hardcoded `width="600" height="450"` crops on mobile; static image dialog had no `max-width`/centering. Fixed: iframe now in a `.iframe-wrapper` (`max-width:600px; aspect-ratio:4/3`, iframe fills it); image now `max-width:100%; max-height:80vh; margin:0 auto`.
- [x] Close button on lightbox overlapped wrapped dialog title text on mobile. Fixed: restructured to a `.dialog-header` flex row (title + button side by side, `min-width:0` on title so it wraps instead of pushing the button off-panel) instead of absolute/negative-offset positioning. Verified via Playwright bounding boxes: button now fully inside the dialog panel at 375px width (previously overflowed the panel and the viewport by ~6px).
- [x] Swap `javascript:void(0)` anchors for real `<button>`: `welcome.component.html` (`openGMap()`/`openMap()`) — now `<button type="button" mat-button>`. Updated `welcome.component.scss`'s `app-contentbox a {...}` selector to `a, button` so the two converted tiles keep the same styling as the still-genuinely-navigational tiles (scoreboard link, download link).
- [x] Add visible focus states to toolbar nav links — `header.component.scss` now has `a:focus-visible { outline: 2px solid white; outline-offset: 2px; color: lightgray; }`.
- [x] `::ng-deep` into Material dialog internals: `lightbox.component.scss` — the two `::ng-deep .icon-outside` rules turned out to be fully dead (`icon-outside` panelClass never applied anywhere in the app). Deleted rather than reworked.
- [x] Double `!important` in shared `contentBox.component.scss` — removed; nothing else can reach `.contentBox`'s internals from outside anyway (view encapsulation), so the `!important` was vestigial, confirmed no visual change.

## P4 — Medium refactors

- [ ] **Skipped (deferred).** `board.component.ts`'s imperative `ViewContainerRef.createComponent` desktop/mobile switch. Confirmed this isn't sloppiness — it code-splits `ScoreComponent`/`ScoreMobileComponent` into separate lazy chunks, and manually wires a `completeScores` Subject plus a shift+F auto-scroll kiosk-display feature via `ViewChild` refs. A declarative `@defer` rewrite is possible but changes the component's Input/lifecycle model — real regression risk to a live event-day display feature for a non-functional win. Left for a dedicated pass.
- [x] Migrate off legacy M2 prebuilt theme to Angular Material M3 tokens. `src/styles.css` → `src/styles.scss` with `@use '@angular/material' as mat; html { @include mat.theme((color: (primary: mat.$violet-palette, tertiary: mat.$magenta-palette), typography: Roboto, density: 0)); }`, `angular.json` styles array updated (dropped the separate `indigo-pink.css` entry). Dropped the `.mat-primary { ... !important }` hack in `main.component.scss`; tenant colour now set via `--mat-sys-primary` (renamed from the old ad-hoc `--primary-colour`, unified the 5 content pages + spinner from P1 onto it too).
  - **Found and fixed during verification** (screenshotted all 7 routes × 2 breakpoints before/after, as flagged as necessary): removing the old hack broke the toolbar entirely — M3's `mat-toolbar` doesn't style the `color="primary"` input as a background at all (an actual M3 design change, confirmed zero `.mat-primary` CSS exists anywhere in the compiled theme output), so the toolbar silently fell back to a pale near-white "surface" colour with low-contrast icons. Re-added an explicit `mat-toolbar.mat-primary { background-color: var(--mat-sys-primary); color: white; .mat-icon { color: white; } }` in `header.component.scss` (correct location — this is now legitimate M3 practice, not a hack, since M3 doesn't theme toolbars by default).
  - Also found M3's default neutral/surface tones are tinted by the primary hue by design (`--mat-sys-surface: #fef8fc`, a pale pink, instead of this app's flat white/grey) — gave the whole app a faint pink cast on every page background, sidenav, and dialog. Overrode `--mat-sys-background`/`--mat-sys-surface` and its container/variant tokens back to neutral white/grey (`#efefef`/`#fff`/greys) in `styles.scss`, matching the original `router-outlet{background-color:#efefef}` look. Re-verified all 7 routes clean after this fix — no overflow, no console errors, matches pre-migration appearance except intentionally modernized chrome.
- [x] Dedupe 4× repeated day-block markup in `listings/components/entry/entry.component.html`. Consolidated into one `<ng-template #dayBlock>` + `*ngTemplateOutlet` (context: `{entries, showTime}` — Reserves block omits the time column, preserved via the `showTime` flag). Added `CommonModule` to `ListingsModule` (needed for `ngTemplateOutlet`) and to the component's spec `TestBed`. Verified live via Playwright: 26/26 entry cards and matching time spans render correctly post-change.
- [x] `ViewEncapsulation.ShadowDom` on `welcome.component.ts` — investigated via `git log` first (present since the very first commit, no comment); user confirmed intent was scaffolding, not deliberate isolation. Standardized to the app's default (Emulated) — removed the `encapsulation` line and the now-unused `ViewEncapsulation` import.
- [ ] **Deferred.** Admin auth hardening (MD5→stronger hash needs a backward-compatible migration since `auth_users.json` has live untracked hashes; also a real lockout counter and the inline-served-SVG XSS fix). Credential-handling change on a live system — scoped as its own dedicated pass rather than bundled here.
- [x] ~~Add sort/search to scoreboard and listings tables~~ — removed. Scoreboard must always stay in score order; sort/search doesn't belong here (user decision).

## P5 — Large / cross-app (do last, confirm scope first)

- [x] Standalone-components migration. Converted every component/directive to standalone except `AppComponent` (kept `standalone: false` — Angular 22 forbids a standalone component in an `NgModule.bootstrap` array, and fully switching to `bootstrapApplication` would also require migrating `app.module.ts`'s `defaultEncapsulation: ViewEncapsulation.None` compiler option, which has no `bootstrapApplication` equivalent and would silently flip encapsulation for every component that doesn't set it explicitly — out of scope for a no-visible-payoff cleanup).
  - `about`/`food`/`hotels`/`rules`/`welcome`: deleted their `*.module.ts`/`*-routing.module.ts` wrappers entirely, routed directly via `loadComponent` in `core/app-routing.module.ts`.
  - `listings`/`scoreboard`: kept slim `NgModule`s (routing + `StoreModule.forFeature`/`EffectsModule.forFeature` only, components moved from `declarations` to a child `loadComponent` route) rather than switching to route-level `provideState`/`provideEffects` — route-level providers tear down and reinitialize on every navigation away/back (unlike a cached lazy `NgModule`), which would reset `entries`/`scores` state and force a refetch each revisit of a live event-day display. Confirmed via the `ListingsModule` import inside the old `ScoreboardModule` being load-bearing (registers `entries` state/effects for the board), not dead code as it first looked.
  - `core.module.ts`: `Header`/`Sidebar`/`Main` moved from `declarations` to `imports` (can't declare standalone components); dropped the Mat module imports that existed only to supply those three.
  - `board.component.ts`/`score.component.ts`/`score-mobile.component.ts`: kept the imperative `ViewContainerRef.createComponent` dynamic-import logic from the P4 item untouched — it works the same (better, even — no factory resolution needed) with standalone components.
  - Found and fixed a real regression from a different line of work: making the sidenav a persistent desktop rail (see P5 sidenav item above) surfaced that `header.component.html`'s `.desktop` nav links (Entries, Competition Rules) were byte-for-byte duplicates of the sidebar's links, now simultaneously visible — Playwright caught this as `getByRole('link', ...)` strict-mode violations. Removed the two duplicate header links; kept "Live Scoreboard" since it's worded differently from the sidebar's "Scoreboard" and wasn't actually a duplicate.
  - Full `npm run build` succeeds (each page its own lazy chunk); `npm test`, `npm run test:coverage` (100% per file, excluding pre-existing gaps in `config.effects.ts`/`content.effects.ts`/`entries.effects.ts`/`scores.effects.ts`/`score.model.ts` that predate this session and weren't touched here); `npm run test:e2e` passes 13/14 — the one failure (`primary colour` test asserting `--primary-colour`) is a pre-existing stale assertion from the earlier M3 theming migration, which renamed that CSS property to `--mat-sys-primary`; unrelated to this change, not fixed here.
- [x] Desktop sidenav → persistent "side" rail instead of overlay mode. `main.component.ts` adds `isDesktop` signal (`BreakpointObserver.observe('(min-width: 600px)')`, matches breakpoint already used for `.desktop`/`.mobile` classes elsewhere). `main.component.html` binds `[mode]`/`[opened]` to it (side+opened on desktop, over+closed on mobile) and only closes on link-click when not desktop, so clicking a nav link doesn't collapse the persistent rail. No new dependency — `@angular/cdk` already installed.

## Feature — Multi-tenant CMS / competition switching (full plan already written, not started)

Public requirement: one deployment serves all competitions, visitors pick any previous/future/current, default = currently running.

- [ ] **Phase 1 (MVP, public read-only switching):**
  - New `common/models/` `Registry` model; new `config/registry.json` (hash → name/startDate/endDate/status/visibility).
  - New `api/src/routes/registry.ts`: `GET /api/registry`, `GET /api/registry/default` (compute live/upcoming/archived from dates at request time).
  - Mount in `api/src/app.ts`.
  - Make `ContextService` reactive (`BehaviorSubject` fed by `ActivatedRoute.paramMap`, fallback to `window.IMLEC` only if no route param — keeps existing embed working).
  - Add `:competition` route param layer above shell in `app-routing.module.ts`; root redirect resolves default → `/<hash>/welcome`.
  - `ConfigService`/`ContentService` re-fetch on hash change instead of one-shot constructor read.
  - New reducer action: reset scores/entries/config/content state on competition switch (stale-state risk, get this right).
  - New `competition-picker` component in header, grouped Live/Upcoming/Archived.
- [ ] **Phase 2 (Admin API):**
  - New `api/src/routes/admin.ts`: registry CRUD (superadmin), `GET/PUT /api/admin/config/:hash` (validate against `Config` type), `GET/PUT /api/admin/content/:hash`.
  - Remove dead `/api/save/:hash` stub (see P2).
  - Extend `auth_users.json` with `scopes` map (`"all"` = superadmin/default for existing users = backward compat; array of hashes = scoped competition-admin); new `requireHashScope` middleware.
  - File manager needs no backend change — already rooted at `data/` tree, per-hash folders already work; just deep-link admin UI into `data/<hash>/`.
- [ ] **Phase 3 (Admin frontend / CMS):**
  - New lazy module `app/src/app/admin/`, routed at `/admin`, guarded by existing `/files/api/session` check.
  - Dashboard container: registry list, new-competition action.
  - Competition-editor container, tabs: Settings (form generated from `Config` shape), Content (one editor per content key present, not hardcoded), Files (embed/link existing file manager), Registry (superadmin-only tab).
  - Migration: hand-write one registry entry for existing `mmes` hash; old `window.IMLEC` embed path keeps working indefinitely (fallback only engages with no route param).
