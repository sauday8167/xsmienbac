const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function setup() {
    const dbDir = path.join(process.cwd(), 'database');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir);
    }

    const dbPath = path.join(dbDir, 'xsmb.sqlite');
    console.log(`Setting up SQLite database at ${dbPath}`);

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    console.log('Connected. Creating table if not exists...');

    // Matches mysql xsmb_results structure roughly
    await db.exec(`
        CREATE TABLE IF NOT EXISTS xsmb_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            draw_date DATE UNIQUE NOT NULL,
            special_prize TEXT,
            prize_1 TEXT,
            prize_2 TEXT, 
            prize_3 TEXT,
            prize_4 TEXT,
            prize_5 TEXT,
            prize_6 TEXT,
            prize_7 TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Add index
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_draw_date ON xsmb_results(draw_date)`);

    console.log('Table xsmb_results ready.');
    await db.close();
}

setup().catch(console.error);
