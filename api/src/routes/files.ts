import fs from 'fs';
import os from 'os';
import path from 'path';
import express, {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import multer from 'multer';
import {AppOptions} from '../config';
import {authRouter, requireAuth, requireWrite} from '../auth/auth';
import * as ops from '../files/ops';
import {PathError, resolveInRoot} from '../files/safePath';

const handle = (fn: (req: Request, res: Response) => unknown): RequestHandler => (req, res, next) => {
    try {
        const out = fn(req, res);
        if (out !== undefined) res.json(out);
    } catch (e) {
        next(e);
    }
};

const q = (req: Request, key: string): unknown => req.query[key];

export const filesRouter = (opts: AppOptions): Router => {
    const router = Router();
    const root = opts.dataRoot;
    const upload = multer({dest: os.tmpdir(), limits: {fileSize: 500 * 1024 * 1024}});

    router.use(express.json({limit: '10mb'}));
    router.use(authRouter(opts));

    // reads
    router.get('/list', requireAuth, handle(req => ops.listDir(root, q(req, 'path'))));
    router.get('/search', requireAuth, handle(req => ({results: ops.search(root, q(req, 'path'), q(req, 'q'))})));
    router.get('/view', requireAuth, handle(req => ops.view(root, q(req, 'path'))));

    router.get('/download', requireAuth, handle((req, res) => {
        const file = ops.downloadPath(root, q(req, 'path'));
        res.download(file, path.basename(file));
    }));

    const INLINE = new Set(['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp', 'ico', 'wav', 'mp3', 'ogg', 'webm', 'mp4']);
    router.get('/raw', requireAuth, handle((req, res) => {
        const file = ops.downloadPath(root, q(req, 'path'));
        if (!INLINE.has(path.extname(file).slice(1).toLowerCase())) {
            throw new PathError('Not viewable inline', 415);
        }
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.sendFile(file);
    }));

    // writes
    const body = (req: Request) => req.body ?? {};
    router.post('/mkdir', requireWrite, handle(req => ({path: ops.makeDir(root, body(req).dir, body(req).name)})));
    router.post('/new', requireWrite, handle(req => ({path: ops.newFile(root, body(req).dir, body(req).name)})));
    router.post('/delete', requireWrite, handle(req => ({deleted: ops.remove(root, body(req).paths)})));
    router.post('/rename', requireWrite, handle(req => ({path: ops.rename(root, body(req).path, body(req).to)})));
    router.post('/copy', requireWrite, handle(req => ({count: ops.copyMove(root, body(req).paths, body(req).dest, false)})));
    router.post('/move', requireWrite, handle(req => ({count: ops.copyMove(root, body(req).paths, body(req).dest, true)})));
    router.post('/backup', requireWrite, handle(req => ({path: ops.backup(root, body(req).path)})));
    router.post('/save', requireWrite, handle(req => {
        ops.saveText(root, body(req).path, body(req).content);
        return {saved: true};
    }));
    router.post('/zip', requireWrite, handle(req => ({path: ops.zip(root, body(req).dir, body(req).names)})));
    router.post('/unzip', requireWrite, handle(req => ({path: ops.unzip(root, body(req).path, !!body(req).toFolder)})));
    router.post('/chmod', requireWrite, handle(req => ({mode: ops.chmod(root, body(req).path, body(req).mode)})));

    // upload: auth and CSRF checked before multer touches the disk
    router.post('/upload', requireWrite, upload.array('upload'), (req: Request, res: Response, next: NextFunction) => {
        const files = (req.files as Express.Multer.File[] | undefined) ?? [];
        try {
            const dir = req.body?.dir;
            resolveInRoot(root, dir);
            const saved = ops.saveUploads(root, dir, files.map(f => ({
                tmpPath: f.path,
                originalName: Buffer.from(f.originalname, 'latin1').toString('utf8'),
            })));
            res.json({uploaded: saved});
        } catch (e) {
            files.forEach(f => fs.rmSync(f.path, {force: true}));
            next(e);
        }
    });

    router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof PathError) {
            res.status(err.status).json({error: err.message});
        } else if (err instanceof multer.MulterError) {
            res.status(400).json({error: err.message});
        } else if ((err as {type?: string}).type === 'entity.parse.failed') {
            res.status(400).json({error: 'Invalid JSON'});
        } else {
            next(err);
        }
    });

    return router;
};
