/**
 * The spreadsheets name locomotives free-text ('B1', 'B1 "Springbok"', 'Kestrel A4', ...).
 * `canonicalDesign` collapses those to one design/class name; `wheelArrangement` maps a design
 * to its wheel arrangement (the "type"). Both tables are hand-curated: extend them when
 * `npm run analyse -- designs` shows more variants worth merging.
 */

/** key: lower-cased raw name -> canonical design */
const DESIGN_ALIASES: Record<string, string> = {
    'nigel gresley': 'A4',
    'kestrel a4': 'A4',
    'a4 "wild swan"': 'A4',
    'rebuilt royal scot': 'Royal Scot',
    'unrebuilt royal scot': 'Royal Scot',
    'simplex modified': 'Simplex',
    'modified simplex': 'Simplex',
    'simplex (super)': 'Simplex',
    'beyer peacock simplex': 'Simplex',
    'polly 3': 'Polly III',
    'lbsc netta': 'Netta',
    'lbsc eva may': 'Eva May',
    'lbsc pamela': 'Pamela',
    'lbsc mona': 'Mona',
    '"betty" lbsc design': 'Betty',
    'juliet (rebuilt)': 'Juliet',
    'tich (enlarged)': 'Tich',
    'gwr king': 'King',
    'gwr "gooch"': 'Gooch',
    'gwr armstrong': 'Armstrong Goods',
    'g.w.r. armstrong': 'Armstrong Goods',
    'hunslet lilla': 'Hunslet',
    'quarry hunslet': 'Quarry Hunslet',
    'large quarry hunslet': 'Quarry Hunslet',
    'b.r. class 4': 'BR Standard Class 4',
    'class 4': 'BR Standard Class 4',
    'b.r. class 4 tank': 'BR Standard Class 4 Tank',
    'wd "austerity"': 'WD Austerity',
    'wd "austerity" 2-10-0': 'WD Austerity',
    'beyer garratt': 'Garratt',
    'beyer-garratt': 'Garratt',
    'beyer peacock k1 garratt': 'Garratt',
    'rail motor': 'Railmotor',
    'u class mogul': 'U Class',
    'lms mogul (2-6-0)': 'LMS Mogul',
    'bantam cock (vh)': 'Bantam Cock',
    'ajax (mod.)': 'Ajax',
    'ajax/achilles': 'Ajax',
    "welsh highland 'russell'": 'Russell',
    'whr russell': 'Russell',
    'sr q1': 'Q1',
    'union pacific switcher': 'UP Switcher',
    'crab': 'Horwich Crab',
    'sweet metre maid': 'Metre Maid',
    'majorie evelyn': 'Polly VI',
    'marjorie evelyn': 'Polly VI',
    'marjory evelyn': 'Polly VI',
    'majory evelyn': 'Polly VI',
};

/** The spreadsheet name is ambiguous; the driver knows which design it really was. */
const DRIVER_OVERRIDES: {driver: string; locomotive: string; design: string}[] = [
    {driver: 'Luke Bridges', locomotive: 'Polly', design: 'Polly Trojan'},
    {driver: 'Duncan Stagg', locomotive: 'Polly IV', design: 'Polly VI'},
];

/** Designs that are variants of one family (e.g. every Polly). */
export function designFamily(design: string | null): string | null {
    if (design === null) return null;
    return design === 'Polly' || design.startsWith('Polly ') ? 'Polly' : design;
}

const COMPANY_DOTS: [RegExp, string][] = [
    [/\bL\.?M\.?S\.?(?=\s|$)/gi, 'LMS'],
    [/\bG\.?W\.?R\.?(?=\s|$)/gi, 'GWR'],
    [/\bL\.?N\.?W\.?R\.?(?=\s|$)/gi, 'LNWR'],
    [/\bL\.?S\.?W\.?R\.?(?=\s|$)/gi, 'LSWR'],
    [/\bS\.?A\.?R\.?(?=\s|$)/gi, 'SAR'],
    [/\bB\.R\.(?=\s|$)/gi, 'BR'],
];

export function canonicalDesign(raw: string | null, driver: string | null = null): string | null {
    if (raw === null) return null;
    const trimmed = raw.trim().replace(/\s+/g, ' ');
    if (trimmed === '') return null;

    const override = DRIVER_OVERRIDES.find(o => o.driver === driver && o.locomotive.toLowerCase() === trimmed.toLowerCase());
    if (override) return override.design;

    const alias = DESIGN_ALIASES[trimmed.toLowerCase()];
    if (alias) return alias;

    if (/^freelance/i.test(trimmed)) return 'Freelance';
    if (/^polly (i{1,3}|iv|v|vi)$/i.test(trimmed)) return `Polly ${trimmed.slice(6).toUpperCase()}`;
    if (/^polly$/i.test(trimmed)) return 'Polly';

    let name = trimmed;
    for (const [re, to] of COMPANY_DOTS) name = name.replace(re, to);
    // 'B1 "Springbok"' -> 'B1' (nickname of an individual engine)
    const withoutNickname = name.replace(/\s+"[^"]*"?$/, '').trim();
    if (withoutNickname !== '' && withoutNickname !== name) name = withoutNickname;

    return DESIGN_ALIASES[name.toLowerCase()] ?? name;
}

const WHEELS: Record<string, string[]> = {
    '4-6-2': ['Britannia', 'A4', 'A1', 'A3', 'A2', 'Merchant Navy', 'Duchess', 'Princess Royal', 'Princess Coronation'],
    '4-6-0': ['B1', 'Manor', 'Black Five', 'Royal Scot', 'Jubilee', 'Hall', 'King', 'Castle', 'Saint', 'S15', 'Patriot', 'County', 'King Arthur', 'Grange', 'Star', 'B17'],
    '2-10-0': ['9F'],
    '2-8-2': ['P2'],
    '2-8-0': ['28XX', '47XX', '38XX', '8F', 'Thompson O1'],
    '2-6-2': ['V2'],
    '2-6-0': ['U Class', '5F', 'Horwich Crab', '43XX'],
    '2-6-2T': ['45XX', '51XX', '61XX', '55XX', '81XX'],
    '2-8-2T': ['72XX'],
    '0-6-0PT': ['57XX'],
    '0-6-0': ['4F', 'Dean Goods', 'Q1', 'J39'],
    '0-6-0T': ['Jinty'],
    '0-6-2T': ['N2'],
    '4-4-0': ['D49', 'Midland Compound', 'Schools', 'Claud Hamilton', 'Super Claud'],
    '4-4-2': ['Atlantic'],
    '4-2-2': ['Stirling Single'],
};

const WHEEL_BY_DESIGN = new Map(Object.entries(WHEELS).flatMap(([w, ds]) => ds.map(d => [d, w] as const)));

export function wheelArrangement(design: string | null): string | null {
    return design === null ? null : WHEEL_BY_DESIGN.get(design) ?? null;
}
