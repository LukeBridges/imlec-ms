import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import {cleanName, PathError, resolveInRoot} from './safePath';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const p2 = (n: number) => String(n).padStart(2, '0');

/** PHP date('ymd_His') in UTC. */
export const stampZip = (d = new Date()): string =>
    p2(d.getUTCFullYear() % 100) + p2(d.getUTCMonth() + 1) + p2(d.getUTCDate()) + '_' +
    p2(d.getUTCHours()) + p2(d.getUTCMinutes()) + p2(d.getUTCSeconds());

/** PHP date('dMy-His') in UTC. */
export const stampBackup = (d = new Date()): string =>
    p2(d.getUTCDate()) + MONTHS[d.getUTCMonth()] + p2(d.getUTCFullYear() % 100) + '-' +
    p2(d.getUTCHours()) + p2(d.getUTCMinutes()) + p2(d.getUTCSeconds());

export interface Entry {
    name: string;
    type: 'dir' | 'file';
    size: number;
    modified: string;
    perms: string;
    link: boolean;
}

export interface Listing {
    path: string;
    parent: string | null;
    entries: Entry[];
}

const natural = (a: string, b: string) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});

const relOf = (root: string, abs: string): string =>
    path.relative(fs.realpathSync(root), abs).split(path.sep).join('/');

const exists = (p: string) => {
    try {
        fs.lstatSync(p);
        return true;
    } catch (e) {
        return false;
    }
};

const statOrThrow = (abs: string, what = 'File not found') => {
    try {
        return fs.statSync(abs);
    } catch (e) {
        throw new PathError(what, 404);
    }
};

const dirAt = (root: string, rel: unknown): string => {
    const abs = resolveInRoot(root, rel);
    if (!statOrThrow(abs, 'Folder not found').isDirectory()) throw new PathError('Not a folder', 400);
    return abs;
};

const entryOf = (abs: string, name: string): Entry => {
    const l = fs.lstatSync(path.join(abs, name));
    let s = l;
    try {
        s = fs.statSync(path.join(abs, name));
    } catch (e) {
        // broken link: keep lstat
    }
    return {
        name,
        type: s.isDirectory() ? 'dir' : 'file',
        size: s.isDirectory() ? 0 : s.size,
        modified: s.mtime.toISOString(),
        perms: (s.mode & 0o777).toString(8).padStart(4, '0'),
        link: l.isSymbolicLink(),
    };
};

export const listDir = (root: string, rel: unknown): Listing => {
    const abs = dirAt(root, rel);
    const entries = fs.readdirSync(abs).map(n => entryOf(abs, n));
    const dirs = entries.filter(e => e.type === 'dir').sort((a, b) => natural(a.name, b.name));
    const files = entries.filter(e => e.type === 'file').sort((a, b) => natural(a.name, b.name));
    const here = relOf(root, abs);
    return {path: here, parent: here === '' ? null : path.posix.dirname(here) === '.' ? '' : path.posix.dirname(here), entries: [...dirs, ...files]};
};

export interface SearchHit {
    path: string;
    type: 'dir' | 'file';
}

/** Recursive search below rel; skips dotfiles like the PHP scan(). Matches name substring, case insensitive. */
export const search = (root: string, rel: unknown, q: unknown): SearchHit[] => {
    const needle = String(q ?? '').toLowerCase();
    const out: SearchHit[] = [];
    const walk = (abs: string) => {
        for (const name of fs.readdirSync(abs)) {
            if (name.startsWith('.')) continue;
            const full = path.join(abs, name);
            const l = fs.lstatSync(full);
            const isDir = l.isDirectory();
            if (name.toLowerCase().includes(needle)) out.push({path: relOf(root, full), type: isDir ? 'dir' : 'file'});
            if (isDir) walk(full);
        }
    };
    walk(dirAt(root, rel));
    return out;
};

export const makeDir = (root: string, dir: unknown, name: unknown): string => {
    const target = path.join(dirAt(root, dir), cleanName(name));
    if (exists(target)) throw new PathError('Already exists', 409);
    fs.mkdirSync(target);
    return relOf(root, target);
};

