const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function migrate() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        await db.run("ALTER TABLE admins ADD COLUMN avatar TEXT");
        console.log('Successfully added avatar column to admins table');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('Column avatar already exists');
        } else {
            console.error('Error adding avatar column:', e.message);
        }
    }

    await db.close();
}

migrate();
