const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function migrate() {
    const dbPath = path.join(__dirname, '../database/xsmb.sqlite');
    console.log(`Connecting to database at ${dbPath}...`);
    
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const columnsToAdd = [
        'bac_nho_cap_3_numbers',
        'bac_nho_2_ngay_numbers',
        'bac_nho_3_ngay_numbers',
        'actual_numbers',
        'source_accuracy',
        'ai_rules'
    ];

    console.log('Checking and adding missing columns to ai_source_snapshots...');

    for (const column of columnsToAdd) {
        try {
            await db.run(`ALTER TABLE ai_source_snapshots ADD COLUMN ${column} TEXT`);
            console.log(`✅ Added column: ${column}`);
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log(`ℹ️ Column ${column} already exists.`);
            } else if (e.message.includes('no such table')) {
                console.log('⚠️ Table ai_source_snapshots does not exist. Creating it now...');
                await db.run(`CREATE TABLE IF NOT EXISTS ai_source_snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    snapshot_date TEXT UNIQUE,
                    target_date TEXT,
                    bac_nho_cap_3_numbers TEXT,
                    bac_nho_2_ngay_numbers TEXT,
                    bac_nho_3_ngay_numbers TEXT,
                    actual_numbers TEXT,
                    source_accuracy TEXT,
                    ai_rules TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`);
                console.log('✅ Created table: ai_source_snapshots');
                break; // Created with all columns
            } else {
                console.error(`❌ Error adding ${column}:`, e.message);
            }
        }
    }

    await db.close();
    console.log('Migration finished.');
}

migrate().catch(console.error);
