const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

async function applySchema() {
    const dbPath = path.join(process.cwd(), 'database', 'xsmb.sqlite');
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sqlite.sql');

    console.log(`Checking database at: ${dbPath}`);
    console.log(`Reading schema from: ${schemaPath}`);

    const schema = fs.readFileSync(schemaPath, 'utf8');
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    try {
        console.log('Applying schema...');
        // Split by semicolon and filter empty parts
        const statements = schema.split(';').filter(s => s.trim().length > 0);

        for (const statement of statements) {
            await db.run(statement);
        }

        console.log('Schema applied successfully.');

        // Verify posts table
        const table = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='posts'");
        if (table) {
            console.log('Verification: posts table created successfully.');
        } else {
            console.log('Verification: posts table still missing!');
        }
    } catch (error) {
        console.error('Error applying schema:', error);
    } finally {
        await db.close();
    }
}

applySchema();
