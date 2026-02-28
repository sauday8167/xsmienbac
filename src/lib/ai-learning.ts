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
        loto_roi?: number;
        bac_nho?: number;
        bridges?: number;
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

    const prompt = `
Bạn là một Chuyên gia Cố vấn Chiến lược AI cao cấp cho Hội đồng Dự đoán XSMB.
MỤC TIÊU TỐI THƯỢNG: Đạt KPI ít nhất 2 nháy trúng (>= 2 con lô trúng) trong danh sách Top 5 VIP mỗi ngày.

Dưới đây là lịch sử hiệu suất 10 ngày qua của Hội đồng:
${JSON.stringify(performanceSummary, null, 2)}

Kết quả thực tế hôm nay (${date}): ${actualNumbers.join(', ')}

NHIỆM VỤ CỦA BẠN (TRUY TÌM NGUYÊN NHÂN & ĐỀ XUẤT):
1. PHÂN TÍCH THẤT BẠI: Tại sao Hội đồng chưa đạt KPI 2 nháy? Có phải do bị "bẫy" bởi các số gan, hay do thuật toán Bạc nhớ đang bị "loãng" trong chu kỳ này?
2. NHẬN DIỆN VÙNG ẢO: Xác định các đầu/đuôi nào đang có xu hướng "gãy" thống kê (thống kê cho ra rất nhiều nhưng thực tế không về).
3. DANH SÁCH ĐEN (Banned Numbers): Liệt kê các số cực kỳ rủi ro không được phép cho vào Top 5 ngày mai.
4. DANH SÁCH ƯU TIÊN (Preferred Numbers): Liệt kê 5-7 số có xác suất "nổ" cao nhất dựa trên nhịp rơi hiện tại.
5. ĐIỀU CHỈNH TRỌNG SỐ (Tactical Weights): Tăng/Giảm trọng số cho các yếu tố (frequency, gan, loto_roi, bac_nho) để tối ưu hóa bộ lọc.

HÃY TRẢ VỀ DẠNG JSON NGHIÊM NGẶT:
{
  "analysis": "Phân tích sâu sắc về nhịp độ thị trường và sai lầm của Hội đồng...",
  "tactical_adjustments": {
    "weights": { 
        "frequency": 1.0, 
        "gan": 0.5, 
        "loto_roi": 1.5, 
        "bac_nho": 1.3,
        "bridges": 1.2
    },
    "preferred_numbers": ["12", "34", ...],
    "banned_numbers": ["99", "00", ...],
    "advice": "Chiến thuật chốt hạ cho ngày mai...",
    "risk_level": "high | medium | low"
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
 * 3. LẤY LỊCH SỬ 10 NGÀY CHO UI (deduplicated – 1 entry per day)
 */
export async function getCouncilHistory(limit: number = 10) {
    try {
        await ensureTablesExist();
        return await query<any[]>(`
            SELECT e.draw_date, e.predicted_numbers, e.accuracy_score, e.created_at
            FROM ai_experience e
            INNER JOIN (
                SELECT draw_date, MAX(id) as max_id
                FROM ai_experience
                WHERE prediction_type = 'funnel'
                GROUP BY draw_date
            ) latest ON e.id = latest.max_id
            ORDER BY e.draw_date DESC
            LIMIT ?
        `, [limit]);
    } catch (e) {
        console.warn('getCouncilHistory: table not ready yet, returning empty');
        return [];
    }
}
