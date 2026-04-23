import { OpenRouterClient } from './openrouter-client';
import { ContextProvider } from './context-provider';
import { query, queryOne } from '@/lib/db';
import { getLatestTacticalAdvice } from '../ai-learning';
import { calculateLoGan } from '@/lib/statistics';

export class AIAnalyst {
    static async runDailyAnalysis(customTargetDate?: string, mode: 'hoi-dong' | 'du-doan-3-số' = 'hoi-dong') {
        try {
            // Get Vietnam Date string reliably
            const now = new Date();
            const vnTime = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Ho_Chi_Minh',
                hour: 'numeric',
                hour12: false
            }).format(now);
            
            let targetDate = customTargetDate;
            if (!targetDate) {
                const dateObj = new Date(now);
                // Nếu sau 18:30 (giờ quay xong), dự đoán cho ngày mai
                if ((parseInt(vnTime) >= 19 && parseInt(vnTime) < 24)) { 
                    dateObj.setDate(dateObj.getDate() + 1);
                }
                targetDate = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).format(dateObj);
            }

            const modelKey = mode === 'hoi-dong' ? 'claude-3-haiku-hoi-dong' : 'claude-3-haiku-3-so';

            // 0. Update accuracy for previous days
            const vnDate = new Date(targetDate);
            for (let i = 1; i <= 3; i++) {
                const prevDate = new Date(vnDate);
                prevDate.setDate(prevDate.getDate() - i);
                const prevDateStr = prevDate.toISOString().split('T')[0];
                await this.checkAccuracy(prevDateStr);
            }

            // 0.5. Fetch History Context
            const historyRows = await query<any[]>(
                `SELECT draw_date, is_correct, accuracy_notes 
                 FROM ai_predictions 
                 WHERE draw_date < ? AND model_used = ?
                 ORDER BY draw_date DESC 
                 LIMIT 3`,
                [targetDate, modelKey]
            );

            let historyContext = "Chưa có dữ liệu lịch sử.";
            let recentHitRate = 100;

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

            // 0.5.5 Dynamic Strategy
            let dynamicInstructions = "";
            if (recentHitRate >= 60) {
                dynamicInstructions = `
[CHIẾN THUẬT: BẢO TOÀN PHONG ĐỘ]
Phong độ cực cao. Ưu tiên bám sát các cầu đang chạy ổn định (Aggregated Predictions).`;
            } else if (recentHitRate >= 40) {
                dynamicInstructions = `
[CHIẾN THUẬT: ĐÁNH THEO NHỊP CẦU THUẬN]
Phong độ ổn định. Kết hợp giữa Cầu Thuận và một ít Loto Rơi.`;
            } else if (recentHitRate >= 20) {
                dynamicInstructions = `
[CHIẾN THUẬT: TÌM ĐIỂM ĐẢO CHIỀU]
Phong độ đang giảm. Hãy tìm các cặp Rare Pairs và Loto Gan sắp nổ. Tránh các cầu quá nóng đang bị gãy.`;
            } else {
                dynamicInstructions = `
[CHIẾN THUẬT: BẺ CẦU TOÀN DIỆN / ĐỘT PHÁ]
CẢNH BÁO: Chuỗi trượt kéo dài. Bỏ qua các cầu truyền thống. Tập trung 100% vào các con số dị, hiếm gặp hoặc các nhịp biến động cực lớn ở Giải Đặc Biệt. Đã đến lúc phải thay đổi hoàn toàn tư duy chọn số.`;
            }

            // 0.6 Rules & Gan
            const [tacticalAdvice, loGan50] = await Promise.all([
                getLatestTacticalAdvice(),
                calculateLoGan(50, 60)
            ]);
            const ganList = loGan50.map((g: any) => g.number).join(', ');

            let tacticalContext = "Đang thu thập kinh nghiệm...";
            if (tacticalAdvice) {
                tacticalContext = `QUY TẮC VÀNG: ${tacticalAdvice.advice}\nMỨC ĐỘ RỦI RO: ${tacticalAdvice.risk_level}`;
            }

            // 1. Check existing
            const existing = await queryOne(
                `SELECT id FROM ai_predictions WHERE draw_date = ? AND model_used = ?`,
                [targetDate, modelKey]
            );
            if (existing) {
                console.log(`Prediction for ${targetDate} (${mode}) already exists.`);
                return;
            }

            // 2. Context
            const context = await ContextProvider.getDailyContext(targetDate, mode);
            const contextText = ContextProvider.formatContextForPrompt(context, mode);

            // 3. Prompt Configuration based on Mode
            const kpiTarget = mode === 'hoi-dong' ? '5 NHÁY' : '2 NHÁY';
            const lotoCount = mode === 'hoi-dong' ? 'ĐÚNG 10 CẶP/SỐ LOTO' : '3 SỐ LOTO DUY NHẤT';
            
            let ANALYST_PROMPT = `
VAI TRÒ: Bạn là "Claude Oracle" - Một hệ thống AI tối thượng chuyên giải mã các quy luật xác suất phức tạp của XSMB.
MỤC TIÊU: Đạt KPI "${kpiTarget}" thông qua việc phân tích "Mật độ xác suất" (Probability Density).

QUY TẮC TƯ DUY (BẮT BUỘC):
1. CHIẾN THUẬT ĐA DẠNG: Tuyệt đối không chọn dàn số quá tập trung vào một đầu/đuôi trừ khi có bằng chứng cực mạnh về "Dòng chảy con số" (Number Flow).
2. GIẢI MÃ NHIỄU: Phác họa sự khác biệt giữa "Số ảo" (ngẫu nhiên đơn thuần) và "Số có nhịp" (theo quy luật Bạc nhớ/Tần suất).
3. LẬP LUẬN ĐỐI NGHỊCH: Trước khi chọn một số, hãy tự hỏi "Tại sao số này có thể KHÔNG về?" và chỉ chọn nếu bằng chứng ủng hộ mạnh hơn rủi ro.

NHIỆM VỤ:
1. Phân tích 300-1000 ngày dữ liệu để tìm ra ${lotoCount}.
2. Ưu tiên các số có "Gia tốc tần suất" (Frequency Acceleration).
3. Sử dụng Rare Pairs để tạo đột phá nếu phong độ gần đây thấp hoặc đang cần "Bẻ cầu".
`;

            if (mode === 'du-doan-3-số') {
                ANALYST_PROMPT = `
VAI TRÒ: Bạn là "The Architect" - Chuyên gia giải mã các điểm kỳ dị (Singularities) trong chuỗi số ngẫu nhiên.
MỤC TIÊU: Trích xuất ${lotoCount} có xác suất nổ cao nhất thông qua "Phân tích Động lực học".

QUY TẮC TƯ DUY:
1. TOÁN HỌC KHÁNH KIỆT: Sử dụng Phương sai (Variance) và Độ lệch chuẩn để loại bỏ các số đang ở vùng "Quá nhiệt" nhưng sắp gãy.
2. TÌM KIẾM ĐỘT BIẾN: Tập trung vào các con số đang tích lũy năng lượng sau một chuỗi ngày câm hoặc gan nhẹ.
3. TỐI ƯU HÓA KPI: Mỗi con số được chọn phải có ít nhất 3 bằng chứng kỹ thuật (Bạc nhớ + Tần suất + Nhịp rơi) đồng quy.
`;
            }

            const prompt = `
${ANALYST_PROMPT}

DỮ LIỆU ĐẦU VÀO:
${contextText}

LỊCH SỬ THẮNG/THUA GẦN ĐÂY:
${historyContext}

[ĐIỀU PHỐI CHIẾN THUẬT]:
${dynamicInstructions}
${tacticalContext}
CẢNH BÁO LÔ GAN (Hạn chế chọn): ${ganList}

LƯU Ý QUAN TRỌNG: Hãy đảm bảo dàn số cuối cùng có sự phân bổ hợp lý, không bị lặp lại những sai lầm của những ngày thua cuộc gần đây.

ĐỊNH DẠNG JSON (BẮT BUỘC - KHÔNG ĐƯỢC SAI):
{
    "internal_reasoning": "Viết ít nhất 200 chữ về processes suy luận: So sánh các cầu đang chạy, lý do loại trừ các số rủi ro, và tại sao dàn số này lại tối ưu cho chiến thuật hiện tại. Hãy thể hiện tư duy chuyên gia.",
    "dan_loto": ["XX", "YY", ...], 
    "confidence": 95,
    "analysis": {
        "summary": "Tóm tắt chiến thuật ngắn gọn (VD: Đánh vào nhịp rơi của đầu 2 và đầu 5).",
        "top_evidence": [
            "Bằng chứng thống kê quan trọng nhất...",
            "Bằng chứng thứ hai..."
        ],
        "advice": "Lời khuyên thực tế cho người chơi ngày hôm nay."
    }
}
`;

            // 4. Call Claude
            console.log('Asking OpenRouter for high-precision analysis with reasoning...');
            const rawResponse = await OpenRouterClient.generateContent(prompt + "\n\nTRẢ VỀ JSON NGAY BÂY GIỜ:", 0.9);

            if (!rawResponse) throw new Error('Empty response from Claude');

            const aiResponse = rawResponse
                .replace(/XSMN/g, 'XSMB')
                .replace(/Miền Nam/g, 'Miền Bắc');

            // 5. Parse Response
            let predictedPairs: string[] = [];
            let confidence = 0;
            let analysisContent = aiResponse;

            try {
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const data = JSON.parse(jsonMatch[0]);
                    predictedPairs = data.dan_loto || [];
                    
                    // Backend Validation & Padding
                    if ((mode === 'hoi-dong' && predictedPairs.length < 10) || (mode === 'du-doan-3-số' && predictedPairs.length < 3)) {
                        const targetLen = mode === 'hoi-dong' ? 10 : 3;
                        console.warn(`AI returned only ${predictedPairs.length} numbers. Padding to ${targetLen}...`);
                        
                        const hot = (context.frequency?.hot_lotos || []).map((x: any) => x.number);
                        const rare = (context.rare_pairs || []).flatMap((x: any) => x.pair);
                        const fallback = ["00", "11", "22", "33", "44", "55", "66", "77", "88", "99"]; // Stable pairs
                        
                        // Mixed pool for padding
                        const pool = Array.from(new Set([...rare, ...hot, ...fallback]))
                            .filter(n => n && !predictedPairs.includes(n));
                        
                        while (predictedPairs.length < targetLen && pool.length > 0) {
                            // Pick semi-randomly from the top of the pool to ensure diversity
                            const idx = Math.floor(Math.random() * Math.min(pool.length, 5));
                            const n = pool.splice(idx, 1)[0];
                            if (n) predictedPairs.push(n);
                        }
                    }

                    confidence = data.confidence || 0;
                    analysisContent = JSON.stringify({ ...data, dan_loto: predictedPairs });
                }
            } catch (e) {
                console.warn('Failed to parse Claude JSON', e);
            }

            // 6. Save to DB
            await query(
                `INSERT OR REPLACE INTO ai_predictions (draw_date, analysis_content, predicted_pairs, confidence_score, model_used)
                 VALUES (?, ?, ?, ?, ?)`,
                [targetDate, analysisContent, JSON.stringify(predictedPairs), confidence, modelKey]
            );

            console.log(`AI Prediction (OpenRouter) saved for ${targetDate} - KPI: 5+ Hits`);

            return { targetDate, predictedPairs, confidence, analysisContent };

        } catch (error) {
            console.error('OpenRouter Analysis Failed:', error);
            throw error;
        }
    }

    static async checkAccuracy(drawDate: string) {
        try {
            const predictions = await query<any[]>(
                'SELECT id, predicted_pairs, actual_result, model_used FROM ai_predictions WHERE draw_date = ?',
                [drawDate]
            );

            if (!predictions || predictions.length === 0) return;

            const result = await queryOne<any>(
                'SELECT * FROM xsmb_results WHERE draw_date = ?',
                [drawDate]
            );

            if (!result || result.draw_date !== drawDate) return;

            const winningLotos = new Set<string>();
            const prizeKeys = ['special_prize', 'prize_1', 'prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'];

            prizeKeys.forEach(key => {
                const prizeData = result[key];
                if (!prizeData) return;
                try {
                    const prizes = prizeData.startsWith('[') ? JSON.parse(prizeData) : [prizeData];
                    prizes.forEach((p: any) => {
                        const s = String(p);
                        if (s.length >= 2) winningLotos.add(s.slice(-2));
                    });
                } catch (e) {
                    const s = String(prizeData);
                    if (s.length >= 2) winningLotos.add(s.slice(-2));
                }
            });

            for (const prediction of predictions) {
                if (prediction.actual_result) continue;

                const predicted = JSON.parse(prediction.predicted_pairs || '[]');
                const matches = predicted.filter((num: string) => winningLotos.has(num));
                
                // KPI differs based on model
                const isHoiDong = prediction.model_used === 'claude-3-haiku-hoi-dong';
                const isCorrect = isHoiDong ? (matches.length >= 5) : (matches.length >= 2); 

                await query(
                    `UPDATE ai_predictions 
                     SET actual_result = ?, is_correct = ?, accuracy_notes = ?
                     WHERE id = ?`,
                    [
                        Array.from(winningLotos).sort().join(','),
                        isCorrect ? 1 : 0,
                        isCorrect ? `Trúng ${matches.length}/${predicted.length} loto (${matches.join(', ')})` : `Chỉ trúng ${matches.length}/${predicted.length} loto`,
                        prediction.id
                    ]
                );

                console.log(`Accuracy updated for ${drawDate} [${prediction.model_used}]: ${isCorrect ? 'WIN' : 'FAIL'} (${matches.length} hits)`);
            }

        } catch (error) {
            console.error(`Error checking accuracy for ${drawDate}:`, error);
        }
    }
}

