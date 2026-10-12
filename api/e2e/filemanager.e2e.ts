import fs from 'fs';
import {expect, Page, test} from '@playwright/test';
import AdmZip from 'adm-zip';
import {answerNextDialog, data, login, openFolder, PNG, reset, row} from './helpers';

const names = (page: Page) => page.locator('#rows td.name a').allTextContents();
const msg = (page: Page) => page.locator('#msg');

test.beforeEach(async () => {
    await reset();
});

const enterEv = async (page: Page, user?: string, pass?: string) => {
    await login(page, user, pass);
    await openFolder(page, 'ev');
};

test.describe('login and session', () => {
    test('shows login form first and hides manager', async ({page}) => {
        await page.goto('/backend/index.html');
        await expect(page.locator('#login')).toBeVisible();
        await expect(page.locator('#manager')).toBeHidden();
    });

    test('wrong password shows error and stays on login', async ({page}) => {
        await page.goto('/backend/index.html');
        await page.getByLabel('User').fill('admin');
        await page.getByLabel('Password').fill('wrong');
        await page.getByRole('button', {name: 'Log in'}).click();
        await expect(msg(page)).toHaveText('Wrong password');
        await expect(page.locator('#manager')).toBeHidden();
    });

    test('login lists data root, shows user, survives reload, logout returns to login', async ({page}) => {
        await login(page);
        await expect(page.locator('#who')).toHaveText('admin');
        expect(await names(page)).toEqual(['[ ] ev']);
        await page.reload();
        await expect(page.locator('#manager')).toBeVisible();
        await expect(page.locator('#who')).toHaveText('admin');
        await page.getByRole('button', {name: 'Log out'}).click();
        await expect(page.locator('#login')).toBeVisible();
        await page.reload();
        await expect(page.locator('#login')).toBeVisible();
    });

    test('expired session shows login when an action is rejected', async ({page, context}) => {
        await enterEv(page);
        await context.clearCookies();
        answerNextDialog(page, 'x.txt');
        await page.getByRole('button', {name: 'New file'}).click();
        await expect(page.locator('#login')).toBeVisible();
    });
});

test.describe('browsing', () => {
    test('lists folders first then files with sizes', async ({page}) => {
        await enterEv(page);
        expect(await names(page)).toEqual(['[ ] sub', 'Entries.xlsx', 'notes.txt', 'pack.zip', 'photo.png', 'Scores.xlsx']);
        await expect(row(page, 'notes.txt').locator('td').nth(2)).toHaveText('11 B');
    });

    test('breadcrumbs navigate up and down', async ({page}) => {
        await enterEv(page);
        await openFolder(page, 'sub');
        await expect(page.locator('#rows td.name a')).toHaveText(['inner.txt']);
        await page.locator('#crumbs a', {hasText: 'ev'}).click();
        await expect(page.locator('#rows td.name a', {hasText: 'notes.txt'})).toBeVisible();
        await page.locator('#crumbs a', {hasText: 'data'}).click();
        await expect(page.locator('#rows td.name a')).toHaveText(['[ ] ev']);
    });

    test('select all toggles every checkbox', async ({page}) => {
        await enterEv(page);
        await page.locator('#select-all').check();
        expect(await page.locator('.pick:checked').count()).toBe(6);
        await page.locator('#select-all').uncheck();
        expect(await page.locator('.pick:checked').count()).toBe(0);
    });

    test('search finds files below current folder', async ({page}) => {
        await enterEv(page);
        await page.locator('#search').fill('INNER');
        await page.locator('#do-search').click();
        await expect(page.locator('#rows td.name a')).toHaveText(['ev/sub/inner.txt']);
    });

    test('search result folder navigates in instead of erroring', async ({page}) => {
        await enterEv(page);
        await page.locator('#search').fill('SUB');
        await page.locator('#do-search').click();
        await expect(page.locator('#rows td.name a')).toHaveText(['[ ] ev/sub']);
        await page.locator('#rows td.name a', {hasText: 'ev/sub'}).click();
        await expect(page.locator('#rows td.name a')).toHaveText(['inner.txt']);
        await expect(msg(page)).toBeHidden();
    });
});

