export function mean(xs: number[]): number | null {
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export function median(xs: number[]): number | null {
    if (!xs.length) return null;
    const s = [...xs].sort((a, b) => a - b);
    const mid = s.length >> 1;
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function stdev(xs: number[]): number | null {
    if (xs.length < 2) return null;
    const m = mean(xs)!;
    return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1));
}

export function groupBy<T, K>(items: T[], key: (item: T) => K | null | undefined): Map<K, T[]> {
    const groups = new Map<K, T[]>();
    for (const item of items) {
        const k = key(item);
        if (k === null || k === undefined) continue;
        const list = groups.get(k);
        if (list) list.push(item);
        else groups.set(k, [item]);
    }
    return groups;
}

/** Average ranks (ties share the mean of their positions). */
export function ranks(xs: number[]): number[] {
    const order = xs.map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0]);
    const out = new Array<number>(xs.length);
    for (let i = 0; i < order.length;) {
        let j = i;
        while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
        const rank = (i + j) / 2 + 1;
        for (let k = i; k <= j; k++) out[order[k][1]] = rank;
        i = j + 1;
    }
    return out;
}

function lnGamma(x: number): number {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (const ci of c) ser += ci / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function betaContinuedFraction(a: number, b: number, x: number): number {
    const tiny = 1e-30;
    let c = 1;
    let d = 1 - (a + b) * x / (a + 1);
    if (Math.abs(d) < tiny) d = tiny;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 200; m++) {
        const m2 = 2 * m;
        let aa = m * (b - m) * x / ((a + m2 - 1) * (a + m2));
        d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
        c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
        d = 1 / d;
        h *= d * c;
        aa = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1));
        d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
        c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
        d = 1 / d;
        const delta = d * c;
        h *= delta;
        if (Math.abs(delta - 1) < 3e-12) break;
    }
    return h;
}

/** Regularised incomplete beta function I_x(a, b). */
export function incompleteBeta(x: number, a: number, b: number): number {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const front = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2)
        ? front * betaContinuedFraction(a, b, x) / a
        : 1 - front * betaContinuedFraction(b, a, 1 - x) / b;
}

export interface Correlation {
    n: number;
    r: number;
    /** Two-sided p-value for H0: no correlation (t-test on r). */
    p: number;
}

export function pearson(xs: number[], ys: number[]): Correlation | null {
    const n = xs.length;
    if (n !== ys.length) throw new Error('pearson: length mismatch');
    if (n < 3) return null;
    const mx = mean(xs)!;
    const my = mean(ys)!;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) {
        sxy += (xs[i] - mx) * (ys[i] - my);
        sxx += (xs[i] - mx) ** 2;
        syy += (ys[i] - my) ** 2;
    }
    if (sxx === 0 || syy === 0) return null;
    const r = Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy)));
    const df = n - 2;
    const p = Math.abs(r) === 1 ? 0 : incompleteBeta(df / (df + (r * r * df) / (1 - r * r)), df / 2, 0.5);
    return {n, r, p};
}

export function spearman(xs: number[], ys: number[]): Correlation | null {
    return n3(xs) ? pearson(ranks(xs), ranks(ys)) : null;
}

function n3(xs: number[]): boolean {
    return xs.length >= 3;
}
