import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {cleanName, PathError, resolveInRoot} from './safePath';

let base: string;
let root: string;
beforeEach(() => {
    base = fs.mkdtempSync(path.join(os.tmpdir(), 'sp-'));
    root = path.join(base, 'data');
    fs.mkdirSync(path.join(root, 'a'), {recursive: true});
    fs.mkdirSync(path.join(base, 'outside'));
});
afterEach(() => fs.rmSync(base, {recursive: true, force: true}));

describe('resolveInRoot', () => {
    const real = () => fs.realpathSync(root);

    it('empty and undefined resolve to root', () => {
        expect(resolveInRoot(root, '')).toBe(real());
        expect(resolveInRoot(root)).toBe(real());
    });

    it('resolves nested, tolerating leading slashes and backslashes', () => {
        expect(resolveInRoot(root, 'a/b.txt')).toBe(path.join(real(), 'a', 'b.txt'));
        expect(resolveInRoot(root, '/a')).toBe(path.join(real(), 'a'));
        expect(resolveInRoot(root, 'a\\b.txt')).toBe(path.join(real(), 'a', 'b.txt'));
    });

    it.each(['..', '../outside', '....//x/../../../outside','a/../../outside', '..\\outside'])(
        'blocks %s', (p: string) => {
            expect(() => resolveInRoot(root, p)).toThrow(PathError);
        });

    it('blocks absolute path escaping root', () => {
        expect(() => resolveInRoot(root, path.join(base, 'outside'))).not.toThrow(); // treated relative, stays inside
        expect(resolveInRoot(root, path.join(base, 'outside')).startsWith(fs.realpathSync(root))).toBe(true);
    });

    it('blocks sibling with shared prefix', () => {
        fs.mkdirSync(path.join(base, 'data-evil'));
        expect(() => resolveInRoot(root, '../data-evil')).toThrow(PathError);
    });

    it('blocks null byte and non-string', () => {
        expect(() => resolveInRoot(root, 'a\0.txt')).toThrow(PathError);
        expect(() => resolveInRoot(root, 5)).toThrow(PathError);
    });

    it('blocks symlink escape', () => {
        try {
            fs.symlinkSync(path.join(base, 'outside'), path.join(root, 'link'), 'junction');
        } catch (e) {
            return; // cannot create symlink here
        }
        expect(() => resolveInRoot(root, 'link')).toThrow(PathError);
        expect(() => resolveInRoot(root, 'link/new.txt')).toThrow(PathError);
    });

    it('error status is 403 for escape and 400 for invalid', () => {
        try { resolveInRoot(root, '..'); } catch (e) { expect((e as PathError).status).toBe(403); }
        try { resolveInRoot(root, 'a\0'); } catch (e) { expect((e as PathError).status).toBe(400); }
    });
});

describe('cleanName', () => {
    it('accepts and trims', () => expect(cleanName(' x.txt ')).toBe('x.txt'));
    it.each(['', '.', '..', 'a/b', 'a\\b', 'a\0b', 5 as any])('rejects %s', (n) => {
        expect(() => cleanName(n)).toThrow(PathError);
    });
});
