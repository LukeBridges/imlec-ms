/**
 * `host_society` is free-text from the spreadsheet ('Bromsgrove', 'Leyland', ...). `trackFor`
 * maps it to a hand-curated track spec scraped from that society's own website — imlecarchive.com
 * carries no structured track data itself. Extend `SOCIETY_ALIASES` for spelling variants and
 * `TRACKS` with more societies as they're sourced.
 *
 * IMLEC is always run on a raised track, 3.5"/5" gauge, by rule — not something that varies per
 * host or needs sourcing per club. Where a society's site describes other gauges or a separate
 * ground-level loop, that's irrelevant to IMLEC and not captured here; `gaugesIn`/`elevation` are
 * recorded per entry for traceability but are expected to be `[3.5, 5]`/`'raised'` throughout.
 *
 * Caveat: these specs describe the track as it is on the club's current page, not necessarily as
 * it was in any given run's year — clubs extend and resurface tracks over decades. Treat matches
 * for older runs as approximate unless the source explicitly dates the layout.
 *
 * Rail material default: `railMaterial` is `'steel'` unless a source says otherwise. Non-steel
 * rail gets called various things by clubs (aluminium, ali, alloy, aluminum, "ally") — treat any
 * of those as `'aluminium'`. Only two values exist in this field; there is no third material.
 *
 * A material-specific pass checked every mapped society's own site (and other pages on the same
 * site — about/history/track) for an explicit rail-material statement: none of the 11 defaulted
 * entries name a material for their raised track. (Tyneside's site does say "Rails are steel,
 * with wooden sleepers... on a concrete base", but explicitly for its ground-level track, not the
 * raised one IMLEC runs on — not treated as confirmation.) All 11 stay on the default; don't
 * re-spend effort on this without a genuinely new source.
 *
 * Rugby and South Cheshire are announced future hosts (see `schedule.ts`) that have never hosted
 * before. Rugby is now sourced (see below, with a noted exception to the usual sourcing rule).
 * South Cheshire is still left out — see the Coverage list below for why.
 *
 * Coverage: only entries with an explicit gauge + length from the society's own site are included.
 * Checked and still left out, each re-verified on a second pass (don't re-spend effort on these
 * without a new source — reasons are specific, not "not found yet"):
 * - Bedford (runs at Summerfield's, Haynes): gauge is a non-issue (IMLEC fixes it at 3.5"/5"), but
 *   no length could be confirmed from the club's own site (bedfordmes.co.uk) — it only says "three
 *   track systems" with no specs. A "750ft/Winterfield" figure surfaced in an earlier pass but
 *   could not be re-traced to any source on a follow-up check (likely a mix-up with "Summerfield");
 *   treat it as unverified, not as a usable number.
 * - Chingford (cdmec.co.uk): states both gauges (ground 7.25"/5", raised 5"/3.5") but the domain
 *   does not resolve (DNS failure on both bare and www host) — no length obtainable.
 * - Fareham: no official "Fareham Society of Model Engineers"-type site found; only a model
 *   railway club (different hobby, 00/7mm scale) turns up under that town.
 * - Leeds (leedsmodelengineers.org.uk): home page has no track specs; the club relocated from
 *   Temple Newsam to Eggborough Power Station in 1978 and is relocating again, and no history
 *   subpage with Eggborough-era gauge/length could be reached (404s / not indexed).
 * - Llanelli (runs Pembrey Country Park railway as "Llanelli and District Model Engineers"): no
 *   confident official site found (only a possibly-stale WordPress address via a directory).
 * - Southampton (southamptonsme.co.uk): states raised track is 3.5"/5", opened 1962, but gives no
 *   length; site is marked "under construction" and subpages weren't reachable.
 * - South Cheshire: public-facing material only describes two tracks — a 5" ground-level passenger
 *   line ("the Peacock Railway") and a raised Gauge 1 (45mm, not a passenger gauge) line — neither
 *   matching IMLEC's raised 3.5"/5" requirement. One 2025 event listing mentions the society running
 *   "2.5"/3.5"/5" tracks... along with the new Gauge 1 layout", implying a matching raised line
 *   exists, but no source gives its length/gradient, and none clarifies it's the same track as the
 *   Gauge 1/Peacock lines already described. Needs the club directly, or the project owner.
 * - Witney: no "Witney"-area model engineering society could be confidently identified at all.
 * Not checked in enough depth to even reject with a specific reason: Urmston (official site
 * udmes.co.uk found, but its pages carry no track specs — only a third-party figure exists).
 * Bournemouth was never researched in either pass despite having 4 events — treat it as
 * "not looked at", not as "checked and rejected" like the others above.
 */

