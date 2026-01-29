const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function check() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    const rows = await db.all('SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 5');
    console.log('Recent 5 results:', JSON.stringify(rows, null, 2));

    const count = await db.get('SELECT COUNT(*) as count FROM xsmb_results');
    console.log('Total count:', count.count);

    await db.close();
}

check();
