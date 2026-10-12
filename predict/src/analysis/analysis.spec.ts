import type {NewRun, Run} from '../types.ts';
import {canonicalDesign, designFamily, wheelArrangement} from './locomotives.ts';
import {averageScores, correlations, groupKey, mostWins, summariseGroups} from './questions.ts';
import {incompleteBeta, mean, median, pearson, ranks, spearman, stdev} from './stats.ts';

let id = 0;
const run = (over: Partial<Run>): Run => ({
    id: ++id, year: 2000, runNo: null, position: null, driver: null, owner: null, driverRaw: null,
    society: null, locomotive: null, gaugeIn: 5, passengers: null, passengersBasis: null, distanceFt: null,
    workDoneFtLb: null, drawbarPullLb: null, coalLb: null, specificCoalLbHpHr: null, thermalEffPct: null,
    extra: {}, ...over,
}) satisfies NewRun & {id: number; year: number};

describe('stats', () => {
    it('computes basic summaries', () => {
        expect(mean([])).toBeNull();
        expect(mean([1, 2, 3])).toBe(2);
        expect(median([])).toBeNull();
        expect(median([3, 1, 2])).toBe(2);
        expect(median([4, 1, 2, 3])).toBe(2.5);
        expect(stdev([1])).toBeNull();
        expect(stdev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
    });

    it('ranks ties by average', () => {
        expect(ranks([10, 20, 20, 30])).toEqual([1, 2.5, 2.5, 4]);
    });

    it('matches known pearson values and p-values', () => {
        // r = 0.8 with n = 10 -> t = 3.771, p ~ 0.0055
        const perfect = pearson([1, 2, 3, 4], [2, 4, 6, 8])!;
        expect(perfect.r).toBe(1);
        expect(perfect.p).toBe(0);
        const c = pearson([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [2, 1, 4, 3, 7, 8, 5, 10, 9, 12])!;
        expect(c.r).toBeCloseTo(0.9, 1);
        expect(c.p).toBeLessThan(0.001);
        const weak = pearson([1, 2, 3, 4, 5], [2, 5, 1, 4, 3])!;
        expect(weak.r).toBeCloseTo(0.1, 5);
        expect(weak.p).toBeCloseTo(0.8729, 3);
    });

    it('returns null for degenerate input', () => {
        expect(pearson([1, 2], [1, 2])).toBeNull();
        expect(pearson([1, 1, 1], [1, 2, 3])).toBeNull();
        expect(spearman([1, 2], [1, 2])).toBeNull();
        expect(() => pearson([1, 2, 3], [1])).toThrow('length mismatch');
    });

    it('spearman handles monotone non-linear data', () => {
        expect(spearman([1, 2, 3, 4, 5], [1, 4, 9, 16, 25])!.r).toBe(1);
    });

    it('incompleteBeta edge cases', () => {
        expect(incompleteBeta(0, 2, 3)).toBe(0);
        expect(incompleteBeta(1, 2, 3)).toBe(1);
        expect(incompleteBeta(0.5, 2, 2)).toBeCloseTo(0.5, 8);
        expect(incompleteBeta(0.9, 2, 2)).toBeCloseTo(0.972, 3);
    });
});

describe('locomotive normalisation', () => {
    it.each([
        ['B1 "Springbok"', 'B1'],
        ['Kestrel A4', 'A4'],
        ['Nigel Gresley', 'A4'],
        ['Rebuilt Royal Scot', 'Royal Scot'],
        ['Freelance Baltic Tank 4-6-4T', 'Freelance'],
        ['Polly V', 'Polly V'],
        ['Polly', 'Polly'],
        ['L.M.S. Class 4', 'LMS Class 4'],
        ['B.R. Class 4', 'BR Standard Class 4'],
        ['  Britannia ', 'Britannia'],
        ['"', '"'],
    ])('%s -> %s', (raw, design) => {
        expect(canonicalDesign(raw)).toBe(design);
    });

    it('maps Marjorie Evelyn spellings to Polly VI', () => {
        for (const raw of ['Majorie Evelyn', 'Marjorie Evelyn', 'Marjory Evelyn']) expect(canonicalDesign(raw)).toBe('Polly VI');
    });

    it('applies driver overrides only for the matching driver', () => {
        expect(canonicalDesign('Polly', 'Luke Bridges')).toBe('Polly Trojan');
        expect(canonicalDesign('Polly', 'Someone Else')).toBe('Polly');
        expect(canonicalDesign('Polly IV', 'Duncan Stagg')).toBe('Polly VI');
        expect(canonicalDesign('Polly IV', 'Someone Else')).toBe('Polly IV');
        expect(canonicalDesign('Polly')).toBe('Polly');
    });

    it('groups Polly variants into one family', () => {
        expect(designFamily('Polly Trojan')).toBe('Polly');
        expect(designFamily('Polly V')).toBe('Polly');
        expect(designFamily('Pollyanna')).toBe('Pollyanna');
        expect(designFamily('B1')).toBe('B1');
        expect(designFamily(null)).toBeNull();
    });

    it('handles empty values', () => {
        expect(canonicalDesign(null)).toBeNull();
        expect(canonicalDesign('   ')).toBeNull();
    });

    it('maps wheel arrangements', () => {
        expect(wheelArrangement('Britannia')).toBe('4-6-2');
        expect(wheelArrangement('Simplex')).toBeNull();
        expect(wheelArrangement(null)).toBeNull();
    });
});

describe('questions', () => {
    const runs = [
        run({year: 2000, position: 1, locomotive: 'B1 "Springbok"', thermalEffPct: 4, distanceFt: 3000, passengers: 6, passengersBasis: 'start'}),
        run({year: 2000, position: 2, locomotive: 'Britannia', thermalEffPct: 2, distanceFt: 2000, passengers: 4, passengersBasis: 'start'}),
        run({year: 2000, position: 3, locomotive: 'B1', thermalEffPct: 1, distanceFt: 1000, passengers: 2, passengersBasis: 'start'}),
        run({year: 2000, position: null, locomotive: 'B1', thermalEffPct: null}),
        run({year: 2001, position: 1, locomotive: 'Britannia', thermalEffPct: 2, distanceFt: 1500, passengers: 3, passengersBasis: 'finish'}),
        run({year: 2001, position: 2, locomotive: 'Mystery', thermalEffPct: 1, distanceFt: 500, passengers: 1, passengersBasis: 'finish'}),
        run({year: 2001, position: 3, locomotive: null, thermalEffPct: 0.5}),
        run({year: 2001, position: 4, locomotive: '   '}),
    ];

    it('keys by design, type and raw name', () => {
        expect(groupKey(runs[0], 'design')).toBe('B1');
        expect(groupKey(runs[0], 'type')).toBe('4-6-0');
        expect(groupKey(runs[0], 'raw')).toBe('B1 "Springbok"');
        expect(groupKey(runs[6], 'raw')).toBeNull();
        expect(groupKey(run({locomotive: 'Polly V'}), 'family')).toBe('Polly');
        expect(groupKey(runs[7], 'raw')).toBeNull();
    });

    it('ranks designs by wins', () => {
        expect(mostWins(runs, 'design').map(g => [g.group, g.wins, g.entries])).toEqual([['Britannia', 1, 2], ['B1', 1, 3]]);
        expect(mostWins(runs, 'type').map(g => g.group)).toEqual(['4-6-2', '4-6-0']);
    });

    it('computes average and relative scores', () => {
        const b1 = summariseGroups(runs, 'design').find(g => g.group === 'B1')!;
        expect(b1).toMatchObject({entries: 3, scored: 2, wins: 1, avgScore: 2.5, medianScore: 2.5});
        expect(b1.avgRelScore).toBeCloseTo((1 + 0.25) / 2);
        expect(b1.stdevScore).toBeCloseTo(2.1213, 3);
    });

    it('filters by minimum scored runs and sorts by average', () => {
        expect(averageScores(runs, 'design', 2).map(g => g.group)).toEqual(['B1', 'Britannia']);
        expect(averageScores(runs, 'design', 3)).toEqual([]);
        expect(averageScores(runs, 'design').length).toBe(0);
    });

    it('correlates distance and passengers with score', () => {
        const [distance, start, finish] = correlations(runs);
        expect(distance.n).toBe(5);
        expect(distance.pearson!.r).toBeGreaterThan(0.9);
        expect(distance.withinYear!.r).toBeGreaterThan(0.9);
        expect(start).toMatchObject({variable: 'passengers', basis: 'start', n: 3});
        expect(start.pearson!.r).toBeGreaterThan(0.9);
        expect(finish.n).toBe(2);
        expect(finish.pearson).toBeNull();
        expect(finish.withinYear).toBeNull();
    });
});