export type Elevation = 'raised' | 'ground';

export interface TrackSpec {
    /** Canonical society name, matching `host_society` once aliased. */
    society: string;
    /** Gauges carried by this track, in inches (e.g. 2.5, 3.5, 5). */
    gaugesIn: number[];
    lengthFt: number | null;
    /**
     * Ruling gradient, standard format `x:y` (e.g. '1:100'); `'x:y up, x:z down'` for an
     * asymmetric track; null if substantially level or unstated. Always store as `x:y`, never
     * '1 in y' or other phrasing, even when a source states it differently.
     */
    gradient: string | null;
    elevation: Elevation;
    /** Rail material: 'steel' by default, 'aluminium' if a source says the rail is non-steel (whatever it's called there). */
    railMaterial: 'steel' | 'aluminium';
    /** Where the spec was sourced from. */
    sourceUrl: string;
}

/** key: lower-cased raw host_society -> canonical society name used in TRACKS */
const SOCIETY_ALIASES: Record<string, string> = {
    'bromsgrove': 'Bromsgrove',
    'bristol': 'Bristol',
    'guildford': 'Guildford',
    'kinver': 'Kinver',
    'nottingham': 'Nottingham',
    'southport': 'Southport',
    'northampton': 'Northampton',
    'gravesend': 'Gravesend',
    'tyneside': 'Tyneside',
    'maidstone': 'Maidstone',
    'birmingham': 'Birmingham',
    'leyland': 'Leyland',
    'rugby': 'Rugby',
};

