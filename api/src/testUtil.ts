import fs from 'fs';
import os from 'os';
import path from 'path';
import {AppOptions} from './config';

export interface Fixture {
    opts: AppOptions;
    dataRoot: string;
    cleanup: () => void;
}

export const makeFixture = (overrides: Partial<AppOptions> = {}): Fixture => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'imlec-'));
    const apiDir = path.join(repoRoot, 'api');
    const dataRoot = path.join(repoRoot, 'data');
    fs.mkdirSync(path.join(repoRoot, 'config', 'content'), {recursive: true});
    fs.mkdirSync(path.join(apiDir, 'public'), {recursive: true});
    fs.mkdirSync(path.join(apiDir, 'backend'), {recursive: true});
    fs.mkdirSync(path.join(dataRoot, 'ev'), {recursive: true});
    fs.writeFileSync(path.join(repoRoot, 'config', 'ev.json'),
        JSON.stringify({hash: 'ev', data: {entries: 'Entries.xlsx', scores: 'Scores.xlsx'}}));
    fs.writeFileSync(path.join(repoRoot, 'config', 'content', 'ev.json'), JSON.stringify({title: 'content-ev'}));
    fs.writeFileSync(path.join(repoRoot, 'config', 'nodata.json'), JSON.stringify({hash: 'nodata'}));
    const opts: AppOptions = {
        repoRoot, apiDir, dataRoot,
        appDistDir: path.join(repoRoot, 'dist', 'browser'),
        authUsersFile: path.join(repoRoot, 'auth_users.json'),
        sessionSecret: 'test-secret',
        loginDelayMs: 0,
        ...overrides,
    };
    return {opts, dataRoot, cleanup: () => fs.rmSync(repoRoot, {recursive: true, force: true})};
};

export const writeSheet = async (file: string, rows: string[][]): Promise<void> => {
    const writeXlsxFile = (await import('write-excel-file/node')).default;
    await writeXlsxFile(rows.map(r => r.map(value => ({value})))).toFile(file);
};
