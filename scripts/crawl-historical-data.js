// Historical Data Crawler - Populate past 5 days for AI
const axios = require('axios');
const cheerio = require('cheerio');
const { query, queryOne } = require('../src/lib/db');

const DATES_TO_CRAWL = [
    '2026-01-14',
    '2026-01-15',
    '2026-01-16',
    '2026-01-17',
    '2026-01-18'
];

/**
 * Crawl from xoso.com.vn using date parameter
 */
async function crawlHistoricalXSMB(date) {
    try {
        // Format: DD-MM-YYYY for URL
        const [year, month, day] = date.split('-');
        const urlDate = `${day}-${month}-${year}`;

        const url = `https://xoso.com.vn/xsmb-${urlDate}.html`;
        console.log(`📡 Crawling ${url}`);

        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        const $ = cheerio.load(html);

        // Parse results
        const result = {
            draw_date: date,
            special_prize: null,
            prize_1: null,
            prize_2: [],
            prize_3: [],
            prize_4: [],
            prize_5: [],
            prize_6: [],
            prize_7: []
        };

        // Find result table
        const container = $('.box_kqxs, .bkqmn').first();

        // Special prize & Prize 1
        result.special_prize = container.find('.giaidb, .db, .v-gdb').first().text().trim();
        result.prize_1 = container.find('.giai1, .g1, .v-g1').first().text().trim();

        // Arrays - get each div/span separately
        const extractArray = (selector) => {
            const values = [];
            container.find(selector).each((i, el) => {
                const text = $(el).text().trim();
                if (text && /^\d+$/.test(text)) {
                    values.push(text);
                }
            });
            return values;
        };

        result.prize_2 = extractArray('.giai2, .g2, .v-g2');
        result.prize_3 = extractArray('.giai3, .g3, .v-g3');
        result.prize_4 = extractArray('.giai4, .g4, .v-g4');
        result.prize_5 = extractArray('.giai5, .g5, .v-g5');
        result.prize_6 = extractArray('.giai6, .g6, .v-g6');
        result.prize_7 = extractArray('.giai7, .g7, .v-g7');

        return result;

    } catch (error) {
        console.error(`❌ Error crawling ${date}:`, error.message);
        return null;
    }
}

/**
 * Save to database
 */
async function saveResult(result) {
    try {
        // Check if exists
        const existing = await queryOne('SELECT id FROM xsmb_results WHERE draw_date = ?', [result.draw_date]);

        if (existing) {
            console.log(`   ⚠️  Already exists, skipping...`);
            return;
        }

        // Insert
        await query(`
            INSERT INTO xsmb_results (
                draw_date, special_prize, prize_1, prize_2, prize_3, 
                prize_4, prize_5, prize_6, prize_7, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
            result.draw_date,
            result.special_prize,
            result.prize_1,
            JSON.stringify(result.prize_2),
            JSON.stringify(result.prize_3),
            JSON.stringify(result.prize_4),
            JSON.stringify(result.prize_5),
            JSON.stringify(result.prize_6),
            JSON.stringify(result.prize_7)
        ]);

        console.log(`   ✅ Saved successfully`);

    } catch (error) {
        console.error(`   ❌ Error saving ${result.draw_date}:`, error.message);
    }
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Historical Data Crawler');
    console.log('===========================\n');
    console.log(`📅 Crawling ${DATES_TO_CRAWL.length} dates for AI training\n`);

    for (const date of DATES_TO_CRAWL) {
        console.log(`\n📆 Processing ${date}...`);

        const result = await crawlHistoricalXSMB(date);

        if (result && result.special_prize) {
            console.log(`   📊 GĐB: ${result.special_prize}`);
            console.log(`   📊 G1: ${result.prize_1}`);
            console.log(`   📊 G2: ${result.prize_2.join(', ')}`);

            await saveResult(result);
        } else {
            console.log(`   ❌ Failed to get valid data`);
        }

        // Wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n\n✅ Historical data crawling complete!');
    console.log('🤖 AI prediction page should now have enough data.\n');
}

main().catch(console.error);
