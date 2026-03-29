const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function checkSchema() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        const schema = await db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='posts'");
        console.log('--- SCHEMA ---');
        console.log(schema ? schema.sql : 'Table not found');

        const columns = await db.all("PRAGMA table_info(posts)");
        console.log('--- COLUMNS ---');
        console.log(JSON.stringify(columns, null, 2));

        const count = await db.get("SELECT COUNT(*) as count FROM posts");
        console.log('--- COUNT ---');
        console.log(count.count);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.close();
    }
}

checkSchema();
