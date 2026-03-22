import { query } from './src/lib/db';

async function migrate() {
    try {
        console.log('Migrating ai_predictions table...');
        
        // 1. Create temporary table
        await query(`
            CREATE TABLE IF NOT EXISTS ai_predictions_new (
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
            )
        `);

        // 2. Copy data
        await query(`
            INSERT INTO ai_predictions_new (
                id, draw_date, analysis_content, predicted_pairs, confidence_score, 
                actual_result, is_correct, accuracy_notes, model_used, created_at
            )
            SELECT 
                id, draw_date, analysis_content, predicted_pairs, confidence_score, 
                actual_result, is_correct, accuracy_notes, IFNULL(model_used, 'claude-3-haiku-20240307'), created_at
            FROM ai_predictions
        `);

        // 3. Drop old table and rename new one
        await query(`DROP TABLE ai_predictions`);
        await query(`ALTER TABLE ai_predictions_new RENAME TO ai_predictions`);

        console.log('Migration successful!');
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

migrate();
