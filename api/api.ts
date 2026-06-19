import express, {Express, Request, Response} from 'express';
import cors from 'cors';
import compression from 'compression';
import {Config} from "../common/models/config.model";
import readXlsxFile from "read-excel-file/node";

const app: Express = express();
const port: string | number = process.env.PORT || 4201;

const getConfig = async (hash: string, subPath = '') => {
    return await import('../config' + subPath + '/' + hash + '.json');
};

const handleHash = async (res: Response, hash: string) => {
    let config: Config | null = null;
    if (hash) {
        try {
            config = await getConfig(hash);
        } catch (e) {
            res.statusCode = 404;
            res.send("Not Found");
            return null;
        }
    } else {
        res.statusCode = 404;
        res.send("Missing HASH");
        return null;
    }

    return config;
};

app.use((req, res, next) => {
    console.log(req.method + ' ' + req.url);
    next();
});

app.use(cors());
app.use(compression());
app.use(express.static('public'));
app.use(express.static('backend'));

app.get('/', (req: Request, res: Response) => {
    res.send('IMLEC MS Api');
});

app.get('/api/config{/:hash}', async (req: Request, res: Response) => {
    const hash = req.params.hash;
    let config: Config | null = await handleHash(res, hash);
    res.setHeader('Content-Type', 'application/json');
    res.json(config);
});

app.get('/api/content{/:hash}', async (req: Request, res: Response) => {
    const hash = req.params.hash;
    let config: Config | null = await handleHash(res, hash);
    res.setHeader('Content-Type', 'application/json');
    res.send(config);
});

app.get('/api/entries{/:hash}', async (req: Request, res: Response) => {
    const hash = req.params.hash;
    let config: Config | null = await handleHash(res, hash);

    let file = await readXlsxFile('../data/' + hash + '/' + config?.data?.entries);
    file = file.slice(1);
    res.send(file);
});

app.get('/api/scores{/:hash}', async (req: Request, res: Response) => {
    const hash = req.params.hash;
    let config: Config | null = await handleHash(res, hash);

    let file = await readXlsxFile('../data/' + hash + '/' + config?.data?.scores);
    file = file.slice(1);
    res.send(file);
});

app.get('/api/save{/:hash}', async (req: Request, res: Response) => {
    const hash = req.params.hash;
    let config: Config | null = await handleHash(res, hash);

    res.send('OK');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