const TRACKS: Record<string, TrackSpec> = {
    'Bromsgrove': {
        society: 'Bromsgrove',
        gaugesIn: [2.5, 3.5, 5],
        lengthFt: 1260,
        gradient: '1:100 up, 1:80 down',
        elevation: 'raised',
        railMaterial: 'steel', // default: no source states otherwise
        sourceUrl: 'https://bromsgrovesme.co.uk/home24/index.php/our-tracks',
    },
    'Bristol': {
        society: 'Bristol',
        gaugesIn: [3.5, 5],
        // Site states "two tracks, each approximately 1/3 mile long"; 1/3 mile = 1760ft (our conversion).
        lengthFt: 1760,
        gradient: null,
        elevation: 'raised',
        railMaterial: 'steel', // default: no source states otherwise
        sourceUrl: 'https://www.bristolmodelengineers.co.uk/?p=331',
    },
    'Guildford': {
        society: 'Guildford',
        gaugesIn: [3.5, 5],
        lengthFt: 1405,
        // Site states "1 in 110" (ruling, usual running direction); normalised to x:y.
        gradient: '1:110',
        elevation: 'raised',
        railMaterial: 'steel', // default: no source states otherwise
        sourceUrl: 'https://gmes.org.uk/passenger.htm',
    },
    'Kinver': {
        society: 'Kinver',
        gaugesIn: [3.5, 5],
        // Site states "extensive raised half mile track"; half mile = 2640ft (our conversion).
        lengthFt: 2640,
        gradient: null,
        elevation: 'raised',
        railMaterial: 'steel', // default: no source states otherwise
        sourceUrl: 'https://kinver-miniature-railway.co.uk',
    },
    'Nottingham': {
        society: 'Nottingham',
        gaugesIn: [3.5, 5],
        lengthFt: 2270,
        // Site states "1 in 115 max"; normalised to x:y.
        gradient: '1:115',
        elevation: 'raised',
        railMaterial: 'steel', // default: no source states otherwise
        sourceUrl: 'https://nsmee.org.uk/about-nsmee/',
    },
    'Southport': {
        society: 'Southport',
        gaugesIn: [3.5, 5],
        // Site: original "500ft track" (Victoria Park); newer track opened May 2005, "approximately
        // 1/3 of a mile" (our conversion) — using the newer figure as the current track.
        lengthFt: 1760,
        // Gradient not stated on the club site; given as 1:100 directly by the project owner.
        gradient: '1:100',
        elevation: 'raised',
        railMaterial: 'steel', // default: no source states otherwise
        sourceUrl: 'https://www.southportmec.com/about',
    },
    'Northampton': {
        society: 'Northampton',
        gaugesIn: [3.5, 5],
        // Site: raised track (1965-67, rebuilt 1990) "extended to approximately 1/3 of a mile" (our conversion).
        lengthFt: 1760,
        gradient: null,
        elevation: 'raised',
        railMaterial: 'steel', // default: no source states otherwise
        sourceUrl: 'https://www.nsme.co.uk/Documents/HTML/NSMEHistory.html',
    },
    'Gravesend': {
        society: 'Gravesend',
        gaugesIn: [3.5, 5],
        lengthFt: 1218,
        gradient: null,
        elevation: 'raised',
        railMaterial: 'steel', // default: no source states otherwise
        sourceUrl: 'https://www.gmmes.co.uk/',
    },
    'Tyneside': {
        society: 'Tyneside',
        gaugesIn: [3.5, 5],
        lengthFt: 680,
        // Site states "1 in 100"; normalised to x:y.
        gradient: '1:100',
        elevation: 'raised',
        railMaterial: 'steel', // default: no source states otherwise
        sourceUrl: 'https://tsmee.co.uk/railway/',
    },
    'Maidstone': {
        society: 'Maidstone',
        gaugesIn: [3.5, 5],
        // Site: opened 1950 with 5"/3.5"/2.5" rails; "the 2 1/2" gauge rail was removed" in 1961,
        // leaving 3.5"/5" (our inference from the site's own account, not stated as a current list).
        lengthFt: 1826,
        // Gradient not stated on the club site; given as 1:100 directly by the project owner.
        gradient: '1:100',
        elevation: 'raised',
        // Given directly by the project owner: this track is aluminium, not steel.
        railMaterial: 'aluminium',
        sourceUrl: 'https://www.maidstonemes.co.uk/history.php',
    },
    'Birmingham': {
        society: 'Birmingham',
        // Site also separately describes a 1112ft dual-gauge 5"/7.25" ground-level track; this
        // entry is the raised track, to match every other entry in this file.
        gaugesIn: [3.5, 5],
        lengthFt: 1041,
        gradient: null,
        elevation: 'raised',
        railMaterial: 'steel', // default: no source states otherwise
        sourceUrl: 'https://www.birminghamsme.co.uk/about-us/',
    },
    'Leyland': {
        society: 'Leyland',
        gaugesIn: [3.5, 5],
        // Length given directly by the project owner as 540 yards; 540 * 3 = 1620ft.
        lengthFt: 1620,
        gradient: null,
        elevation: 'raised',
        railMaterial: 'steel', // default: no source states otherwise
        sourceUrl: 'https://leylandsme.co.uk',
    },
    'Rugby': {
        society: 'Rugby',
        // Exception to this file's usual rule: rugbymes.co.uk (incl. club-history and historical-
        // documents pages) states no track specs at all. This is from Wikipedia's Rainsbrook Valley
        // Railway article (sourced there to Warwickshire World / Steam Heritage press coverage, not
        // the club itself): "raised track around 800 yards (730m) long, mixed gauge 5in/3.5in/2.5in".
        // A 2025 Rugby Observer piece rounds the same track to "half mile" (2640ft) — close to but
        // not exactly 800yd (2400ft); treating 800yd as the more specific of the two press figures.
        gaugesIn: [2.5, 3.5, 5],
        lengthFt: 2400,
        gradient: null,
        elevation: 'raised',
        railMaterial: 'steel', // default: no source states otherwise
        sourceUrl: 'https://en.wikipedia.org/wiki/Rainsbrook_Valley_Railway',
    },
};

export function trackFor(hostSociety: string | null): TrackSpec | null {
    if (hostSociety === null) return null;
    const trimmed = hostSociety.trim();
    if (trimmed === '') return null;
    const key = trimmed.toLowerCase();
    const canonical = Object.hasOwn(SOCIETY_ALIASES, key) ? SOCIETY_ALIASES[key] : trimmed;
    return Object.hasOwn(TRACKS, canonical) ? TRACKS[canonical] : null;
}