export const newFile = (root: string, dir: unknown, name: unknown): string => {
    const target = path.join(dirAt(root, dir), cleanName(name));
    if (exists(target)) throw new PathError('Already exists', 409);
    fs.writeFileSync(target, '');
    return relOf(root, target);
};

const notRoot = (root: string, abs: string) => {
    if (abs === fs.realpathSync(root)) throw new PathError('Cannot act on root', 400);
};

const asList = (v: unknown): unknown[] => {
    if (!Array.isArray(v) || v.length === 0) throw new PathError('Nothing selected');
    return v;
};

/** Delete files and folders recursively. Symlinks are unlinked, never followed. */
export const remove = (root: string, paths: unknown): number => {
    const abs = asList(paths).map(p => resolveInRoot(root, p));
    abs.forEach(a => {
        notRoot(root, a);
        if (!exists(a)) throw new PathError('File not found', 404);
    });
    abs.forEach(a => fs.rmSync(a, {recursive: true, force: true}));
    return abs.length;
};

export const rename = (root: string, from: unknown, to: unknown): string => {
    const src = resolveInRoot(root, from);
    notRoot(root, src);
    if (!exists(src)) throw new PathError('File not found', 404);
    const dest = path.join(path.dirname(src), cleanName(to));
    resolveInRoot(root, relOf(root, dest));
    if (exists(dest)) throw new PathError('File or folder with this path already exists', 409);
    fs.renameSync(src, dest);
    return relOf(root, dest);
};

/** Copy overwrites like PHP fm_rcopy; move refuses to overwrite like fm_rename. Destination folder is created. */
export const copyMove = (root: string, paths: unknown, dest: unknown, move: boolean): number => {
    const sources = asList(paths).map(p => resolveInRoot(root, p));
    const destAbs = resolveInRoot(root, dest);
    const plan = sources.map(src => {
        notRoot(root, src);
        if (!exists(src)) throw new PathError('File not found', 404);
        const target = path.join(destAbs, path.basename(src));
        if (target === src) throw new PathError('Paths must be not equal');
        if (fs.statSync(src).isDirectory() && (target + path.sep).startsWith(src + path.sep)) {
            throw new PathError('Cannot copy folder into itself');
        }
        if (move && exists(target)) throw new PathError('File or folder with this path already exists', 409);
        return {src, target};
    });
    fs.mkdirSync(destAbs, {recursive: true});
    plan.forEach(({src, target}) => {
        if (move) {
            try {
                fs.renameSync(src, target);
            } catch (e) {
                fs.cpSync(src, target, {recursive: true});
                fs.rmSync(src, {recursive: true, force: true});
            }
        } else {
            fs.cpSync(src, target, {recursive: true, force: true});
        }
    });
    return plan.length;
};

export interface Upload {
    tmpPath: string;
    originalName: string;
}

/** Move uploaded temp files into dir. Same name overwrites. Names reduced to their basename. */
export const saveUploads = (root: string, dir: unknown, files: Upload[]): string[] => {
    if (!files.length) throw new PathError('Nothing uploaded');
    const dirAbs = dirAt(root, dir);
    return files.map(f => {
        const name = cleanName(path.basename(f.originalName.replace(/\\/g, '/')));
        const target = path.join(dirAbs, name);
        resolveInRoot(root, relOf(root, target));
        try {
            fs.renameSync(f.tmpPath, target);
        } catch (e) {
            fs.copyFileSync(f.tmpPath, target);
            fs.rmSync(f.tmpPath, {force: true});
        }
        return relOf(root, target);
    });
};

const fileAt = (root: string, rel: unknown): string => {
    const abs = resolveInRoot(root, rel);
    if (!statOrThrow(abs).isFile()) throw new PathError('File not found', 404);
    return abs;
};

export const downloadPath = fileAt;

export const backup = (root: string, rel: unknown): string => {
    const abs = fileAt(root, rel);
    const target = abs + '-' + stampBackup() + '.bak';
    fs.copyFileSync(abs, target);
    return relOf(root, target);
};

export const saveText = (root: string, rel: unknown, content: unknown): void => {
    if (typeof content !== 'string') throw new PathError('Invalid content');
    fs.writeFileSync(fileAt(root, rel), content);
};

