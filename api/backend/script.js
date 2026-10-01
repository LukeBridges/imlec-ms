(function () {
    'use strict';

    const API = '/files/api';
    const $ = (id) => document.getElementById(id);
    const state = {path: '', csrf: null, readonly: false, viewing: null};

    const show = (el, on) => { el.hidden = !on; };
    const message = (text, error) => {
        const el = $('msg');
        el.textContent = text || '';
        el.className = error ? 'error' : '';
        show(el, !!text);
    };

    const call = async (route, options = {}) => {
        const headers = Object.assign({}, options.headers || {});
        if (state.csrf) headers['x-csrf-token'] = state.csrf;
        let body = options.body;
        if (body && !(body instanceof FormData)) {
            headers['content-type'] = 'application/json';
            body = JSON.stringify(body);
        }
        const res = await fetch(API + route, {method: options.method || 'GET', headers, body, credentials: 'same-origin'});
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            if (res.status === 401 && route !== '/login') showLogin();
            throw new Error(data.error || res.statusText);
        }
        return data;
    };

    const post = (route, body) => call(route, {method: 'POST', body});
    const join = (dir, name) => (dir ? dir + '/' + name : name);
    const q = (p) => '?path=' + encodeURIComponent(p);

    const showLogin = () => {
        state.csrf = null;
        show($('login'), true);
        show($('manager'), false);
        show($('session'), false);
    };

    const applySession = (s) => {
        state.csrf = s.csrf;
        state.readonly = s.readonly;
        $('who').textContent = s.user + (s.readonly ? ' (read only)' : '');
        show($('session'), true);
        show($('login'), false);
        show($('manager'), true);
        document.body.classList.toggle('readonly', s.readonly);
    };

    const guard = (fn) => async (...args) => {
        try {
            message('');
            await fn(...args);
        } catch (e) {
            message(e.message, true);
        }
    };

    const fmtSize = (n) => (n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB');

    const button = (label, onClick, write) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        if (write) b.className = 'write';
        b.addEventListener('click', guard(onClick));
        return b;
    };

    const renderCrumbs = (path) => {
        const nav = $('crumbs');
        nav.textContent = '';
        const add = (label, target) => {
            const a = document.createElement('a');
            a.textContent = label;
            a.addEventListener('click', guard(() => load(target)));
            nav.appendChild(a);
        };
        add('data', '');
        let acc = '';
        path.split('/').filter(Boolean).forEach((part) => {
            nav.appendChild(document.createTextNode(' / '));
            acc = join(acc, part);
            add(part, acc);
        });
    };

    const selected = () => Array.from(document.querySelectorAll('.pick:checked')).map((c) => join(state.path, c.value));

    const renderRows = (entries, fullPaths) => {
        const tbody = $('rows');
        tbody.textContent = '';
        $('select-all').checked = false;
        entries.forEach((e) => {
            const full = fullPaths ? e.path : join(state.path, e.name);
            const tr = document.createElement('tr');

            const pick = document.createElement('td');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'pick';
            cb.value = fullPaths ? e.path.slice(state.path ? state.path.length + 1 : 0) : e.name;
            pick.appendChild(cb);

            const name = document.createElement('td');
            name.className = 'name';
            const a = document.createElement('a');
            a.textContent = (e.type === 'dir' ? '[ ] ' : '') + (fullPaths ? e.path : e.name);
            a.addEventListener('click', guard(() => (e.type === 'dir' ? load(full) : openFile(full))));
            name.appendChild(a);

            const size = document.createElement('td');
            size.textContent = e.type === 'dir' ? '' : fmtSize(e.size);
            const mod = document.createElement('td');
            mod.textContent = e.modified ? new Date(e.modified).toLocaleString() : '';
            const perms = document.createElement('td');
            perms.textContent = e.perms || '';

            const actions = document.createElement('td');
            actions.className = 'actions';
            if (e.type === 'file') {
                actions.appendChild(button('Download', () => { window.location = API + '/download' + q(full); }));
                actions.appendChild(button('View', () => openFile(full)));
                actions.appendChild(button('Edit', () => openFile(full, true), true));
                actions.appendChild(button('Backup', async () => { const r = await post('/backup', {path: full}); message('Backup ' + r.path + ' created'); await load(state.path); }, true));
                if (/[.]zip$/i.test(e.name)) {
                    actions.appendChild(button('Unzip here', async () => { await post('/unzip', {path: full}); message('Archive unpacked'); await load(state.path); }, true));
                    actions.appendChild(button('Unzip to folder', async () => { await post('/unzip', {path: full, toFolder: true}); message('Archive unpacked'); await load(state.path); }, true));
                }
            }
            actions.appendChild(button('Rename', async () => {
                const to = prompt('New name', e.name);
                if (!to || to === e.name) return;
                await post('/rename', {path: full, to});
                await load(state.path);
            }, true));
            actions.appendChild(button('Delete', async () => {
                if (!confirm('Delete ' + e.name + '?')) return;
                await post('/delete', {paths: [full]});
                await load(state.path);
            }, true));
            if (e.perms) {
                actions.appendChild(button('Chmod', async () => {
                    const mode = prompt('Octal mode', e.perms);
                    if (!mode) return;
                    await post('/chmod', {path: full, mode});
                    await load(state.path);
                }, true));
            }

            [pick, name, size, mod, perms, actions].forEach((td) => tr.appendChild(td));
            tbody.appendChild(tr);
        });
    };

    const load = async (path) => {
        const data = await call('/list' + q(path));
        state.path = data.path;
        renderCrumbs(data.path);
        renderRows(data.entries, false);
        closeViewer();
    };

    const closeViewer = () => {
        state.viewing = null;
        show($('viewer'), false);
    };

    const openFile = async (full, edit) => {
        const v = await call('/view' + q(full));
        const body = $('viewer-body');
        body.textContent = '';
        $('viewer-title').textContent = full;
        const editor = $('editor');
        show(editor, false);
        show($('save'), false);
        state.viewing = full;
        const url = API + '/raw' + q(full);
        if (v.type === 'image') {
            const img = document.createElement('img');
            img.src = url;
            img.alt = v.name;
            body.appendChild(img);
        } else if (v.type === 'audio' || v.type === 'video') {
            const m = document.createElement(v.type);
            m.controls = true;
            m.src = url;
            body.appendChild(m);
        } else if (v.type === 'zip') {
            const pre = document.createElement('pre');
            pre.textContent = v.zipEntries.map((z) => z.name + '  ' + fmtSize(z.size)).join('\n');
            body.appendChild(pre);
        } else if (v.type === 'text') {
            if (edit && !state.readonly) {
                editor.value = v.content;
                show(editor, true);
                show($('save'), true);
            } else {
                const pre = document.createElement('pre');
                pre.textContent = v.content;
                body.appendChild(pre);
            }
        } else {
            body.textContent = 'Binary file, ' + fmtSize(v.size) + '. Use Download.';
        }
        show($('viewer'), true);
    };

    const upload = async (files) => {
        if (!files.length) return;
        const form = new FormData();
        form.append('dir', state.path);
        Array.from(files).forEach((f) => form.append('upload', f, f.name));
        const r = await call('/upload', {method: 'POST', body: form});
        message('Uploaded ' + r.uploaded.length + ' file(s)');
        await load(state.path);
    };

    const bulk = async (kind) => {
        const paths = selected();
        if (!paths.length) throw new Error('Nothing selected');
        if (kind === 'delete') {
            if (!confirm('Delete ' + paths.length + ' item(s)?')) return;
            await post('/delete', {paths});
        } else if (kind === 'zip') {
            const names = paths.map((p) => p.split('/').pop());
            const r = await post('/zip', {dir: state.path, names});
            message('Archive ' + r.path + ' created');
        } else {
            const dest = prompt('Destination folder (relative to data/)', state.path);
            if (dest === null) return;
            await post('/' + kind, {paths, dest});
        }
        await load(state.path);
    };

    const init = () => {
        $('login').addEventListener('submit', guard(async (ev) => {
            ev.preventDefault();
            const f = new FormData(ev.target);
            const s = await post('/login', {username: f.get('username'), password: f.get('password')});
            ev.target.reset();
            applySession(s);
            await load('');
        }));
        $('logout').addEventListener('click', guard(async () => { await post('/logout', {}); showLogin(); }));
        $('new-folder').addEventListener('click', guard(async () => {
            const name = prompt('Folder name');
            if (!name) return;
            await post('/mkdir', {dir: state.path, name});
            await load(state.path);
        }));
        $('new-file').addEventListener('click', guard(async () => {
            const name = prompt('File name');
            if (!name) return;
            await post('/new', {dir: state.path, name});
            await load(state.path);
        }));
        $('do-search').addEventListener('click', guard(async () => {
            const r = await call('/search?path=' + encodeURIComponent(state.path) + '&q=' + encodeURIComponent($('search').value));
            const entries = r.results.map((p) => ({name: p, path: p, type: 'file', size: 0}));
            renderRows(entries, true);
        }));
        document.querySelectorAll('[data-bulk]').forEach((b) => b.addEventListener('click', guard(() => bulk(b.dataset.bulk))));
        $('select-all').addEventListener('change', (ev) => {
            document.querySelectorAll('.pick').forEach((c) => { c.checked = ev.target.checked; });
        });
        $('file-input').addEventListener('change', guard((ev) => upload(ev.target.files)));
        const drop = $('drop-area');
        ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (ev) => { ev.preventDefault(); drop.classList.add('over'); }));
        ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (ev) => { ev.preventDefault(); drop.classList.remove('over'); }));
        drop.addEventListener('drop', guard((ev) => upload(ev.dataTransfer.files)));
        $('save').addEventListener('click', guard(async () => {
            await post('/save', {path: state.viewing, content: $('editor').value});
            message('Saved');
        }));
        $('close-viewer').addEventListener('click', closeViewer);

        call('/session').then(async (s) => {
            if (s.loggedIn) {
                applySession(s);
                await load('');
            } else {
                showLogin();
            }
        }).catch((e) => message(e.message, true));
    };

    init();
})();
