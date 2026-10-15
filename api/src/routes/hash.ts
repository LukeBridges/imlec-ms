import fs from 'fs/promises';
import path from 'path';
import {Router, Request, Response} from 'express';
import readXlsxFile from 'read-excel-file/node';
import {Config} from '../../../common/models/config.model';
import {AppOptions} from '../config';

const HASH_RE = /^[A-Za-z0-9_-]+$/;

export const hashRouter = (opts: AppOptions): Router => {
    const router = Router();

    const load = async (res: Response, hash: string | undefined, sub = ''): Promise<Config | null> => {
        if (!hash) {
            res.status(404).send('Missing HASH');
            return null;
        }
        if (!HASH_RE.test(hash)) {
            res.status(404).send('Not Found');
            return null;
        }
        try {
            const raw = await fs.readFile(path.join(opts.repoRoot, 'config', sub, hash + '.json'), 'utf8');
            return JSON.parse(raw);
        } catch (e) {
            res.status(404).send('Not Found');
            return null;
        }
    };

    router.get('/api/config{/:hash}', async (req: Request, res: Response) => {
        const config = await load(res, req.params.hash as string | undefined);
        if (config) res.json(config);
    });

    router.get('/api/content{/:hash}', async (req: Request, res: Response) => {
        const content = await load(res, req.params.hash as string | undefined, 'content');
        if (content) res.json(content);
    });

    const sheet = (key: 'entries' | 'scores') => async (req: Request, res: Response) => {
        const hash = req.params.hash as string | undefined;
        const config = await load(res, hash);
        if (!config) return;
        const name = config.data?.[key];
        if (!name) {
            res.status(404).send('Not Found');
            return;
        }
        try {
            const rows = await readXlsxFile(path.join(opts.dataRoot, hash as string, path.basename(name)));
            res.send(rows.slice(1));
        } catch (e) {
            res.status(404).send('Not Found');
        }
    };
    router.get('/api/entries{/:hash}', sheet('entries'));
    router.get('/api/scores{/:hash}', sheet('scores'));

    return router;
};
