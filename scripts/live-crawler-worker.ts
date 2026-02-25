// Live Crawler Worker
// This worker runs continuously and crawls lottery results during drawing hours

import { crawlLiveXSMB } from '../src/lib/realtime-crawler';
import { query, queryOne } from '../src/lib/db';

/**
 * Get Vietnam time and check if within drawing window
 */
function getCrawlStrategy() {
    const now = new Date();
    const vnTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const hour = vnTime.getHours();
    const minute = vnTime.getMinutes();

    // Phase 1: Prizes 1-7 (18:15 - 18:26)
    if (hour === 18 && minute >= 15 && minute <= 26) {
        return {
            active: true,
            interval: 3000 + Math.random() * 2000, // 3-5 seconds
            phase: 'PRIZES_1_TO_7',
            description: 'Đang quay Giải 1 → Giải 7'
        };
    }

    // Phase 2: Waiting for Special Prize (18:27 - 18:29)
    if (hour === 18 && minute >= 27 && minute <= 29) {
        return {
            active: true,
            interval: 30000, // 30 seconds (save resources)
            phase: 'WAITING_FOR_SPECIAL',
            description: 'Chờ Giải Đặc Biệt'
        };
    }

    // Phase 3: Special Prize (18:30 - 18:32)
    if (hour === 18 && minute >= 30 && minute <= 32) {
        return {
            active: true,
            interval: 5000, // 5 seconds (very high frequency)
            phase: 'SPECIAL_PRIZE',
            description: 'Đang quay Giải Đặc Biệt'
        };
    }

    // Phase 4: Final check (18:33 - 18:35)
    if (hour === 18 && minute >= 33 && minute <= 35) {
        return {
            active: true,
            interval: 15000,
            phase: 'FINAL_CHECK',
            description: 'Kiểm tra cuối cùng'
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

        // 2. Prepare params (only update non-null values and valid number formats)
        const checkDigits = (val: string | null | string[], count: number) => {
            if (!val) return null;
            if (Array.isArray(val)) {
                // For arrays, only keep if all items are digits and match expected length (if provided)
                const isValid = val.every(item => /^\d+$/.test(item.trim()));
                return isValid ? JSON.stringify(val) : null;
            }
            // For single strings, must be digits only
            return /^\d+$/.test(val.trim()) ? val : null;
        };

        const params = [
            // Special prize: 5 digits
            checkDigits(data.special_prize, 5),

            // Prize 1: 5 digits
            checkDigits(data.prize_1, 5),

            // Prize 2-7
            checkDigits(data.prize_2, 5),
            checkDigits(data.prize_3, 5),
            checkDigits(data.prize_4, 5),
            checkDigits(data.prize_5, 4),
            checkDigits(data.prize_6, 3),
            checkDigits(data.prize_7, 2),

            draw_date
        ];

        // 3. Update using COALESCE (preserves old values if new is NULL/Invalid)
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
    console.log('📅 Timeline:');
    console.log('   18:15-18:26: Giải 1 → Giải 7 (10-15s interval)');
    console.log('   18:27-18:29: Chờ (30s interval)');
    console.log('   18:30-18:32: Giải Đặc Biệt (5s interval)');
    console.log('---------------------------------------------------\n');

    while (true) {
        const strategy = getCrawlStrategy();

        if (!strategy.active) {
            const now = new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
            process.stdout.write(`\r[${now}] ⏸️  Ngoài giờ quay thưởng, chờ...`);
            await sleep(60000); // Check every 1 minute
            continue;
        }

        const now = new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        console.log(`\n[${now}] 🔄 [${strategy.phase}] ${strategy.description}`);

        try {
            const data = await crawlLiveXSMB();

            if (data) {
                console.log(`   ✅ Nguồn: ${data.source}`);
                console.log(`   📊 GĐB: ${data.special_prize || '...'}`);
                console.log(`   📊 G1: ${data.prize_1 || '...'}`);
                console.log(`   📊 G2: ${data.prize_2 ? data.prize_2.join(', ') : '...'}`);
                console.log(`   📊 G3: ${data.prize_3 ? data.prize_3.join(', ') : '...'}`);

                await savePartialResult(data);
                console.log(`   💾 Đã lưu vào database`);
            } else {
                console.log(`   ⚠️  Chưa có dữ liệu hợp lệ từ tất cả nguồn`);
            }
        } catch (error) {
            console.error(`   ❌ Lỗi: ${error.message}`);
        }

        const nextPoll = (strategy.interval / 1000).toFixed(0);
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
