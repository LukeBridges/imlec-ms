import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import request from 'supertest';
import AdmZip from 'adm-zip';
import {createApp} from '../app';
import {Fixture, makeFixture} from '../testUtil';
import {loadUsers, md5} from '../auth/auth';

const md5hex = (s: string) => crypto.createHash('md5').update(s).digest('hex');
const API = '/files/api';

let fx: Fixture;
let app: ReturnType<typeof createApp>;
const data = (...p: string[]) => path.join(fx.dataRoot, ...p);

beforeEach(() => {
    fx = makeFixture();
    fs.writeFileSync(fx.opts.authUsersFile, JSON.stringify({
        users: {admin: md5hex('secret'), user: md5hex('viewer')},
        readonly: ['user'],
    }));
    app = createApp(fx.opts);
    fs.writeFileSync(data('ev', 'b10.txt'), 'ten');
    fs.writeFileSync(data('ev', 'b2.txt'), 'two');
    fs.writeFileSync(data('ev', '.hidden'), 'h');
    fs.mkdirSync(data('ev', 'sub'));
    fs.writeFileSync(data('ev', 'sub', 'inner.txt'), 'in');
});
afterEach(() => fx.cleanup());

const login = async (username = 'admin', password = 'secret') => {
    const agent = request.agent(app);
    const res = await agent.post(API + '/login').send({username, password});
    return {agent, csrf: res.body.csrf as string, res};
};

describe('auth', () => {
    it('session reports logged out', async () => {
        const res = await request(app).get(API + '/session');
        expect(res.body).toEqual({loggedIn: false, user: null, readonly: false, csrf: null});
    });

    it('login success returns csrf, sets cookie flags', async () => {
        const {res} = await login();
        expect(res.status).toBe(200);
        expect(res.body.loggedIn).toBe(true);
        expect(res.body.readonly).toBe(false);
        expect(res.body.csrf).toBeTruthy();
        const cookie = String(res.headers['set-cookie']);
        expect(cookie).toContain('filemanager=');
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('SameSite=Lax');
    });

    it('wrong password 401', async () => {
        const {res} = await login('admin', 'nope');
        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Wrong password');
    });

    it('unknown user and prototype names 401', async () => {
        expect((await login('ghost', 'x')).res.status).toBe(401);
        expect((await login('__proto__', 'x')).res.status).toBe(401);
        expect((await login('constructor', 'x')).res.status).toBe(401);
    });

    it('non string credentials 401', async () => {
        const res = await request(app).post(API + '/login').send({username: 1, password: {}});
        expect(res.status).toBe(401);
        const empty = await request(app).post(API + '/login');
        expect(empty.status).toBe(401);
    });

    it('fails closed when users file missing or invalid', async () => {
        fs.rmSync(fx.opts.authUsersFile);
        expect((await login()).res.status).toBe(401);
        fs.writeFileSync(fx.opts.authUsersFile, '{not json');
        expect((await login()).res.status).toBe(401);
        fs.writeFileSync(fx.opts.authUsersFile, '{}');
        expect((await login()).res.status).toBe(401);
        expect((await request(app).get(API + '/list')).status).toBe(401);
    });

    it('md5 compare is case insensitive on stored hash', async () => {
        fs.writeFileSync(fx.opts.authUsersFile, JSON.stringify({users: {a: md5hex('p').toUpperCase(), b: 5}}));
        expect((await login('a', 'p')).res.status).toBe(200);
        expect((await login('b', '5')).res.status).toBe(401);
    });

    it('loadUsers ignores bad readonly', () => {
        fs.writeFileSync(fx.opts.authUsersFile, JSON.stringify({users: {a: 'x'}, readonly: 'a'}));
        expect(loadUsers(fx.opts.authUsersFile).readonly).toEqual([]);
        expect(md5('a')).toBe(md5hex('a'));
    });

    it('login delays failures', async () => {
        const slow = createApp({...fx.opts, loginDelayMs: 150});
        const start = Date.now();
        await request(slow).post(API + '/login').send({username: 'admin', password: 'bad'});
        expect(Date.now() - start).toBeGreaterThanOrEqual(140);
    });

    it('logout ends session', async () => {
        const {agent} = await login();
        expect((await agent.get(API + '/list')).status).toBe(200);
        await agent.post(API + '/logout');
        expect((await agent.get(API + '/list')).status).toBe(401);
    });

    it('login regenerates session id', async () => {
        const agent = request.agent(app);
        const first = await agent.get(API + '/session');
        const before = String(first.headers['set-cookie'] ?? '');
        const res = await agent.post(API + '/login').send({username: 'admin', password: 'secret'});
        expect(String(res.headers['set-cookie'])).not.toBe(before);
    });

    it('write needs csrf', async () => {
        const {agent} = await login();
        expect((await agent.post(API + '/mkdir').send({dir: 'ev', name: 'x'})).status).toBe(403);
        expect((await agent.post(API + '/mkdir').set('x-csrf-token', 'bad').send({dir: 'ev', name: 'x'})).status).toBe(403);
    });

    it('write needs login', async () => {
        const res = await request(app).post(API + '/mkdir').send({dir: 'ev', name: 'x'});
        expect(res.status).toBe(401);
    });

    it('invalid json 400', async () => {
        const res = await request(app).post(API + '/login').set('content-type', 'application/json').send('{bad');
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid JSON');
    });
});

