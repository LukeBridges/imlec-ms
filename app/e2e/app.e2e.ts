import {expect, test} from '@playwright/test';
import {expectedScore, gotoHash} from './helpers';

const openSidenav = async (page: import('@playwright/test').Page) => {
    await page.getByRole('button', {name: 'Menu'}).click();
};

test.describe('feature flags and navigation', () => {
    test('full hash shows every optional nav link and the welcome content', async ({page}) => {
        await gotoHash(page, 'full');
        await expect(page.locator('.content')).toContainText('Fixture welcome body for e2e');
        await expect(page.getByRole('link', {name: 'Live Scoreboard'})).toBeVisible();
        await expect(page.getByRole('link', {name: 'Entries'})).toBeVisible();
        await expect(page.getByRole('link', {name: 'Competition Rules'})).toBeVisible();
        await expect(page.locator('main')).not.toContainText('Entries are now closed');
    });

    test('bare hash hides every optional nav link and shows the closed-entries message', async ({page}) => {
        await gotoHash(page, 'bare');
        await expect(page.locator('.content')).toContainText('Bare fixture welcome body');
        await expect(page.getByRole('link', {name: 'Live Scoreboard'})).toHaveCount(0);
        await expect(page.getByRole('link', {name: 'Entries', exact: true})).toHaveCount(0);
        await expect(page.getByRole('link', {name: 'Competition Rules'})).toHaveCount(0);
        await expect(page.getByRole('link', {name: 'Application Form'})).toHaveCount(0);
        await expect(page.locator('main')).toContainText('Entries are now closed');
    });

    test('the closed-entries link opens listings even though its nav link is hidden', async ({page}) => {
        await gotoHash(page, 'bare');
        await page.getByRole('link', {name: 'Here'}).click();
        await expect(page.locator('app-count')).toContainText('Number of entries:');
    });

    test('rules page renders via the header link', async ({page}) => {
        await gotoHash(page, 'full');
        await page.getByRole('link', {name: 'Competition Rules'}).click();
        await expect(page.locator('main')).toContainText('MARTIN EVANS TROPHY');
    });
});

test.describe('primary colour', () => {
    test('applies the configured primary colour as a CSS custom property', async ({page}) => {
        await gotoHash(page, 'full');
        await expect.poll(() => page.evaluate(() =>
            document.documentElement.style.getPropertyValue('--mat-sys-primary'))).toBe('#ab1234');
    });
});

test.describe('scoreboard', () => {
    test('desktop board lists every run with distinct computed scores', async ({page}) => {
        await gotoHash(page, 'full');
        await page.getByRole('link', {name: 'Live Scoreboard'}).click();
        // the board now shows one row per entry (28), with runs 5-28 as unscored placeholders.
        await expect(page.locator('mat-row')).toHaveCount(28);
        const runNos = await page.locator('mat-row .mat-column-runNo').allTextContents();
        expect(runNos.map(Number).sort((a, b) => a - b)).toEqual(Array.from({length: 28}, (_, i) => i + 1));
        const scores = await page.locator('mat-row .mat-column-overallThermalEfficiency').allTextContents();
        expect(scores).toContain(String(expectedScore(500000, 2)));
        expect(scores).toContain(String(expectedScore(700000, 2.2)));
        expect(scores).toContain(String(expectedScore(300000, 1.8)));
        expect(scores).toContain('Retired / Did not start');
    });

    test('higher-scoring runs sort above lower-scoring runs', async ({page}) => {
        await gotoHash(page, 'full');
        await page.getByRole('link', {name: 'Live Scoreboard'}).click();
        await expect(page.locator('mat-row')).toHaveCount(28);
        const runNos = await page.locator('.mat-column-runNo').allTextContents();
        // run 2 (score ~2.92) outscores run 3 (score ~1.53).
        expect(runNos.indexOf('2')).toBeLessThan(runNos.indexOf('3'));
    });

    test('a narrow viewport renders the mobile score layout', async ({page}) => {
        await page.setViewportSize({width: 375, height: 800});
        await gotoHash(page, 'full');
        await page.getByRole('button', {name: 'Menu'}).click();
        await page.getByRole('link', {name: 'Scoreboard'}).click();
        await expect(page.locator('mat-row')).toHaveCount(28);
        await expect(page.locator('.mat-column-driversClub')).toHaveCount(0);
        await expect(page.locator('.mat-column-coalUsed').first()).toBeVisible();
    });
});

test.describe('listings', () => {
    test('fullListings groups entries by day and shows reserves', async ({page}) => {
        await gotoHash(page, 'full');
        await page.getByRole('link', {name: 'Entries'}).click();
        await expect(page.locator('app-entry')).toBeVisible();
        await expect(page.locator('.day').nth(0)).toContainText('Driver 1');
        await expect(page.locator('.day').nth(1)).toContainText('Driver 9');
        await expect(page.locator('.day').nth(2)).toContainText('Driver 20');
        await expect(page.getByText('Reserves')).toBeVisible();
        await expect(page.locator('.day').nth(3)).toContainText('Driver 28');
        await expect(page.locator('.time').first()).toHaveText('10:30');
    });

    test('listings without fullListings shows only the entry count', async ({page}) => {
        await gotoHash(page, 'counted');
        await page.getByRole('link', {name: 'Entries'}).click();
        await expect(page.locator('app-count')).toContainText('Number of entries:');
        await expect(page.locator('app-count')).toContainText('28');
        await expect(page.locator('app-entry')).toHaveCount(0);
    });
});

test.describe('static pages via the sidebar', () => {
    test.beforeEach(async ({page}) => {
        await page.setViewportSize({width: 375, height: 800});
        await gotoHash(page, 'full');
    });

    test('about page renders', async ({page}) => {
        await openSidenav(page);
        await page.getByRole('link', {name: 'About'}).click();
        await expect(page.locator('main h1')).toHaveText('About');
        await expect(page.locator('main')).toContainText('Written by Luke Bridges');
    });

    test('hotels page renders', async ({page}) => {
        await openSidenav(page);
        await page.getByRole('link', {name: 'Accommodation'}).click();
        await expect(page.locator('main h1')).toContainText('Accommodation');
    });

    test('food page renders', async ({page}) => {
        await openSidenav(page);
        await page.getByRole('link', {name: 'Catering and Food'}).click();
        await expect(page.locator('main h1')).toContainText('Catering and Food');
    });

    test('home link returns to welcome from a deep page', async ({page}) => {
        await openSidenav(page);
        await page.getByRole('link', {name: 'About'}).click();
        await expect(page.locator('main h1')).toHaveText('About');
        await openSidenav(page);
        await page.getByRole('link', {name: 'Home'}).click();
        await expect(page.locator('.content')).toContainText('Fixture welcome body for e2e');
    });
});
