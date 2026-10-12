import type {Run} from '../types.ts';
import {groupKey, score, type GroupBy} from './questions.ts';
import {groupBy, mean} from './stats.ts';

/**
 * Within-year least-squares fit of score on distance (per 1,000 ft) and passengers.
 * Subtracting each year's means removes year-to-year differences in score scale.
 */
export interface FieldModel {
    n: number;
    perKft: number;
    perPassenger: number;
    yearMeans: Map<number, {score: number; kft: number; passengers: number}>;
}

interface Complete {
    year: number;
    score: number;
    kft: number;
    passengers: number;
}

function complete(run: Run): Complete | null {
    const s = score(run);
    if (s === null || run.distanceFt === null || run.passengers === null) return null;
    return {year: run.year, score: s, kft: run.distanceFt / 1000, passengers: run.passengers};
}

export function fitFieldModel(runs: Run[]): FieldModel | null {
    const rows = runs.map(complete).filter((r): r is Complete => r !== null);
    const yearMeans = new Map<number, {score: number; kft: number; passengers: number}>();
    for (const [year, g] of groupBy(rows, r => r.year)) {
        yearMeans.set(year, {
            score: mean(g.map(r => r.score))!,
            kft: mean(g.map(r => r.kft))!,
            passengers: mean(g.map(r => r.passengers))!,
        });
    }

    let dd = 0, pp = 0, dp = 0, ds = 0, ps = 0;
    for (const r of rows) {
        const m = yearMeans.get(r.year)!;
        const d = r.kft - m.kft;
        const p = r.passengers - m.passengers;
        const s = r.score - m.score;
        dd += d * d; pp += p * p; dp += d * p; ds += d * s; ps += p * s;
    }
    const det = dd * pp - dp * dp;
    if (rows.length < 3 || Math.abs(det) < 1e-9) return null;
    return {n: rows.length, perKft: (ds * pp - ps * dp) / det, perPassenger: (ps * dd - ds * dp) / det, yearMeans};
}

/** Score minus the score the field model predicts for this run's distance and passengers (same year). */
export function scoreVsExpected(run: Run, model: FieldModel): number | null {
    const c = complete(run);
    if (c === null) return null;
    const m = model.yearMeans.get(c.year)!;
    return (c.score - m.score) - model.perKft * (c.kft - m.kft) - model.perPassenger * (c.passengers - m.passengers);
}

export interface ProfileRow {
    group: string;
    entries: number;
    wins: number;
    avgScore: number | null;
    avgDistanceFt: number | null;
    avgPassengers: number | null;
    avgCoalLb: number | null;
    /** Mean of coal / (distance in 1,000 ft). */
    coalPerKft: number | null;
    /** Mean of scoreVsExpected over runs that have score, distance and passengers. */
    vsExpected: number | null;
    vsExpectedN: number;
}

const nonNull = (xs: (number | null)[]) => xs.filter((x): x is number => x !== null);

export function profileRow(group: string, runs: Run[], model: FieldModel | null): ProfileRow {
    const residuals = model ? nonNull(runs.map(r => scoreVsExpected(r, model))) : [];
    return {
        group,
        entries: runs.length,
        wins: runs.filter(r => r.position === 1).length,
        avgScore: mean(nonNull(runs.map(score))),
        avgDistanceFt: mean(nonNull(runs.map(r => r.distanceFt))),
        avgPassengers: mean(nonNull(runs.map(r => r.passengers))),
        avgCoalLb: mean(nonNull(runs.map(r => r.coalLb))),
        coalPerKft: mean(runs.flatMap(r => r.coalLb !== null && r.distanceFt ? [r.coalLb / (r.distanceFt / 1000)] : [])),
        vsExpected: mean(residuals),
        vsExpectedN: residuals.length,
    };
}

export type ProfileSort = 'entries' | 'score' | 'vs';

/** Groups with at least `minEntries` entries, plus the whole-field row for reference. */
export function profileGroups(runs: Run[], by: GroupBy, minEntries = 3, sort: ProfileSort = 'entries'): {rows: ProfileRow[]; field: ProfileRow} {
    const model = fitFieldModel(runs);
    const rows = [...groupBy(runs, r => groupKey(r, by))]
        .filter(([, rs]) => rs.length >= minEntries)
        .map(([group, rs]) => profileRow(group, rs, model));

    const byNumber = (pick: (r: ProfileRow) => number | null) => (a: ProfileRow, b: ProfileRow) =>
        (pick(b) ?? -Infinity) - (pick(a) ?? -Infinity) || b.entries - a.entries || a.group.localeCompare(b.group);
    rows.sort(sort === 'entries'
        ? (a, b) => b.entries - a.entries || a.group.localeCompare(b.group)
        : byNumber(sort === 'score' ? r => r.avgScore : r => r.vsExpected));

    return {rows, field: profileRow('FIELD', runs, model)};
}
