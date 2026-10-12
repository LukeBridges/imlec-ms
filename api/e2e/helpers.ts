import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {expect, Page} from '@playwright/test';
import AdmZip from 'adm-zip';
import {writeSheet} from '../src/testUtil';

interface Info {
    dataRoot: string;
    authUsersFile: string;
}

export const info = (): Info => JSON.parse(fs.readFileSync(path.join(__dirname, '.run', 'info.json'), 'utf8'));
export const data = (...p: string[]) => path.join(info().dataRoot, ...p);

const md5 = (s: string) => crypto.createHash('md5').update(s).digest('hex');

// 1x1 transparent png
export const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

/** Reset the data folder and users to a known state. */
export const reset = async (): Promise<void> => {
    const {dataRoot, authUsersFile} = info();
    fs.rmSync(dataRoot, {recursive: true, force: true});
    fs.mkdirSync(path.join(dataRoot, 'ev', 'sub'), {recursive: true});
    fs.writeFileSync(authUsersFile, JSON.stringify({
        users: {admin: md5('secret'), viewer: md5('look')},
        readonly: ['viewer'],
    }));
    await writeSheet(data('ev', 'Entries.xlsx'), [['Number', 'Name'], ['1', 'Original Entry']]);
    await writeSheet(data('ev', 'Scores.xlsx'), [['Number', 'Score'], ['1', '10']]);
    fs.writeFileSync(data('ev', 'notes.txt'), 'hello notes');
    fs.writeFileSync(data('ev', 'photo.png'), PNG);
    fs.writeFileSync(data('ev', 'sub', 'inner.txt'), 'inner');
    const zip = new AdmZip();
    zip.addFile('packed.txt', Buffer.from('packed content'));
    zip.writeZip(data('ev', 'pack.zip'));
};

export const login = async (page: Page, user = 'admin', password = 'secret'): Promise<void> => {
    await page.goto('/backend/index.html');
    await page.getByLabel('User').fill(user);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', {name: 'Log in'}).click();
    await expect(page.locator('#manager')).toBeVisible();
};

/** Row for exactly this entry name (the checkbox value holds the exact name). */
export const row = (page: Page, name: string) => page.locator('#rows tr', {has: page.locator('input.pick[value="' + name + '"]')});

export const openFolder = async (page: Page, name: string) => {
    await page.locator('td.name a', {hasText: name}).first().click();
    await expect(page.locator('#crumbs')).toContainText(name);
};

/** Answer the next window.prompt / confirm. */
export const answerNextDialog = (page: Page, value?: string) => {
    page.once('dialog', d => (value === undefined ? d.accept() : d.accept(value)));
};
