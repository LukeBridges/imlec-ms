import path from 'path';
import {defineConfig} from '@playwright/test';

const API_PORT = 4201; // matches src/environments/environment.ts
const APP_PORT = 4200;

export default defineConfig({
    testDir: './e2e',
    testMatch: '**/*.e2e.ts',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: [['list']],
    use: {
        baseURL: 'http://localhost:' + APP_PORT,
        trace: 'retain-on-failure',
        // Chromium's Local/Private Network Access checks block the app (localhost:4200)
        // from calling the fixture API (localhost:4201) with no way to grant permission
        // in a headless, unattended run, so the checks are disabled for this suite.
        launchOptions: {
            args: ['--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults'],
        },
    },
    webServer: [
        {
            command: 'npx ts-node --transpile-only e2e/server.ts',
            cwd: __dirname,
            env: {TS_NODE_PROJECT: path.join(__dirname, '..', 'api', 'tsconfig.json'), E2E_PORT: String(API_PORT)},
            url: 'http://localhost:' + API_PORT + '/',
            reuseExistingServer: false,
            timeout: 60000,
        },
        {
            command: 'npx ng serve --port ' + APP_PORT,
            cwd: __dirname,
            url: 'http://localhost:' + APP_PORT + '/',
            reuseExistingServer: false,
            timeout: 180000,
        },
    ],
});
