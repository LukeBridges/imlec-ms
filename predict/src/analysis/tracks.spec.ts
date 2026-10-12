import {trackFor} from './tracks.ts';

describe('trackFor', () => {
    it('returns null for no host society', () => {
        expect(trackFor(null)).toBeNull();
        expect(trackFor('')).toBeNull();
        expect(trackFor('   ')).toBeNull();
    });

    it('matches a known society case-insensitively', () => {
        expect(trackFor('bromsgrove')).toMatchObject({society: 'Bromsgrove', lengthFt: 1260});
        expect(trackFor('Bromsgrove')).toMatchObject({society: 'Bromsgrove'});
        expect(trackFor('  Bromsgrove  ')).toMatchObject({society: 'Bromsgrove'});
    });

    it('matches other sourced societies', () => {
        expect(trackFor('Bristol')).toMatchObject({society: 'Bristol', gaugesIn: [3.5, 5], lengthFt: 1760});
        expect(trackFor('guildford')).toMatchObject({society: 'Guildford', lengthFt: 1405, gradient: '1:110'});
        expect(trackFor('Kinver')).toMatchObject({society: 'Kinver', lengthFt: 2640});
        expect(trackFor('NOTTINGHAM')).toMatchObject({society: 'Nottingham', lengthFt: 2270, gradient: '1:115'});
        expect(trackFor('Southport')).toMatchObject({society: 'Southport', lengthFt: 1760, gradient: '1:100'});
        expect(trackFor('Northampton')).toMatchObject({society: 'Northampton', lengthFt: 1760});
        expect(trackFor('Gravesend')).toMatchObject({society: 'Gravesend', lengthFt: 1218});
        expect(trackFor('Tyneside')).toMatchObject({society: 'Tyneside', lengthFt: 680, gradient: '1:100'});
        expect(trackFor('Maidstone')).toMatchObject({society: 'Maidstone', lengthFt: 1826, gradient: '1:100', railMaterial: 'aluminium'});
        expect(trackFor('Birmingham')).toMatchObject({society: 'Birmingham', lengthFt: 1041});
        expect(trackFor('Leyland')).toMatchObject({society: 'Leyland', lengthFt: 1620});
        expect(trackFor('rugby')).toMatchObject({society: 'Rugby', gaugesIn: [2.5, 3.5, 5], lengthFt: 2400});
    });

    it('returns null for an unmapped society', () => {
        expect(trackFor('Leeds')).toBeNull();
        expect(trackFor('South Cheshire')).toBeNull();
    });
});
