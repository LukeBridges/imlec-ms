import type {Run} from '../types.ts';
import {fitFieldModel, profileGroups, profileRow, scoreVsExpected} from './profile.ts';

let id = 0;
const run = (over: Partial<Run>): Run => ({
    id: ++id, year: 2000, runNo: null, position: null, driver: null, owner: null, driverRaw: null,
    society: null, locomotive: null, gaugeIn: 5, passengers: null, passengersBasis: null, distanceFt: null,
    workDoneFtLb: null, drawbarPullLb: null, coalLb: null, specificCoalLbHpHr: null, thermalEffPct: null,
    extra: {}, ...over,
});

// score = 0.1 * kft + 0.2 * passengers (+ a per-year constant), so the fit must recover those slopes exactly.
const exact = (year: number, kft: number, pax: number, offset = 0, over: Partial<Run> = {}) =>
    run({year, distanceFt: kft * 1000, passengers: pax, thermalEffPct: 0.1 * kft + 0.2 * pax + offset + year / 1000, ...over});

const field = [
    exact(2000, 10, 2), exact(2000, 15, 6), exact(2000, 20, 3), exact(2000, 12, 9),
    exact(2001, 11, 4), exact(2001, 18, 8), exact(2001, 14, 1), exact(2001, 9, 7),
];

describe('fitFieldModel', () => {
    it('recovers slopes and works within each year', () => {
        const m = fitFieldModel(field)!;
        expect(m.n).toBe(8);
        expect(m.perKft).toBeCloseTo(0.1, 8);
        expect(m.perPassenger).toBeCloseTo(0.2, 8);
        expect(m.yearMeans.size).toBe(2);
    });

    it('returns null with too little or degenerate data', () => {
        expect(fitFieldModel([])).toBeNull();
        expect(fitFieldModel(field.slice(0, 2))).toBeNull();
        expect(fitFieldModel([exact(2000, 10, 2), exact(2000, 20, 4), exact(2000, 30, 6)])).toBeNull();
    });

    it('ignores runs missing score, distance or passengers', () => {
        const withGaps = [...field, run({thermalEffPct: 1}), run({distanceFt: 1000, passengers: 1}), run({thermalEffPct: 1, distanceFt: 1000})];
        expect(fitFieldModel(withGaps)!.n).toBe(8);
    });
});

describe('scoreVsExpected', () => {
    it('is zero for runs on the line and the offset for runs above it', () => {
        const m = fitFieldModel(field)!;
        expect(scoreVsExpected(field[0], m)).toBeCloseTo(0, 8);
        const above = exact(2000, 13, 5, 0.5);
        expect(scoreVsExpected(above, fitFieldModel([...field, above])!)).toBeGreaterThan(0.3);
        expect(scoreVsExpected(run({thermalEffPct: 1}), m)).toBeNull();
    });
});

describe('profileRow', () => {
    it('averages each measure and counts wins', () => {
        const rs = [
            exact(2000, 10, 2, 0, {position: 1, coalLb: 2}),
            exact(2000, 20, 4, 0, {position: 2, coalLb: 4}),
            run({position: null, coalLb: null}),
        ];
        const row = profileRow('X', rs, fitFieldModel(field));
        expect(row).toMatchObject({group: 'X', entries: 3, wins: 1, avgDistanceFt: 15000, avgPassengers: 3, avgCoalLb: 3, vsExpectedN: 2});
        expect(row.coalPerKft).toBeCloseTo((0.2 + 0.2) / 2);
        expect(profileRow('none', [run({})], null)).toMatchObject({avgScore: null, coalPerKft: null, vsExpected: null, vsExpectedN: 0});
    });
});

describe('profileGroups', () => {
    const runs = [
        ...field.map(r => ({...r, locomotive: 'A4'})),
        exact(2000, 16, 5, 0.8, {locomotive: 'Rare', position: 1}),
        exact(2001, 12, 3, 0.8, {locomotive: 'Rare'}),
        exact(2001, 12, 3, -0.4, {locomotive: 'Rare'}),
        run({locomotive: 'Tiny', thermalEffPct: 9}),
    ];

    it('applies the minimum and always returns the field row', () => {
        const {rows, field: f} = profileGroups(runs, 'design', 3);
        expect(rows.map(r => r.group)).toEqual(['A4', 'Rare']);
        expect(f.group).toBe('FIELD');
        expect(f.entries).toBe(runs.length);
        expect(profileGroups(runs, 'design', 1).rows.map(r => r.group)).toContain('Tiny');
    });

    it('sorts by entries, score or vs expected', () => {
        const names = (sort: 'entries' | 'score' | 'vs') => profileGroups(runs, 'design', 1, sort).rows.map(r => r.group);
        expect(names('entries')).toEqual(['A4', 'Rare', 'Tiny']);
        expect(names('score')).toEqual(['Tiny', 'Rare', 'A4']);
        expect(names('vs')[0]).toBe('Rare');
        expect(names('vs').at(-1)).toBe('Tiny');
    });

    it('breaks ties by entries then name', () => {
        const tied = [run({locomotive: 'B'}), run({locomotive: 'A'}), run({locomotive: 'A'})];
        expect(profileGroups(tied, 'design', 1, 'score').rows.map(r => r.group)).toEqual(['A', 'B']);
        expect(profileGroups([run({locomotive: 'B'}), run({locomotive: 'A'})], 'design', 1, 'score').rows.map(r => r.group)).toEqual(['A', 'B']);
    });
});
