const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function inspect() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    const rows = await db.all('SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 3');
    console.log(JSON.stringify(rows, null, 2));

    await db.close();
}

inspect().catch(console.error);
