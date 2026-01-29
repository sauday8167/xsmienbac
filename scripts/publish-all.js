const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function publishDrafts() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        console.log('Publishing existing drafts...');
        const result = await db.run("UPDATE posts SET status = 'published', published_at = datetime('now') WHERE status = 'draft'");
        console.log(`Updated ${result.changes} posts.`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.close();
    }
}

publishDrafts();
