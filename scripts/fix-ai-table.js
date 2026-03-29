const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

async function migrate() {
    const dbPath = path.join(__dirname, '../database/xsmb.sqlite');
    console.log(`Connecting to database at ${dbPath}...`);
    
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    console.log('--- Database Migration: AI Predictions Table ---');

    // 1. Check if model_used exists
    const tableInfo = await db.all("PRAGMA table_info(ai_predictions)");
    const hasModelUsed = tableInfo.some(col => col.name === 'model_used');

    if (!hasModelUsed) {
        console.log('Adding model_used column...');
        await db.run("ALTER TABLE ai_predictions ADD COLUMN model_used TEXT");
    }

    // 2. Check current unique constraint
    const indexInfo = await db.all("PRAGMA index_list(ai_predictions)");
    console.log('Current indexes:', indexInfo);

    // 3. Recreate table with proper unique constraint to avoid overwriting
    // SQLite doesn't support ALTER TABLE DROP UNIQUE, so we use the temp table approach.
    
    console.log('Upgrading table schema to support multiple models per day...');
    
    // Create new table
    await db.run(`CREATE TABLE ai_predictions_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        draw_date TEXT NOT NULL,
        analysis_content TEXT,
        predicted_pairs TEXT,
        confidence_score INTEGER,
        actual_result TEXT,
        is_correct INTEGER,
        accuracy_notes TEXT,
        model_used TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(draw_date, model_used)
    )`);

    // Copy data
    // If model_used was null, set it to the default 'claude-3-haiku-3-so' for old entries
    await db.run(`INSERT INTO ai_predictions_new (
        id, draw_date, analysis_content, predicted_pairs, confidence_score, 
        actual_result, is_correct, accuracy_notes, model_used, created_at
    ) SELECT 
        id, draw_date, analysis_content, predicted_pairs, confidence_score, 
        actual_result, is_correct, accuracy_notes, COALESCE(model_used, 'claude-3-haiku-3-so'), created_at
    FROM ai_predictions`);

    // Swap tables
    await db.run("DROP TABLE ai_predictions");
    await db.run("ALTER TABLE ai_predictions_new RENAME TO ai_predictions");

    // Re-create index if any were needed (the UNIQUE constraint already creates an index)

    console.log('✅ Migration successful! Now you can have both Hoi Dong and AI 3-so on the same day.');

    await db.close();
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
});
