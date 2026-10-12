import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {DatabaseSync} from 'node:sqlite';
import {openDb, saveEvent} from './db.ts';
import {parseWorkbook} from './parse.ts';

const BASE = 'https://www.imlecarchive.com';
const FIRST_YEAR = 1950;
const USER_AGENT = 'imlec-predict-scraper/1.0 (personal research)';
const DELAY_MS = 500;

export interface Options {
    years: number[];
    db: string;
    cacheDir: string;
    refresh: boolean;
}

export type YearStatus = 'ok' | 'not-found' | 'no-link' | 'error';

export interface YearResult {
    year: number;
    status: YearStatus;
    rows?: number;
    message?: string;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Wix embeds results files as `ugd/5f6f6a_<id>.xlsx?dn=<name>` in the page source. */
export function extractXlsxUrl(html: string): string | null {
    const m = /ugd\/([A-Za-z0-9_]+\.xlsx)/.exec(html);
    return m ? `${BASE}/_files/ugd/${m[1]}` : null;
}

export function parseYearRange(spec: string): number[] {
    const [from, to = from] = spec.split('-').map(Number);
    if (!Number.isInteger(from) || !Number.isInteger(to) || to < from) throw new Error(`Bad --years "${spec}"`);
    return Array.from({length: to - from + 1}, (_, i) => from + i);
}

async function fetchRetry(url: string, attempts = 3): Promise<Response> {
    for (let i = 1; ; i++) {
        try {
            const res = await fetch(url, {headers: {'User-Agent': USER_AGENT}});
            if (res.status < 500 || i >= attempts) return res;
        } catch (e) {
            if (i >= attempts) throw e;
        }
        await sleep(1000 * i);
    }
}

async function scrapeYear(year: number, opts: Options, db: DatabaseSync): Promise<YearResult> {
    const file = join(opts.cacheDir, `${year}.xlsx`);
    const urlFile = join(opts.cacheDir, `${year}.url`);
    let sourceUrl: string;

    if (!opts.refresh && existsSync(file) && existsSync(urlFile)) {
        sourceUrl = await readFile(urlFile, 'utf8');
    } else {
        const page = await fetchRetry(`${BASE}/imlecresults/${year}`);
        if (page.status === 404) return {year, status: 'not-found'};
        if (!page.ok) return {year, status: 'error', message: `page HTTP ${page.status}`};
        const url = extractXlsxUrl(await page.text());
        if (!url) return {year, status: 'no-link'};
        const download = await fetchRetry(url);
        if (!download.ok) return {year, status: 'error', message: `xlsx HTTP ${download.status}`};
        await writeFile(file, Buffer.from(await download.arrayBuffer()));
        await writeFile(urlFile, url);
        sourceUrl = url;
        await sleep(DELAY_MS);
    }

    const {hostSociety, runs} = await parseWorkbook(file);
    saveEvent(db, {year, hostSociety, sourceUrl, scrapedAt: new Date().toISOString()}, runs);
    return {year, status: 'ok', rows: runs.length};
}

export async function scrape(opts: Options): Promise<YearResult[]> {
    await mkdir(opts.cacheDir, {recursive: true});
    const db = openDb(opts.db);
    const results: YearResult[] = [];
    try {
        for (const year of opts.years) {
            let result: YearResult;
            try {
                result = await scrapeYear(year, opts, db);
            } catch (e) {
                result = {year, status: 'error', message: e instanceof Error ? e.message : String(e)};
            }
            results.push(result);
            if (result.status !== 'not-found') {
                const rows = result.rows !== undefined ? ` (${result.rows} runs)` : '';
                console.log(`${year} ${result.status}${rows}${result.message ? ` ${result.message}` : ''}`);
            }
        }
    } finally {
        db.close();
    }
    return results;
}

export function summarise(results: YearResult[]): string {
    const by = (s: YearStatus) => results.filter(r => r.status === s).map(r => r.year);
    const ok = results.filter(r => r.status === 'ok');
    return [
        `ok: ${ok.length} years, ${ok.reduce((n, r) => n + (r.rows ?? 0), 0)} runs`,
        `not found (404): ${by('not-found').join(', ') || 'none'}`,
        `no xlsx link: ${by('no-link').join(', ') || 'none'}`,
        `errors: ${by('error').join(', ') || 'none'}`,
    ].join('\n');
}

export function parseArgs(argv: string[]): Options {
    const opts: Options = {
        years: parseYearRange(`${FIRST_YEAR}-${new Date().getFullYear()}`),
        db: 'imlec.sqlite',
        cacheDir: 'cache',
        refresh: false,
    };
    for (let i = 0; i < argv.length; i++) {
        switch (argv[i]) {
            case '--years': opts.years = parseYearRange(argv[++i]); break;
            case '--db': opts.db = argv[++i]; break;
            case '--refresh': opts.refresh = true; break;
            default: throw new Error(`Unknown argument "${argv[i]}"`);
        }
    }
    return opts;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    scrape(parseArgs(process.argv.slice(2))).then(r => console.log('\n' + summarise(r)));
}