test.describe('upload', () => {
    test('file chooser uploads and lists the file', async ({page}) => {
        await enterEv(page);
        await page.locator('#file-input').setInputFiles({name: 'new.txt', mimeType: 'text/plain', buffer: Buffer.from('uploaded')});
        await expect(msg(page)).toHaveText('Uploaded 1 file(s)');
        await expect(page.locator('#rows td.name a', {hasText: 'new.txt'})).toBeVisible();
        expect(fs.readFileSync(data('ev', 'new.txt'), 'utf8')).toBe('uploaded');
    });

    test('drag and drop uploads several files', async ({page}) => {
        await enterEv(page);
        await page.evaluate(() => {
            const dt = new DataTransfer();
            dt.items.add(new File(['one'], 'd1.txt'));
            dt.items.add(new File(['two'], 'd2.txt'));
            const area = document.getElementById('drop-area')!;
            area.dispatchEvent(new DragEvent('dragenter', {dataTransfer: dt, bubbles: true, cancelable: true}));
            area.dispatchEvent(new DragEvent('drop', {dataTransfer: dt, bubbles: true, cancelable: true}));
        });
        await expect(msg(page)).toHaveText('Uploaded 2 file(s)');
        expect(fs.readFileSync(data('ev', 'd2.txt'), 'utf8')).toBe('two');
    });

    test('upload overwrites same name', async ({page}) => {
        await enterEv(page);
        await page.locator('#file-input').setInputFiles({name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('replaced')});
        await expect(msg(page)).toHaveText('Uploaded 1 file(s)');
        expect(fs.readFileSync(data('ev', 'notes.txt'), 'utf8')).toBe('replaced');
    });

    test('uploaded spreadsheet is served by /api/entries', async ({page, request}) => {
        const before = await request.get('/api/entries/ev');
        expect(await before.json()).toEqual([['1', 'Original Entry']]);
        const ExcelWriter = (await import('write-excel-file/node')).default;
        const buffer = await ExcelWriter([[{value: 'Number'}, {value: 'Name'}], [{value: '2'}, {value: 'Uploaded Entry'}]]).toBuffer();
        await enterEv(page);
        await page.locator('#file-input').setInputFiles({
            name: 'Entries.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            buffer,
        });
        await expect(msg(page)).toHaveText('Uploaded 1 file(s)');
        const after = await request.get('/api/entries/ev');
        expect(await after.json()).toEqual([['2', 'Uploaded Entry']]);
    });
});

test.describe('create, rename, delete', () => {
    test('new folder and new file', async ({page}) => {
        await enterEv(page);
        answerNextDialog(page, 'fresh');
        await page.getByRole('button', {name: 'New folder'}).click();
        await expect(page.locator('#rows td.name a', {hasText: 'fresh'})).toBeVisible();
        expect(fs.statSync(data('ev', 'fresh')).isDirectory()).toBe(true);
        answerNextDialog(page, 'empty.txt');
        await page.getByRole('button', {name: 'New file'}).click();
        await expect(page.locator('#rows td.name a', {hasText: 'empty.txt'})).toBeVisible();
        expect(fs.readFileSync(data('ev', 'empty.txt'), 'utf8')).toBe('');
    });

    test('creating an existing name shows an error', async ({page}) => {
        await enterEv(page);
        answerNextDialog(page, 'notes.txt');
        await page.getByRole('button', {name: 'New file'}).click();
        await expect(msg(page)).toHaveText('Already exists');
        await expect(msg(page)).toHaveClass(/error/);
    });

    test('cancelled prompt does nothing', async ({page}) => {
        await enterEv(page);
        page.once('dialog', d => d.dismiss());
        await page.getByRole('button', {name: 'New file'}).click();
        await expect(msg(page)).toBeHidden();
    });

    test('rename moves the file, refuses to overwrite', async ({page}) => {
        await enterEv(page);
        answerNextDialog(page, 'renamed.txt');
        await row(page, 'notes.txt').getByRole('button', {name: 'Rename'}).click();
        await expect(page.locator('#rows td.name a', {hasText: 'renamed.txt'})).toBeVisible();
        expect(fs.existsSync(data('ev', 'notes.txt'))).toBe(false);
        answerNextDialog(page, 'photo.png');
        await row(page, 'renamed.txt').getByRole('button', {name: 'Rename'}).click();
        await expect(msg(page)).toHaveText('File or folder with this path already exists');
    });

    test('delete asks to confirm', async ({page}) => {
        await enterEv(page);
        page.once('dialog', d => d.dismiss());
        await row(page, 'notes.txt').getByRole('button', {name: 'Delete'}).click();
        expect(fs.existsSync(data('ev', 'notes.txt'))).toBe(true);
        answerNextDialog(page);
        await row(page, 'notes.txt').getByRole('button', {name: 'Delete'}).click();
        await expect(page.locator('#rows td.name a', {hasText: 'notes.txt'})).toHaveCount(0);
        expect(fs.existsSync(data('ev', 'notes.txt'))).toBe(false);
    });

    test('delete removes a folder recursively', async ({page}) => {
        await enterEv(page);
        answerNextDialog(page);
        await row(page, 'sub').getByRole('button', {name: 'Delete'}).click();
        await expect(page.locator('#rows td.name a', {hasText: 'sub'})).toHaveCount(0);
        expect(fs.existsSync(data('ev', 'sub'))).toBe(false);
    });
});

