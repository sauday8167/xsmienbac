const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

(async () => {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    const result = await db.get('SELECT MAX(draw_date) as max_date, COUNT(*) as count FROM xsmb_results');
    console.log('Latest Date:', result.max_date);
    console.log('Total Records:', result.count);
    await db.close();
})();
