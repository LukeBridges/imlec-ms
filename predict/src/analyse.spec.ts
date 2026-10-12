import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {run as runAnalysis, parseArgs} from './analyse.ts';
import {openDb, saveEvent} from './db.ts';
import type {NewRun} from './types.ts';

const newRun = (over: Partial<NewRun>): NewRun => ({
    runNo: null, position: null, driver: null, owner: null, driverRaw: null, society: null,
    locomotive: null, gaugeIn: 5, passengers: null, passengersBasis: null, distanceFt: null,
    workDoneFtLb: null, drawbarPullLb: null, coalLb: null, specificCoalLbHpHr: null,
    thermalEffPct: null, extra: {}, ...over,
});

describe('parseArgs', () => {
    it('defaults to all', () => {
        expect(parseArgs([])).toEqual({command: 'all', by: 'design', db: 'imlec.sqlite', minScored: 5, minEntries: 3, sort: 'entries'});
    });

    it('reads command and flags', () => {
        expect(parseArgs(['wins', '--by', 'type', '--top', '3', '--min-scored', '2', '--db', 'x'])).toEqual({
            command: 'wins', by: 'type', db: 'x', top: 3, minScored: 2, minEntries: 3, sort: 'entries',
        });
        expect(parseArgs(['profile', '--min-entries', '10', '--sort', 'vs'])).toMatchObject({command: 'profile', minEntries: 10, sort: 'vs'});
        expect(parseArgs(['--by', 'raw']).command).toBe('all');
    });

    it('rejects bad input', () => {
        expect(() => parseArgs(['nope'])).toThrow('Unknown command');
        expect(() => parseArgs(['--by', 'x'])).toThrow('Bad --by');
        expect(() => parseArgs(['--what'])).toThrow('Unknown argument');
        expect(() => parseArgs(['--top', '0'])).toThrow('--top');
        expect(() => parseArgs(['--min-scored', 'x'])).toThrow('--min-scored');
        expect(() => parseArgs(['--min-entries', '0'])).toThrow('--min-entries');
        expect(() => parseArgs(['--sort', 'luck'])).toThrow('Bad --sort');
    });
});

describe('run', () => {
    const dir = mkdtempSync(join(tmpdir(), 'imlec-an-'));
    const path = join(dir, 'a.sqlite');

    beforeAll(() => {
        const db = openDb(path);
        saveEvent(db, {year: 2000, hostSociety: 'X', sourceUrl: 'u', scrapedAt: 't'}, [
            newRun({position: 1, locomotive: 'B1', thermalEffPct: 3, distanceFt: 3000, passengers: 5, passengersBasis: 'start'}),
            newRun({position: 2, locomotive: 'Britannia', thermalEffPct: 2, distanceFt: 2000, passengers: 3, passengersBasis: 'start'}),
            newRun({position: 3, locomotive: 'Mystery', thermalEffPct: 1, distanceFt: 1000, passengers: 1, passengersBasis: 'start'}),
        ]);
        db.close();
    });
    afterAll(() => rmSync(dir, {recursive: true, force: true}));

    const args = (command: string, by = 'design') => parseArgs([command, '--by', by, '--db', path, '--min-scored', '1']);

    it('prints wins', () => {
        const out = runAnalysis(args('wins'));
        expect(out).toContain('Most wins by design');
        expect(out).toContain('100.0%');
    });

    it('prints scores and notes type coverage', () => {
        const out = runAnalysis(args('scores', 'type'));
        expect(out).toContain('type is known for 2 of 3 runs');
        expect(out).toContain('avg % of year best');
    });

    it('prints correlations, including p-value formatting and missing results', () => {
        const out = runAnalysis(args('correlation'));
        expect(out).toContain('distanceFt [all]');
        expect(out).toContain('passengers [finish]');
        expect(out).toContain('Speed: not available');
        expect(out).toContain('-');
    });

    it('prints a profile with the field row, honouring --top and --sort', () => {
        const out = runAnalysis(parseArgs(['profile', '--db', path, '--min-entries', '1', '--sort', 'vs', '--top', '2']));
        expect(out).toContain('Profile by design, min 1 entries');
        expect(out).toContain('FIELD');
        expect(out.split('\n').filter(l => /^(B1|Britannia|Mystery)\s/.test(l))).toHaveLength(2);
        expect(runAnalysis(parseArgs(['profile', '--db', path, '--min-entries', '1']))).toContain('Mystery');
        expect(runAnalysis(parseArgs(['profile', '--db', path, '--min-entries', '99']))).toContain('FIELD');
    });

    it('prints designs and handles no rows', () => {
        expect(runAnalysis(args('designs'))).toContain('Britannia');
        expect(runAnalysis(args('wins', 'type'))).toContain('type');
        expect(runAnalysis(parseArgs(['all', '--db', path, '--min-scored', '99']))).toContain('(no rows)');
    });
});
