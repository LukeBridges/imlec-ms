import {extractXlsxUrl, parseArgs, parseYearRange, summarise} from './scrape.ts';

describe('extractXlsxUrl', () => {
    it('finds the Wix ugd file in page source', () => {
        const html = '..."href":"wix:document://v1/ugd/5f6f6a_720d04f5.xlsx?dn=1969%2520results.xlsx"...';
        expect(extractXlsxUrl(html)).toBe('https://www.imlecarchive.com/_files/ugd/5f6f6a_720d04f5.xlsx');
    });

    it('returns null when there is no spreadsheet', () => {
        expect(extractXlsxUrl('<html>nothing</html>')).toBeNull();
    });
});

describe('parseYearRange', () => {
    it('parses single years and ranges', () => {
        expect(parseYearRange('1990')).toEqual([1990]);
        expect(parseYearRange('1990-1992')).toEqual([1990, 1991, 1992]);
    });

    it('rejects bad input', () => {
        expect(() => parseYearRange('abc')).toThrow('Bad --years');
        expect(() => parseYearRange('2000-1990')).toThrow('Bad --years');
    });
});

describe('parseArgs', () => {
    it('has defaults', () => {
        const o = parseArgs([]);
        expect(o).toMatchObject({db: 'imlec.sqlite', cacheDir: 'cache', refresh: false});
        expect(o.years[0]).toBe(1950);
    });

    it('reads flags', () => {
        expect(parseArgs(['--years', '2000-2001', '--db', 'x.sqlite', '--refresh'])).toEqual({
            years: [2000, 2001], db: 'x.sqlite', cacheDir: 'cache', refresh: true,
        });
    });

    it('rejects unknown flags', () => {
        expect(() => parseArgs(['--nope'])).toThrow('Unknown argument');
    });
});

describe('summarise', () => {
    it('reports each status', () => {
        const text = summarise([
            {year: 2019, status: 'ok', rows: 24},
            {year: 2020, status: 'not-found'},
            {year: 1978, status: 'no-link'},
            {year: 2021, status: 'error', message: 'boom'},
        ]);
        expect(text).toBe([
            'ok: 1 years, 24 runs', 'not found (404): 2020', 'no xlsx link: 1978', 'errors: 2021',
        ].join('\n'));
    });

    it('reports none', () => {
        expect(summarise([])).toContain('errors: none');
    });
});
