const { crawlMinhNgoc } = require('./crawl-history');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const { exec } = require('child_process');

async function updateLatest() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        // Find latest date in DB
        const latest = await db.get('SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
        let startDate;

        if (!latest) {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7); // Start from a week ago if empty
        } else {
            startDate = new Date(latest.draw_date);
            startDate.setDate(startDate.getDate() + 1); // Start from next day
        }

        const today = new Date();
        console.log(`Checking updates from ${startDate.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`);

        let current = new Date(startDate);
        while (current <= today) {
            console.log(`Crawling results for ${current.toISOString().split('T')[0]}...`);
            const result = await crawlMinhNgoc(current);

            if (result && result.special_prize) {
                console.log(`Success! Found results for ${result.draw_date}`);
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
            } else {
                console.log(`No results found yet for ${current.toISOString().split('T')[0]}`);
            }

            current.setDate(current.getDate() + 1);
            await new Promise(r => setTimeout(r, 1000)); // Be polite
        }

        console.log('Update process completed.');

        // Trigger AI Analysis
        console.log('Triggering AI Analysis...');
        exec('npx ts-node -r tsconfig-paths/register scripts/run-ai.ts', (error, stdout, stderr) => {
            if (error) {
                console.error(`AI Analysis Error: ${error.message}`);
                return;
            }
            if (stderr) console.error(`AI Analysis Stderr: ${stderr}`);
            console.log(`AI Analysis Stdout: ${stdout}`);
        });

    } catch (e) {
        console.error('Update failed:', e);
    } finally {
        await db.close();
    }
}

updateLatest();
