import { GeminiClient } from './gemini-client';
import { ContextProvider } from './context-provider';
import { query, queryOne } from '@/lib/db';
import { getLatestTacticalAdvice } from '../ai-learning';
import { calculateLoGan } from '@/lib/statistics';

export class AIAnalyst {
    static async runDailyAnalysis(customTargetDate?: string) {
        try {
            // Get Vietnam Date string reliably
            const vnDateStr = customTargetDate || new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date()); // Returns "YYYY-MM-DD"

            const targetDate = vnDateStr;

            // 0. Update accuracy for previous days (last 3 days)
            // We use the VN date object to subtract days
            const vnDate = new Date(targetDate);

            for (let i = 1; i <= 3; i++) {
                const prevDate = new Date(vnDate);
                prevDate.setDate(prevDate.getDate() - i);
                const prevDateStr = prevDate.toISOString().split('T')[0];
                await this.checkAccuracy(prevDateStr);
            }

            // 0.5. Fetch History Context for Prompt
            const historyRows = await query<any[]>(
                `SELECT draw_date, is_correct, accuracy_notes 
                 FROM ai_predictions 
                 WHERE draw_date < ? 
                 ORDER BY draw_date DESC 
                 LIMIT 3`,
                [targetDate]
            );

            let historyContext = "Chưa có dữ liệu lịch sử.";
            let recentHitRate = 100; // Mặc định tự tin ban đầu nếu chưa có sử

            if (historyRows.length > 0) {
                let hitCount = 0;
                historyContext = historyRows.map(row => {
                    const date = new Date(row.draw_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                    const status = row.is_correct === 1 ? 'TRÚNG' : 'TRƯỢT';
                    if (row.is_correct === 1) hitCount++;
                    const note = row.accuracy_notes || '';
                    return `- Ngày ${date}: ${status} (${note})`;
                }).join('\n');
                recentHitRate = (hitCount / historyRows.length) * 100;
            }

            // 0.5.5 Lập Chiến Thuật Động (Dynamic Strategy) dựa trên Tỷ lệ Trúng
            let dynamicInstructions = "";
            if (recentHitRate >= 40) {
                // Đang trong nhịp cầu trơn -> Đánh theo đám đông & cầu kèo phổ thông
                dynamicInstructions = `
[CHIẾN THUẬT HIỆN TẠI: ĐÁNH THEO NHỊP CẦU THUẬN]
Phong độ của Hội đồng đang TỐT (Tỷ lệ thắng: ${recentHitRate}%). 
HÃY ƯU TIÊN SỰ HỘI TỤ CỦA CÁC ĐƯỜNG CẦU PHỔ BIẾN:
- Tập trung vào các loto có nhịp rơi ổn định theo Thống Kê Tần Suất.
- Kế thừa Bạc Nhớ, Lô Rơi và Bạc Nhớ Khung 3 Ngày vì thị trường đang đi đúng quy luật.
`;
            } else {
                // Đang bị gạch -> Bắt AI bẻ cầu, cấm đi theo lối mòn
                dynamicInstructions = `
[CHIẾN THUẬT HIỆN TẠI: CHỐT SỐ RỦI RO / BẺ CẦU - PHÁ LỐI MÒN]
CẢNH BÁO ĐỎ: Phong độ của Hội đồng đang RẤT TỆ (Tỷ lệ thắng: ${recentHitRate}%, đang trượt nhiều ngày).
Bạn ĐANG BỊ RƠI VÀO LỐI MÒN của các phương pháp cơ bản (Bạc nhớ thông thường đã GÃY). Mệnh lệnh cho ngày hôm nay:
- TUYỆT ĐỐI KHÔNG đi theo đám đông. Bỏ qua các cầu loto quá lộ liễu.
- HÃY TÌM KIẾM CÁC DẤU HIỆU ĐẢO CHIỀU: Tìm Lô Kép, Lô đi theo Đầu/Đuôi đang câm hôm qua, hoặc Loto nghịch.
- Soi kỹ các dấu hiệu cực kỳ bất thường từ Giải Đặc Biệt. 
- Hãy chọn ít nhất 2 loto mà các thuật toán cơ bản thường bỏ qua nhưng mang lại tiềm năng đột biến ngày hôm nay.
`;
            }

            // 0.6. Get Latest Tactical Advice & Gan Stats
            const [tacticalAdvice, loGan50] = await Promise.all([
                getLatestTacticalAdvice(),
                calculateLoGan(50, 60) // High risk numbers
            ]);

            const ganList = loGan50.map((g: any) => g.number).join(', ');
            const tacticalContext = tacticalAdvice
                ? `BÀI HỌC KINH NGHIỆM: ${tacticalAdvice.advice}\nMỨC ĐỘ RỦI RO: ${tacticalAdvice.risk_level}`
                : "Đang thu thập kinh nghiệm...";

            // 1. Check if we already have a prediction for target date
            const existing = await queryOne(
                `SELECT id FROM ai_predictions WHERE draw_date = ?`,
                [targetDate]
            );

            if (existing) {
                console.log(`Prediction for ${targetDate} already exists.`);
                return;
            }

            // 2. Build Context
            // This will fetch results BEFORE targetDate (i.e., latest available)
            const context = await ContextProvider.getDailyContext(targetDate);
            const contextText = ContextProvider.formatContextForPrompt(context);

            // 3. Construct Enhanced Prompt (Simplified for Readability)

            // Core Analyst Prompt
            const ANALYST_PROMPT = `
VAI TRÒ: Bạn là người phân tích dữ liệu Xổ số Miền Bắc (XSMB), chia sẻ phân tích một cách TỰ NHIÊN, DỄ HIỂU.

PHONG CÁCH:
- Thân thiện, gần gũi như đang chia sẻ với bạn bè
- TRÁNH dùng: "chuyên gia", "kinh nghiệm lâu năm", "bề dày kinh nghiệm"
- Viết ngắn gọn, súc tích, dễ hiểu
- Sử dụng ngôn ngữ đơn giản, tự nhiên

NHIỆM VỤ:
1. Phân tích dữ liệu thống kê được cung cấp
2. Đưa ra nhận định dựa trên số liệu thực tế
3. Trình bày theo format yêu cầu
`;

            const prompt = `
${ANALYST_PROMPT}

TUYỆT ĐỐI KHÔNG nhắc đến "XSMN", "Miền Nam", "Xổ số Miền Nam". Bạn chỉ phân tích duy nhất đài MIỀN BẮC.

QUY TẮC TỪ NGỮ (BẮT BUỘC):
- KHÔNG dùng từ "lô", "đề", "lô đề".
- HÃY dùng: "loto", "cặp loto", "loto đặc biệt", "giải đặc biệt".

MỤC TIÊU: Dự đoán 5 cặp loto tiềm năng nhất cho ngày ${targetDate}.
MỤC TIÊU KPI: Phải trúng ít nhất 2 nháy trở lên (Tỷ lệ chính xác mong muốn >90%).

DỮ LIỆU ĐẦU VÀO:
${contextText}

LỊCH SỬ DỰ ĐOÁN TẦM NHÌN 3 NGÀY QUA:
${historyContext}

${dynamicInstructions}

BÀI HỌC & CHIẾN THUẬT QUYẾT ĐOÁN TỪ AI MENTOR:
${tacticalContext}

CẢNH BÁO TỪ CHUYÊN GIA GAN (KIỂM SOÁT RỦI RO):
Danh sách loto Gan cực cao (CẤM DỰ ĐOÁN VÀO NHỮNG SỐ NÀY): ${ganList}

NHIỆM VỤ:
1. TỔNG KẾT phong độ dựa trên lịch sử và áp dụng BÀI HỌC KINH NGHIỆM để điều chỉnh lựa chọn.
2. Tuyệt đối KHÔNG chọn các số trong danh sách CẢNH BÁO TỪ CHUYÊN GIA GAN.
3. TUÂN THỦ NGHIÊM NGẶT [CHIẾN THUẬT HIỆN TẠI]: Nếu chiến thuật yêu cầu "BẺ CẦU", bạn PHẢI phân tích ngoài lề và cấm chọn số dễ dãi.
4. Phân tích dữ liệu theo đúng chiến thuật và tìm ra 5 cặp loto nổ 2 nháy cao nhất.
5. Cảnh báo: Lệnh của AI Bậc thầy là tối thượng, tuyệt đối không được chống lệnh (vd Bậc thầy bảo loại đầu 6 thì hãy dẹp hết đầu 6).
6. Hãy chắc chắn rằng trong Json phần "top_evidence", bạn có CÂU TỰ SỰ GIẢI THÍCH (Ví dụ: "Hôm nay quyết định bẻ cầu không theo lối mòn cũ..." hoặc "Tiếp tục bám sát nhịp Bạc Nhớ đang ổn định...").

ĐỊNH DẠNG ĐẦU RA (JSON):
Trình bày TỪNG LOTO CỤ THỂ, VÍ DỤ: "01", KHÔNG TRÌNH BÀY KIỂU "12, 21". Trả về MỘT obect JSON duy nhất (không markdown wrapper nếu có thể, hoặc nằm trong block code json):
{
    "dan_loto": ["xx", "yy", "zz", "aa", "bb"],
    "confidence": 85,
    "analysis": {
        "summary": "Đoạn văn tổng kết. Phải nhắc đến việc hôm nay sẽ Bẻ Cầu hay Đánh Thuận Cầu dựa trên tỷ lệ trúng vừa qua.",
        "top_evidence": [
            "Lý do 1: Sự thay đổi tư duy so với ngày hôm qua (Bẻ cầu / Bám cầu).",
            "Lý do 2: Loto xx chọn vì (lý do khác biệt).",
            "Lý do 3: Dấu hiệu dị thường (nếu có)."
        ],
        "advice": "Lời khuyên ngắn gọn."
    }
}
            `;

            // 4. Call AI
            console.log('Asking Gemini for simplified analysis...');
            const rawResponse = await GeminiClient.generateContent(prompt);

            if (!rawResponse) throw new Error('Empty response from AI');

            // POST-PROCESSING SAFETY NET:
            // Replace any accidental "XSMN" or "Miền Nam" references with "XSMB" / "Miền Bắc"
            const aiResponse = rawResponse
                .replace(/XSMN/g, 'XSMB')
                .replace(/Miền Nam/g, 'Miền Bắc')
                .replace(/miền nam/g, 'miền bắc');

            // 5. Parse Response
            let predictedPairs = [];
            let confidence = 0;
            let analysisContent = aiResponse; // Default to raw if parse fails

            try {
                // Try to extract JSON
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const jsonStr = jsonMatch[0];
                    const data = JSON.parse(jsonStr);
                    predictedPairs = data.dan_loto || [];
                    confidence = data.confidence || 0;
                    // Store the WHOLE structured JSON string as analysis_content for frontend parsing
                    analysisContent = JSON.stringify(data);
                }
            } catch (e) {
                console.warn('Failed to parse AI JSON', e);
            }

            // 6. Save to DB
            await query(
                `INSERT INTO ai_predictions (draw_date, analysis_content, predicted_pairs, confidence_score, model_used)
                 VALUES (?, ?, ?, ?, ?)`,
                [targetDate, analysisContent, JSON.stringify(predictedPairs), confidence, 'gemini-2.5-flash']
            );

            console.log(`AI Prediction saved for ${targetDate}`);

            // Return result for API response
            return {
                targetDate,
                predictedPairs,
                confidence,
                analysisContent // Return the simplified JSON string
            };

        } catch (error) {
            console.error('AI Analysis Failed:', error);
            throw error; // Re-throw to let API handler catch it
        }
    }

    static async checkAccuracy(drawDate: string) {
        try {
            // 1. Get prediction (only if not already updated or missing result)
            // Skip if actual_result is already set (to avoid re-checking processed ones, 
            // unless we want to allow updates? Usually once set it's final. 
            // BUT for debugging, we might want to check if it's null)
            const prediction = await queryOne<any>(
                'SELECT id, predicted_pairs, actual_result FROM ai_predictions WHERE draw_date = ?',
                [drawDate]
            );

            if (!prediction) return;
            if (prediction.actual_result) return; // Already checked

            // 2. Get results
            const result = await queryOne<any>(
                'SELECT * FROM xsmb_results WHERE draw_date = ?',
                [drawDate]
            );

            if (!result) return;

            // STRICT CHECK: Ensure the result date matches the requested date
            // (Handling potential DB misconfiguration or lucky query matches)
            if (result.draw_date !== drawDate) {
                console.warn(`Mismatch date in checkAccuracy: Requested ${drawDate} but got result for ${result.draw_date}`);
                return;
            }

            // 3. Extract all loto numbers (last 2 digits)
            const winningLotos = new Set<string>();
            const prizeKeys = [
                'special_prize', 'prize_1', 'prize_2', 'prize_3',
                'prize_4', 'prize_5', 'prize_6', 'prize_7'
            ];

            prizeKeys.forEach(key => {
                const prizeData = result[key];
                if (!prizeData) return;

                try {
                    // Handle JSON array or single string
                    const prizes = prizeData.startsWith('[') ? JSON.parse(prizeData) : [prizeData];
                    prizes.forEach((p: any) => {
                        const s = String(p);
                        if (s.length >= 2) {
                            winningLotos.add(s.slice(-2));
                        }
                    });
                } catch (e) {
                    const s = String(prizeData);
                    if (s.length >= 2) winningLotos.add(s.slice(-2));
                }
            });

            // 4. Compare
            const predicted = JSON.parse(prediction.predicted_pairs || '[]');
            const matches = predicted.filter((num: string) => winningLotos.has(num));
            const isCorrect = matches.length > 0;

            // 5. Update DB
            await query(
                `UPDATE ai_predictions 
                 SET actual_result = ?, is_correct = ?, accuracy_notes = ?
                 WHERE id = ?`,
                [
                    Array.from(winningLotos).sort().join(','),
                    isCorrect ? 1 : 0,
                    isCorrect ? `Trúng ${matches.length}/${predicted.length} loto (${matches.join(', ')})` : 'Không trúng',
                    prediction.id
                ]
            );

            console.log(`Accuracy updated for ${drawDate}: ${isCorrect ? 'WIN' : 'FAIL'}`);

        } catch (error) {
            console.error(`Error checking accuracy for ${drawDate}:`, error);
        }
    }
}

