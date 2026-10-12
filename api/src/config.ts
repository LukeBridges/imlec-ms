import fs from 'fs';
import path from 'path';

export const findUp = (name: string, from = __dirname): string => {
    let dir = from;
    while (!fs.existsSync(path.join(dir, name))) {
        const parent = path.dirname(dir);
        if (parent === dir) {
            throw new Error('Cannot locate ' + name + ' above ' + from);
        }
        dir = parent;
    }
    return dir;
};

export interface AppOptions {
    repoRoot: string;
    dataRoot: string;
    apiDir: string;
    authUsersFile: string;
    sessionSecret: string;
    loginDelayMs: number;
}

export const defaultOptions = (): AppOptions => {
    const repoRoot = findUp('config');
    const apiDir = path.join(repoRoot, 'api');
    return {
        repoRoot,
        apiDir,
        dataRoot: process.env.DATA_ROOT || path.join(repoRoot, 'data'),
        authUsersFile: process.env.AUTH_USERS_FILE || path.join(apiDir, 'auth_users.json'),
        sessionSecret: process.env.SESSION_SECRET || '',
        loginDelayMs: 1000,
    };
};
