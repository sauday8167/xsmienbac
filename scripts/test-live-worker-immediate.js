
// Use ts-node to handle TS imports if running with node directly might fail
require('ts-node/register');
const { crawlLiveXSMB } = require('../src/lib/realtime-crawler');
// Mock DB queries for test safety, or use real DB if verified?
// User said "save into table", so we should probably use real DB but maybe log it well.
// Actually, let's use the real DB logic to be sure it works.
const { query, queryOne } = require('../src/lib/db');

async function savePartialResult(data) {
    console.log('💾 Saving result to DB:', JSON.stringify(data, null, 2));
    const { draw_date } = data;

    try {
        const existing = await queryOne(
            'SELECT id FROM xsmb_results WHERE draw_date = ?',
            [draw_date]
        );

        if (!existing) {
            console.log('   Creating new record for', draw_date);
            await query(
                `INSERT INTO xsmb_results (draw_date, created_at, updated_at) 
                 VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [draw_date]
            );
        } else {
            console.log('   Record exists for', draw_date);
        }

        const params = [
            data.special_prize && /^\d{5}$/.test(data.special_prize) ? data.special_prize : null,
            data.prize_1,
            data.prize_2 ? JSON.stringify(data.prize_2) : null,
            data.prize_3 ? JSON.stringify(data.prize_3) : null,
            data.prize_4 ? JSON.stringify(data.prize_4) : null,
            data.prize_5 ? JSON.stringify(data.prize_5) : null,
            data.prize_6 ? JSON.stringify(data.prize_6) : null,
            data.prize_7 ? JSON.stringify(data.prize_7) : null,
            draw_date
        ];

        console.log('   Updating values...');
        await query(`
            UPDATE xsmb_results SET
                special_prize = COALESCE(?, special_prize),
                prize_1 = COALESCE(?, prize_1),
                prize_2 = COALESCE(?, prize_2),
                prize_3 = COALESCE(?, prize_3),
                prize_4 = COALESCE(?, prize_4),
                prize_5 = COALESCE(?, prize_5),
                prize_6 = COALESCE(?, prize_6),
                prize_7 = COALESCE(?, prize_7),
                updated_at = CURRENT_TIMESTAMP
            WHERE draw_date = ?
        `, params);
        console.log('✅ DB Update Success');

    } catch (error) {
        console.error('❌ Error saving:', error.message);
    }
}

async function run() {
    console.log('🚀 Running Immediate Test Worker...');
    try {
        const data = await crawlLiveXSMB();
        if (data) {
            console.log('✅ Crawler returned data source:', data.source);
            await savePartialResult(data);
        } else {
            console.log('❌ Crawler returned null');
        }
    } catch (e) {
        console.error('❌ Test failed:', e);
    }
    process.exit(0);
}

run();
