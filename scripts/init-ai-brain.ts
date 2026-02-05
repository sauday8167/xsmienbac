import { query } from '../src/lib/db';

async function initAIBrain() {
    console.log("🧠 Initializing AI Brain Database...");

    try {
        await query(`
            CREATE TABLE IF NOT EXISTS ai_experience (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draw_date TEXT NOT NULL,
                personality_id TEXT NOT NULL,
                prediction_type TEXT NOT NULL, -- 'funnel', 'v2', '3d', '4d'
                predicted_numbers TEXT NOT NULL, -- JSON array
                accuracy_score REAL DEFAULT 0, -- 0 to 1
                weights_used TEXT, -- JSON object of weights used at that time
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add index for faster feedback loops
        await query(`CREATE INDEX IF NOT EXISTS idx_ai_exp_date ON ai_experience(draw_date)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_ai_exp_personality ON ai_experience(personality_id)`);

        console.log("✅ AI Experience table ready.");
    } catch (error) {
        console.error("❌ Error initializing AI Brain:", error);
    }
}

initAIBrain();
