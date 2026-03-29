const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function checkPosts() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        const posts = await db.all("SELECT id, title FROM posts");
        console.log('--- CURRENT POSTS ---');
        console.table(posts);

        const mediaCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='media'");
        console.log('Media table exists:', !!mediaCheck);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.close();
    }
}

checkPosts();
