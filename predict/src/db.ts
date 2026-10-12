import {DatabaseSync} from 'node:sqlite';
import {SCHEMA} from './schema.ts';
import type {NewEvent, NewRun} from './types.ts';

export function openDb(path: string, options: {readonly?: boolean} = {}): DatabaseSync {
    const db = new DatabaseSync(path, {readOnly: options.readonly ?? false});
    if (!options.readonly) {
        db.exec('PRAGMA foreign_keys = ON');
        db.exec(SCHEMA);
    }
    return db;
}

/** Replace an event and all of its runs in one transaction. Re-runnable. */
export function saveEvent(db: DatabaseSync, event: NewEvent, runs: NewRun[]): void {
    db.exec('BEGIN');
    try {
        db.prepare('DELETE FROM run WHERE year = ?').run(event.year);
        db.prepare(`
            INSERT INTO event (year, host_society, source_url, scraped_at, row_count)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (year) DO UPDATE SET
                host_society = excluded.host_society,
                source_url = excluded.source_url,
                scraped_at = excluded.scraped_at,
                row_count = excluded.row_count
        `).run(event.year, event.hostSociety, event.sourceUrl, event.scrapedAt, runs.length);

        const insert = db.prepare(`
            INSERT INTO run (
                year, run_no, position, driver, owner, driver_raw, society, locomotive, gauge_in,
                passengers, passengers_basis, distance_ft, work_done_ftlb, drawbar_pull_lb, coal_lb,
                specific_coal_lb_hp_hr, thermal_eff_pct, extra_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const r of runs) {
            insert.run(
                event.year, r.runNo, r.position, r.driver, r.owner, r.driverRaw, r.society, r.locomotive,
                r.gaugeIn, r.passengers, r.passengersBasis, r.distanceFt, r.workDoneFtLb, r.drawbarPullLb, r.coalLb,
                r.specificCoalLbHpHr, r.thermalEffPct,
                Object.keys(r.extra).length ? JSON.stringify(r.extra) : null,
            );
        }
        db.exec('COMMIT');
    } catch (e) {
        db.exec('ROLLBACK');
        throw e;
    }
}
