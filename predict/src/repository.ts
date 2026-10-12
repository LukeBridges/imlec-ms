import type {DatabaseSync, SQLInputValue} from 'node:sqlite';
import {openDb} from './db.ts';
import {toEvent, toRun} from './mappers.ts';
import type {
    DriverStats, Event, EventRow, LocomotiveStats, Run, RunFilter, RunRow, SocietyStats,
} from './types.ts';

const STATS_COLUMNS = `
    COUNT(*) AS entries,
    COALESCE(SUM(position = 1), 0) AS wins,
    COALESCE(SUM(position BETWEEN 1 AND 3), 0) AS podiums,
    AVG(position) AS avgPosition,
    AVG(thermal_eff_pct) AS avgThermalEffPct
`;

export class ImlecRepository {
    private readonly db: DatabaseSync;

    constructor(db: DatabaseSync) {
        this.db = db;
    }

    static open(path: string, options: {readonly?: boolean} = {readonly: true}): ImlecRepository {
        return new ImlecRepository(openDb(path, options));
    }

    close(): void {
        this.db.close();
    }

    getEvents(): Event[] {
        return (this.db.prepare('SELECT * FROM event ORDER BY year').all() as unknown as EventRow[]).map(toEvent);
    }

    getEvent(year: number): Event | undefined {
        const row = this.db.prepare('SELECT * FROM event WHERE year = ?').get(year) as unknown as EventRow | undefined;
        return row && toEvent(row);
    }

    getYears(): number[] {
        return (this.db.prepare('SELECT year FROM event ORDER BY year').all() as {year: number}[]).map(r => r.year);
    }

    countRuns(): number {
        return (this.db.prepare('SELECT COUNT(*) AS n FROM run').get() as {n: number}).n;
    }

    getRuns(filter: RunFilter = {}): Run[] {
        const where: string[] = [];
        const params: SQLInputValue[] = [];
        const add = (clause: string, value: SQLInputValue | undefined) => {
            if (value !== undefined) {
                where.push(clause);
                params.push(value);
            }
        };
        add('run.year >= ?', filter.fromYear);
        add('run.year <= ?', filter.toYear);
        add('run.society = ?', filter.society);
        add('run.driver = ?', filter.driver);
        add('run.locomotive = ?', filter.locomotive);
        add('run.gauge_in = ?', filter.gaugeIn);
        add('event.host_society = ?', filter.hostSociety);
        add('run.position <= ?', filter.maxPosition);
        const sql = `
            SELECT run.* FROM run JOIN event ON event.year = run.year
            ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
            ORDER BY run.year, run.position IS NULL, run.position, run.run_no
        `;
        return (this.db.prepare(sql).all(...params) as unknown as RunRow[]).map(toRun);
    }

    getRunsForYear(year: number): Run[] {
        return this.getRuns({fromYear: year, toYear: year});
    }

    /** Position 1 of every year. */
    getWinners(): Run[] {
        return this.getRuns({maxPosition: 1});
    }

    getDriverHistory(driver: string): Run[] {
        return this.getRuns({driver});
    }

    getSocietyStats(): SocietyStats[] {
        return this.stats('society') as unknown as SocietyStats[];
    }

    getLocomotiveStats(): LocomotiveStats[] {
        return this.stats('locomotive') as unknown as LocomotiveStats[];
    }

    getDriverStats(): DriverStats[] {
        return this.stats('driver') as unknown as DriverStats[];
    }

    private stats(column: 'society' | 'locomotive' | 'driver') {
        return this.db.prepare(`
            SELECT ${column} AS ${column}, ${STATS_COLUMNS}
            FROM run WHERE ${column} IS NOT NULL
            GROUP BY ${column}
            ORDER BY wins DESC, entries DESC, ${column}
        `).all();
    }
}
