import fs from 'fs';
import os from 'os';
import path from 'path';
// Reused from the API package so this fixture boots the real Express app and real
// xlsx writer instead of re-implementing them; see api/src/app.ts and testUtil.ts.
import {createApp} from '../../api/src/app';
import {writeSheet} from '../../api/src/testUtil';

const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'imlec-app-e2e-'));
const apiDir = path.join(repoRoot, 'api');
const dataRoot = path.join(repoRoot, 'data');

fs.mkdirSync(path.join(repoRoot, 'config', 'content'), {recursive: true});
fs.mkdirSync(path.join(apiDir, 'public'), {recursive: true});
fs.mkdirSync(path.join(apiDir, 'backend'), {recursive: true});
fs.mkdirSync(path.join(dataRoot, 'full'), {recursive: true});

const configJson = (hash: string, features: Record<string, boolean>) => JSON.stringify({
    hash,
    primaryColour: hash === 'full' ? '#ab1234' : '#3f51b5',
    features,
    data: {entries: 'Entries.xlsx', scores: 'Scores.xlsx'},
});

fs.writeFileSync(path.join(repoRoot, 'config', 'full.json'), configJson('full', {
    applicationForm: true, scoreboard: true, listings: true, fullListings: true, rules: true,
}));
fs.writeFileSync(path.join(repoRoot, 'config', 'bare.json'), configJson('bare', {
    applicationForm: false, scoreboard: false, listings: false, fullListings: false, rules: false,
}));
fs.writeFileSync(path.join(repoRoot, 'config', 'counted.json'), configJson('counted', {
    applicationForm: false, scoreboard: true, listings: true, fullListings: false, rules: false,
}));

fs.writeFileSync(path.join(repoRoot, 'config', 'content', 'full.json'),
    JSON.stringify({welcome: {body: '<p>Fixture welcome body for e2e</p>'}}));
fs.writeFileSync(path.join(repoRoot, 'config', 'content', 'bare.json'),
    JSON.stringify({welcome: {body: '<p>Bare fixture welcome body</p>'}}));
fs.writeFileSync(path.join(repoRoot, 'config', 'content', 'counted.json'),
    JSON.stringify({welcome: {body: '<p>Counted fixture welcome body</p>'}}));

// Columns consumed by EntriesService.getEntries(): runNo, builder, name, club, model, arrangement, gauge, img, time.
const entryRow = (n: number) => [
    String(n), 'Builder ' + n, 'Driver ' + n, 'Club ' + n, 'Loco ' + n, '2-6-0', '5', 'loco' + n + '.jpg', '1030',
];
const entryRows = [
    ['runNo', 'builder', 'name', 'club', 'model', 'arrangement', 'gauge', 'img', 'time'],
    ...Array.from({length: 28}, (_, i) => entryRow(i + 1)),
];

// Columns consumed by ScoresService.getScores(): runNo, _, _, workDone, runningTime, coalUsed, distanceTravelled, load.
const scoreRows = [
    ['runNo', 'a', 'b', 'workDone', 'runningTime', 'coalUsed', 'distanceTravelled', 'load'],
    ['1', '', '', '500000', '600', '2', '1000', '200'],
    ['2', '', '', '700000', '650', '2.2', '1100', '210'],
    ['3', '', '', '300000', '500', '1.8', '900', '180'],
    ['4', '', '', '0', '0', '0', '0', '0'],
];

const run = async () => {
    await writeSheet(path.join(dataRoot, 'full', 'Entries.xlsx'), entryRows);
    await writeSheet(path.join(dataRoot, 'full', 'Scores.xlsx'), scoreRows);
    fs.cpSync(path.join(dataRoot, 'full'), path.join(dataRoot, 'counted'), {recursive: true});
    fs.cpSync(path.join(dataRoot, 'full'), path.join(dataRoot, 'bare'), {recursive: true});

    const opts = {
        repoRoot, apiDir, dataRoot,
        authUsersFile: path.join(repoRoot, 'auth_users.json'),
        sessionSecret: 'app-e2e-secret',
        loginDelayMs: 0,
    };

    createApp(opts).listen(Number(process.env.E2E_PORT), () => {
        console.log('app e2e fixture api ready');
    });
};

run();

const stop = () => {
    fs.rmSync(repoRoot, {recursive: true, force: true});
    process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