describe('readonly user', () => {
    it('can read but not write', async () => {
        const {agent, csrf, res} = await login('user', 'viewer');
        expect(res.body.readonly).toBe(true);
        expect((await agent.get(API + '/list?path=ev')).status).toBe(200);
        expect((await agent.get(API + '/view?path=ev/b2.txt')).status).toBe(200);
        expect((await agent.get(API + '/download?path=ev/b2.txt')).status).toBe(200);
        const writes: [string, object][] = [
            ['mkdir', {dir: 'ev', name: 'n'}], ['new', {dir: 'ev', name: 'n'}], ['delete', {paths: ['ev/b2.txt']}],
            ['rename', {path: 'ev/b2.txt', to: 'z'}], ['copy', {paths: ['ev/b2.txt'], dest: 'ev/sub'}],
            ['move', {paths: ['ev/b2.txt'], dest: 'ev/sub'}], ['backup', {path: 'ev/b2.txt'}],
            ['save', {path: 'ev/b2.txt', content: 'hacked'}], ['zip', {dir: 'ev', names: ['b2.txt']}],
            ['unzip', {path: 'ev/b2.txt'}], ['chmod', {path: 'ev/b2.txt', mode: '777'}],
        ];
        for (const [route, payload] of writes) {
            const r = await agent.post(API + '/' + route).set('x-csrf-token', csrf).send(payload);
            expect(r.status, route).toBe(403);
        }
        const up = await agent.post(API + '/upload').set('x-csrf-token', csrf).field('dir', 'ev').attach('upload', Buffer.from('x'), 'u.txt');
        expect(up.status).toBe(403);
        expect(fs.readFileSync(data('ev', 'b2.txt'), 'utf8')).toBe('two');
        expect(fs.existsSync(data('ev', 'u.txt'))).toBe(false);
    });
});

