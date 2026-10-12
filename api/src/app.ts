import crypto from 'crypto';
import express, {Express, Request, Response} from 'express';
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

    app.set('trust proxy', 1);
    app.use(cors());
    app.use(compression());
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

    return app;
};
