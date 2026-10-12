import type {Event, EventRow, Run, RunRow} from './types.ts';

export function toEvent(row: EventRow): Event {
    return {
        year: row.year,
        hostSociety: row.host_society,
        sourceUrl: row.source_url,
        scrapedAt: row.scraped_at,
        rowCount: row.row_count,
    };
}

export function toRun(row: RunRow): Run {
    return {
        id: row.id,
        year: row.year,
        runNo: row.run_no,
        position: row.position,
        driver: row.driver,
        owner: row.owner,
        driverRaw: row.driver_raw,
        society: row.society,
        locomotive: row.locomotive,
        gaugeIn: row.gauge_in,
        passengers: row.passengers,
        passengersBasis: row.passengers_basis,
        distanceFt: row.distance_ft,
        workDoneFtLb: row.work_done_ftlb,
        drawbarPullLb: row.drawbar_pull_lb,
        coalLb: row.coal_lb,
        specificCoalLbHpHr: row.specific_coal_lb_hp_hr,
        thermalEffPct: row.thermal_eff_pct,
        extra: row.extra_json ? JSON.parse(row.extra_json) : {},
    };
}
