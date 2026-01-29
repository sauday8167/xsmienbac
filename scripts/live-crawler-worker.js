const { crawlLiveXSMB } = require('../src/lib/realtime-crawler');
const { query, queryOne } = require('../src/lib/db');

/**
 * Get Vietnam time and check if within drawing window
 * Window: 18:10 to 18:45
 */
function getCrawlStrategy() {
    const now = new Date();
    const vnTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const hour = vnTime.getHours();
    const minute = vnTime.getMinutes();

    // Active window: 18:10 to 18:45
    if (hour === 18 && minute >= 10 && minute <= 45) {
        return {
            active: true,
            interval: 15000 + Math.random() * 10000, // 15-25 seconds
            description: 'Đang quay thưởng (Live)'
        };
    }

    // Outside drawing window
    return { active: false };
}

/**
 * Save partial result to database
 */
async function savePartialResult(data) {
    const { draw_date } = data;

    try {
        // 1. Check if record exists
        const existing = await queryOne(
            'SELECT id FROM xsmb_results WHERE draw_date = ?',
            [draw_date]
        );

        if (!existing) {
            // Create empty record
            await query(
                `INSERT INTO xsmb_results (draw_date, created_at, updated_at) 
                 VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [draw_date]
            );
        }

        // 2. Prepare params (only update non-null values)
        const params = [
            // Special prize: only if 5 digits
            data.special_prize && /^\d{5}$/.test(data.special_prize) ? data.special_prize : null,

            // Prize 1
            data.prize_1,

            // Prize 2-7 (arrays)
            data.prize_2 ? JSON.stringify(data.prize_2) : null,
            data.prize_3 ? JSON.stringify(data.prize_3) : null,
            data.prize_4 ? JSON.stringify(data.prize_4) : null,
            data.prize_5 ? JSON.stringify(data.prize_5) : null,
            data.prize_6 ? JSON.stringify(data.prize_6) : null,
            data.prize_7 ? JSON.stringify(data.prize_7) : null,

            draw_date
        ];

        // 3. Update using COALESCE (preserves old values if new is NULL)
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

    } catch (error) {
        console.error('❌ Error saving partial result:', error.message);
    }
}

/**
 * Main worker loop
 */
async function runWorker() {
    console.log('🚀 XSMB Live Crawler Worker Started');
    console.log('📅 Window: 18:10 - 18:45 daily');
    console.log('---------------------------------------------------\n');

    while (true) {
        const strategy = getCrawlStrategy();

        if (!strategy.active) {
            const now = new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
            process.stdout.write(`\r[${now}] ⏸️  Ngoài giờ quay thưởng (chờ 18:10)...`);
            await sleep(60000); // Check every 1 minute
            continue;
        }

        const now = new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        console.log(`\n[${now}] 🔄 ${strategy.description}`);

        try {
            const data = await crawlLiveXSMB();

            if (data) {
                console.log(`   ✅ Nguồn: ${data.source}`);
                console.log(`   📊 GĐB: ${data.special_prize || '...'}`);

                await savePartialResult(data);
                console.log(`   💾 Đã cập nhật database`);
            } else {
                console.log(`   ⚠️  Chưa có dữ liệu mới`);
            }
        } catch (error) {
            console.error(`   ❌ Lỗi: ${error.message}`);
        }

        const nextPoll = (strategy.interval / 1000).toFixed(1);
        console.log(`   ⏳ Poll tiếp theo sau ${nextPoll}s...`);
        await sleep(strategy.interval);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start worker
runWorker().catch(err => {
    console.error('💥 Worker Crash:', err);
    process.exit(1);
});
