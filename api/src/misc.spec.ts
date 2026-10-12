import {describe, expect, it} from 'vitest';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';
import request from 'supertest';
import {defaultOptions, findUp} from './config';
import {createApp} from './app';
import {authRouter} from './auth/auth';
import {resolveInRoot} from './files/safePath';
import {makeFixture} from './testUtil';

describe('config', () => {
    it('findUp finds a parent containing the name', () => {
        const base = fs.mkdtempSync(path.join(os.tmpdir(), 'fu-'));
        fs.mkdirSync(path.join(base, 'config'));
        fs.mkdirSync(path.join(base, 'a', 'b'), {recursive: true});
        expect(findUp('config', path.join(base, 'a', 'b'))).toBe(base);
        fs.rmSync(base, {recursive: true, force: true});
    });

    it('findUp throws when nothing found', () => {
        expect(() => findUp('definitely-not-here-' + Date.now(), os.tmpdir())).toThrow(/Cannot locate/);
    });

    it('defaultOptions finds repo and honours env', () => {
        const opts = defaultOptions();
        expect(fs.existsSync(path.join(opts.repoRoot, 'config'))).toBe(true);
        expect(opts.apiDir).toBe(path.join(opts.repoRoot, 'api'));
        expect(opts.loginDelayMs).toBe(1000);
        process.env.DATA_ROOT = '/x';
        process.env.AUTH_USERS_FILE = '/y';
        process.env.SESSION_SECRET = 'z';
        const env = defaultOptions();
        delete process.env.DATA_ROOT;
        delete process.env.AUTH_USERS_FILE;
        delete process.env.SESSION_SECRET;
        expect([env.dataRoot, env.authUsersFile, env.sessionSecret]).toEqual(['/x', '/y', 'z']);
    });
});

describe('app', () => {
    it('generates a session secret when none configured', async () => {
        const fx = makeFixture({sessionSecret: ''});
        const res = await request(createApp(fx.opts)).get('/files/api/session');
        expect(res.status).toBe(200);
        fx.cleanup();
    });

    it('serves backend UI statically', async () => {
        const fx = makeFixture();
        fs.writeFileSync(path.join(fx.opts.apiDir, 'backend', 'index.html'), '<p>ui</p>');
        const res = await request(createApp(fx.opts)).get('/backend/index.html');
        expect(res.text).toBe('<p>ui</p>');
        fx.cleanup();
    });
});

describe('auth session errors', () => {
    it('login returns 500 when session cannot regenerate', async () => {
        const fx = makeFixture();
        const md5 = crypto.createHash('md5').update('p').digest('hex');
        fs.writeFileSync(fx.opts.authUsersFile, JSON.stringify({users: {a: md5}}));
        const app = express();
        app.use(express.json());
        app.use((req, _res, next) => {
            (req as any).session = {regenerate: (cb: (e?: Error) => void) => cb(new Error('boom'))};
            next();
        });
        app.use(authRouter(fx.opts));
        const res = await request(app).post('/login').send({username: 'a', password: 'p'});
        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Session error');
        fx.cleanup();
    });
});

describe('safePath at a filesystem root', () => {
    it('handles a root that already ends with a separator', () => {
        const root = path.parse(os.tmpdir()).root;
        expect(resolveInRoot(root, path.basename(os.tmpdir())).startsWith(fs.realpathSync(root))).toBe(true);
    });
});
