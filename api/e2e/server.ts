import fs from 'fs';
import path from 'path';
import {createApp} from '../src/app';
import {makeFixture} from '../src/testUtil';

// Test server: real Express app over a throwaway repo layout. Paths are written to
// e2e/.run/info.json so the tests can reset the data folder between runs.
const fx = makeFixture({loginDelayMs: 0});
const runDir = path.join(__dirname, '.run');
fs.mkdirSync(runDir, {recursive: true});
fs.copyFileSync(path.join(__dirname, '..', 'backend', 'index.html'), path.join(fx.opts.apiDir, 'backend', 'index.html'));
fs.copyFileSync(path.join(__dirname, '..', 'backend', 'script.js'), path.join(fx.opts.apiDir, 'backend', 'script.js'));
fs.copyFileSync(path.join(__dirname, '..', 'backend', 'style.css'), path.join(fx.opts.apiDir, 'backend', 'style.css'));
fs.writeFileSync(path.join(runDir, 'info.json'), JSON.stringify({
    dataRoot: fx.dataRoot,
    authUsersFile: fx.opts.authUsersFile,
}));

createApp(fx.opts).listen(Number(process.env.E2E_PORT), () => {
    console.log('e2e server ready');
});

const stop = () => {
    fx.cleanup();
    process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
