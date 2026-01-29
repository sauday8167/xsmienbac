const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function listSlugs() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        const posts = await db.all('SELECT id, title, slug, status FROM posts');
        console.log('Found posts:', posts.length);
        posts.forEach(p => {
            console.log(`- [${p.id}] ${p.title} (${p.slug}) [${p.status}]`);
        });
    } catch (e) {
        console.error('Error listing slugs:', e);
    } finally {
        await db.close();
    }
}

listSlugs();