test.describe('bulk actions', () => {
    const pick = async (page: Page, ...files: string[]) => {
        for (const f of files) await row(page, f).locator('.pick').check();
    };

    test('with nothing selected shows an error', async ({page}) => {
        await enterEv(page);
        await page.getByRole('button', {name: 'Delete selected'}).click();
        await expect(msg(page)).toHaveText('Nothing selected');
    });

    test('delete selected', async ({page}) => {
        await enterEv(page);
        await pick(page, 'notes.txt', 'photo.png');
        answerNextDialog(page);
        await page.getByRole('button', {name: 'Delete selected'}).click();
        await expect(page.locator('#rows td.name a', {hasText: 'photo.png'})).toHaveCount(0);
        expect(fs.existsSync(data('ev', 'notes.txt'))).toBe(false);
        expect(fs.existsSync(data('ev', 'Entries.xlsx'))).toBe(true);
    });

    test('declining the delete confirmation keeps files', async ({page}) => {
        await enterEv(page);
        await pick(page, 'notes.txt');
        page.once('dialog', d => d.dismiss());
        await page.getByRole('button', {name: 'Delete selected'}).click();
        expect(fs.existsSync(data('ev', 'notes.txt'))).toBe(true);
    });

    test('copy to another folder keeps originals', async ({page}) => {
        await enterEv(page);
        await pick(page, 'notes.txt');
        answerNextDialog(page, 'ev/sub');
        await page.getByRole('button', {name: 'Copy to…'}).click();
        await expect(page.locator('#rows td.name a', {hasText: 'notes.txt'})).toBeVisible();
        expect(fs.readFileSync(data('ev', 'sub', 'notes.txt'), 'utf8')).toBe('hello notes');
    });

    test('move removes originals and cancelling prompt does nothing', async ({page}) => {
        await enterEv(page);
        await pick(page, 'notes.txt');
        page.once('dialog', d => d.dismiss());
        await page.getByRole('button', {name: 'Move to…'}).click();
        expect(fs.existsSync(data('ev', 'notes.txt'))).toBe(true);
        answerNextDialog(page, 'ev/sub');
        await page.getByRole('button', {name: 'Move to…'}).click();
        await expect(page.locator('#rows td.name a', {hasText: 'notes.txt'})).toHaveCount(0);
        expect(fs.existsSync(data('ev', 'sub', 'notes.txt'))).toBe(true);
    });

    test('moving onto an existing name shows conflict', async ({page}) => {
        fs.writeFileSync(data('ev', 'sub', 'notes.txt'), 'already here');
        await enterEv(page);
        await pick(page, 'notes.txt');
        answerNextDialog(page, 'ev/sub');
        await page.getByRole('button', {name: 'Move to…'}).click();
        await expect(msg(page)).toHaveText('File or folder with this path already exists');
        expect(fs.readFileSync(data('ev', 'sub', 'notes.txt'), 'utf8')).toBe('already here');
    });

    test('zip one item is named after it, several become archive', async ({page}) => {
        await enterEv(page);
        await pick(page, 'notes.txt');
        await page.getByRole('button', {name: 'Zip selected'}).click();
        await expect(msg(page)).toContainText('notes.txt_');
        const one = fs.readdirSync(data('ev')).find(f => /^notes\.txt_\d{6}_\d{6}\.zip$/.test(f));
        expect(one).toBeTruthy();
        await page.locator('.pick:checked').evaluateAll(els => els.forEach(e => ((e as HTMLInputElement).checked = false)));
        await pick(page, 'notes.txt', 'photo.png');
        await page.getByRole('button', {name: 'Zip selected'}).click();
        await expect(msg(page)).toContainText('archive_');
        const many = fs.readdirSync(data('ev')).find(f => /^archive_\d{6}_\d{6}\.zip$/.test(f))!;
        expect(new AdmZip(data('ev', many)).getEntries().map(e => e.entryName).sort()).toEqual(['notes.txt', 'photo.png']);
    });
});

