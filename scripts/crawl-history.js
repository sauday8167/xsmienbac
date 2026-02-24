const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

function formatDateForUrl(date) {
    const d = new Date(date);
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

function formatDateForDb(date) {
    const d = new Date(date);
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
}

// Convert "08-01-2026" to "08/01/2026"
function formatDateForCheck(date) {
    const d = new Date(date);
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

async function crawlMinhNgoc(date) {
    const urlDate = formatDateForUrl(date);
    const dbDate = formatDateForDb(date);
    const checkDate = formatDateForCheck(date);
    const url = `https://www.minhngoc.net.vn/ket-qua-xo-so/mien-bac/${urlDate}.html`;

    // console.log(`Crawling ${url}...`);

    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        let targetTable = null;

        // Find specifically the table for this date
        $('table.bkqtinhmienbac').each((i, el) => {
            const dateText = $(el).find('.ngay').text();
            if (dateText.includes(checkDate)) {
                targetTable = $(el);
                return false;
            }
        });

        if (!targetTable) {
            // console.log(`Strict date match failed for ${checkDate}. Checking basic table...`);
            const firstTable = $('table.bkqtinhmienbac').first();
            if (firstTable.length > 0) {
                targetTable = firstTable;
            }
        }

        if (!targetTable) return null;

        const results = { special: '' };

        $('tr', targetTable).each((i, el) => {
            if ($(el).find('.giaidb').length > 0) {
                // Get first div (the number) and remove any non-digit chars just in case
                results.special = $(el).find('.giaidb div').first().text().replace(/\D/g, '');
            }
            if ($(el).find('.giai1').length > 0) {
                results.prize1 = $(el).find('.giai1 div').text().trim();
            }
            if ($(el).find('.giai2').length > 0) {
                results.prize2 = $(el).find('.giai2 div').map((i, e) => $(e).text().trim()).get();
            }
            if ($(el).find('.giai3').length > 0) {
                results.prize3 = $(el).find('.giai3 div').map((i, e) => $(e).text().trim()).get();
            }
            if ($(el).find('.giai4').length > 0) {
                results.prize4 = $(el).find('.giai4 div').map((i, e) => $(e).text().trim()).get();
            }
            if ($(el).find('.giai5').length > 0) {
                results.prize5 = $(el).find('.giai5 div').map((i, e) => $(e).text().trim()).get();
            }
            if ($(el).find('.giai6').length > 0) {
                results.prize6 = $(el).find('.giai6 div').map((i, e) => $(e).text().trim()).get();
            }
            if ($(el).find('.giai7').length > 0) {
                results.prize7 = $(el).find('.giai7 div').map((i, e) => $(e).text().trim()).get();
            }
        });

        // Relaxed check: Return result if ANY prize data is found, not just special prize
        // During live drawing, prizes appear sequentially (usually starting from Prize 1 or 7)
        const hasData = results.special || results.prize1 || (results.prize7 && results.prize7.length > 0);

        if (!hasData) return null;

        return {
            draw_date: dbDate,
            special_prize: results.special,
            prize_1: results.prize1,
            prize_2: JSON.stringify(results.prize2 || []),
            prize_3: JSON.stringify(results.prize3 || []),
            prize_4: JSON.stringify(results.prize4 || []),
            prize_5: JSON.stringify(results.prize5 || []),
            prize_6: JSON.stringify(results.prize6 || []),
            prize_7: JSON.stringify(results.prize7 || [])
        };

    } catch (e) {
        return null;
    }
}

async function run() {
    let db;
    try {
        const dbPath = path.join(process.cwd(), 'database', 'xsmb.sqlite');
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log('Connected to SQLite.');

        const DAYS_TO_CRAWL = 100;
        console.log(`Starting crawl for last ${DAYS_TO_CRAWL} days...`);

        const today = new Date();
        const startDay = new Date(today);
        startDay.setDate(today.getDate() - 1);

        // Crawl 300 days
        for (let i = 0; i < DAYS_TO_CRAWL; i++) {
            const date = new Date(startDay);
            date.setDate(startDay.getDate() - i);
            const urlDate = formatDateForUrl(date);

            try {
                const result = await crawlMinhNgoc(date);

                if (result) {
                    await db.run(
                        `INSERT INTO xsmb_results 
                        (draw_date, special_prize, prize_1, prize_2, prize_3, prize_4, prize_5, prize_6, prize_7) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(draw_date) DO UPDATE SET
                        special_prize=excluded.special_prize,
                        prize_1=excluded.prize_1, prize_2=excluded.prize_2, prize_3=excluded.prize_3,
                        prize_4=excluded.prize_4, prize_5=excluded.prize_5, prize_6=excluded.prize_6,
                        prize_7=excluded.prize_7`,
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

                    if ((i + 1) % 10 === 0) {
                        console.log(`[${i + 1}/${DAYS_TO_CRAWL}] Saved result for ${result.draw_date}`);
                    }
                } else {
                    console.log(`[${i + 1}/${DAYS_TO_CRAWL}] No data for ${urlDate}`);
                }

            } catch (dbError) {
                console.error(`DB Error for ${urlDate}:`, dbError.message);
            }

            // Polite delay 800ms
            await new Promise(r => setTimeout(r, 800));
        }

        await db.close();
        console.log('Done.');
    } catch (err) {
        console.error('Migration/Connection Error:', err);
    }
}

// Export functions
module.exports = {
    crawlMinhNgoc,
    formatDateForDb,
    formatDateForUrl
};

// Only run if called directly
if (require.main === module) {
    run();
}
