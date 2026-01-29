const { crawlLiveXSMB } = require('../src/lib/realtime-crawler');
const { query } = require('../src/lib/db');

async function run() {
    console.log('🕷️ Running Manual Realtime Crawl...');
    try {
        const result = await crawlLiveXSMB();
        if (result) {
            console.log('✅ Result Found:', JSON.stringify(result, null, 2));

            // Upsert into DB
            const { draw_date } = result;
            // Ensure date is valid (YYYY-MM-DD)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(draw_date)) {
                console.error('❌ Invalid date format:', draw_date);
                return;
            }

            console.log(`💾 Saving result for date: ${draw_date}`);

            // Check if exists
            const existing = await query('SELECT id FROM xsmb_results WHERE draw_date = ?', [draw_date]);

            if (!existing || existing.length === 0) {
                await query('INSERT INTO xsmb_results (draw_date, created_at) VALUES (?, CURRENT_TIMESTAMP)', [draw_date]);
            }

            // Update fields
            const params = [
                result.special_prize,
                result.prize_1,
                result.prize_2 ? JSON.stringify(result.prize_2) : null,
                result.prize_3 ? JSON.stringify(result.prize_3) : null,
                result.prize_4 ? JSON.stringify(result.prize_4) : null,
                result.prize_5 ? JSON.stringify(result.prize_5) : null,
                result.prize_6 ? JSON.stringify(result.prize_6) : null,
                result.prize_7 ? JSON.stringify(result.prize_7) : null,
                draw_date
            ];

            await query(`
                UPDATE xsmb_results SET
                    special_prize = ?, prize_1 = ?, prize_2 = ?, prize_3 = ?, 
                    prize_4 = ?, prize_5 = ?, prize_6 = ?, prize_7 = ?, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE draw_date = ?
            `, params);

            console.log('✨ Database Updated Successfully!');
        } else {
            console.log('⚠️ No result returned from crawler.');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

run();
