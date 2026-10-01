import {createApp} from './src/app';

const port: string | number = process.env.PORT || 4201;

createApp().listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
