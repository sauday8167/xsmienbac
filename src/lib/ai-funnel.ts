import { query } from './db';
import { LotteryResultRaw, extractAllLotoNumbers } from './lottery-helpers';
import { getEvolvedBrain, saveAIPrediction, AIPersonality, AIWeights } from './ai-brain';

export interface FunnelStage {
    level: 1 | 2 | 3 | 4;
    name: string;
    description: string;
    count: number;
    numbers: FunnelNumber[];
}

export interface FunnelNumber {
    number: string;
    score: number;
    reasons: string[]; // Tại sao số này vượt qua vòng lọc?
    badges?: string[]; // VD: "Gan", "Rơi", "VIP", "Prime"
}

export interface AIFunnelResponse {
    date: string;
    personality: AIPersonality;
    reflectionLog: string[]; // Nhật ký suy luận của AI
    funnel: FunnelStage[];   // 4 giai đoạn lọc
    finalPrediction: string[]; // Top 5 cuối cùng
}

// Kiểm tra số nguyên tố
function isPrime(n: number): boolean {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

// Kiểm tra Fibonacci
const FIB_NUMS = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
function isFibonacci(n: number): boolean {
    return FIB_NUMS.includes(n);
}

/**
 * QUY TRÌNH PHỄU LỌC THÔNG MINH (GEN-NEXT 2.0)
 */
export async function generateFunnelPrediction(daysToAnalyze: number = 100): Promise<AIFunnelResponse> {
    const results = await query<LotteryResultRaw[]>(`
        SELECT * FROM xsmb_results 
        ORDER BY draw_date DESC 
        LIMIT ?
    `, [daysToAnalyze + 10]);

    if (results.length < 10) throw new Error("Cơ sở dữ liệu không đủ dữ liệu để AI phân tích.");

    // --- 🌍 AI BRAIN: Lựa chọn bộ não dựa trên tiến hóa ---
    const { personality, weights, log: brainLog } = await getEvolvedBrain();
    const aiLog = [...brainLog, `💬 Châm ngôn: "${personality.motto}"`];

    const latestResult = results[0];

    // Khởi tạo 100 con số ứng viên
    let candidates: (FunnelNumber & { rawFreq: number, rawGan: number })[] = [];

    for (let i = 0; i < 100; i++) {
        const numStr = i.toString().padStart(2, '0');
        let appearances = 0;
        let lastSeenIndex = -1;

        for (let j = 0; j < Math.min(results.length, daysToAnalyze); j++) {
            if (extractAllLotoNumbers(results[j]).includes(numStr)) {
                appearances++;
                if (lastSeenIndex === -1) lastSeenIndex = j;
            }
        }

        const gan = lastSeenIndex === -1 ? daysToAnalyze : lastSeenIndex;

        // --- 🧠 TÍNH TOÁN ĐIỂM SỐ THÔNG MINH (SMART SCORING) ---
        let score = 0;
        const reasons: string[] = [];

        // 1. Tần suất (Frequency)
        score += (appearances * weights.frequency);
        if (appearances > 25) reasons.push("Tần suất cực cao (Hot)");

        // 2. Độ Khan (Gan)
        if (personality.id === 'maverick') {
            score += (gan * weights.gan * 0.5); // Ma trận gan cho Kẻ độc hành
        } else {
            score += (gan > 10 ? 2 : 0) * weights.gan;
        }

        // 3. Toán học (Primality & Fibonacci)
        if (isPrime(i)) {
            score += weights.primality * 5;
            if (personality.id === 'mathematician') reasons.push("Số nguyên tố (Prime)");
        }
        if (isFibonacci(i)) {
            score += 3;
            if (personality.id === 'mathematician') reasons.push("Dãy Fibonacci");
        }

        // 4. Entropy & Chaos (Sự hỗn loạn)
        const creativeSpark = Math.random() * weights.chaos * 5;
        score += creativeSpark;
        if (creativeSpark > 3) reasons.push("Điểm sáng tạo AI");

        candidates.push({
            number: numStr,
            score: Number(score.toFixed(2)),
            reasons: reasons,
            badges: [],
            rawFreq: appearances,
            rawGan: gan
        });
    }

    // --- STAGE 1: QUÉT DIỆN RỘNG (Top 40) ---
    candidates.sort((a, b) => b.score - a.score);
    const stage1 = candidates.slice(0, 40);
    aiLog.push(`🚀 [GĐ 1] Sơ loại: Đã chọn ra 40 mã số có chỉ số IQ cao nhất theo tư duy của ${personality.name}.`);

    // --- STAGE 2: LỌC CẤU TRÚC (40 -> 20) ---
    const stage2 = stage1.filter((c, idx) => {
        const pass = idx < 20 || c.score > 15;
        if (pass) c.reasons.push("Vượt qua bộ lọc cấu trúc đầu-đuôi");
        return pass;
    }).slice(0, 20);
    aiLog.push(`🛡️ [GĐ 2] Lọc cấu trúc: Loại bỏ 20 số có mật độ nhiễu cao, giữ lại các số có 'kết cấu' bền vững.`);

    // --- STAGE 3: XÁC NHẬN XU HƯỚNG (20 -> 10) ---
    stage2.forEach(c => {
        let recentApps = 0;
        for (let k = 0; k < 10; k++) {
            if (extractAllLotoNumbers(results[k]).includes(c.number)) recentApps++;
        }
        c.score += recentApps * 2;
        c.reasons.push(`Nhịp sinh học 10 ngày: ${recentApps} lần xuất hiện`);
    });
    stage2.sort((a, b) => b.score - a.score);
    const stage3 = stage2.slice(0, 10);
    aiLog.push(`📈 [GĐ 3] Phân tích nhịp: Xác định 10 số đang ở 'điểm rơi' phong độ tốt nhất.`);

    // --- STAGE 4: HỘI TỤ TIN HOA (Top 5 VIP) ---
    const top5 = stage3.slice(0, 5);
    top5.forEach(c => {
        c.badges?.push("💎 VIP");
        if (personality.id === 'mathematician' && isPrime(parseInt(c.number))) c.badges?.push("Math");
        if (personality.id === 'maverick' && c.rawGan > 15) c.badges?.push("Rare");
    });
    aiLog.push(`👑 [GĐ 4] Hội tụ: Chốt danh sách 5 bộ số ưu tú nhất cho kỳ quay thưởng kế tiếp.`);

    // --- 💾 LƯU LẠI KÝ ỨC DỰ ĐOÁN ĐỂ HỌC TẬP ---
    const finalPrediction = top5.map(c => c.number);
    const nextDate = new Date(latestResult.draw_date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    await saveAIPrediction({
        draw_date: nextDateStr,
        personality_id: personality.id,
        prediction_type: 'funnel',
        predicted_numbers: finalPrediction,
        weights_used: weights
    });

    return {
        date: latestResult.draw_date,
        personality: personality,
        reflectionLog: aiLog,
        funnel: [
            { level: 1, name: "Sơ Loại", description: "Sàng lọc theo tư duy chủ đạo", count: 40, numbers: stage1 },
            { level: 2, name: "Cấu Trúc", description: "Đánh giá sự ổn định hình học", count: 20, numbers: stage2 },
            { level: 3, name: "Nhịp Độ", description: "Xác nhận đà tăng trưởng", count: 10, numbers: stage3 },
            { level: 4, name: "Hội Tụ", description: "Lựa chọn tinh hoa (Vùng VIP)", count: 5, numbers: top5 },
        ],
        finalPrediction: finalPrediction
    };
}
