
import { crawlLiveXSMB } from '../src/lib/realtime-crawler';
import { query, queryOne, closePool } from '../src/lib/db';

async function savePartialResult(data: any) {
    const { draw_date } = data;
    console.log(`💾 Saving data for ${draw_date}...`);

    try {
        // 1. Check if record exists
        const existing = await queryOne(
            'SELECT id FROM xsmb_results WHERE draw_date = ?',
            [draw_date]
        );

        if (!existing) {
            console.log('   New record created.');
            await query(
                `INSERT INTO xsmb_results (draw_date, created_at, updated_at) 
                 VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [draw_date]
            );
        }

        // 2. Prepare params
        const params = [
            data.special_prize,
            data.prize_1,
            data.prize_2 ? JSON.stringify(data.prize_2) : null,
            data.prize_3 ? JSON.stringify(data.prize_3) : null,
            data.prize_4 ? JSON.stringify(data.prize_4) : null,
            data.prize_5 ? JSON.stringify(data.prize_5) : null,
            data.prize_6 ? JSON.stringify(data.prize_6) : null,
            data.prize_7 ? JSON.stringify(data.prize_7) : null,
            draw_date
        ];

        // 3. Update
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

        console.log('✅ Save completed successfully.');

    } catch (error: any) {
        console.error('❌ Error saving result:', error.message);
    }
}

async function run() {
    console.log('🚀 Starting Manual Update...');
    try {
        const data = await crawlLiveXSMB();
        if (data) {
            console.log(`✅ Crawled Data for ${data.draw_date}`);
            await savePartialResult(data);
        } else {
            console.log('❌ No data found to save.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await closePool();
        process.exit();
    }
}

run();
