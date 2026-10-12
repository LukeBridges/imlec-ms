import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openDb, saveEvent} from './db.ts';
import {ImlecRepository} from './repository.ts';
import type {NewRun} from './types.ts';

const run = (over: Partial<NewRun>): NewRun => ({
    runNo: null, position: null, driver: null, owner: null, driverRaw: null, society: null,
    locomotive: null, gaugeIn: 5, passengers: null, passengersBasis: null, distanceFt: null,
    workDoneFtLb: null, drawbarPullLb: null, coalLb: null, specificCoalLbHpHr: null,
    thermalEffPct: null, extra: {}, ...over,
});

const event = (year: number, hostSociety: string) =>
    ({year, hostSociety, sourceUrl: `https://x/${year}.xlsx`, scrapedAt: '2026-01-01T00:00:00.000Z'});

function seed() {
    const db = openDb(':memory:');
    saveEvent(db, event(2019, 'Leyland'), [
        run({runNo: 1, position: 1, driver: 'Ann', society: 'Southport', locomotive: 'B1', thermalEffPct: 3}),
        run({runNo: 2, position: 2, driver: 'Bob', society: 'Worthing', locomotive: 'Britannia', thermalEffPct: 2}),
        run({runNo: 3, position: null, driver: 'Cy', society: 'Southport', locomotive: 'B1', extra: {Position: 'Ret'}}),
    ]);
    saveEvent(db, event(2022, 'Maidstone'), [
        run({runNo: 1, position: 1, driver: 'Bob', society: 'Worthing', locomotive: 'Britannia', gaugeIn: 3.5, thermalEffPct: 4}),
        run({runNo: 1, position: 3, driver: 'Ann', society: 'Southport', locomotive: 'B1', thermalEffPct: 1}),
    ]);
    return new ImlecRepository(db);
}

describe('ImlecRepository', () => {
    it('lists events and years', () => {
        const repo = seed();
        expect(repo.getYears()).toEqual([2019, 2022]);
        expect(repo.getEvents().map(e => e.rowCount)).toEqual([3, 2]);
        expect(repo.getEvent(2022)).toEqual({
            year: 2022, hostSociety: 'Maidstone', sourceUrl: 'https://x/2022.xlsx',
            scrapedAt: '2026-01-01T00:00:00.000Z', rowCount: 2,
        });
        expect(repo.getEvent(1999)).toBeUndefined();
        expect(repo.countRuns()).toBe(5);
    });

    it('filters runs', () => {
        const repo = seed();
        expect(repo.getRuns()).toHaveLength(5);
        expect(repo.getRunsForYear(2019).map(r => r.driver)).toEqual(['Ann', 'Bob', 'Cy']);
        expect(repo.getRuns({fromYear: 2020}).map(r => r.year)).toEqual([2022, 2022]);
        expect(repo.getRuns({toYear: 2019, society: 'Southport'})).toHaveLength(2);
        expect(repo.getRuns({locomotive: 'Britannia'})).toHaveLength(2);
        expect(repo.getRuns({gaugeIn: 3.5})).toHaveLength(1);
        expect(repo.getRuns({hostSociety: 'Leyland', maxPosition: 2})).toHaveLength(2);
        expect(repo.getRuns({driver: 'Nobody'})).toEqual([]);
    });

    it('maps rows to camelCase with parsed extra', () => {
        const repo = seed();
        const cy = repo.getRunsForYear(2019)[2];
        expect(cy).toMatchObject({runNo: 3, position: null, extra: {Position: 'Ret'}});
        expect(repo.getRunsForYear(2019)[0].extra).toEqual({});
    });

    it('returns winners and driver history', () => {
        const repo = seed();
        expect(repo.getWinners().map(r => [r.year, r.driver])).toEqual([[2019, 'Ann'], [2022, 'Bob']]);
        expect(repo.getDriverHistory('Ann').map(r => r.position)).toEqual([1, 3]);
    });

    it('aggregates stats', () => {
        const repo = seed();
        expect(repo.getDriverStats()[0]).toEqual({
            driver: 'Ann', entries: 2, wins: 1, podiums: 2, avgPosition: 2, avgThermalEffPct: 2,
        });
        expect(repo.getSocietyStats().map(s => [s.society, s.entries, s.wins])).toEqual([
            ['Southport', 3, 1], ['Worthing', 2, 1],
        ]);
        expect(repo.getLocomotiveStats().map(s => s.locomotive)).toEqual(['B1', 'Britannia']);
    });
});

describe('saveEvent', () => {
    it('is idempotent: re-saving replaces runs', () => {
        const repo = seed();
        const db = openDb(':memory:');
        const runs = [run({runNo: 1, position: 1, driver: 'Ann'})];
        saveEvent(db, event(2019, 'Leyland'), runs);
        saveEvent(db, event(2019, 'Leyland'), runs);
        expect(new ImlecRepository(db).countRuns()).toBe(1);
        expect(repo.countRuns()).toBe(5);
    });

    it('rolls back when an insert fails', () => {
        const db = openDb(':memory:');
        const bad = run({position: 1, gaugeIn: 'x' as unknown as number, extra: {a: 1n as unknown as number}});
        expect(() => saveEvent(db, event(2019, 'Leyland'), [bad])).toThrow();
        expect(new ImlecRepository(db).getEvents()).toEqual([]);
    });
});

describe('ImlecRepository.open', () => {
    it('opens a file DB read-only', () => {
        const dir = mkdtempSync(join(tmpdir(), 'imlec-'));
        const path = join(dir, 't.sqlite');
        try {
            const db = openDb(path);
            saveEvent(db, event(2019, 'Leyland'), [run({runNo: 1, position: 1})]);
            db.close();

            const repo = ImlecRepository.open(path);
            expect(repo.countRuns()).toBe(1);
            repo.close();
        } finally {
            rmSync(dir, {recursive: true, force: true});
        }
    });
});
