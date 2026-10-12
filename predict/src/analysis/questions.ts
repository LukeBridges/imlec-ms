import type {Run} from '../types.ts';
import {canonicalDesign, designFamily, wheelArrangement} from './locomotives.ts';
import {groupBy, mean, median, pearson, spearman, stdev, type Correlation} from './stats.ts';

/** How locomotives are grouped: canonical `design`/class, `family` (all Polly variants as one), wheel-arrangement `type`, or the `raw` spreadsheet name. */
export type GroupBy = 'design' | 'family' | 'type' | 'raw';

/** The "% score" is the thermal efficiency column. Runs without it (retired, or years before 1972) are not scored. */
export const score = (run: Run): number | null => run.thermalEffPct;

export function groupKey(run: Run, by: GroupBy): string | null {
    if (by === 'raw') return run.locomotive?.trim() || null;
    const design = canonicalDesign(run.locomotive, run.driver);
    if (by === 'design') return design;
    return by === 'family' ? designFamily(design) : wheelArrangement(design);
}

export interface GroupRow {
    group: string;
    entries: number;
    scored: number;
    wins: number;
    /** wins / entries */
    winRate: number;
    avgScore: number | null;
    medianScore: number | null;
    stdevScore: number | null;
    /** Mean of (score / best score that year): comparable across years with different score scales. */
    avgRelScore: number | null;
}

export function summariseGroups(runs: Run[], by: GroupBy): GroupRow[] {
    const best = new Map<number, number>();
    for (const r of runs) {
        const s = score(r);
        if (s !== null && s > (best.get(r.year) ?? -Infinity)) best.set(r.year, s);
    }

    return [...groupBy(runs, r => groupKey(r, by))].map(([group, rs]) => {
        const scores = rs.map(score).filter((s): s is number => s !== null);
        const rel = rs.flatMap(r => {
            const s = score(r);
            const b = best.get(r.year);
            return s !== null && b ? [s / b] : [];
        });
        const wins = rs.filter(r => r.position === 1).length;
        return {
            group,
            entries: rs.length,
            scored: scores.length,
            wins,
            winRate: wins / rs.length,
            avgScore: mean(scores),
            medianScore: median(scores),
            stdevScore: stdev(scores),
            avgRelScore: mean(rel),
        };
    });
}

/** Q1: which design/class/type has won most times. */
export function mostWins(runs: Run[], by: GroupBy): GroupRow[] {
    return summariseGroups(runs, by)
        .filter(g => g.wins > 0)
        .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate || a.group.localeCompare(b.group));
}

/** Q2: average score per design/class/type, ignoring groups with fewer than `minScored` scored runs. */
export function averageScores(runs: Run[], by: GroupBy, minScored = 5): GroupRow[] {
    return summariseGroups(runs, by)
        .filter(g => g.scored >= minScored && g.avgScore !== null)
        .sort((a, b) => b.avgScore! - a.avgScore! || a.group.localeCompare(b.group));
}

export interface CorrelationRow {
    variable: string;
    /** Which load measurement the variable uses (loads are start or finish depending on year). */
    basis: string;
    n: number;
    pearson: Correlation | null;
    spearman: Correlation | null;
    /** Pearson after subtracting each year's mean from both variables (removes year-to-year effects). */
    withinYear: Correlation | null;
}

interface Pair {
    year: number;
    x: number;
    y: number;
}

function withinYear(pairs: Pair[]): Correlation | null {
    const xs: number[] = [];
    const ys: number[] = [];
    for (const group of groupBy(pairs, p => p.year).values()) {
        if (group.length < 3) continue;
        const mx = mean(group.map(p => p.x))!;
        const my = mean(group.map(p => p.y))!;
        for (const p of group) {
            xs.push(p.x - mx);
            ys.push(p.y - my);
        }
    }
    return pearson(xs, ys);
}

function correlate(runs: Run[], variable: string, basis: string, x: (r: Run) => number | null): CorrelationRow {
    const pairs: Pair[] = runs.flatMap(r => {
        const xv = x(r);
        const yv = score(r);
        return xv !== null && yv !== null ? [{year: r.year, x: xv, y: yv}] : [];
    });
    const xs = pairs.map(p => p.x);
    const ys = pairs.map(p => p.y);
    return {variable, basis, n: pairs.length, pearson: pearson(xs, ys), spearman: spearman(xs, ys), withinYear: withinYear(pairs)};
}

/**
 * Q3: correlation of distance and load (passenger weight) with score.
 * There is no run-time column, so speed cannot be measured.
 */
export function correlations(runs: Run[]): CorrelationRow[] {
    return [
        correlate(runs, 'distanceFt', 'all', r => r.distanceFt),
        correlate(runs, 'passengers', 'start', r => r.passengersBasis === 'start' ? r.passengers : null),
        correlate(runs, 'passengers', 'finish', r => r.passengersBasis === 'finish' ? r.passengers : null),
    ];
}
