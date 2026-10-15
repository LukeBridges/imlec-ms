import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import path from 'path';
import request from 'supertest';
import {createApp} from '../app';
import {Fixture, makeFixture, writeSheet} from '../testUtil';

let fx: Fixture;
let app: ReturnType<typeof createApp>;

beforeEach(async () => {
    fx = makeFixture();
    app = createApp(fx.opts);
    for (const name of ['Entries.xlsx', 'Scores.xlsx']) {
        await writeSheet(path.join(fx.dataRoot, 'ev', name), [['H1', 'H2'], [name, 'x']]);
    }
});
afterEach(() => fx.cleanup());

describe('hash routes', () => {
    it('root text', async () => {
        const res = await request(app).get('/');
        expect(res.text).toBe('IMLEC MS Api');
    });

    it('config json', async () => {
        const res = await request(app).get('/api/config/ev');
        expect(res.status).toBe(200);
        expect(res.body.hash).toBe('ev');
    });

    it('content uses content folder', async () => {
        const res = await request(app).get('/api/content/ev');
        expect(res.body).toEqual({title: 'content-ev'});
    });

    it('entries and scores drop header row', async () => {
        const e = await request(app).get('/api/entries/ev');
        expect(e.body).toEqual([['Entries.xlsx', 'x']]);
        const s = await request(app).get('/api/scores/ev');
        expect(s.body).toEqual([['Scores.xlsx', 'x']]);
    });

    it.each(['config', 'content', 'entries', 'scores'])('%s missing hash 404', async (r) => {
        const res = await request(app).get('/api/' + r);
        expect(res.status).toBe(404);
        expect(res.text).toBe('Missing HASH');
    });

    it.each(['config', 'content', 'entries', 'scores'])('%s unknown hash 404', async (r) => {
        const res = await request(app).get('/api/' + r + '/nope');
        expect(res.status).toBe(404);
        expect(res.text).toBe('Not Found');
    });

    it('rejects traversal in hash', async () => {
        const res = await request(app).get('/api/config/..%2Fcommon');
        expect(res.status).toBe(404);
    });

    it('404 when config has no data file name', async () => {
        const res = await request(app).get('/api/entries/nodata');
        expect(res.status).toBe(404);
    });

    it('404 when spreadsheet missing', async () => {
        const res = await request(app).get('/api/scores/nodata');
        expect(res.status).toBe(404);
    });

});
