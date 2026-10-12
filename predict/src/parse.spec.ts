import {fieldForHeader, passengersBasisForHeader, parseRows, splitDriver, toNumber, toText} from './parse.ts';

describe('header mapping', () => {
    it.each([
        ['Run No.', 'runNo'],
        ['Driver (Owner)', 'driver'],
        ['Distance run (ft.)', 'distanceFt'],
        ['Work done (ft.lb.)', 'workDoneFtLb'],
        ['Av. drawbar pull (lb.)', 'drawbarPullLb'],
        ['Coal used (lb.)', 'coalLb'],
        ['Specific coal consumption (lb./HP/hr.)', 'specificCoalLbHpHr'],
        ['Thermal efficiency (%)', 'thermalEffPct'],
        ['Host Society', 'hostSociety'],
        ['Load (at finsh)', 'load'],
    ])('%s -> %s', (header, field) => {
        expect(fieldForHeader(header)).toBe(field);
    });

    it('returns undefined for unknown headers', () => {
        expect(fieldForHeader('Boiler pressure')).toBeUndefined();
    });

    it('detects load basis, including the "finsh" typo', () => {
        expect(passengersBasisForHeader('Load (at Start)')).toBe('start');
        expect(passengersBasisForHeader('Load (at finsh)')).toBe('finish');
        expect(passengersBasisForHeader('Load')).toBeNull();
    });
});

describe('value helpers', () => {
    it('rounds float noise and handles text numbers', () => {
        expect(toNumber(0.56000000000000005)).toBe(0.56);
        expect(toNumber(' 3½ ')).toBe(3.5);
        expect(toNumber('7')).toBe(7);
        expect(toNumber('Ret')).toBeNull();
        expect(toNumber(NaN)).toBeNull();
        expect(toNumber(null)).toBeNull();
    });

    it('trims text and nulls blanks', () => {
        expect(toText('  a ')).toBe('a');
        expect(toText('  ')).toBeNull();
        expect(toText(undefined)).toBeNull();
        expect(toText(5)).toBe('5');
    });

    it('splits driver and owner', () => {
        expect(splitDriver('John Dalton (Les Dalton)')).toEqual({driver: 'John Dalton', owner: 'Les Dalton'});
        expect(splitDriver('Marcus Peel')).toEqual({driver: 'Marcus Peel', owner: null});
        expect(splitDriver('(Syndicate)')).toEqual({driver: '(Syndicate)', owner: null});
        expect(splitDriver('Bob ( )')).toEqual({driver: 'Bob', owner: null});
        expect(splitDriver(null)).toEqual({driver: null, owner: null});
    });
});

describe('parseRows', () => {
    const header = [
        'Year', 'Run No.', 'Position', 'Driver (Owner)', 'Society', 'Locomotive', 'Gauge',
        'Load (at finsh)', 'Distance run (ft.)', 'Thermal efficiency (%)', 'Host Society', 'Notes',
    ];

    it('returns nothing for an empty sheet', () => {
        expect(parseRows([])).toEqual({hostSociety: null, runs: []});
    });

    it('maps columns by header, keeps blank cells in place and unknown columns in extra', () => {
        const {hostSociety, runs} = parseRows([
            header,
            [1969, 1, null, 'John Drury (Club)', 'Birmingham', 'Royal Scot', 5, 5, 17610, 3.62000000000000001, 'Birmingham', 'fast'],
            [null, null, null, null, null, null, null, null, null, null, null, null],
            [1969, 2, 'Ret', 'Ann', 'Private', 'Simplex', '3½', null, null, 'Retired', 'Birmingham', null],
        ]);
        expect(hostSociety).toBe('Birmingham');
        expect(runs).toHaveLength(2);
        expect(runs[0]).toMatchObject({
            runNo: 1, position: null, driver: 'John Drury', owner: 'Club', driverRaw: 'John Drury (Club)',
            society: 'Birmingham', locomotive: 'Royal Scot', gaugeIn: 5, passengers: 5, passengersBasis: 'finish',
            distanceFt: 17610, thermalEffPct: 3.62, extra: {Notes: 'fast'},
        });
        expect(runs[1]).toMatchObject({
            position: null, gaugeIn: 3.5, thermalEffPct: null, extra: {Position: 'Ret', 'Thermal efficiency (%)': 'Retired'},
        });
    });

    it('tolerates short rows and numeric extras', () => {
        const {runs} = parseRows([['Run No.', 'Voltage', 'Flag', 'Position'], [3, 12, true]]);
        expect(runs[0].extra).toEqual({Voltage: 12, Flag: true});
        expect(runs[0].position).toBeNull();
    });
});
