import { query, queryOne, closePool } from '../src/lib/db';

async function run() {
    const result = {
        draw_date: '2026-02-04',
        special_prize: '06517',
        prize_1: '31720',
        prize_2: ['59815', '63073'],
        prize_3: ['44790', '51542', '99159', '33670', '51349', '74299'],
        prize_4: ['1691', '0910', '0234', '8239'],
        prize_5: ['7358', '8882', '4025', '6132', '2344', '2649'],
        prize_6: ['448', '371', '569'],
        prize_7: ['65', '60', '30', '88']
    };

    console.log(`📝 Đang chèn kết quả ngày ${result.draw_date}...`);

    try {
        const existing = await queryOne('SELECT id FROM xsmb_results WHERE draw_date = ?', [result.draw_date]);
        if (existing) {
            console.log('⚠️ Dữ liệu đã tồn tại. Đang cập nhật...');
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
            console.log('📝 Đang thêm kết quả mới...');
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
        console.log('💾 Đã lưu vào cơ sở dữ liệu!');
    } catch (e: any) {
        console.error('❌ Lỗi:', e.message);
    } finally {
        await closePool();
    }
}

run();
