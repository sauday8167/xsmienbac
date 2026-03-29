import { query } from './src/lib/db';

async function main() {
    try {
        const posts = await query('SELECT title, slug, published_at FROM posts ORDER BY id DESC LIMIT 1');
        console.log(JSON.stringify(posts, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
