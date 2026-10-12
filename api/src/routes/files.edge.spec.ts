import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import AdmZip from 'adm-zip';
import {createApp} from '../app';
import {Fixture, makeFixture} from '../testUtil';

const API = '/files/api';
const REAL_PLATFORM = process.platform;
let fx: Fixture;
let app: ReturnType<typeof createApp>;
const data = (...p: string[]) => path.join(fx.dataRoot, ...p);

beforeEach(() => {
    fx = makeFixture();
    fs.writeFileSync(fx.opts.authUsersFile, JSON.stringify({
        users: {admin: crypto.createHash('md5').update('secret').digest('hex')},
    }));
    app = createApp(fx.opts);
    fs.writeFileSync(data('ev', 'b2.txt'), 'two');
    fs.mkdirSync(data('ev', 'sub'));
    fs.writeFileSync(data('ev', 'sub', 'inner.txt'), 'in');
});
afterEach(() => {
    vi.restoreAllMocks();
    fx.cleanup();
});

const login = async () => {
    const agent = request.agent(app);
    const res = await agent.post(API + '/login').send({username: 'admin', password: 'secret'});
    return {agent, csrf: res.body.csrf as string};
};

const asPlatform = async (platform: string, fn: () => Promise<void>) => {
    const orig = Object.getOwnPropertyDescriptor(process, 'platform')!;
    Object.defineProperty(process, 'platform', {value: platform});
    try {
        await fn();
    } finally {
        Object.defineProperty(process, 'platform', orig);
    }
};

describe('chmod', () => {
    it('changes mode and validates', async () => {
        const {agent, csrf} = await login();
        const post = (b: object) => agent.post(API + '/chmod').set('x-csrf-token', csrf).send(b);
        await asPlatform('linux', async () => {
            expect((await post({path: 'ev/b2.txt', mode: '0600'})).body.mode).toBe('0600');
            if (REAL_PLATFORM !== 'win32') expect(fs.statSync(data('ev', 'b2.txt')).mode & 0o777).toBe(0o600);
            expect((await post({path: 'ev/b2.txt', mode: 'rwx'})).status).toBe(400);
            expect((await post({path: 'ev/b2.txt'})).status).toBe(400);
            expect((await post({path: 'ev/none', mode: '644'})).status).toBe(404);
            expect((await post({path: '', mode: '644'})).status).toBe(400);
        });
    });

    it('is unavailable on Windows', async () => {
        const {agent, csrf} = await login();
        await asPlatform('win32', async () => {
            const res = await agent.post(API + '/chmod').set('x-csrf-token', csrf).send({path: 'ev/b2.txt', mode: '644'});
            expect(res.status).toBe(501);
        });
    });
});

describe('edge cases', () => {
    it('search without q lists everything', async () => {
        const {agent} = await login();
        const res = await agent.get(API + '/search?path=ev/sub');
        expect(res.body.results).toEqual(['ev/sub/inner.txt']);
    });

    it('sorts several folders naturally', async () => {
        fs.mkdirSync(data('ev', 'd10'));
        fs.mkdirSync(data('ev', 'd2'));
        const {agent} = await login();
        const res = await agent.get(API + '/list?path=ev');
        expect(res.body.entries.map((e: {name: string}) => e.name).slice(0, 3)).toEqual(['d2', 'd10', 'sub']);
    });

    it('post without body is a 400, not a crash', async () => {
        const {agent, csrf} = await login();
        expect((await agent.post(API + '/mkdir').set('x-csrf-token', csrf)).status).toBe(400);
    });

    it('upload without multipart body is 400', async () => {
        const {agent, csrf} = await login();
        const res = await agent.post(API + '/upload').set('x-csrf-token', csrf).send({dir: 'ev'});
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Nothing uploaded');
    });

    it('upload with unexpected field is a multer 400', async () => {
        const {agent, csrf} = await login();
        const res = await agent.post(API + '/upload').set('x-csrf-token', csrf).field('dir', 'ev')
            .attach('wrongfield', Buffer.from('x'), 'a.txt');
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/unexpected/i);
    });

    it('oversize json goes to default error handler', async () => {
        const {agent, csrf} = await login();
        const res = await agent.post(API + '/save').set('x-csrf-token', csrf)
            .send({path: 'ev/b2.txt', content: 'x'.repeat(11 * 1024 * 1024)});
        expect(res.status).toBe(413);
    });

    it('unzip extracts explicit directory entries', async () => {
        const z = new AdmZip();
        z.addFile('emptydir/', Buffer.alloc(0));
        z.addFile('f.txt', Buffer.from('f'));
        z.writeZip(data('ev', 'dirs.zip'));
        const {agent, csrf} = await login();
        await agent.post(API + '/unzip').set('x-csrf-token', csrf).send({path: 'ev/dirs.zip', toFolder: true});
        expect(fs.statSync(data('ev', 'dirs', 'emptydir')).isDirectory()).toBe(true);
    });

    it('missing spreadsheet file gives 404', async () => {
        const res = await request(app).get('/api/entries/ev');
        expect(res.status).toBe(404);
    });
});

describe('cross-device fallbacks', () => {
    const exdev = () => {
        vi.spyOn(fs, 'renameSync').mockImplementation(() => {
            const err = new Error('EXDEV') as NodeJS.ErrnoException;
            err.code = 'EXDEV';
            throw err;
        });
    };

    it('move falls back to copy and delete', async () => {
        const {agent, csrf} = await login();
        exdev();
        const res = await agent.post(API + '/move').set('x-csrf-token', csrf).send({paths: ['ev/b2.txt'], dest: 'ev/sub'});
        expect(res.status).toBe(200);
        expect(fs.readFileSync(data('ev', 'sub', 'b2.txt'), 'utf8')).toBe('two');
        expect(fs.existsSync(data('ev', 'b2.txt'))).toBe(false);
    });

    it('upload falls back to copy and delete temp', async () => {
        const {agent, csrf} = await login();
        exdev();
        const res = await agent.post(API + '/upload').set('x-csrf-token', csrf).field('dir', 'ev')
            .attach('upload', Buffer.from('fallback'), 'fb.txt');
        expect(res.status).toBe(200);
        expect(fs.readFileSync(data('ev', 'fb.txt'), 'utf8')).toBe('fallback');
    });
});
