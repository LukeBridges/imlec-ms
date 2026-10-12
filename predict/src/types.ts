export type LoadBasis = 'start' | 'finish';

/** Row of the `event` table. */
export interface EventRow {
    year: number;
    host_society: string | null;
    source_url: string;
    scraped_at: string;
    row_count: number;
}

/** Row of the `run` table. */
export interface RunRow {
    id: number;
    year: number;
    run_no: number | null;
    position: number | null;
    driver: string | null;
    owner: string | null;
    driver_raw: string | null;
    society: string | null;
    locomotive: string | null;
    gauge_in: number | null;
    passengers: number | null;
    passengers_basis: LoadBasis | null;
    distance_ft: number | null;
    work_done_ftlb: number | null;
    drawbar_pull_lb: number | null;
    coal_lb: number | null;
    specific_coal_lb_hp_hr: number | null;
    thermal_eff_pct: number | null;
    extra_json: string | null;
}

export interface Event {
    year: number;
    hostSociety: string | null;
    sourceUrl: string;
    scrapedAt: string;
    rowCount: number;
}

export interface Run {
    id: number;
    year: number;
    runNo: number | null;
    position: number | null;
    driver: string | null;
    owner: string | null;
    driverRaw: string | null;
    society: string | null;
    locomotive: string | null;
    gaugeIn: number | null;
    passengers: number | null;
    passengersBasis: LoadBasis | null;
    distanceFt: number | null;
    workDoneFtLb: number | null;
    drawbarPullLb: number | null;
    coalLb: number | null;
    specificCoalLbHpHr: number | null;
    thermalEffPct: number | null;
    extra: Record<string, string | number | boolean | null>;
}

/** Run as parsed from a spreadsheet, before it has a DB id. */
export type NewRun = Omit<Run, 'id' | 'year'>;

export interface NewEvent {
    year: number;
    hostSociety: string | null;
    sourceUrl: string;
    scrapedAt: string;
}

export interface RunFilter {
    fromYear?: number;
    toYear?: number;
    society?: string;
    driver?: string;
    locomotive?: string;
    gaugeIn?: number;
    hostSociety?: string;
    maxPosition?: number;
}

interface BaseStats {
    entries: number;
    wins: number;
    podiums: number;
    avgPosition: number | null;
    avgThermalEffPct: number | null;
}

export interface SocietyStats extends BaseStats {
    society: string;
}

export interface LocomotiveStats extends BaseStats {
    locomotive: string;
}

export interface DriverStats extends BaseStats {
    driver: string;
}
