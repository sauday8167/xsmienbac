import { query } from './src/lib/db';

async function main() {
    try {
        const keys = await query('SELECT * FROM api_keys');
        console.log(JSON.stringify(keys, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
