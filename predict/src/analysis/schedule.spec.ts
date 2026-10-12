import {hostFor} from './schedule.ts';

describe('hostFor', () => {
    it('returns the announced host for a known future year', () => {
        expect(hostFor(2027)).toEqual({year: 2027, society: 'Rugby'});
        expect(hostFor(2028)).toEqual({year: 2028, society: 'South Cheshire'});
        expect(hostFor(2029)).toEqual({year: 2029, society: 'Maidstone'});
    });

    it('returns null for a year with no announced host', () => {
        expect(hostFor(2026)).toBeNull();
        expect(hostFor(2030)).toBeNull();
    });
});
