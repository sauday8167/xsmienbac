
import { query, queryOne } from '../src/lib/db';

async function verifySoHotResults() {
    console.log(`[${new Date().toISOString()}] Bắt đầu xác minh kết quả Số Nóng...`);

    // 1. Lấy danh sách các bản ghi chưa xác minh
    const unverified = await query(`
        SELECT * FROM so_hot_history 
        WHERE is_verified = 0 
        ORDER BY draw_date DESC 
        LIMIT 20
    `);

    if (!unverified || unverified.length === 0) {
        console.log("Không có bản ghi nào cần xác minh.");
        return;
    }

    for (const record of unverified) {
        let date = record.draw_date; // "10/3/2026"
        console.log(`- Đang xử lý ngày: ${date}`);

        // Chuyển đổi định dạng nếu cần: "10/3/2026" -> "2026-03-10"
        let queryDate = date;
        if (date.includes('/')) {
            const [d, m, y] = date.split('/');
            queryDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }

        // 2. Lấy kết quả xổ số của ngày đó
        const result = await queryOne(`SELECT * FROM xsmb_results WHERE draw_date = ?`, [queryDate]);

        if (!result) {
            console.log(`  -> Chưa có kết quả xổ số cho ngày ${date}. Bỏ qua.`);
            continue;
        }

        // 3. Trích xuất tất cả các số lô (2 số cuối) từ kết quả
        const allPrizes = [
            result.special_prize, result.prize_1, result.prize_2, result.prize_3,
            result.prize_4, result.prize_5, result.prize_6, result.prize_7
        ];

        const winningNumbers: string[] = [];
        allPrizes.forEach(prizeStr => {
            if (!prizeStr) return;
            const parts = prizeStr.split(',');
            parts.forEach(p => {
                const trimmed = p.trim();
                if (trimmed.length >= 2) {
                    winningNumbers.push(trimmed.slice(-2));
                }
            });
        });

        // 4. So khớp với dự đoán
        const predictions = JSON.parse(record.prediction_data);
        const hitDetails: any = {
            bach_thu_lo: [],
            song_thu_lo: [],
            hot_numbers: []
        };

        // Kiểm tra Bạch thủ lô
        if (predictions.bach_thu_lo) {
            predictions.bach_thu_lo.forEach((num: string) => {
                if (winningNumbers.includes(num)) {
                    hitDetails.bach_thu_lo.push(num);
                }
            });
        }

        // Kiểm tra Song thủ lô (Có thể là "39-93" hoặc ["39", "93"])
        if (predictions.song_thu_lo) {
            predictions.song_thu_lo.forEach((pair: string) => {
                const nums = pair.includes('-') ? pair.split('-') : [pair];
                nums.forEach(n => {
                    const cleanN = n.trim();
                    if (winningNumbers.includes(cleanN)) {
                        hitDetails.song_thu_lo.push(cleanN);
                    }
                });
            });
        }

        // Kiểm tra Hot Numbers
        if (predictions.hot_numbers) {
            predictions.hot_numbers.forEach((item: any) => {
                if (winningNumbers.includes(item.number)) {
                    hitDetails.hot_numbers.push(item.number);
                }
            });
        }

        // 5. Cập nhật kết quả vào DB
        await query(`
            UPDATE so_hot_history 
            SET hit_details = ?, is_verified = 1 
            WHERE id = ?
        `, [JSON.stringify(hitDetails), record.id]);

        console.log(`  -> Hoàn tất! Trúng: ${hitDetails.bach_thu_lo.length + hitDetails.song_thu_lo.length} số.`);
    }
}

verifySoHotResults()
    .then(() => {
        console.log("Xác minh hoàn tất.");
        process.exit(0);
    })
    .catch(err => {
        console.error("Lỗi xác minh:", err);
        process.exit(1);
    });
