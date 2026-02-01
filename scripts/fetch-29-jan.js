// Crawler logic adapted from crawl-historical-data.js
const axios = require('axios');
const cheerio = require('cheerio');
const { query, queryOne } = require('../src/lib/db');

async function crawlAndSave(date) {
    console.log(`🚀 Starting crawl for ${date}...`);

    try {
        const [year, month, day] = date.split('-');
        const urlDate = `${day}-${month}-${year}`;
        const url = `https://xoso.com.vn/xsmb-${urlDate}.html`;

        console.log(`📡 Fetching ${url}`);

        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        const $ = cheerio.load(html);
        const container = $('.box_kqxs, .bkqmn').first();

        const result = {
            draw_date: date,
            special_prize: container.find('.giaidb, .db, .v-gdb').first().text().trim(),
            prize_1: container.find('.giai1, .g1, .v-g1').first().text().trim(),
            prize_2: [], prize_3: [], prize_4: [], prize_5: [], prize_6: [], prize_7: []
        };

        const extract = (selector) => {
            const arr = [];
            container.find(selector).each((_, el) => {
                const txt = $(el).text().trim();
                if (txt && /^\d+$/.test(txt)) arr.push(txt);
            });
            return arr;
        };

        result.prize_2 = extract('.giai2, .g2, .v-g2');
        result.prize_3 = extract('.giai3, .g3, .v-g3');
        result.prize_4 = extract('.giai4, .g4, .v-g4');
        result.prize_5 = extract('.giai5, .g5, .v-g5');
        result.prize_6 = extract('.giai6, .g6, .v-g6');
        result.prize_7 = extract('.giai7, .g7, .v-g7');

        if (!result.special_prize) {
            console.error('❌ Could not find result data on page.');
            return;
        }

        console.log('✅ Result Found:');
        console.log('Special:', result.special_prize);
        console.log('Prize 1:', result.prize_1);

        // Save to DB
        const existing = await queryOne('SELECT id FROM xsmb_results WHERE draw_date = ?', [date]);
        if (existing) {
            console.log('⚠️ Result already exists. Updating...');
            await query(`
                UPDATE xsmb_results SET
                special_prize=?, prize_1=?, prize_2=?, prize_3=?,
                prize_4=?, prize_5=?, prize_6=?, prize_7=?, updated_at=CURRENT_TIMESTAMP
                WHERE draw_date=?
             `, [
                result.special_prize, result.prize_1,
                JSON.stringify(result.prize_2), JSON.stringify(result.prize_3),
                JSON.stringify(result.prize_4), JSON.stringify(result.prize_5),
                JSON.stringify(result.prize_6), JSON.stringify(result.prize_7),
                date
            ]);
        } else {
            console.log('📝 Inserting new result...');
            await query(`
                INSERT INTO xsmb_results (
                draw_date, special_prize, prize_1, prize_2, prize_3,
                prize_4, prize_5, prize_6, prize_7, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             `, [
                date, result.special_prize, result.prize_1,
                JSON.stringify(result.prize_2), JSON.stringify(result.prize_3),
                JSON.stringify(result.prize_4), JSON.stringify(result.prize_5),
                JSON.stringify(result.prize_6), JSON.stringify(result.prize_7)
            ]);
        }
        console.log('💾 Saved to Database!');

    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

crawlAndSave('2026-01-29');
