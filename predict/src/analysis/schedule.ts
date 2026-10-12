/**
 * Announced future IMLEC hosts, not yet in the scraped `event` table (imlecarchive.com only has
 * results for runs that already happened). Given directly by the project owner — not scraped or
 * web-sourced — so there's no `sourceUrl` to cite here, unlike `tracks.ts`. Update as further years
 * are announced or as each one is superseded by an actual scraped result.
 *
 * `society` matches the `host_society` spelling used elsewhere (and `tracks.ts`'s `SOCIETY_ALIASES`
 * keys), so `trackFor(hostFor(year)?.society ?? null)` chains straight through once a track spec
 * exists for that society.
 */

export interface FutureHost {
    year: number;
    society: string;
}

export const FUTURE_HOSTS: FutureHost[] = [
    {year: 2027, society: 'Rugby'},
    {year: 2028, society: 'South Cheshire'},
    {year: 2029, society: 'Maidstone'},
];

export function hostFor(year: number): FutureHost | null {
    return FUTURE_HOSTS.find(h => h.year === year) ?? null;
}
