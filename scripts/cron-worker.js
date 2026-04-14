const cron = require('node-cron');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const { crawlMinhNgoc, formatDateForDb } = require('./crawl-history');

async function runTask() {
    console.log(`[${new Date().toISOString()}] Starting cron task...`);

    // Open DB
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        const today = new Date();
        // Adjust for timezone if running on server, but local should be fine if machine time is correct.
        // If we want to be safe for VN time:
        // const now = new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"});
        // const today = new Date(now);

        console.log(`Crawling for date: ${today.toLocaleDateString()}`);

        const result = await crawlMinhNgoc(today);

        if (result) {
            console.log(`Has data! Special Prize: ${result.special_prize || '(Not yet)'}`);

            await db.run(
                `INSERT INTO xsmb_results 
                (draw_date, special_prize, prize_1, prize_2, prize_3, prize_4, prize_5, prize_6, prize_7, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(draw_date) DO UPDATE SET
                special_prize=excluded.special_prize,
                prize_1=excluded.prize_1, prize_2=excluded.prize_2, prize_3=excluded.prize_3,
                prize_4=excluded.prize_4, prize_5=excluded.prize_5, prize_6=excluded.prize_6,
                 prize_7=excluded.prize_7, updated_at=CURRENT_TIMESTAMP`,
                [
                    result.draw_date,
                    result.special_prize,
                    result.prize_1,
                    result.prize_2,
                    result.prize_3,
                    result.prize_4,
                    result.prize_5,
                    result.prize_6,
                    result.prize_7
                ]
            );
            console.log('Data saved to DB.');

            // Trigger Automatic Article Generation (DISABLED - Use Admin Panel)
            // try {
            //     console.log('Triggering daily prediction article generation...');
            //     // Assuming Next.js app is running on localhost:3000
            //     const response = await fetch('http://localhost:3000/api/schedulers/generate-daily-post?secret=cron_secret_password', {
            //         method: 'GET'
            //     });
            //     const json = await response.json();
            //     console.log('Generation Trigger Response:', json);
            // } catch (err) {
            //     console.error('Failed to trigger article generation:', err);
            // }

            // Trigger Bac Nho Pre-calculation - ONLY if Special Prize is present (End of Live)
            if (result.special_prize && result.special_prize.length > 0) {
                try {
                    console.log('Triggering Bac Nho calculation...');
                    const { exec } = require('child_process');
                    exec('npm run calculate-bac-nho', { env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=6144' } }, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Calculation error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.error(`Calculation stderr: ${stderr}`);
                            return;
                        }
                        console.log(`Calculation stdout: ${stdout}`);
                    });
                } catch (err) {
                    console.error('Failed to trigger calculation:', err);
                }
            }
        } else {
            console.log('No data found yet.');
        }

    } catch (e) {
        console.error('Error in cron task:', e);
    } finally {
        await db.close();
    }
}

// Schedule:
// Every 2 minutes from 18:10 to 18:50 (Vietnam time usually results come 18:15-18:30)
console.log('Cron worker started.');
console.log('Schedules:');
console.log(' - 07:00: AI Council Accuracy Learning');
console.log(' - 08:00: AI Council Prediction (/hoi-dong-ai)');
console.log(' - 12:00: AI Council Status Check (Retry if failed)');
console.log(' - 18:15-18:45: Live Crawl (Every minute)');
console.log(' - 18:47: AI Council Accuracy Scoring (Post-Result)');
console.log(' - 18:52: 180 Days Analysis');
console.log(' - 19:04: 365 Days Analysis');
console.log(' - 19:16: 730 Days Analysis');
console.log(' - 19:28: 1000 Days Analysis');
console.log(' - 19:40: AI Prediction (/du-doan-ai) - phân tích sau kết quả');

// 1. Live Crawl: Every minute from 18:15 to 18:45
// ... (omitted same part)

// 2-5 ... (omitted same part)

// New Task: 18:47 - AI Council Accuracy Scoring (Deprecated - Removed logic)
// cron.schedule('47 18 * * *', () => { ... });

// 7. 19:40 - AI Prediction (Dự Đoán AI - /du-doan-ai)
cron.schedule('40 19 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering AI Prediction (Early Update)...`);
    const { exec } = require('child_process');
    exec('npx tsx scripts/run-ai.ts null du-doan-3-số', (error, stdout, stderr) => {
        if (error) {
            console.error(`AI Analysis Error: ${error.message}`);
            return;
        }
        console.log(`AI Analysis Stdout: ${stdout}`);
    });
});

// Hội Đồng Bạc Nhớ Prediction - /hoi-dong-bac-nho
cron.schedule('0 8 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering Hội Đồng Bạc Nhớ Prediction...`);
    const { exec } = require('child_process');
    exec('npx tsx scripts/run-ai.ts null hoi-dong', (error, stdout, stderr) => {
        if (error) {
            console.error(`AI Analysis Error (Hội Đồng): ${error.message}`);
            return;
        }
        console.log(`AI Analysis Stdout (Hội Đồng): ${stdout}`);
    });
});

