import { query } from '../src/lib/db';
import { generateFunnelPrediction } from '../src/lib/ai-funnel';
import { validateAndLearnAll } from '../src/lib/ai-brain';
import { findAIPatternsV2, findAIPatterns3D, findAIPatterns4D, findAIPatternsLotoDau } from '../src/lib/ai-patterns';
import { saveAIPrediction } from '../src/lib/ai-brain';

async function trainAI() {
    console.log("🚀 Starting Comprehensive AI Training Session (All Categories)...");

    // Lấy 30 ngày gần nhất để huấn luyện
    const history = await query<any[]>(`
        SELECT DISTINCT draw_date FROM xsmb_results 
        ORDER BY draw_date DESC 
        LIMIT 30
    `);

    // Chạy ngược từ cũ đến mới
    const trainingDates = history.reverse();

    for (let i = 0; i < trainingDates.length - 1; i++) {
        const currentDate = trainingDates[i].draw_date;
        const targetDate = trainingDates[i + 1].draw_date;

        console.log(`\n📅 Training Cycle: ${targetDate} (Data up to ${currentDate})`);

        try {
            // 1. Huấn luyện Funnel (Dự đoán AI 2.0)
            const funnelRes = await generateFunnelPrediction(100);

            // 2. Huấn luyện Bach Thu, 3D, 4D, Loto Dau bằng cách gọi trực tiếp patterns
            // (Mô phỏng việc lưu dự đoán vào kinh nghiệm)

            // Bach Thu
            const bachThu = await findAIPatternsV2(currentDate);
            await saveAIPrediction({
                draw_date: targetDate,
                personality_id: bachThu[0].personality?.name.includes('Chiến Lược') ? 'strategist' : 'maverick',
                prediction_type: 'bach-thu',
                predicted_numbers: Array.from(new Set(bachThu.flatMap(p => p.numbers))),
                weights_used: {}
            });

            // 3D
            const ai3d = await findAIPatterns3D(currentDate);
            if (ai3d.length > 0) {
                await saveAIPrediction({
                    draw_date: targetDate,
                    personality_id: 'mathematician',
                    prediction_type: '3d',
                    predicted_numbers: Array.from(new Set(ai3d.flatMap(p => p.numbers))),
                    weights_used: {}
                });
            }

            // 4D
            const ai4d = await findAIPatterns4D(currentDate);
            if (ai4d.length > 0) {
                await saveAIPrediction({
                    draw_date: targetDate,
                    personality_id: 'intuitive',
                    prediction_type: '4d',
                    predicted_numbers: Array.from(new Set(ai4d.flatMap(p => p.numbers))),
                    weights_used: {}
                });
            }

            // 3. Chấm điểm toàn bộ các dự đoán vừa tạo cho targetDate
            await validateAndLearnAll(targetDate);

        } catch (error) {
            console.error(`Error in training cycle ${targetDate}:`, error);
        }
    }

    console.log("\n✅ Comprehensive AI Training Complete. The brain is now evolved across all categories.");
}

trainAI();
