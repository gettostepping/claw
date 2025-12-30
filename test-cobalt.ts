import { processSoundCloudUrl } from './src/lib/cobalt.js';
import dotenv from 'dotenv';
dotenv.config();

const url = 'https://soundcloud.com/postmalone/circles';

async function test() {
    console.log('Testing Cobalt with:', url);
    const result = await processSoundCloudUrl(url);
    console.log('Result:', JSON.stringify(result, null, 2));
}

test();
