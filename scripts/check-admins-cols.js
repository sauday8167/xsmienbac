const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function check() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    const info = await db.all("PRAGMA table_info(admins)");
    const columnNames = info.map(c => c.name);
    console.log('Columns in admins:', columnNames.join(', '));

    if (!columnNames.includes('avatar')) {
        console.log('AVATAR COLUMN IS MISSING!');
    }

    await db.close();
}

check();
