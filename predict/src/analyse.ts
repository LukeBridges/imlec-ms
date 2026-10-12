import {fileURLToPath} from 'node:url';
import {profileGroups, type ProfileRow, type ProfileSort} from './analysis/profile.ts';
import {averageScores, correlations, groupKey, mostWins, summariseGroups, type CorrelationRow, type GroupBy, type GroupRow} from './analysis/questions.ts';
import type {Correlation} from './analysis/stats.ts';
import {ImlecRepository} from './repository.ts';

type Command = 'wins' | 'scores' | 'correlation' | 'profile' | 'designs' | 'all';

interface Args {
    command: Command;
    by: GroupBy;
    db: string;
    /** Rows to print; each command picks its own default when omitted. */
    top?: number;
    minScored: number;
    minEntries: number;
    sort: ProfileSort;
}

const COMMANDS: Command[] = ['wins', 'scores', 'correlation', 'profile', 'designs', 'all'];

export function parseArgs(argv: string[]): Args {
    const args: Args = {command: 'all', by: 'design', db: 'imlec.sqlite', minScored: 5, minEntries: 3, sort: 'entries'};
    const [first, ...rest] = argv;
    if (first && !first.startsWith('--')) {
        if (!COMMANDS.includes(first as Command)) throw new Error(`Unknown command "${first}". Use: ${COMMANDS.join(', ')}`);
        args.command = first as Command;
    } else if (first) {
        rest.unshift(first);
    }
    for (let i = 0; i < rest.length; i++) {
        switch (rest[i]) {
            case '--by': {
                const by = rest[++i];
                if (by !== 'design' && by !== 'family' && by !== 'type' && by !== 'raw') throw new Error(`Bad --by "${by}". Use design, family, type or raw`);
                args.by = by;
                break;
            }
            case '--db': args.db = rest[++i]; break;
            case '--top': args.top = Number(rest[++i]); break;
            case '--min-scored': args.minScored = Number(rest[++i]); break;
            case '--min-entries': args.minEntries = Number(rest[++i]); break;
            case '--sort': {
                const sort = rest[++i];
                if (sort !== 'entries' && sort !== 'score' && sort !== 'vs') throw new Error(`Bad --sort "${sort}". Use entries, score or vs`);
                args.sort = sort;
                break;
            }
            default: throw new Error(`Unknown argument "${rest[i]}"`);
        }
    }
    if (args.top !== undefined && (!Number.isInteger(args.top) || args.top < 1)) throw new Error('--top must be a positive integer');
    if (!Number.isInteger(args.minScored) || args.minScored < 1) throw new Error('--min-scored must be a positive integer');
    if (!Number.isInteger(args.minEntries) || args.minEntries < 1) throw new Error('--min-entries must be a positive integer');
    return args;
}

const fixed = (n: number | null, dp: number) => n === null ? '-' : n.toFixed(dp);

function table(rows: Record<string, string | number>[]): string {
    if (!rows.length) return '(no rows)';
    const cols = Object.keys(rows[0]);
    const width = cols.map(c => Math.max(c.length, ...rows.map(r => String(r[c]).length)));
    const line = (cells: (string | number)[]) => cells.map((c, i) => i === 0 ? String(c).padEnd(width[i]) : String(c).padStart(width[i])).join('  ');
    return [line(cols), line(width.map(w => '-'.repeat(w))), ...rows.map(r => line(cols.map(c => r[c])))].join('\n');
}

export function formatWins(rows: GroupRow[], by: GroupBy, top: number): string {
    return `Most wins by ${by} (position 1)\n` + table(rows.slice(0, top).map(g => ({
        [by]: g.group, wins: g.wins, entries: g.entries, 'win rate': `${(g.winRate * 100).toFixed(1)}%`,
    })));
}

export function formatScores(rows: GroupRow[], by: GroupBy, top: number, minScored: number): string {
    return `Average score (thermal efficiency %) by ${by}, min ${minScored} scored runs\n` + table(rows.slice(0, top).map(g => ({
        [by]: g.group, scored: g.scored, avg: fixed(g.avgScore, 3), median: fixed(g.medianScore, 3),
        sd: fixed(g.stdevScore, 3), 'avg % of year best': fixed(g.avgRelScore === null ? null : g.avgRelScore * 100, 1),
    })));
}

export function formatProfile(rows: ProfileRow[], field: ProfileRow, by: GroupBy, minEntries: number): string {
    const cell = (g: ProfileRow) => ({
        [by]: g.group, entries: g.entries, wins: g.wins, 'avg %': fixed(g.avgScore, 2),
        'dist ft': fixed(g.avgDistanceFt, 0), pax: fixed(g.avgPassengers, 1), 'coal lb': fixed(g.avgCoalLb, 2),
        'coal/kft': fixed(g.coalPerKft, 2), 'vs expected': `${g.vsExpected === null ? '-' : (g.vsExpected >= 0 ? '+' : '') + g.vsExpected.toFixed(2)} (${g.vsExpectedN})`,
    });
    return `Profile by ${by}, min ${minEntries} entries. 'vs expected' = score minus the field model's prediction for the same distance and passengers (n = runs used)
` +
        table([...rows.map(cell), cell(field)]);
}

const fmtCorr = (c: Correlation | null) => c ? `${c.r.toFixed(3)} (p=${c.p < 0.001 ? '<0.001' : c.p.toFixed(3)})` : '-';

export function formatCorrelations(rows: CorrelationRow[]): string {
    return 'Correlation with score (thermal efficiency %)\n' + table(rows.map(r => ({
        variable: `${r.variable} [${r.basis}]`, n: r.n, pearson: fmtCorr(r.pearson),
        spearman: fmtCorr(r.spearman), 'within-year pearson': fmtCorr(r.withinYear),
    }))) + '\nSpeed: not available (no run-time column in the spreadsheets).';
}

export function run(args: Args): string {
    const repo = ImlecRepository.open(args.db);
    try {
        const runs = repo.getRuns();
        const out: string[] = [];
        if (args.by === 'type') {
            const mapped = runs.filter(r => groupKey(r, 'type') !== null).length;
            out.push(`Note: wheel-arrangement type is known for ${mapped} of ${runs.length} runs (curated table in analysis/locomotives.ts); the rest are excluded.`);
        }
        const all = args.command === 'all';
        if (all || args.command === 'wins') out.push(formatWins(mostWins(runs, args.by), args.by, args.top ?? 15));
        if (all || args.command === 'scores') out.push(formatScores(averageScores(runs, args.by, args.minScored), args.by, args.top ?? 15, args.minScored));
        if (all || args.command === 'correlation') out.push(formatCorrelations(correlations(runs)));
        if (args.command === 'profile') {
            const {rows, field} = profileGroups(runs, args.by, args.minEntries, args.sort);
            out.push(formatProfile(rows.slice(0, args.top ?? rows.length), field, args.by, args.minEntries));
        }
        if (args.command === 'designs') {
            out.push('Raw name -> design groups with several variants are worth reviewing in analysis/locomotives.ts\n' +
                table(summariseGroups(runs, args.by).sort((a, b) => b.entries - a.entries).slice(0, args.top ?? 15)
                    .map(g => ({[args.by]: g.group, entries: g.entries}))));
        }
        return out.join('\n\n');
    } finally {
        repo.close();
    }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    console.log(run(parseArgs(process.argv.slice(2))));
}