describe('list / search', () => {
    it('lists folders first, natural order, hidden shown', async () => {
        const {agent} = await login();
        const res = await agent.get(API + '/list?path=ev');
        expect(res.body.path).toBe('ev');
        expect(res.body.parent).toBe('');
        expect(res.body.entries.map((e: {name: string}) => e.name)).toEqual(['sub', '.hidden', 'b2.txt', 'b10.txt']);
        expect(res.body.entries[0].type).toBe('dir');
        expect(res.body.entries[2]).toMatchObject({type: 'file', size: 3});
    });

    it('root listing has null parent and nested parent', async () => {
        const {agent} = await login();
        expect((await agent.get(API + '/list')).body.parent).toBeNull();
        expect((await agent.get(API + '/list?path=ev/sub')).body.parent).toBe('ev');
    });

    it('missing folder 404, file 400', async () => {
        const {agent} = await login();
        expect((await agent.get(API + '/list?path=nope')).status).toBe(404);
        expect((await agent.get(API + '/list?path=ev/b2.txt')).status).toBe(400);
    });

    it('blocks traversal', async () => {
        const {agent} = await login();
        expect((await agent.get(API + '/list?path=..')).status).toBe(403);
        expect((await agent.get(API + '/list?path=ev/../..')).status).toBe(403);
        expect((await agent.get(API + '/view?path=../auth_users.json')).status).toBe(403);
        expect((await agent.get(API + '/download?path=..%2Fauth_users.json')).status).toBe(403);
    });

    it('searches recursively skipping dotfiles', async () => {
        const {agent} = await login();
        const res = await agent.get(API + '/search?q=INNER');
        expect(res.body.results).toEqual(['ev/sub/inner.txt']);
        const all = await agent.get(API + '/search?path=ev&q=');
        expect(all.body.results).not.toContain('ev/.hidden');
        expect(all.body.results).toContain('ev/b2.txt');
    });
});

describe('view / download / raw', () => {
    it('views text', async () => {
        const {agent} = await login();
        expect((await agent.get(API + '/view?path=ev/b2.txt')).body).toMatchObject({type: 'text', content: 'two'});
    });

    it('classifies image audio video binary', async () => {
        fs.writeFileSync(data('ev', 'p.png'), 'x');
        fs.writeFileSync(data('ev', 's.mp3'), 'x');
        fs.writeFileSync(data('ev', 'v.mp4'), 'x');
        fs.writeFileSync(data('ev', 'bin.dat'), Buffer.from([1, 0, 2]));
        const {agent} = await login();
        const type = async (f: string) => (await agent.get(API + '/view?path=ev/' + f)).body.type;
        expect(await type('p.png')).toBe('image');
        expect(await type('s.mp3')).toBe('audio');
        expect(await type('v.mp4')).toBe('video');
        expect(await type('bin.dat')).toBe('binary');
    });

    it('lists zip entries', async () => {
        const z = new AdmZip();
        z.addFile('a.txt', Buffer.from('aaa'));
        z.writeZip(data('ev', 'z.zip'));
        const {agent} = await login();
        const res = await agent.get(API + '/view?path=ev/z.zip');
        expect(res.body.type).toBe('zip');
        expect(res.body.zipEntries[0]).toMatchObject({name: 'a.txt', size: 3, folder: false});
    });

    it('download is attachment', async () => {
        const {agent} = await login();
        const res = await agent.get(API + '/download?path=ev/b2.txt');
        expect(res.headers['content-disposition']).toContain('attachment');
        expect(res.text).toBe('two');
    });

    it('raw serves media only', async () => {
        fs.writeFileSync(data('ev', 'p.png'), 'png');
        const {agent} = await login();
        expect((await agent.get(API + '/raw?path=ev/p.png')).status).toBe(200);
        expect((await agent.get(API + '/raw?path=ev/b2.txt')).status).toBe(415);
    });

    it('missing file or folder 404', async () => {
        const {agent} = await login();
        expect((await agent.get(API + '/view?path=ev/none.txt')).status).toBe(404);
        expect((await agent.get(API + '/download?path=ev/sub')).status).toBe(404);
    });
});

