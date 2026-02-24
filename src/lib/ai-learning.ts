import { query, queryOne } from './db';
import { GeminiClient } from './ai/gemini-client';
import { extractAllLotoNumbers } from './lottery-helpers';

/**
 * Tự động tạo các bảng cần thiết nếu chưa tồn tại.
 * Gọi trước bất kỳ query nào để tránh crash khi chưa migrate.
 */
async function ensureTablesExist() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS ai_experience (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draw_date TEXT NOT NULL,
                personality_id TEXT NOT NULL,
                prediction_type TEXT NOT NULL,
                predicted_numbers TEXT NOT NULL,
                weights_used TEXT,
                accuracy_score REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await query(`
            CREATE TABLE IF NOT EXISTS ai_lessons_learned (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draw_date TEXT NOT NULL,
                personality_id TEXT NOT NULL,
                analysis TEXT NOT NULL,
                tactical_adjustments TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await query(`CREATE INDEX IF NOT EXISTS idx_ai_exp_date ON ai_experience(draw_date)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_ai_lessons_date ON ai_lessons_learned(draw_date)`);
    } catch (e) {
        // Bỏ qua nếu index đã tồn tại
    }
}

export interface TacticalAdjustment {
    weights: {
        frequency?: number;
        gan?: number;
        tail?: number;
        primality?: number;
        entropy?: number;
        chaos?: number;
    };
    preferred_numbers?: string[];
    banned_numbers?: string[];
    risk_level: 'low' | 'medium' | 'high';
    advice: string;
}

/**
 * 1. TỔNG KẾT VÀ HỌC TẬP (Feedback Loop)
 * Chạy sau mỗi kỳ quay để Gemini phân tích dữ liệu 10 ngày qua.
 */
export async function generateDailyCouncilLessons(date: string) {
    console.log(`🎓 AI Learning: Bắt đầu phân tích lịch sử 10 ngày tính đến ${date}...`);

    // Lấy kết quả thực tế của kỳ gần nhất
    const actualResult = await queryOne<any>(`SELECT * FROM xsmb_results WHERE draw_date = ?`, [date]);
    if (!actualResult) {
        console.warn(`⚠️ AI Learning: Không tìm thấy kết quả cho ngày ${date}. Hủy bỏ học tập.`);
        return null;
    }

    const actualNumbers = extractAllLotoNumbers(actualResult);

    // Lấy lịch sử 10 ngày gần nhất của Hội đồng (prediction_type = 'funnel')
    const history = await query<any[]>(`
        SELECT * FROM ai_experience 
        WHERE prediction_type = 'funnel' 
        ORDER BY draw_date DESC 
        LIMIT 10
    `);

    if (history.length === 0) {
        console.warn('⚠️ AI Learning: Không có lịch sử dự đoán để phân tích.');
        return null;
    }

    // So sánh và tính toán tỷ lệ trúng thực tế cho 10 ngày qua
    const performanceSummary = history.map(h => {
        const predicted = JSON.parse(h.predicted_numbers);
        const hits = predicted.filter((n: string) => actualNumbers.includes(n));
        return {
            date: h.draw_date,
            predicted,
            hits,
            hitRate: hits.length
        };
    });

    // Tạo prompt cho Gemini phân tích
    const prompt = `
Bạn là một Chuyên gia Cố vấn AI cao cấp cho Hội đồng Dự đoán Xổ số Miền Bắc (XSMB).
Mục tiêu của Hội đồng là trúng ít nhất 2 nháy trở lên mỗi kỳ (>90% độ tin cậy hội tụ).

Dưới đây là lịch sử 10 ngày gần nhất của Hội đồng:
${JSON.stringify(performanceSummary, null, 2)}

Dữ liệu kết quả thực tế hôm nay (${date}): ${actualNumbers.join(', ')}

NHIỆM VỤ CỦA BẠN:
1. Phân tích tại sao Hội đồng lại trượt hoặc trúng ít trong các ngày qua.
2. Tìm ra quy luật "sai lầm" lặp đi lặp lại (ví dụ: bị "bẫy" bởi các số gan, hoặc quá tin vào tần suất).
3. Đề xuất điều chỉnh trọng số (Weights) kỹ thuật cho ngày mai để tối ưu hóa tỷ lệ trúng.
4. Dự báo các vùng số (Heads/Tails) đang có xu hướng "ảo" (ảo là kết quả thực tế khác xa thống kê).

HÃY TRẢ VỀ KẾT QUẢ DƯỚI DẠNG JSON NHƯ SAU:
{
  "analysis": "Chuỗi văn bản phân tích chuyên sâu...",
  "tactical_adjustments": {
    "weights": { "frequency": 1.2, "gan": 0.8, ... },
    "advice": "Lời khuyên chiến thuật ngắn gọn...",
    "risk_level": "medium"
  }
}
`;

    try {
        const aiResponse = await GeminiClient.generateContent(prompt);
        if (!aiResponse) return null;

        // Trích xuất JSON từ phản hồi (đôi khi AI trả về markdown code block)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const lessonData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        if (lessonData) {
            await query(`
                INSERT INTO ai_lessons_learned (draw_date, personality_id, analysis, tactical_adjustments)
                VALUES (?, 'council', ?, ?)
            `, [date, lessonData.analysis, JSON.stringify(lessonData.tactical_adjustments)]);

            console.log(`✅ AI Learning: Đã lưu bài học cho kỳ ${date}.`);
            return lessonData;
        }
    } catch (error) {
        console.error('❌ AI Learning Error:', error);
    }
    return null;
}

/**
 * 2. LẤY CHIẾN THUẬT MỚI NHẤT
 */
export async function getLatestTacticalAdvice(): Promise<TacticalAdjustment | null> {
    try {
        await ensureTablesExist();
        const latest = await queryOne<any>(`
            SELECT * FROM ai_lessons_learned 
            WHERE personality_id = 'council' 
            ORDER BY draw_date DESC 
            LIMIT 1
        `);
        if (!latest) return null;
        return JSON.parse(latest.tactical_adjustments);
    } catch (e) {
        console.warn('getLatestTacticalAdvice: table not ready yet, returning null');
        return null;
    }
}

/**
 * 3. LẤY LỊCH SỬ 10 NGÀY CHO UI
 */
export async function getCouncilHistory(limit: number = 10) {
    try {
        await ensureTablesExist();
        return await query<any[]>(`
            SELECT draw_date, predicted_numbers, accuracy_score, created_at
            FROM ai_experience
            WHERE prediction_type = 'funnel'
            ORDER BY draw_date DESC
            LIMIT ?
        `, [limit]);
    } catch (e) {
        console.warn('getCouncilHistory: table not ready yet, returning empty');
        return [];
    }
}
