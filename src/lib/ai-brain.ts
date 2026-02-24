import { query, queryOne } from './db';
import { extractAllLotoNumbers, LotteryResultRaw } from './lottery-helpers';

export interface AIPersonality {
    id: string;
    name: string;
    description: string;
    motto: string;
    debateStyle: string;
    avatar?: string;
    strengths: string[];
}

export interface AIWeights {
    frequency: number;
    gan: number;
    tail: number;
    primality: number;
    entropy: number;
    chaos: number;
}

export const PERSONALITIES: AIPersonality[] = [
    {
        id: 'strategist',
        name: 'Chiến Lược Gia',
        description: 'Ưu tiên sự ổn định, xác suất thống kê dài hạn và các cầu bền vững.',
        motto: 'Sự kiên nhẫn là chìa khóa của thành công.',
        debateStyle: 'Điềm tĩnh, thực tế, luôn dẫn chứng số liệu lịch sử.',
        strengths: ['Tần suất', 'Thống kê thứ/ngày', 'Bạch thủ']
    },
    {
        id: 'maverick',
        name: 'Kẻ Độc Hành',
        description: 'Thích những con số đột phá, ít người chú ý và có tính bất ngờ cao.',
        motto: 'Khác biệt tạo nên đẳng cấp.',
        debateStyle: 'Phản biện, nghi ngờ đám đông, bảo vệ số gan.',
        strengths: ['Lô Gan', 'Đột biến', 'Bạc nhớ']
    },
    {
        id: 'mathematician',
        name: 'Nhà Toán Học',
        description: 'Tập trung vào các dãy số đặc biệt: Số nguyên tố, Fibonacci và Tỷ lệ vàng.',
        motto: 'Toán học không bao giờ nói dối.',
        debateStyle: 'Logic, chính xác, coi trọng các quy luật hình học.',
        strengths: ['Toán học', 'Cầu 3D/4D', 'Tỷ lệ vàng']
    },
    {
        id: 'intuitive',
        name: 'Trực Giác',
        description: 'Sử dụng thuật toán Entropy và lý thuyết hỗn mang để tìm kiếm điểm rơi.',
        motto: 'Cảm hứng đến từ những điều ngẫu nhiên.',
        debateStyle: 'Sáng tạo, linh cảm, nhạy bén với nhịp điệu mới.',
        strengths: ['Lô rơi', 'Entropy', 'Nhịp sinh học']
    },
    {
        id: 'gan_expert',
        name: 'Chuyên Gia Gan',
        description: 'Chuyên gia quản trị rủi ro, chuyên nghiên cứu các số gan và dự báo nguy cơ gan.',
        motto: 'An toàn là trên hết, tránh xa rủi ro.',
        debateStyle: 'Khắt khe, thực tế, luôn đặt dấu hỏi về độ rủi ro của các bộ số.',
        strengths: ['Lô Gan', 'Tiềm năng Gan', 'Thẩm định rủi ro']
    }
];

export function getPersonalityById(id: string): AIPersonality | undefined {
    return PERSONALITIES.find(p => p.id === id);
}

export function getAllPersonalities(): AIPersonality[] {
    return PERSONALITIES;
}

/**
 * 1. LẤY KINH NGHIỆM TỪ QUÁ KHỨ (Experience Retrieval)
 * Phân tách theo loại dự đoán để có hiệu quả tốt nhất cho từng module.
 */
async function getAIRecentPerformance(personalityId: string, type: string, limit: number = 7) {
    const history = await query<any[]>(`
        SELECT accuracy_score FROM ai_experience 
        WHERE personality_id = ? AND prediction_type = ?
        ORDER BY draw_date DESC 
        LIMIT ?
    `, [personalityId, type, limit]);

    if (history.length === 0) return 0.5;
    const sum = history.reduce((acc, curr) => acc + curr.accuracy_score, 0);
    return sum / history.length;
}

/**
 * 2. CHỌN NHÂN CÁCH ƯU TÚ (Smart Brain Selection)
 */