describe('mkdir / new / rename / delete', () => {
    it('mkdir and new, refuse existing and bad names', async () => {
        const {agent, csrf} = await login();
        const post = (r: string, b: object) => agent.post(API + '/' + r).set('x-csrf-token', csrf).send(b);
        expect((await post('mkdir', {dir: 'ev', name: 'newdir'})).body.path).toBe('ev/newdir');
        expect(fs.statSync(data('ev', 'newdir')).isDirectory()).toBe(true);
        expect((await post('new', {dir: 'ev', name: 'n.txt'})).body.path).toBe('ev/n.txt');
        expect(fs.readFileSync(data('ev', 'n.txt'), 'utf8')).toBe('');
        expect((await post('mkdir', {dir: 'ev', name: 'newdir'})).status).toBe(409);
        expect((await post('new', {dir: 'ev', name: 'n.txt'})).status).toBe(409);
        expect((await post('mkdir', {dir: 'ev', name: '../x'})).status).toBe(400);
        expect((await post('new', {dir: 'ev', name: '..'})).status).toBe(400);
        expect((await post('mkdir', {dir: '..', name: 'x'})).status).toBe(403);
    });

    it('rename without overwrite', async () => {
        const {agent, csrf} = await login();
        const post = (b: object) => agent.post(API + '/rename').set('x-csrf-token', csrf).send(b);
        expect((await post({path: 'ev/b2.txt', to: 'c.txt'})).body.path).toBe('ev/c.txt');
        expect(fs.existsSync(data('ev', 'c.txt'))).toBe(true);
        expect((await post({path: 'ev/c.txt', to: 'b10.txt'})).status).toBe(409);
        expect((await post({path: 'ev/nope', to: 'x'})).status).toBe(404);
        expect((await post({path: 'ev/c.txt', to: '../../x'})).status).toBe(400);
        expect((await post({path: '', to: 'x'})).status).toBe(400);
    });

    it('delete recursive, multiple, validates', async () => {
        const {agent, csrf} = await login();
        const post = (b: object) => agent.post(API + '/delete').set('x-csrf-token', csrf).send(b);
        expect((await post({paths: ['ev/sub', 'ev/b2.txt']})).body.deleted).toBe(2);
        expect(fs.existsSync(data('ev', 'sub'))).toBe(false);
        expect(fs.existsSync(data('ev', 'b2.txt'))).toBe(false);
        expect((await post({paths: []})).status).toBe(400);
        expect((await post({})).status).toBe(400);
        expect((await post({paths: ['ev/none']})).status).toBe(404);
        expect((await post({paths: ['']})).status).toBe(400);
        expect((await post({paths: ['../x']})).status).toBe(403);
        expect(fs.existsSync(data('ev', 'b10.txt'))).toBe(true);
    });
});

describe('copy / move', () => {
    it('copies file and folder, overwrites, creates destination', async () => {
        const {agent, csrf} = await login();
        const post = (r: string, b: object) => agent.post(API + '/' + r).set('x-csrf-token', csrf).send(b);
        expect((await post('copy', {paths: ['ev/b2.txt', 'ev/sub'], dest: 'ev2/deep'})).body.count).toBe(2);
        expect(fs.readFileSync(data('ev2', 'deep', 'b2.txt'), 'utf8')).toBe('two');
        expect(fs.readFileSync(data('ev2', 'deep', 'sub', 'inner.txt'), 'utf8')).toBe('in');
        expect(fs.existsSync(data('ev', 'b2.txt'))).toBe(true);
        fs.writeFileSync(data('ev', 'b2.txt'), 'changed');
        await post('copy', {paths: ['ev/b2.txt'], dest: 'ev2/deep'});
        expect(fs.readFileSync(data('ev2', 'deep', 'b2.txt'), 'utf8')).toBe('changed');
    });

    it('moves, refuses overwrite', async () => {
        const {agent, csrf} = await login();
        const post = (r: string, b: object) => agent.post(API + '/' + r).set('x-csrf-token', csrf).send(b);
        expect((await post('move', {paths: ['ev/b2.txt'], dest: 'ev/sub'})).status).toBe(200);
        expect(fs.existsSync(data('ev', 'b2.txt'))).toBe(false);
        expect(fs.existsSync(data('ev', 'sub', 'b2.txt'))).toBe(true);
        fs.writeFileSync(data('ev', 'b2.txt'), 'again');
        expect((await post('move', {paths: ['ev/b2.txt'], dest: 'ev/sub'})).status).toBe(409);
        expect(fs.existsSync(data('ev', 'b2.txt'))).toBe(true);
    });

    it('rejects same path, into self, missing, traversal, empty', async () => {
        const {agent, csrf} = await login();
        const post = (r: string, b: object) => agent.post(API + '/' + r).set('x-csrf-token', csrf).send(b);
        expect((await post('copy', {paths: ['ev/b2.txt'], dest: 'ev'})).status).toBe(400);
        expect((await post('copy', {paths: ['ev/sub'], dest: 'ev/sub'})).status).toBe(400);
        expect((await post('copy', {paths: ['ev/nope'], dest: 'ev'})).status).toBe(404);
        expect((await post('copy', {paths: ['ev/b2.txt'], dest: '..'})).status).toBe(403);
        expect((await post('copy', {paths: ['../x'], dest: 'ev'})).status).toBe(403);
        expect((await post('move', {paths: [], dest: 'ev'})).status).toBe(400);
        expect((await post('move', {paths: [''], dest: 'ev'})).status).toBe(400);
    });
});

