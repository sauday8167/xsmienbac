const { crawlMinhNgoc } = require('./crawl-history');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function forceUpdate() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        const today = new Date();
        console.log(`Force crawling for date: ${today.toLocaleDateString()}`);

        const result = await crawlMinhNgoc(today);

        if (result && result.special_prize) {
            console.log(`Success! Found Special Prize: ${result.special_prize}`);

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
            console.log('Database updated.');
        } else {
            console.log('No data found for today on the source website yet.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await db.close();
    }
}

forceUpdate();
