# predict

Scrapes the IMLEC results spreadsheets from imlecarchive.com into a SQLite file (`node:sqlite`, Node 22+) and exposes typed read methods for analysis.

## Scrape

```bash
npm install
npm run scrape                              # all years -> imlec.sqlite
npm run scrape -- --years 1990-2000         # subset
npm run scrape -- --refresh --db other.sqlite
```

- Year pages: `https://www.imlecarchive.com/imlecresults/<year>`; each embeds one `.xlsx` link.
- Downloads are cached in `cache/` (gitignored); re-runs parse from cache unless `--refresh`.
- Re-running is idempotent: each year's runs are replaced in one transaction.

## Read

```ts
import {ImlecRepository} from './src/index.ts';

const repo = ImlecRepository.open('imlec.sqlite');
repo.getWinners();
repo.getRuns({society: 'Southport', fromYear: 2010});
repo.getDriverStats();
repo.close();
```

Types for the tables live in `src/types.ts` (`EventRow`/`RunRow` = DB columns, `Event`/`Run` = camelCase).

## Analyse

```bash
npm run analyse                          # wins + average scores + correlations
npm run analyse -- wins --by type        # --by design (default) | family | type | raw
npm run analyse -- scores --min-scored 10 --top 30
npm run analyse -- correlation
npm run analyse -- profile               # per-design table: wins, avg %, distance, passengers, coal, score vs expected
npm run analyse -- profile --by family --min-entries 10 --sort vs --top 20
```

- Code: `src/analysis/` (`questions.ts` = the three questions, `stats.ts` = pearson/spearman/p-values, `locomotives.ts` = name normalisation).
- Score = thermal efficiency %. Only available 1972+ and not for retirements. `avg % of year best` rescales each year against that year's best score, since absolute scores drift over time.
- Loco **design** merges spreadsheet name variants via a hand-curated alias table; **type** is wheel arrangement from a curated table covering only common classes (unmapped locos are excluded). Extend both in `src/analysis/locomotives.ts`.
- `profile`: `--min-entries` (default 3), `--sort entries|score|vs`, all rows unless `--top`. `vs expected` = score minus what a within-year least-squares fit (score ~ distance + passengers over the whole field) predicts for that run; the `FIELD` row is the reference (0.00). Entries missing score, distance or passengers are left out of that column (n shown in brackets).
- `--by family` merges all Polly variants (incl. the Trojan override) into one row.
- Correlations: distance, passengers (start/finish counts are kept separate). No run-time column exists, so speed cannot be analysed.

## Tables

- `event(year, host_society, source_url, scraped_at, row_count)`
- `run(...)` one row per entry. Non-numeric values in numeric columns (e.g. position `Ret`, efficiency `Retired`) become NULL with the raw text kept in `extra_json`; unmapped spreadsheet columns also go to `extra_json`. Run numbers are not unique within a year in the source data.
- `passengers` is the "Load" column (a passenger count, not pounds), counted at start or at finish depending on the year; see `passengers_basis`.

## Known gaps

- Results section starts at 1969. 1950-1968 return 404.
- No year page / spreadsheet for 2001, 2020, 2023. 1978's page has no xlsx link.

## Tests

`npm test`, `npm run typecheck`