describe('upload', () => {
    it('uploads multiple files, overwrites same name', async () => {
        const {agent, csrf} = await login();
        const send = () => agent.post(API + '/upload').set('x-csrf-token', csrf).field('dir', 'ev')
            .attach('upload', Buffer.from('one'), 'a.xlsx').attach('upload', Buffer.from('two'), 'b.xlsx');
        const res = await send();
        expect(res.body.uploaded).toEqual(['ev/a.xlsx', 'ev/b.xlsx']);
        expect(fs.readFileSync(data('ev', 'a.xlsx'), 'utf8')).toBe('one');
        await agent.post(API + '/upload').set('x-csrf-token', csrf).field('dir', 'ev').attach('upload', Buffer.from('NEW'), 'a.xlsx');
        expect(fs.readFileSync(data('ev', 'a.xlsx'), 'utf8')).toBe('NEW');
    });

    it('strips path from upload name', async () => {
        const {agent, csrf} = await login();
        const res = await agent.post(API + '/upload').set('x-csrf-token', csrf).field('dir', 'ev')
            .attach('upload', Buffer.from('x'), {filename: '../../evil.txt'});
        expect(res.status).toBe(200);
        expect(res.body.uploaded).toEqual(['ev/evil.txt']);
        expect(fs.existsSync(path.join(fx.opts.repoRoot, 'evil.txt'))).toBe(false);
    });

    it('rejects traversal dir, missing dir, nothing uploaded', async () => {
        const {agent, csrf} = await login();
        const up = (dir: string, withFile = true) => {
            const r = agent.post(API + '/upload').set('x-csrf-token', csrf).field('dir', dir);
            return withFile ? r.attach('upload', Buffer.from('x'), 'a.txt') : r;
        };
        expect((await up('..')).status).toBe(403);
        expect((await up('nodir')).status).toBe(404);
        expect((await up('ev', false)).status).toBe(400);
        expect(fs.existsSync(path.join(fx.opts.repoRoot, 'a.txt'))).toBe(false);
    });

    it('rejects upload without csrf', async () => {
        const {agent} = await login();
        const res = await agent.post(API + '/upload').field('dir', 'ev').attach('upload', Buffer.from('x'), 'a.txt');
        expect(res.status).toBe(403);
    });
});

