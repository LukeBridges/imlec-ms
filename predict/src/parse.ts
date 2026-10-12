import readXlsxFile from 'read-excel-file/node';
import type {LoadBasis, NewRun} from './types.ts';

export type Cell = string | number | boolean | Date | null | undefined;

export interface ParsedSheet {
    hostSociety: string | null;
    runs: NewRun[];
}

type Field =
    | 'year' | 'runNo' | 'position' | 'driver' | 'society' | 'locomotive' | 'gaugeIn' | 'load'
    | 'distanceFt' | 'workDoneFtLb' | 'drawbarPullLb' | 'coalLb' | 'specificCoalLbHpHr'
    | 'thermalEffPct' | 'hostSociety';

/** Ordered: first matching pattern wins. Keys are headers lower-cased with non-alphanumerics removed. */
const HEADER_RULES: [RegExp, Field][] = [
    [/^year$/, 'year'],
    [/^run(no|number)?$/, 'runNo'],
    [/^pos(ition)?$/, 'position'],
    [/^driver/, 'driver'],
    [/^society$/, 'society'],
    [/^loco/, 'locomotive'],
    [/^gauge/, 'gaugeIn'],
    [/^load/, 'load'],
    [/^distance/, 'distanceFt'],
    [/^workdone/, 'workDoneFtLb'],
    [/drawbar/, 'drawbarPullLb'],
    [/^coalused/, 'coalLb'],
    [/^specificcoal/, 'specificCoalLbHpHr'],
    [/^thermal/, 'thermalEffPct'],
    [/^host/, 'hostSociety'],
];

export function normaliseHeader(header: string): string {
    return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function fieldForHeader(header: string): Field | undefined {
    const key = normaliseHeader(header);
    return HEADER_RULES.find(([re]) => re.test(key))?.[1];
}

export function passengersBasisForHeader(header: string): LoadBasis | null {
    const key = normaliseHeader(header);
    if (/start/.test(key)) return 'start';
    if (/fin|end/.test(key)) return 'finish';
    return null;
}

/** Spreadsheet numbers carry float noise (0.56000000000000005). */
function round(n: number): number {
    return Math.round(n * 1e6) / 1e6;
}

export function toNumber(cell: Cell): number | null {
    if (typeof cell === 'number') return Number.isFinite(cell) ? round(cell) : null;
    if (typeof cell !== 'string') return null;
    const text = cell.trim().replace('½', '.5');
    if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
    return round(Number(text));
}

export function toText(cell: Cell): string | null {
    if (cell === null || cell === undefined) return null;
    const text = String(cell).trim();
    return text === '' ? null : text;
}

/** "Name (Owner)" -> {driver: "Name", owner: "Owner"}. Without parentheses the owner is null. */
export function splitDriver(raw: string | null): {driver: string | null; owner: string | null} {
    if (raw === null) return {driver: null, owner: null};
    const m = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(raw);
    if (!m || m[1] === '') return {driver: raw, owner: null};
    return {driver: m[1], owner: m[2].trim() || null};
}

/** Number from a cell; non-numeric text (e.g. "Retired") is kept in `extra` under the header name. */
function numeric(cell: Cell, name: string, extra: NewRun['extra']): number | null {
    const n = toNumber(cell);
    const text = toText(cell);
    if (n === null && text !== null) extra[name] = text;
    return n;
}

function blankRun(): NewRun {
    return {
        runNo: null, position: null, driver: null, owner: null, driverRaw: null, society: null,
        locomotive: null, gaugeIn: null, passengers: null, passengersBasis: null, distanceFt: null,
        workDoneFtLb: null, drawbarPullLb: null, coalLb: null, specificCoalLbHpHr: null,
        thermalEffPct: null, extra: {},
    };
}

export function parseRows(rows: Cell[][]): ParsedSheet {
    const [header, ...body] = rows;
    if (!header) return {hostSociety: null, runs: []};

    const columns = header.map((h, index) => {
        const name = toText(h) ?? '';
        return {index, name, field: fieldForHeader(name)};
    }).filter(c => c.name !== '');

    let hostSociety: string | null = null;
    const runs: NewRun[] = [];

    for (const row of body) {
        if (row.every(c => toText(c) === null)) continue;
        const run = blankRun();

        for (const {index, name, field} of columns) {
            const cell = row[index];
            switch (field) {
                case 'year': break;
                case 'hostSociety': hostSociety ??= toText(cell); break;
                case 'runNo': run.runNo = numeric(cell, name, run.extra); break;
                case 'position': run.position = numeric(cell, name, run.extra); break;
                case 'driver':
                    run.driverRaw = toText(cell);
                    Object.assign(run, splitDriver(run.driverRaw));
                    break;
                case 'society': run.society = toText(cell); break;
                case 'locomotive': run.locomotive = toText(cell); break;
                case 'gaugeIn': run.gaugeIn = numeric(cell, name, run.extra); break;
                case 'load':
                    run.passengers = numeric(cell, name, run.extra);
                    run.passengersBasis = passengersBasisForHeader(name);
                    break;
                case 'distanceFt': run.distanceFt = numeric(cell, name, run.extra); break;
                case 'workDoneFtLb': run.workDoneFtLb = numeric(cell, name, run.extra); break;
                case 'drawbarPullLb': run.drawbarPullLb = numeric(cell, name, run.extra); break;
                case 'coalLb': run.coalLb = numeric(cell, name, run.extra); break;
                case 'specificCoalLbHpHr': run.specificCoalLbHpHr = numeric(cell, name, run.extra); break;
                case 'thermalEffPct': run.thermalEffPct = numeric(cell, name, run.extra); break;
                default: {
                    const value = typeof cell === 'number' || typeof cell === 'boolean' ? cell : toText(cell);
                    if (value !== null && value !== undefined) run.extra[name] = value;
                }
            }
        }
        runs.push(run);
    }
    return {hostSociety, runs};
}

export async function parseWorkbook(path: string): Promise<ParsedSheet> {
    return parseRows(await readXlsxFile(path) as Cell[][]);
}
