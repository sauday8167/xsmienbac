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

        if (result && result.special_prize) {
            console.log(`Has data! Special Prize: ${result.special_prize}`);

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

            // Trigger Bac Nho Pre-calculation
            try {
                console.log('Triggering Bac Nho calculation...');
                const { exec } = require('child_process');
                exec('npm run calculate-bac-nho', (error, stdout, stderr) => {
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
console.log(' - 18:40: Final Check + 100 Days Analysis');
console.log(' - 18:52: 180 Days Analysis');
console.log(' - 19:04: 365 Days Analysis');
console.log(' - 19:16: 730 Days Analysis');
console.log(' - 19:28: 1000 Days Analysis');

// 1. 18:40 - Crawl + Default (100 days)
cron.schedule('40 18 * * *', () => {
    runTask();
});

// Helper to run calculation
function runCalculation(days) {
    const { exec } = require('child_process');
    console.log(`[${new Date().toISOString()}] Triggering ${days} Days Analysis...`);
    exec(`npx tsx scripts/calculate-bac-nho.ts ${days}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Calculation ${days} error: ${error.message}`);
            return;
        }
        if (stderr) {
            // console.error(`Calculation ${days} stderr: ${stderr}`); // Only log if critical, or keep specifically for debugging
        }
        console.log(`Calculation ${days} stdout: ${stdout}`);
    });
}

// 2. 18:52 - 180 Days
cron.schedule('52 18 * * *', () => {
    runCalculation(180);
});

// 3. 19:04 - 365 Days
cron.schedule('04 19 * * *', () => {
    runCalculation(365);
});

// 4. 19:16 - 730 Days
cron.schedule('16 19 * * *', () => {
    runCalculation(730);
});

// 5. 19:28 - 1000 Days
cron.schedule('28 19 * * *', () => {
    runCalculation(1000);
});

// 6. 20:35 - AI Prediction
cron.schedule('35 20 * * *', () => {
    console.log(`[${new Date().toISOString()}] Triggering AI Prediction...`);
    const { exec } = require('child_process');
    exec('npm run run-ai', (error, stdout, stderr) => {
        if (error) {
            console.error(`AI Analysis Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`AI Analysis Stderr: ${stderr}`);
        }
        console.log(`AI Analysis Stdout: ${stdout}`);
    });
});

