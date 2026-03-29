import { ClaudeClient } from './claude-client';
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
            if (recentHitRate >= 40) {
                dynamicInstructions = `
[CHIẾN THUẬT HIỆN TẠI: ĐÁNH THEO NHỊP CẦU THUẬN]
Phong độ đang TỐT. Ưu tiên hội tụ chuyên sâu.`;
            } else {
                dynamicInstructions = `
[CHIẾN THUẬT HIỆN TẠI: CHỐT SỐ RỦI RO / BẺ CẦU]
CẢNH BÁO: Phong độ đang thấp. Tìm kiếm dấu hiệu đảo chiều, lô gan hoặc giải đặc biệt biến động.`;
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
VAI TRÒ: Bạn là Claude - Chuyên gia phân tích dữ liệu XSMB cấp cao.
MỤC TIÊU TỐI THƯỢNG: Chốt dàn loto nổ từ ${kpiTarget} trở lên.
PHONG CÁCH: Quyết đoán, chuyên nghiệp, sắc bén. Ngôn ngữ tự nhiên.

NHIỆM VỤ:
1. Phân tích dữ liệu từ các nguồn Bạc Nhớ chuyên sâu.
2. Tìm ra ĐÚNG 10 CẶP/SỐ LOTO có khả năng nổ cao nhất, mục tiêu "${kpiTarget}". 
3. TUYỆT ĐỐI KHÔNG TRẢ VỀ THIẾU. NẾU KHÔNG ĐỦ 10 SỐ ĐẸP, HÃY CHỌN CÁC SỐ TIỀM NĂNG TIẾP THEO TRONG BẠC NHỚ.
4. GIẢI THÍCH logic "Bẻ cầu" hoặc "Thuận cầu" cực kỳ thuyết phục cho dàn số này.
5. QUAN TRỌNG: CHỈ TRẢ VỀ JSON, KHÔNG CÓ LỜI DẪN, KHÔNG CÓ CHÀO HỎI.
`;

            if (mode === 'du-doan-3-số') {
                ANALYST_PROMPT = `
VAI TRÒ: Bạn là Claude - Kỹ sư Thuật Toán Xác Suất & Machine Learning chuyên sâu về Xổ Số.
MỤC TIÊU TỐI THƯỢNG: Trích xuất chính xác ${lotoCount} có Động lượng (Momentum) và Phân phối kỳ vọng (Expected Distribution) cao nhất để đạt KPI "${kpiTarget}".
PHONG CÁCH: Khoa học dữ liệu, lập luận thuần túy bằng toán học, xác suất, độ trễ lô gan chuẩn và nhịp xung lực. TUYỆT ĐỐI KHÔNG dùng từ ngữ dân gian như "Bạc nhớ", "Cầu kèo", "Tâm linh", "Thuận/Bẻ cầu".

NHIỆM VỤ:
1. Đánh giá Tần suất Vĩ mô (Frequency Over 30-50 days) để tìm các Loto đang có gia tốc rơi mạnh nhất. Ngược lại, tính toán độ trễ (Standard Deviation) của các Loto Gan để bắt điểm nổ (Breakout point).
2. Tích hợp số liệu Loto Rơi, chu kỳ Giải Đặc Biệt/Giải Nhất vào mô hình toán học (Markov Chain / Regression) của bạn để loại trừ nhiễu.
3. Chốt ĐÚNG 3 SỐ LOTO DUY NHẤT.
4. Phần "summary" / "advice": Lập luận thuyết phục người xem bằng ngôn ngữ kỹ thuật học thống kê (động lượng phân phối, điểm bùng nổ xác suất, phương sai hẹp...). Thuyết phục hoàn toàn bằng số liệu.
5. QUAN TRỌNG: CHỈ TRẢ VỀ JSON.
`;
            }

            const prompt = `
${ANALYST_PROMPT}

DỮ LIỆU ĐẦU VÀO:
${contextText}

LỊCH SỬ THẮNG/THUA:
${historyContext}

${dynamicInstructions}
${tacticalContext}
CẢNH BÁO LÔ GAN: ${ganList}

ĐỊNH DẠNG JSON:
{
    "dan_loto": ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"], 
    "confidence": 95,
    "analysis": {
        "summary": "Phân tích vì sao dàn này sẽ nổ ${kpiTarget} dựa trên thống kê xác suất, động lượng (momentum), và quy luật phân phối.",
        "top_evidence": [
            "Lý do chọn loto bằng thông số toán học...",
            "Dấu hiệu đạt ngưỡng bùng nổ..."
        ],
        "advice": "Lời khuyên quản trị rủi ro & thuật toán hiện tại."
    }
}
`;

            // 4. Call Claude
            console.log('Asking Claude for high-precision analysis...');
            const rawResponse = await ClaudeClient.generateContent(prompt + "\n\nTRẢ VỀ JSON NGAY BÂY GIỜ:");

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
                    if (mode === 'hoi-dong' && predictedPairs.length < 10) {
                        console.warn(`AI returned only ${predictedPairs.length} numbers. Padding to 10...`);
                        const allAvailable = [
                            ...(context.bac_nho?.so_don?.map((x: any) => x.predictions?.[0]?.number) || []),
                            ...(context.frequency?.hot_lotos?.map((x: any) => x.number) || [])
                        ].filter(n => n && !predictedPairs.includes(n));
                        
                        while (predictedPairs.length < 10 && allAvailable.length > 0) {
                            const n = allAvailable.shift();
                            if (n) predictedPairs.push(n);
                        }
                    } else if (mode === 'du-doan-3-số' && predictedPairs.length < 3) {
                         // Similar padding for 3-so if needed
                         const fallback = ["79", "33", "52"].filter(n => !predictedPairs.includes(n));
                         while (predictedPairs.length < 3 && fallback.length > 0) {
                             const n = fallback.shift();
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

            console.log(`AI Prediction (Claude) saved for ${targetDate} - KPI: 5+ Hits`);

            return { targetDate, predictedPairs, confidence, analysisContent };

        } catch (error) {
            console.error('Claude Analysis Failed:', error);
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

