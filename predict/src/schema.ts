export const SCHEMA = `
CREATE TABLE IF NOT EXISTS event (
    year         INTEGER PRIMARY KEY,
    host_society TEXT,
    source_url   TEXT NOT NULL,
    scraped_at   TEXT NOT NULL,
    row_count    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS run (
    id                     INTEGER PRIMARY KEY AUTOINCREMENT,
    year                   INTEGER NOT NULL REFERENCES event(year) ON DELETE CASCADE,
    run_no                 INTEGER,
    position               INTEGER,
    driver                 TEXT,
    owner                  TEXT,
    driver_raw             TEXT,
    society                TEXT,
    locomotive             TEXT,
    gauge_in               REAL,
    passengers             REAL,
    passengers_basis       TEXT CHECK (passengers_basis IN ('start', 'finish')),
    distance_ft            REAL,
    work_done_ftlb         REAL,
    drawbar_pull_lb        REAL,
    coal_lb                REAL,
    specific_coal_lb_hp_hr REAL,
    thermal_eff_pct        REAL,
    extra_json             TEXT
);

CREATE INDEX IF NOT EXISTS idx_run_year ON run(year);
CREATE INDEX IF NOT EXISTS idx_run_driver ON run(driver);
CREATE INDEX IF NOT EXISTS idx_run_society ON run(society);
CREATE INDEX IF NOT EXISTS idx_run_locomotive ON run(locomotive);
`;
