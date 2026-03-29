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

    const schemaPath = path.join(process.cwd(), 'database', 'schema.sqlite.sql');
    if (!fs.existsSync(schemaPath)) {
        console.error('Schema file not found at', schemaPath);
        process.exit(1);
    }
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Connected. Applying schema...');

    // Split by semicolon to run multiple statements if exec doesn't match compatible
    // But sqlite.exec usually handles multiple statements. Let's try direct exec first.
    await db.exec(schema);

    console.log('Database schema applied successfully.');
    await db.close();
}

setup().catch(console.error);