test.describe('view, edit, download', () => {
    test('view text', async ({page}) => {
        await enterEv(page);
        await row(page, 'notes.txt').getByRole('button', {name: 'View'}).click();
        await expect(page.locator('#viewer-title')).toHaveText('ev/notes.txt');
        await expect(page.locator('#viewer-body pre')).toHaveText('hello notes');
        await expect(page.locator('#editor')).toBeHidden();
        await page.getByRole('button', {name: 'Close'}).click();
        await expect(page.locator('#viewer')).toBeHidden();
    });

    test('clicking a file name opens it', async ({page}) => {
        await enterEv(page);
        await page.locator('td.name a', {hasText: 'notes.txt'}).click();
        await expect(page.locator('#viewer-body pre')).toHaveText('hello notes');
    });

    test('view image renders an img that loads', async ({page}) => {
        await enterEv(page);
        await row(page, 'photo.png').getByRole('button', {name: 'View'}).click();
        const img = page.locator('#viewer-body img');
        await expect(img).toBeVisible();
        await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBe(1);
    });

    test('view zip lists its entries', async ({page}) => {
        await enterEv(page);
        await row(page, 'pack.zip').getByRole('button', {name: 'View'}).click();
        await expect(page.locator('#viewer-body pre')).toContainText('packed.txt');
    });

    test('view audio and video get media elements', async ({page}) => {
        fs.writeFileSync(data('ev', 'clip.mp3'), 'x');
        fs.writeFileSync(data('ev', 'clip.mp4'), 'x');
        await enterEv(page);
        await row(page, 'clip.mp3').getByRole('button', {name: 'View'}).click();
        await expect(page.locator('#viewer-body audio')).toHaveCount(1);
        await row(page, 'clip.mp4').getByRole('button', {name: 'View'}).click();
        await expect(page.locator('#viewer-body video')).toHaveCount(1);
    });

    test('view binary file suggests download', async ({page}) => {
        fs.writeFileSync(data('ev', 'blob.bin'), Buffer.from([0, 1, 2, 3]));
        await enterEv(page);
        await row(page, 'blob.bin').getByRole('button', {name: 'View'}).click();
        await expect(page.locator('#viewer-body')).toContainText('Binary file');
    });

    test('edit and save writes the file', async ({page}) => {
        await enterEv(page);
        await row(page, 'notes.txt').getByRole('button', {name: 'Edit'}).click();
        await expect(page.locator('#editor')).toHaveValue('hello notes');
        await page.locator('#editor').fill('edited in browser');
        await page.getByRole('button', {name: 'Save'}).click();
        await expect(msg(page)).toHaveText('Saved');
        expect(fs.readFileSync(data('ev', 'notes.txt'), 'utf8')).toBe('edited in browser');
    });

    test('download delivers the file bytes', async ({page}) => {
        await enterEv(page);
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            row(page, 'photo.png').getByRole('button', {name: 'Download'}).click(),
        ]);
        expect(download.suggestedFilename()).toBe('photo.png');
        const saved = await download.path();
        expect(fs.readFileSync(saved!).equals(PNG)).toBe(true);
    });

    test('backup creates a timestamped .bak copy', async ({page}) => {
        await enterEv(page);
        await row(page, 'notes.txt').getByRole('button', {name: 'Backup'}).click();
        await expect(msg(page)).toContainText('Backup ev/notes.txt-');
        const bak = fs.readdirSync(data('ev')).find(f => /^notes\.txt-\d{2}[A-Z][a-z]{2}\d{2}-\d{6}\.bak$/.test(f))!;
        expect(fs.readFileSync(data('ev', bak), 'utf8')).toBe('hello notes');
        await expect(page.locator('#rows td.name a', {hasText: bak})).toBeVisible();
    });
});

test.describe('zip files', () => {
    test('unzip here extracts next to the archive', async ({page}) => {
        await enterEv(page);
        await row(page, 'pack.zip').getByRole('button', {name: 'Unzip here'}).click();
        await expect(msg(page)).toHaveText('Archive unpacked');
        expect(fs.readFileSync(data('ev', 'packed.txt'), 'utf8')).toBe('packed content');
    });

    test('unzip to folder extracts into a folder named after the zip', async ({page}) => {
        await enterEv(page);
        await row(page, 'pack.zip').getByRole('button', {name: 'Unzip to folder'}).click();
        await expect(msg(page)).toHaveText('Archive unpacked');
        expect(fs.readFileSync(data('ev', 'pack', 'packed.txt'), 'utf8')).toBe('packed content');
        await expect(page.locator('#rows td.name a', {hasText: 'pack'}).first()).toBeVisible();
    });

    test('only zip files offer unzip', async ({page}) => {
        await enterEv(page);
        await expect(row(page, 'notes.txt').getByRole('button', {name: 'Unzip here'})).toHaveCount(0);
    });
});

