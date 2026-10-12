import crypto from 'crypto';
import fs from 'fs';
import {NextFunction, Request, Response, Router} from 'express';
import {AppOptions} from '../config';

declare module 'express-session' {
    interface SessionData {
        user?: string;
        readonly?: boolean;
        csrf?: string;
    }
}

export interface AuthUsers {
    users: Record<string, string>;
    readonly: string[];
}

/** Load users file. Missing, empty or invalid file means no users, so login always fails (fail closed). */
export const loadUsers = (file: string): AuthUsers => {
    try {
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
        const users: Record<string, string> = {};
        for (const [name, hash] of Object.entries(parsed.users ?? {})) {
            if (typeof hash === 'string') users[name] = hash.toLowerCase();
        }
        const readonly = Array.isArray(parsed.readonly) ? parsed.readonly.filter((r: unknown) => typeof r === 'string') : [];
        return {users, readonly};
    } catch (e) {
        return {users: {}, readonly: []};
    }
};

const safeEqual = (a: string, b: string): boolean => {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

export const md5 = (value: string): string => crypto.createHash('md5').update(value).digest('hex');

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user) {
        res.status(401).json({error: 'Not logged in'});
        return;
    }
    next();
};

/** Auth plus readonly and CSRF enforcement for state changing requests. */
export const requireWrite = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user) {
        res.status(401).json({error: 'Not logged in'});
        return;
    }
    const sent = req.get('x-csrf-token');
    if (!sent || !req.session.csrf || !safeEqual(sent, req.session.csrf)) {
        res.status(403).json({error: 'Bad CSRF token'});
        return;
    }
    if (req.session.readonly) {
        res.status(403).json({error: 'Read only user'});
        return;
    }
    next();
};

const sessionInfo = (req: Request) => ({
    loggedIn: !!req.session.user,
    user: req.session.user ?? null,
    readonly: !!req.session.readonly,
    csrf: req.session.user ? req.session.csrf : null,
});

export const authRouter = (opts: AppOptions): Router => {
    const router = Router();

    router.get('/session', (req, res) => {
        res.json(sessionInfo(req));
    });

    router.post('/login', async (req, res) => {
        const {username, password} = req.body ?? {};
        const {users, readonly} = loadUsers(opts.authUsersFile);
        const expected = typeof username === 'string' && Object.prototype.hasOwnProperty.call(users, username)
            ? users[username] : null;
        const ok = expected !== null && typeof password === 'string' && safeEqual(md5(password), expected);
        if (!ok) {
            await sleep(opts.loginDelayMs);
            res.status(401).json({error: 'Wrong password'});
            return;
        }
        req.session.regenerate(err => {
            if (err) {
                res.status(500).json({error: 'Session error'});
                return;
            }
            req.session.user = username;
            req.session.readonly = readonly.includes(username);
            req.session.csrf = crypto.randomBytes(24).toString('hex');
            res.json(sessionInfo(req));
        });
    });

    router.post('/logout', (req, res) => {
        req.session.destroy(() => {
            res.json({loggedIn: false});
        });
    });

    return router;
};
