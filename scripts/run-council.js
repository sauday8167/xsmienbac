/**
 * run-council.js
 * Tự động khởi chạy thuật toán Hội Đồng AI (Funnel Prediction) mỗi ngày lúc 17:30.
 * Script này:
 * 1. Gọi API /api/quay-hoi-dong để trigger generateConsensusPrediction() và lưu vào ai_experience
 * 2. Cập nhật accuracy_score cho các kỳ 3 ngày trước dựa vào kết quả xổ số thực tế
 */

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'database', 'xsmb.sqlite');
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

async function checkAndUpdateAccuracy(db, drawDate) {
    try {
        // Get the council's prediction for this date
        const prediction = await db.get(`
            SELECT e.id, e.predicted_numbers, e.accuracy_score
            FROM ai_experience e
            INNER JOIN (
                SELECT draw_date, MAX(id) as max_id
                FROM ai_experience
                WHERE prediction_type = 'funnel'
                GROUP BY draw_date
            ) latest ON e.id = latest.max_id
            WHERE e.draw_date = ?
        `, [drawDate]);

        if (!prediction) {
            console.log(`[Council Accuracy] No council prediction found for ${drawDate}`);
            return;
        }

        // Already evaluated (score > 0 means it has been set)
        if (prediction.accuracy_score > 0) {
            console.log(`[Council Accuracy] Already evaluated for ${drawDate}: ${(prediction.accuracy_score * 100).toFixed(0)}%`);
            return;
        }

        // Get actual lottery result for this date
        const result = await db.get(`SELECT * FROM xsmb_results WHERE draw_date = ?`, [drawDate]);
        if (!result) {
            console.log(`[Council Accuracy] No lottery result yet for ${drawDate}, skipping.`);
            return;
        }

        // Extract all loto numbers (last 2 digits of every prize number)
        const winningLotos = new Set();
        const prizeKeys = ['special_prize', 'prize_1', 'prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'];

        prizeKeys.forEach(key => {
            const prizeData = result[key];
            if (!prizeData) return;
            try {
                const prizes = prizeData.startsWith('[') ? JSON.parse(prizeData) : [prizeData];
                prizes.forEach(p => {
                    const s = String(p);
                    if (s.length >= 2) winningLotos.add(s.slice(-2));
                });
            } catch (e) {
                const s = String(prizeData);
                if (s.length >= 2) winningLotos.add(s.slice(-2));
            }
        });

        // Compare predicted vs actual
        const predicted = JSON.parse(prediction.predicted_numbers || '[]');
        const matches = predicted.filter(num => winningLotos.has(num));
        const accuracyScore = predicted.length > 0 ? matches.length / predicted.length : 0;

        // Update ALL entries for this draw_date (so they all get the score)
        await db.run(`
            UPDATE ai_experience
            SET accuracy_score = ?
            WHERE draw_date = ? AND prediction_type = 'funnel'
        `, [accuracyScore, drawDate]);

        console.log(`[Council Accuracy] ${drawDate}: Trúng ${matches.length}/${predicted.length} loto (${matches.join(', ') || 'Không trúng'}) — Score: ${(accuracyScore * 100).toFixed(0)}%`);
    } catch (err) {
        console.error(`[Council Accuracy] Error for ${drawDate}:`, err.message);
    }
}

async function triggerCouncilPrediction() {
    console.log(`[${new Date().toISOString()}] Gọi API tạo dự đoán Hội Đồng AI...`);
    try {
        const response = await fetch(`${APP_URL}/api/ai-funnel`, {
            method: 'GET',
            headers: { 'User-Agent': 'cron-council/1.0' }
        });
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
        const json = await response.json();
        if (json.success) {
            console.log(`[Council Trigger] Thành công! Dự đoán cho kỳ: ${json.data?.date}, Số VIP: ${json.data?.finalPrediction?.join(', ')}`);
        } else {
            console.error('[Council Trigger] API trả về lỗi:', json.error);
        }
    } catch (err) {
        console.error('[Council Trigger] Lỗi khi gọi API:', err.message);
    }
}

async function main() {
    console.log(`\n====== RUN COUNCIL SCRIPT ======`);
    console.log(`Thời gian: ${new Date().toLocaleString('vi-VN')}`);

    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    try {
        // Step 1: Update accuracy for last 3 days
        console.log('\n--- Bước 1: Cập nhật accuracy_score 3 ngày qua ---');
        const today = new Date();
        for (let i = 1; i <= 3; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            await checkAndUpdateAccuracy(db, dateStr);
        }

        // Step 2: Trigger today's prediction (calls the API which calls generateConsensusPrediction)
        console.log('\n--- Bước 2: Tạo dự đoán mới cho hôm nay ---');
        await triggerCouncilPrediction();

        console.log('\n====== HOÀN TẤT ======\n');
    } catch (err) {
        console.error('run-council.js error:', err);
    } finally {
        await db.close();
    }
}

main().catch(err => {
    console.error('Fatal error in run-council.js:', err);
    process.exit(1);
});
