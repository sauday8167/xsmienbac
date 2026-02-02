import axios from 'axios';
import * as cheerio from 'cheerio';
import { query, queryOne, closePool } from '../src/lib/db';

async function crawlAndSave(date: string) {
    console.log(`🚀 Starting crawl for ${date}...`);

    try {
        const [day, month, year] = date.split('-');
        const urlDate = `${day}-${month}-${year}`;
        const url = `https://xoso.com.vn/xsmb-${urlDate}.html`;

        console.log(`📡 Fetching ${url}`);

        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        const $ = cheerio.load(html);

        const result = {
            draw_date: `${year}-${month}-${day}`, // YYYY-MM-DD
            special_prize: '',
            prize_1: '',
            prize_2: [] as string[],
            prize_3: [] as string[],
            prize_4: [] as string[],
            prize_5: [] as string[],
            prize_6: [] as string[],
            prize_7: [] as string[]
        };

        const getVal = (id: string) => $(`#${id}`).text().trim();

        const getByPrefix = (prefix: string) => {
            return $(`[id^="${prefix}"]`).map((_, el) => $(el).text().trim()).get();
        };

        // Standard IDs often used by xoso.com.vn
        result.special_prize = getVal('mb_prize_db_item0') || getVal('mb_prizedb_item0') || $('.special-prize, .giaidb').text().trim();
        result.prize_1 = getVal('mb_prize1_item0') || getVal('mb_prize1_item1') || $('.prize1, .giai1').text().trim();

        result.prize_2 = getByPrefix('mb_prize2_item');
        result.prize_3 = getByPrefix('mb_prize3_item');
        result.prize_4 = getByPrefix('mb_prize4_item');
        result.prize_5 = getByPrefix('mb_prize5_item');
        result.prize_6 = getByPrefix('mb_prize6_item');
        result.prize_7 = getByPrefix('mb_prize7_item');

        // Backup for Special/G1 if ID failed
        if (!result.special_prize) result.special_prize = getByPrefix('mb_prizedb_item')[0] || getByPrefix('mb_prize_db_item')[0];
        if (!result.prize_1) result.prize_1 = getByPrefix('mb_prize1_item')[0];

        // Clean up weird characters
        const clean = (s: string) => s ? s.replace(/\D/g, '') : '';
        result.special_prize = clean(result.special_prize);
        result.prize_1 = clean(result.prize_1);
        result.prize_2 = result.prize_2.map(clean);
        result.prize_3 = result.prize_3.map(clean);
        result.prize_4 = result.prize_4.map(clean);
        result.prize_5 = result.prize_5.map(clean);
        result.prize_6 = result.prize_6.map(clean);
        result.prize_7 = result.prize_7.map(clean);

        if (!result.special_prize) {
            console.error(`❌ Could not find Special Prize for ${date}. Aborting save.`);
            if ($('.special-prize').length) {
                result.special_prize = clean($('.special-prize').text());
                console.log(`Found via fallback class: ${result.special_prize}`);
            } else {
                console.log('Partial Data:', JSON.stringify(result, null, 2));
                return;
            }
        }

        console.log('✅ Result Found!');
        console.log('GDB:', result.special_prize);
        console.log('G1:', result.prize_1);

        // Save
        const existing = await queryOne('SELECT id FROM xsmb_results WHERE draw_date = ?', [result.draw_date]);
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
                result.draw_date
            ]);
        } else {
            console.log('📝 Inserting new result...');
            await query(`
                INSERT INTO xsmb_results (
                draw_date, special_prize, prize_1, prize_2, prize_3,
                prize_4, prize_5, prize_6, prize_7, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             `, [
                result.draw_date, result.special_prize, result.prize_1,
                JSON.stringify(result.prize_2), JSON.stringify(result.prize_3),
                JSON.stringify(result.prize_4), JSON.stringify(result.prize_5),
                JSON.stringify(result.prize_6), JSON.stringify(result.prize_7)
            ]);
        }
        console.log('💾 Saved to Database!');

    } catch (e: any) {
        console.error('❌ Error:', e.message);
    }
}

async function run() {
    await crawlAndSave('01-02-2026');
    await crawlAndSave('02-02-2026');
    await closePool();
}

run();
