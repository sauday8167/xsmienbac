import { getDb } from '../src/lib/db';

async function initHoiDongDeTable() {
    const db = await getDb();
    console.log('Initializing hoi_dong_de_history table...');
    
    await db.exec(`
        CREATE TABLE IF NOT EXISTS hoi_dong_de_history (
            draw_date TEXT PRIMARY KEY,
            prediction_36 TEXT,
            actual_de TEXT,
            is_hit INTEGER,
            analysis_meta TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    console.log('Table initialized successfully.');
    process.exit(0);
}

initHoiDongDeTable().catch(err => {
    console.error('Failed to initialize table:', err);
    process.exit(1);
});