const IMAGE = ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'svg', 'webp', 'ico'];
const AUDIO = ['wav', 'mp3', 'ogg'];
const VIDEO = ['webm', 'mp4'];
const ARCHIVE = ['zip'];
const MAX_TEXT = 5 * 1024 * 1024;

export interface ViewResult {
    name: string;
    type: 'image' | 'audio' | 'video' | 'zip' | 'text' | 'binary';
    size: number;
    content?: string;
    zipEntries?: {name: string; size: number; compressed: number; folder: boolean}[];
}

export const view = (root: string, rel: unknown): ViewResult => {
    const abs = fileAt(root, rel);
    const name = path.basename(abs);
    const ext = path.extname(name).slice(1).toLowerCase();
    const size = fs.statSync(abs).size;
    if (IMAGE.includes(ext)) return {name, type: 'image', size};
    if (AUDIO.includes(ext)) return {name, type: 'audio', size};
    if (VIDEO.includes(ext)) return {name, type: 'video', size};
    if (ARCHIVE.includes(ext)) {
        const zipEntries = new AdmZip(abs).getEntries().map(e => ({
            name: e.entryName, size: e.header.size, compressed: e.header.compressedSize, folder: e.isDirectory,
        }));
        return {name, type: 'zip', size, zipEntries};
    }
    const buf = fs.readFileSync(abs);
    if (size > MAX_TEXT || buf.includes(0)) return {name, type: 'binary', size};
    return {name, type: 'text', size, content: buf.toString('utf8')};
};

/** Create zip in dir. One selected: <name>_ymd_His.zip, several: archive_ymd_His.zip. Returns zip rel path. */
export const zip = (root: string, dir: unknown, names: unknown): string => {
    const dirAbs = dirAt(root, dir);
    const list = asList(names).map(n => cleanName(n));
    const sources = list.map(n => {
        const abs = resolveInRoot(root, relOf(root, path.join(dirAbs, n)));
        if (!exists(abs)) throw new PathError('File not found', 404);
        return abs;
    });
    const zipName = (list.length === 1 ? list[0] : 'archive') + '_' + stampZip() + '.zip';
    const z = new AdmZip();
    sources.forEach(s => {
        if (fs.statSync(s).isDirectory()) z.addLocalFolder(s, path.basename(s));
        else z.addLocalFile(s);
    });
    const target = path.join(dirAbs, zipName);
    z.writeZip(target);
    return relOf(root, target);
};

/** Extract zip next to itself, or into a folder named after the zip. Entries escaping the target are rejected. */
export const unzip = (root: string, rel: unknown, toFolder: boolean): string => {
    const zipAbs = fileAt(root, rel);
    let target = path.dirname(zipAbs);
    if (toFolder) {
        target = path.join(target, path.basename(zipAbs, path.extname(zipAbs)));
        fs.mkdirSync(target, {recursive: true});
    }
    const archive = new AdmZip(zipAbs);
    const entries = archive.getEntries();
    const real = fs.realpathSync(target);
    const jobs = entries.map(e => {
        const out = path.resolve(real, e.entryName.replace(/\\/g, '/'));
        if (out !== real && !out.startsWith(real + path.sep)) throw new PathError('Unsafe archive entry', 400);
        resolveInRoot(root, relOf(root, out));
        return {e, out};
    });
    jobs.forEach(({e, out}) => {
        if (e.isDirectory) {
            fs.mkdirSync(out, {recursive: true});
        } else {
            fs.mkdirSync(path.dirname(out), {recursive: true});
            fs.writeFileSync(out, e.getData());
        }
    });
    return relOf(root, target);
};

export const chmod = (root: string, rel: unknown, mode: unknown, platform: string = process.platform): string => {
    if (platform === 'win32') throw new PathError('chmod not available on Windows', 501);
    if (typeof mode !== 'string' || !/^[0-7]{3,4}$/.test(mode)) throw new PathError('Invalid mode');
    const abs = resolveInRoot(root, rel);
    notRoot(root, abs);
    if (!exists(abs)) throw new PathError('File not found', 404);
    fs.chmodSync(abs, parseInt(mode, 8));
    return mode;
};
