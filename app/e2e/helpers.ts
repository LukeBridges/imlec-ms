import {Page} from '@playwright/test';

/**
 * window.IMLEC.hash is baked into index.html at build time ('mmes'). Rewrite it in-flight so each
 * test can point the SPA at a different fixture hash served by e2e/server.ts, without touching source.
 */
export const gotoHash = async (page: Page, hash: string): Promise<void> => {
    await page.route('**/*', async route => {
        if (route.request().resourceType() !== 'document') {
            await route.continue();
            return;
        }
        const response = await route.fetch();
        const body = (await response.text()).replace("hash: 'mmes'", "hash: '" + hash + "'");
        await route.fulfill({response, body});
    });
    await page.goto('/');
};

export const COAL_USED_MAGIC = 14000 * 778;

/** Mirrors ScoreModel.calculatedScoreToDisplay for a fixture row, to assert the rendered score independently. */
export const expectedScore = (workDone: number, coalUsed: number): number =>
    Math.round(((workDone * 100) / (coalUsed * COAL_USED_MAGIC)) * 10000) / 10000;