describe('backup / save', () => {
    it('backup creates dMy-His .bak copy', async () => {
        const {agent, csrf} = await login();
        const res = await agent.post(API + '/backup').set('x-csrf-token', csrf).send({path: 'ev/b2.txt'});
        expect(res.body.path).toMatch(/^ev\/b2\.txt-\d{2}[A-Z][a-z]{2}\d{2}-\d{6}\.bak$/);
        expect(fs.readFileSync(data(res.body.path), 'utf8')).toBe('two');
        expect((await agent.post(API + '/backup').set('x-csrf-token', csrf).send({path: 'ev/nope'})).status).toBe(404);
    });

    it('save writes text, validates', async () => {
        const {agent, csrf} = await login();
        const post = (b: object) => agent.post(API + '/save').set('x-csrf-token', csrf).send(b);
        expect((await post({path: 'ev/b2.txt', content: 'edited'})).body.saved).toBe(true);
        expect(fs.readFileSync(data('ev', 'b2.txt'), 'utf8')).toBe('edited');
        expect((await post({path: 'ev/b2.txt', content: 5})).status).toBe(400);
        expect((await post({path: 'ev/newfile.txt', content: 'x'})).status).toBe(404);
        expect((await post({path: '../x', content: 'x'})).status).toBe(403);
    });
});

describe('zip / unzip', () => {
    it('zips one item with its name, several as archive', async () => {
        const {agent, csrf} = await login();
        const post = (r: string, b: object) => agent.post(API + '/' + r).set('x-csrf-token', csrf).send(b);
        const one = await post('zip', {dir: 'ev', names: ['b2.txt']});
        expect(one.body.path).toMatch(/^ev\/b2\.txt_\d{6}_\d{6}\.zip$/);
        expect(new AdmZip(data(one.body.path)).getEntries().map(e => e.entryName)).toEqual(['b2.txt']);
        const many = await post('zip', {dir: 'ev', names: ['b2.txt', 'sub']});
        expect(many.body.path).toMatch(/^ev\/archive_\d{6}_\d{6}\.zip$/);
        const names = new AdmZip(data(many.body.path)).getEntries().map(e => e.entryName);
        expect(names).toContain('b2.txt');
        expect(names).toContain('sub/inner.txt');
    });

    it('zip validates', async () => {
        const {agent, csrf} = await login();
        const post = (b: object) => agent.post(API + '/zip').set('x-csrf-token', csrf).send(b);
        expect((await post({dir: 'ev', names: []})).status).toBe(400);
        expect((await post({dir: 'ev', names: ['../x']})).status).toBe(400);
        expect((await post({dir: 'ev', names: ['nope']})).status).toBe(404);
        expect((await post({dir: '..', names: ['x']})).status).toBe(403);
    });

    it('unzips in place and to folder', async () => {
        const z = new AdmZip();
        z.addFile('a.txt', Buffer.from('aaa'));
        z.addFile('d/b.txt', Buffer.from('bbb'));
        z.writeZip(data('ev', 'pack.zip'));
        const {agent, csrf} = await login();
        const post = (b: object) => agent.post(API + '/unzip').set('x-csrf-token', csrf).send(b);
        expect((await post({path: 'ev/pack.zip'})).body.path).toBe('ev');
        expect(fs.readFileSync(data('ev', 'a.txt'), 'utf8')).toBe('aaa');
        expect((await post({path: 'ev/pack.zip', toFolder: true})).body.path).toBe('ev/pack');
        expect(fs.readFileSync(data('ev', 'pack', 'd', 'b.txt'), 'utf8')).toBe('bbb');
        expect((await post({path: 'ev/none.zip'})).status).toBe(404);
    });

    it('rejects zip slip entries', async () => {
        const z = new AdmZip();
        z.addFile('safe.txt', Buffer.from('s'));
        z.addFile('x/evil.txt', Buffer.from('e'));
        // forge traversal entry name
        z.getEntries()[1].entryName = '../../evil.txt';
        z.writeZip(data('ev', 'slip.zip'));
        const {agent, csrf} = await login();
        const res = await agent.post(API + '/unzip').set('x-csrf-token', csrf).send({path: 'ev/slip.zip', toFolder: true});
        expect(res.status).toBe(400);
        expect(fs.existsSync(data('evil.txt'))).toBe(false);
        expect(fs.existsSync(path.join(fx.opts.repoRoot, 'evil.txt'))).toBe(false);
        expect(fs.existsSync(data('ev', 'slip', 'safe.txt'))).toBe(false);
    });
});
