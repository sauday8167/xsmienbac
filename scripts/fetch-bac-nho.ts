import 'dotenv/config';
import { AIAnalyst } from '../src/lib/ai/analyst';
import { snapshotSourcePredictions, verifyAndLearnFromSources } from '../src/lib/ai-learning';

/**
 * Script chạy tự động vào 00:00 sáng hàng ngày.
 * Ví dụ: Lúc 00:00 ngày 21/03/2024:
 * - KQXS ngày hôm qua (sourceDate) = 20/03/2024.
 * - Dự đoán cho ngày hôm nay (targetDate) = 21/03/2024.
 */
async function main() {
    try {
        const now = new Date();
        
        // targetDate = ngày hôm nay (00:00)
        const targetDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now);

        // sourceDate = ngày hôm qua (ngày đã có kết quả xổ số)
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const sourceDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(yesterday);

        console.log(`🚀 [Cron 00:00] Bắt đầu quy trình Hội Đồng Bạc Nhớ`);
        console.log(`- Sử dụng kết quả ngày: ${sourceDate}`);
        console.log(`- Chốt số dự đoán cho: ${targetDate}`);

        // 1. Chụp snapshot cho ngày sourceDate (dựa trên KQXS của nó để dự đoán targetDate)
        // Hàm snapshotSourcePredictions(sourceDate) sẽ tự động tính targetDate = sourceDate + 1
        console.log('--- Phase 1: Snapshot ---');
        await snapshotSourcePredictions(sourceDate);

        // 2. Học và verify kết quả cho ngày sourceDate (vì kết quả đã có đầy đủ)
        console.log('--- Phase 2: Learning ---');
        await verifyAndLearnFromSources(sourceDate);

        // 3. Chốt số cho ngày targetDate
        console.log('--- Phase 3: Prediction ---');
        
        console.log('🚀 [AI Predict] Đang tạo dự đoán HỘI ĐỒNG (10 số)...');
        await AIAnalyst.runDailyAnalysis(targetDate, 'hoi-dong');

        console.log('🚀 [AI Predict] Đang tạo dự đoán 3 SỐ...');
        const result3 = await AIAnalyst.runDailyAnalysis(targetDate, 'du-doan-3-số');
        
        console.log('✅ [Cron] Hoàn tất toàn bộ quy trình chốt số 00:00.');
        console.log('Dự đoán 3 số:', result3?.predictedPairs);

        process.exit(0);
    } catch (error) {
        console.error('❌ [Cron] Lỗi quy trình:', error);
        process.exit(1);
    }
}

main();
