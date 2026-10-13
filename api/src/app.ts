import crypto from 'crypto';
import fs from 'fs';
import express, {Express, Request, Response, NextFunction} from 'express';
import cors from 'cors';
import compression from 'compression';
import session from 'express-session';
import path from 'path';
import {AppOptions, defaultOptions} from './config';
import {hashRouter} from './routes/hash';
import {filesRouter} from './routes/files';

export const createApp = (overrides: Partial<AppOptions> = {}): Express => {
    const opts: AppOptions = {...defaultOptions(), ...overrides};
    const app = express();
    const appIndex = path.join(opts.appDistDir, 'index.html');
    const hasApp = fs.existsSync(appIndex);

    app.set('trust proxy', 1);
    app.use(cors());
    app.use(compression());
    if (hasApp) {
        app.use(express.static(opts.appDistDir));
    }
    app.use(express.static(path.join(opts.apiDir, 'public')));
    app.use('/backend', express.static(path.join(opts.apiDir, 'backend')));

    app.get('/', (req: Request, res: Response) => {
        res.send('IMLEC MS Api');
    });

    app.use(hashRouter(opts));

    app.use('/files/api', session({
        name: 'filemanager',
        secret: opts.sessionSecret || crypto.randomBytes(32).toString('hex'),
        resave: false,
        saveUninitialized: false,
        cookie: {httpOnly: true, sameSite: 'lax', secure: 'auto', path: '/'},
    }), filesRouter(opts));

    if (hasApp) {
        app.get('/*splat', (req: Request, res: Response, next: NextFunction) => {
            if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/files') || req.path.startsWith('/backend')) {
                return next();
            }
            res.sendFile(appIndex);
        });
    }

    return app;
};
