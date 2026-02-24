import { query } from './src/lib/db';

async function migrate() {
    console.log('🚀 Running database migrations for Gen-Next 3.5...');

    try {
        // 1. Create ai_lessons_learned table
        await query(`
            CREATE TABLE IF NOT EXISTS ai_lessons_learned (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draw_date TEXT NOT NULL,
                personality_id TEXT NOT NULL,
                analysis TEXT NOT NULL,
                tactical_adjustments TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ TABLE ai_lessons_learned created.');

        // 2. Create index on draw_date
        await query(`CREATE INDEX IF NOT EXISTS idx_ai_lessons_date ON ai_lessons_learned(draw_date)`);
        console.log('✅ INDEX idx_ai_lessons_date created.');

        // 3. Ensure ai_experience exists (just in case)
        await query(`
            CREATE TABLE IF NOT EXISTS ai_experience (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draw_date TEXT NOT NULL,
                personality_id TEXT NOT NULL,
                prediction_type TEXT NOT NULL,
                predicted_numbers TEXT NOT NULL,
                weights_used TEXT,
                accuracy_score REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ TABLE ai_experience verified.');

        console.log('✨ Migrations complete.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
