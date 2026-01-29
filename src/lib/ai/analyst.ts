import { GeminiClient } from './gemini-client';
import { ContextProvider } from './context-provider';
import { query, queryOne } from '@/lib/db';

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
            if (historyRows.length > 0) {
                historyContext = historyRows.map(row => {
                    const date = new Date(row.draw_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                    const status = row.is_correct === 1 ? 'TRÚNG' : 'TRƯỢT';
                    const note = row.accuracy_notes || '';
                    return `- Ngày ${date}: ${status} (${note})`;
                }).join('\n');
            }

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
            const prompt = `
VAI TRÒ: Bạn là Chuyên gia Xổ số Miền Bắc (XSMB) với phong cách phân tích KHOA HỌC, NGẮN GỌN và DỄ HIỂU.
TUYỆT ĐỐI KHÔNG nhắc đến "XSMN", "Miền Nam", "Xổ số Miền Nam". Bạn chỉ phân tích duy nhất đài MIỀN BẮC.

QUY TẮC TỪ NGỮ (BẮT BUỘC):
- KHÔNG dùng từ "lô", "đề", "lô đề".
- HÃY dùng: "loto", "cặp loto", "loto đặc biệt", "giải đặc biệt".

MỤC TIÊU: Dự đoán 5 cặp loto tiềm năng nhất cho ngày ${targetDate}.

DỮ LIỆU ĐẦU VÀO:
${contextText}

LỊCH SỬ DỰ ĐOÁN 3 NGÀY QUA:
${historyContext}

NHIỆM VỤ:
1. TỔNG KẾT NGẮN GỌN phong độ dự đoán trong 3 ngày qua dựa trên "LỊCH SỬ DỰ ĐOÁN" ở trên. Nêu rõ ngày nào trúng, trúng số nào.
2. Phân tích dữ liệu để tìm ra 5 cặp loto có xác suất về cao nhất hôm nay.
3. Giải thích lý do chọn lựa một cách đơn giản (Bạc nhớ, Tần suất, Cầu chạy).
4. Đưa ra lời khuyên quản lý vốn ngắn gọn.

ĐỊNH DẠNG ĐẦU RA (JSON):
Trả về MỘT obect JSON duy nhất (không markdown wrapper nếu có thể, hoặc nằm trong block code json):
{
    "dan_loto": ["xx", "yy", "zz", "aa", "bb"],
    "confidence": 85,
    "analysis": {
        "summary": "Đoạn văn tổng kết lịch sử 3 ngày qua và nhận định thị trường hôm nay. Ví dụ: 'Phong độ 3 ngày qua rất tốt với 2 ngày trúng. Hôm nay cầu đang chạy đều ở đầu 6...'",
        "top_evidence": [
            "Lý do 1: Loto xx là loto rơi từ giải Đặc biệt hôm qua.",
            "Lý do 2: Cặp yy-zz đang ở nhịp về nhiều.",
            "Lý do 3: Theo bạc nhớ, khi có aa thì thường ra bb."
        ],
        "advice": "Lời khuyên ngắn gọn. Ví dụ: Nên vào tiền đều tay cho 3 loto đầu, lót nhẹ 2 loto sau."
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

