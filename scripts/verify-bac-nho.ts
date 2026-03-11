import 'dotenv/config';
import { query, queryOne } from '../src/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface LotteryResultRaw {
    draw_date: string;
    special_prize: string;
    prize_1: string;
    prize_2: string;
    prize_3: string;
    prize_4: string;
    prize_5: string;
    prize_6: string;
    prize_7: string;
}

function extractWinningNumbers(result: LotteryResultRaw): string[] {
    const numbers: string[] = [];
    const pushLast2 = (str: string) => {
        if (str && str.trim()) numbers.push(str.trim().slice(-2).padStart(2, '0'));
    };

    pushLast2(result.special_prize);
    pushLast2(result.prize_1);

    [result.prize_2, result.prize_3, result.prize_4, result.prize_5, result.prize_6, result.prize_7].forEach(prizeJson => {
        try {
            const arr = JSON.parse(prizeJson);
            if (Array.isArray(arr)) arr.forEach(n => pushLast2(n));
        } catch { }
    });

    return [...new Set(numbers)];
}

async function generateAiRules(
    predictedNumbers: any[],
    hitNumbers: string[],
    drawDate: string,
    pastRules: string
): Promise<string> {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return '';
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Bạn là AI chuyên học từ kết quả phân tích Bạc Nhớ XSMB.

Ngày: ${drawDate}
Hội Đồng đã dự đoán 10 số: ${predictedNumbers.map(n => `${n.number}(${n.tier})`).join(', ')}
Kết quả: ${hitNumbers.length > 0 ? `Trúng ${hitNumbers.length} số: ${hitNumbers.join(', ')}` : 'Không trúng số nào'}

Quy tắc đã học từ các ngày trước:
${pastRules || '(Chưa có)'}

Hãy viết NGẮN GỌN (3-5 điểm) bằng tiếng Việt:
1. Nhận xét về hiệu quả dự đoán hôm nay (tier nào cho kết quả tốt/xấu?)
2. Quy tắc mới được rút ra (nếu có)
3. Điều chỉnh gợi ý cho ngày mai (tier nào nên ưu tiên?)

Format: JSON có trường "analysis" (string) và "rules" (array of strings).`;

        const result = await model.generateContent(prompt);
        let content = result.response.text().trim();
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return content;
    } catch {
        return JSON.stringify({
            analysis: `Ngày ${drawDate}: Trúng ${hitNumbers.length} số.`,
            rules: hitNumbers.length >= 5
                ? ['Bộ số hôm nay hiệu quả cao (≥5 nháy).']
                : ['Cần theo dõi thêm để tìm quy tắc tốt hơn.']
        });
    }
}

async function verifyBacNho() {
    console.log(`[${new Date().toISOString()}] 🔍 Bắt đầu xác minh Hội Đồng Bạc Nhớ...`);

    // Get unverified predictions
    const unverified = await query<any[]>(`
        SELECT * FROM bac_nho_history 
        WHERE is_verified = 0 
        ORDER BY draw_date DESC 
        LIMIT 10
    `);

    if (!unverified || (unverified as any[]).length === 0) {
        console.log('✅ Không có bản ghi nào cần xác minh.');
        process.exit(0);
    }

    // Load past rules for Gemini context
    const pastRulesRows = await query<any[]>(`
        SELECT ai_rules FROM bac_nho_history 
        WHERE is_verified = 1 AND ai_rules IS NOT NULL 
        ORDER BY draw_date DESC LIMIT 10
    `);
    const pastRules = (pastRulesRows as any[] || []).map((r: any) => r.ai_rules).join('\n---\n').substring(0, 3000);

    for (const record of (unverified as any[])) {
        let dateQuery = record.draw_date;
        // Normalize date if stored as D/M/YYYY → YYYY-MM-DD
        if (dateQuery.includes('/')) {
            const [d, m, y] = dateQuery.split('/');
            dateQuery = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }

        console.log(`- Đang xác minh ngày ${record.draw_date} (query: ${dateQuery})...`);

        const result = await queryOne<LotteryResultRaw>(`SELECT * FROM xsmb_results WHERE draw_date = ?`, [dateQuery]);
        if (!result) {
            console.log(`  → Chưa có KQXS cho ngày ${record.draw_date}. Bỏ qua.`);
            continue;
        }

        const winningNumbers = extractWinningNumbers(result);
        const predictedNumbers: any[] = JSON.parse(record.predicted_numbers || '[]');
        
        const hitNumbers = predictedNumbers
            .map((n: any) => n.number)
            .filter((n: string) => winningNumbers.includes(n));

        const hitCount = hitNumbers.length;
        console.log(`  → Trúng ${hitCount}/10 số: ${hitNumbers.join(', ') || 'không có'}`);

        // Generate AI rules from this result
        const aiRulesRaw = await generateAiRules(predictedNumbers, hitNumbers, record.draw_date, pastRules);

        await query(`
            UPDATE bac_nho_history 
            SET hit_numbers = ?, hit_count = ?, is_verified = 1, ai_rules = ?
            WHERE id = ?
        `, [JSON.stringify(hitNumbers), hitCount, aiRulesRaw, record.id]);

        console.log(`  → Đã cập nhật DB. AI rules đã học.`);
    }

    console.log('✅ Xác minh Hội Đồng Bạc Nhớ hoàn tất.');
    process.exit(0);
}

verifyBacNho().catch(err => {
    console.error('❌ Lỗi:', err);
    process.exit(1);
});
