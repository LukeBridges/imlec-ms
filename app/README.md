# IMLEC app

Angular 22 single-page app using NgRx for state and Angular Material for UI. Tests run with Vitest. See the root `README.md` for the overall project and the API.

## Development server

Start the API first (`npm run serve:api`, port 4201), then run `npm run serve` and open http://localhost:4200/. The app reloads when source files change. The dev API URL is set in `src/environments/environment.ts`.

## Build

- `npm run build` for a development build.
- `npm run build:prod` for a production build. Output goes to `dist/` at the repository root.
- `npm run build:prod-stats` builds for production and writes a bundle size report with `source-map-explorer`.

## Unit tests

Run `npm test` (`vitest --run`). Specs are `src/**/*.spec.ts` and run in jsdom. Run `npm run test:coverage` for a v8 coverage report. Thresholds are 100% for statements, branches, functions and lines, both globally and per file. `main.ts`, `polyfills.ts`, environments and `src/test` mocks are excluded.

```bash
npx vitest --run src/app/core/models/score.model.spec.ts
```

## Code scaffolding

Run `npx ng generate component component-name`. The same command also generates directive, pipe, service, guard, interface and enum.
