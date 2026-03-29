const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function setupAITables() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        console.log('Setting up AI tables...');

        // 1. API Keys Table
        await db.run(`
            CREATE TABLE IF NOT EXISTS api_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                provider TEXT DEFAULT 'google',
                status TEXT DEFAULT 'active', -- active, rate_limited, quota_exceeded, disabled
                usage_count INTEGER DEFAULT 0,
                last_used DATETIME,
                error_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('- Table api_keys created/checked.');

        // 2. AI Predictions Table
        // Stores the daily analysis report and the raw predicted numbers
        await db.run(`
            CREATE TABLE IF NOT EXISTS ai_predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draw_date DATE UNIQUE NOT NULL, -- Date for which the prediction is made (tomorrow)
                analysis_content TEXT, -- Full markdown report
                predicted_pairs TEXT, -- JSON array of predicted pairs e.g. ["12", "34"]
                confidence_score INTEGER,
                model_used TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                -- Verification (filled next day)
                actual_result TEXT, -- JSON of actual loto numbers
                is_correct BOOLEAN DEFAULT 0,
                accuracy_notes TEXT
            )
        `);
        console.log('- Table ai_predictions created/checked.');

        console.log('AI Database setup complete.');

    } catch (e) {
        console.error('Setup failed:', e);
    } finally {
        await db.close();
    }
}

setupAITables();