// 8. 17:00 - Fetch Số Hot Trong Ngày
cron.schedule('0 17 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering Fetch Số Hot Trong Ngày...`);
    const { exec } = require('child_process');
    // Use --env-file to ensure API keys are loaded
    exec('npx tsx --env-file=.env scripts/fetch-so-hot.ts', (error, stdout, stderr) => {
        if (error) {
            console.error(`Fetch Số Hot Error: ${error.message}`);
            return;
        }
        console.log(`Fetch Số Hot Stdout: ${stdout}`);
    });
});

// 9. 18:50 - Verify Số Hot Results
cron.schedule('50 18 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering Verify Số Hot Results (Post-Result)...`);
    const { exec } = require('child_process');
    exec('npx tsx scripts/verify-so-hot.ts', (error, stdout, stderr) => {
        if (error) {
            console.error(`Verify Số Hot Error: ${error.message}`);
            return;
        }
        console.log(`Verify Số Hot Stdout: ${stdout}`);
    });
});

// 10. 16:30 - Fetch Hội Đồng Bạc Nhớ Predictions (Deprecated)
// cron.schedule('30 16 * * *', () => { ... });

// 11. 19:00 - Verify Hội Đồng Bạc Nhớ Results (Deprecated)
// cron.schedule('0 19 * * *', () => { ... });

// 12. 16:00 - AI Learning v2: Snapshot 6 nguồn phân tích (trước khi xổ số)
cron.schedule('0 16 * * *', () => {
    const { exec } = require('child_process');
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }); // YYYY-MM-DD
    console.log(`[${new Date().toISOString()}] AI Learning v2: Snapshot nguồn phân tích ngày ${today}...`);
    exec(`npx tsx -e "
        require('dotenv/config');
        const { snapshotSourcePredictions } = require('./src/lib/ai-learning');
        snapshotSourcePredictions('${today}').then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
    "`, (error, stdout, stderr) => {
        if (error) { console.error(`AI Snapshot Error: ${error.message}`); return; }
        console.log(`AI Snapshot Done: ${stdout}`);
    });
});

// 13. 19:10 - AI Learning v2: Verify và học quy tắc từ KQXS hôm nay
cron.schedule('10 19 * * *', () => {
    const { exec } = require('child_process');
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
    console.log(`[${new Date().toISOString()}] AI Learning v2: Verify & Learn từ KQXS ngày ${today}...`);
    exec(`npx tsx -e "
        require('dotenv/config');
        const { verifyAndLearnFromSources } = require('./src/lib/ai-learning');
        verifyAndLearnFromSources('${today}').then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
    "`, (error, stdout, stderr) => {
        if (error) { console.error(`AI Learn Error: ${error.message}`); return; }
        console.log(`AI Learn Done: ${stdout}`);
    });
});

// 14. 21:00 - Tự động viết tin tức AI cho ngày mai
cron.schedule('0 21 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering Auto News Generation (21:00)...`);
    const { exec } = require('child_process');
    exec('npx tsx scripts/auto-write-news.ts', (error, stdout, stderr) => {
        if (error) {
            console.error(`Auto News Error: ${error.message}`);
            return;
        }
        console.log(`Auto News Stdout: ${stdout}`);
    });
});

// 15. 22:00 - Kiểm tra và viết tin tức AI (nếu chưa có)
cron.schedule('0 22 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering Auto News Check (22:00)...`);
    const { exec } = require('child_process');
    exec('npx tsx scripts/auto-write-news.ts --check', (error, stdout, stderr) => {
        if (error) {
            console.error(`Auto News Check Error: ${error.message}`);
            return;
        }
        console.log(`Auto News Check Stdout: ${stdout}`);
    });
});

// 16. 19:30 - Tự động viết tin tức Đầu/Đuôi Câm
cron.schedule('30 19 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering Auto Write Ngach Cam (19:30)...`);
    const { exec } = require('child_process');
    exec('npx tsx scripts/auto-write-ngach-cam.ts', (error, stdout, stderr) => {
        if (error) {
            console.error(`Auto Ngach Cam Error: ${error.message}`);
            return;
        }
        console.log(`Auto Ngach Cam Stdout: ${stdout}`);
    });
});

// 17. 19:40 - Tự động viết bài Lô Gan Cực Đại
cron.schedule('40 19 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering Auto Write Lo Gan (19:40)...`);
    const { exec } = require('child_process');
    exec('npx tsx scripts/auto-write-lo-gan.ts', (err, stdout) => {
        if (err) console.error(`Lo Gan Error: ${err.message}`);
        else console.log(`Lo Gan Stdout: ${stdout}`);
    });
});

// 18. 19:45 - Tự động viết bài Bạc Nhớ Lô Kẹp
cron.schedule('45 19 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering Auto Write Bac Nho (19:45)...`);
    const { exec } = require('child_process');
    exec('npx tsx scripts/auto-write-bac-nho.ts', (err, stdout) => {
        if (err) console.error(`Bac Nho Error: ${err.message}`);
        else console.log(`Bac Nho Stdout: ${stdout}`);
    });
});

// 19. 08:00 - Tự động giải mã Sổ Mơ
cron.schedule('0 8 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering Auto Write So Mo (08:00)...`);
    const { exec } = require('child_process');
    exec('npx tsx scripts/auto-write-so-mo.ts', (err, stdout) => {
        if (err) console.error(`So Mo Error: ${err.message}`);
        else console.log(`So Mo Stdout: ${stdout}`);
    });
});
