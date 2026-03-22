import { query } from '../src/lib/db';

async function migrate() {
    console.log('🔄 Starting Database Migration...');

    try {
        // Create api_keys table
        console.log('🛠️ Checking/Creating api_keys table...');
        await query(`
            CREATE TABLE IF NOT EXISTS api_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                \`key\` TEXT NOT NULL UNIQUE,
                status TEXT DEFAULT 'active',
                usage_count INTEGER DEFAULT 0,
                error_count INTEGER DEFAULT 0,
                last_used DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ api_keys table ready.');

        // Create xsmb_results table (if missing)
        console.log('🛠️ Checking/Creating xsmb_results table...');
        await query(`
            CREATE TABLE IF NOT EXISTS xsmb_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draw_date TEXT NOT NULL UNIQUE,
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
            )
        `);
        console.log('✅ xsmb_results table ready.');

        // Create ai_predictions table (Missing on VPS)
        console.log('🛠️ Checking/Creating ai_predictions table...');
        await query(`
            CREATE TABLE IF NOT EXISTS ai_predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draw_date TEXT NOT NULL UNIQUE,
                predicted_pairs TEXT, -- JSON array
                actual_result TEXT,   -- Comma separated or JSON
                is_correct INTEGER DEFAULT 0,
                confidence_score REAL DEFAULT 0,
                accuracy_notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ ai_predictions table ready.');

        console.log('✅ ai_predictions table ready.');

        // Create posts table
        console.log('🛠️ Checking/Creating posts table...');
        await query(`
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                content TEXT NOT NULL,
                excerpt TEXT,
                thumbnail TEXT,
                category TEXT DEFAULT 'news',
                meta_title TEXT,
                meta_description TEXT,
                status TEXT DEFAULT 'draft',
                views INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                published_at DATETIME
            )
        `);
        console.log('✅ posts table ready.');

        // Create admins table and default admin
        console.log('🛠️ Checking/Creating admins table...');
        await query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                full_name TEXT,
                email TEXT,
                avatar TEXT,
                role TEXT DEFAULT 'editor',
                is_active BOOLEAN DEFAULT 1,
                last_login DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Insert default admin if not exists
        await query(`
            INSERT OR IGNORE INTO admins (username, password_hash, full_name, email, role) 
            VALUES ('admin', '$2a$10$chTUgSiuCMS/pFb3CbWeUOUhFVmJsPst79yurspsDCCBzaXuXgUuq', 'Administrator', 'admin@xsmb.local', 'super_admin')
        `);
        console.log('✅ admins table ready.');

        // Create statistics_cache table
        console.log('🛠️ Checking/Creating statistics_cache table...');
        await query(`
            CREATE TABLE IF NOT EXISTS statistics_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stat_type TEXT NOT NULL,
                stat_key TEXT NOT NULL,
                stat_value TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(stat_type, stat_key)
            )
        `);
        console.log('✅ statistics_cache table ready.');

        // Create bac_nho_history table
        console.log('🛠️ Checking/Creating bac_nho_history table...');
        await query(`
            CREATE TABLE IF NOT EXISTS bac_nho_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draw_date TEXT NOT NULL UNIQUE,
                predicted_numbers TEXT NOT NULL,
                score_breakdown TEXT,
                hit_numbers TEXT,
                hit_count INTEGER DEFAULT 0,
                is_verified INTEGER DEFAULT 0,
                ai_rules TEXT,
                analysis_content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ bac_nho_history table ready.');

        // Create ai_source_snapshots table (AI Learning Engine v2 - Updated for new sources)
        console.log('🛠️ Updating ai_source_snapshots table (Drop and Recreate)...');
        await query(`DROP TABLE IF EXISTS ai_source_snapshots`);
        await query(`
            CREATE TABLE IF NOT EXISTS ai_source_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                snapshot_date TEXT NOT NULL UNIQUE,
                target_date TEXT NOT NULL,
                bac_nho_cap_3_numbers TEXT,
                bac_nho_2_ngay_numbers TEXT,
                bac_nho_3_ngay_numbers TEXT,
                actual_numbers TEXT,
                source_accuracy TEXT,
                ai_rules TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ ai_source_snapshots table ready.');

    } catch (error) {
        console.error('❌ Migration Failed:', error);
        process.exit(1);
    }

    console.log('✨ Full Database Migration Completed Successfully!');
}

migrate();
