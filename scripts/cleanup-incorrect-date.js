const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function cleanup() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    const result = await db.run("DELETE FROM xsmb_results WHERE draw_date = '2026-01-18'");
    console.log('Deleted records for 2026-01-18:', result.changes);

    await db.close();
}

cleanup();