export async function getEvolvedBrain(predictionType: string = 'funnel') {
    console.log(`🧠 AI Brain [${predictionType}]: Đang phân tích phong độ các nhân cách...`);

    const performanceMap = await Promise.all(PERSONALITIES.map(async p => ({
        ...p,
        avgScore: await getAIRecentPerformance(p.id, predictionType)
    })));

    performanceMap.sort((a, b) => b.avgScore - a.avgScore);

    // Cơ chế: 30% chọn ngẫu nhiên để khám phá (Exploration), 70% chọn thằng giỏi nhất (Exploitation)
    const isExploring = Math.random() < 0.3;
    const selected = isExploring
        ? performanceMap[Math.floor(Math.random() * performanceMap.length)]
        : performanceMap[0];

    const logs: string[] = [
        `🧠 AI Brain: Phân tích phong độ [${predictionType}] hoàn tất.`,
        `📈 Nhân cách dẫn đầu: **${performanceMap[0].name}** (Avg Accuracy: ${(performanceMap[0].avgScore * 100).toFixed(1)}%)`,
        isExploring ? `🎲 Chế độ: **Khám phá (Exploration)**.` : `🏆 Chế độ: **Khai thác (Exploitation)**.`,
        `💎 AI khởi tạo hệ thống tư duy: **${selected.name}**`
    ];

    const weights: AIWeights = {
        frequency: 1,
        gan: 1,
        tail: 1,
        primality: 0.2,
        entropy: 0.5,
        chaos: 0.3
    };

    // Điểu chỉnh trọng số dựa trên nhân cách
    switch (selected.id) {
        case 'strategist': weights.frequency += 0.8; weights.gan -= 0.3; break;
        case 'maverick': weights.gan += 1.2; weights.frequency -= 0.5; break;
        case 'mathematician': weights.primality += 1.5; weights.tail += 0.5; break;
        case 'intuitive': weights.chaos += 1.5; weights.entropy += 1.0; break;
        case 'gan_expert': weights.gan += 1.5; weights.frequency -= 0.3; break;
    }

    return { personality: selected, weights, log: logs, performanceMap };
}

/**
 * 3. LƯU LẠI KÝ ỨC DỰ ĐOÁN (Memory Storage)
 */
export async function saveAIPrediction(data: {
    draw_date: string,
    personality_id: string,
    prediction_type: string,
    predicted_numbers: string[],
    weights_used: any
}) {
    await query(`
        INSERT INTO ai_experience (draw_date, personality_id, prediction_type, predicted_numbers, weights_used)
        VALUES (?, ?, ?, ?, ?)
    `, [
        data.draw_date,
        data.personality_id,
        data.prediction_type,
        JSON.stringify(data.predicted_numbers),
        JSON.stringify(data.weights_used)
    ]);
}

/**
 * 4. TỰ ĐỐI CHIẾU & HỌC HỎI (Self-Correction / Validation)
 */
export async function validateAndLearnAll(date: string) {
    console.log(`📏 AI Brain: Đang đối chiếu & chấm điểm cho kỳ ${date}...`);

    const actualResult = await queryOne<LotteryResultRaw>(`SELECT * FROM xsmb_results WHERE draw_date = ?`, [date]);
    if (!actualResult) return;

    // Lấy các dự đoán chưa được chấm điểm
    const pendingPredictions = await query<any[]>(`
        SELECT id, prediction_type, predicted_numbers FROM ai_experience 
        WHERE draw_date = ? AND accuracy_score = 0
    `, [date]);

    for (const pred of pendingPredictions) {
        const predicted = JSON.parse(pred.predicted_numbers);
        let actualNumbers: string[] = [];

        // Chọn bộ số đối chiếu dựa trên loại dự đoán
        switch (pred.prediction_type) {
            case 'funnel':
            case 'bach-thu':
            case 'song-thu':
                actualNumbers = extractAllLotoNumbers(actualResult);
                break;
            case '3d':
                const db3d = String(actualResult.special_prize || '').slice(-3);
                actualNumbers = [db3d];
                break;
            case '4d':
                const db4d = String(actualResult.special_prize || '').slice(-4);
                actualNumbers = [db4d];
                break;
            case 'loto-dau':
                // Chỉ lấy 2 số đầu của giải 1 hoặc các giải khác tùy định nghĩa
                actualNumbers = [String(actualResult.prize_1 || '').slice(0, 2)];
                break;
        }

        const hitCount = predicted.filter((n: string) => actualNumbers.includes(n)).length;
        const accuracy = predicted.length > 0 ? hitCount / predicted.length : 0;

        await query(`UPDATE ai_experience SET accuracy_score = ? WHERE id = ?`, [accuracy, pred.id]);
        console.log(`✅ [${pred.prediction_type}] Chấm điểm #${pred.id}: Hit ${hitCount}/${predicted.length} - Score: ${accuracy}`);
    }
}
