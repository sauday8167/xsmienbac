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

// New Task: 18:47 - AI Council Accuracy Scoring
cron.schedule('47 18 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering AI Council Accuracy Scoring (Post-Result)...`);
    const { exec } = require('child_process');
    exec('node scripts/run-council.js --mode=accuracy', (error, stdout, stderr) => {
        if (error) {
            console.error(`[Council Accuracy Post] Error: ${error.message}`);
            return;
        }
        console.log(`[Council Accuracy Post] Done:\n${stdout}`);
    });
});

// 7. 19:40 - AI Prediction (Dự Đoán AI - /du-doan-ai)
cron.schedule('40 19 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering AI Prediction (Early Update)...`);
    const { exec } = require('child_process');
    exec('npm run run-ai', (error, stdout, stderr) => {
        if (error) {
            console.error(`AI Analysis Error: ${error.message}`);
            return;
        }
        console.log(`AI Analysis Stdout: ${stdout}`);
    });
});

// 8. 17:30 - Fetch Số Hot Trong Ngày
cron.schedule('30 17 * * *', () => {
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