test.describe('chmod', () => {
    test('shows the outcome for this platform', async ({page}) => {
        await enterEv(page);
        answerNextDialog(page, '0644');
        await row(page, 'notes.txt').getByRole('button', {name: 'Chmod'}).click();
        if (process.platform === 'win32') {
            await expect(msg(page)).toHaveText('chmod not available on Windows');
        } else {
            await expect(page.locator('#rows tr', {hasText: 'notes.txt'}).locator('td').nth(4)).toHaveText('0644');
        }
    });

    test('invalid mode is rejected on POSIX', async ({page}) => {
        test.skip(process.platform === 'win32', 'chmod unavailable on Windows');
        await enterEv(page);
        answerNextDialog(page, 'zzz');
        await row(page, 'notes.txt').getByRole('button', {name: 'Chmod'}).click();
        await expect(msg(page)).toHaveText('Invalid mode');
    });
});

test.describe('read only user', () => {
    test('can browse and view but write controls are hidden', async ({page}) => {
        await enterEv(page, 'viewer', 'look');
        await expect(page.locator('#who')).toHaveText('viewer (read only)');
        await expect(page.getByRole('button', {name: 'New folder'})).toBeHidden();
        await expect(page.getByRole('button', {name: 'Delete selected'})).toBeHidden();
        await expect(page.locator('#drop-area')).toBeHidden();
        await expect(row(page, 'notes.txt').getByRole('button', {name: 'Delete'})).toBeHidden();
        await expect(row(page, 'notes.txt').getByRole('button', {name: 'Edit'})).toBeHidden();
        await expect(row(page, 'notes.txt').getByRole('button', {name: 'View'})).toBeVisible();
        await row(page, 'notes.txt').getByRole('button', {name: 'View'}).click();
        await expect(page.locator('#viewer-body pre')).toHaveText('hello notes');
    });

    test('server refuses writes even if the UI is bypassed', async ({page}) => {
        await enterEv(page, 'viewer', 'look');
        const csrf = (await (await page.request.get('/files/api/session')).json()).csrf;
        const res = await page.request.post('/files/api/delete', {
            headers: {'x-csrf-token': csrf},
            data: {paths: ['ev/notes.txt']},
        });
        expect(res.status()).toBe(403);
        expect(fs.existsSync(data('ev', 'notes.txt'))).toBe(true);
        const save = await page.request.post('/files/api/save', {
            headers: {'x-csrf-token': csrf},
            data: {path: 'ev/notes.txt', content: 'hacked'},
        });
        expect(save.status()).toBe(403);
    });
});

test.describe('security', () => {
    test('API rejects unauthenticated access', async ({request}) => {
        expect((await request.get('/files/api/list')).status()).toBe(401);
        expect((await request.post('/files/api/delete', {data: {paths: ['ev/notes.txt']}})).status()).toBe(401);
    });

    test('traversal is blocked for an authenticated admin', async ({page}) => {
        await enterEv(page);
        expect((await page.request.get('/files/api/list?path=..')).status()).toBe(403);
        expect((await page.request.get('/files/api/download?path=../auth_users.json')).status()).toBe(403);
    });

    test('writes need the CSRF token', async ({page}) => {
        await enterEv(page);
        const res = await page.request.post('/files/api/delete', {data: {paths: ['ev/notes.txt']}});
        expect(res.status()).toBe(403);
        expect(fs.existsSync(data('ev', 'notes.txt'))).toBe(true);
    });

    test('file names render as text, not HTML', async ({page}) => {
        fs.writeFileSync(data('ev', 'x.txt'), '<img src=x onerror="window.__xss=1">');
        await enterEv(page);
        await row(page, 'x.txt').getByRole('button', {name: 'View'}).click();
        await expect(page.locator('#viewer-body pre')).toContainText('<img src=x');
        expect(await page.evaluate(() => (window as unknown as {__xss?: number}).__xss)).toBeUndefined();
    });
});

test.describe('public api untouched', () => {
    test('config, content, entries and scores', async ({request}) => {
        expect((await (await request.get('/api/config/ev')).json()).hash).toBe('ev');
        expect(await (await request.get('/api/content/ev')).json()).toEqual({title: 'content-ev'});
        expect(await (await request.get('/api/scores/ev')).json()).toEqual([['1', '10']]);
        expect((await request.get('/api/config/missing')).status()).toBe(404);
    });
});
