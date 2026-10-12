import {defineConfig} from '@playwright/test';

const PORT = 4310;

export default defineConfig({
    testDir: './e2e',
    testMatch: '**/*.e2e.ts',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: [['list']],
    use: {
        baseURL: 'http://localhost:' + PORT,
        trace: 'retain-on-failure',
        acceptDownloads: true,
    },
    webServer: {
        command: 'npx ts-node e2e/server.ts',
        url: 'http://localhost:' + PORT + '/',
        reuseExistingServer: false,
        timeout: 60000,
        env: {E2E_PORT: String(PORT)},
    },
});
