import 'dotenv/config';
import path from 'path';
import { query, queryOne } from '../src/lib/db';
import { analyzeBacNhoSoDon } from '../src/lib/bac-nho-so-don';
import { analyzeBacNhoCap2 } from '../src/lib/bac-nho-cap-2';
import { analyzeBacNhoCap3 } from '../src/lib/bac-nho-cap-3';
import { analyzeBacNhoSoDonKhung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-so-don';
import { GoogleGenerativeAI } from '@google/generative-ai';

const WEIGHTS = {
    soDon: 0.35,
    khung3Ngay: 0.25,
    cap2: 0.20,
    cap3: 0.20,
};

async function getAiRulesFromHistory(): Promise<string> {
    try {
        const recent = await query<any[]>(
            `SELECT ai_rules FROM bac_nho_history WHERE is_verified = 1 AND ai_rules IS NOT NULL ORDER BY draw_date DESC LIMIT 30`
        );
        if (!recent || recent.length === 0) return '';
        const rules = (recent as any[]).map((r: any) => r.ai_rules).join('\n---\n').substring(0, 5000);
        return rules;
    } catch {
        return '';
    }
}

async function buildScoreMap(): Promise<Map<string, number>> {
    const scoreMap = new Map<string, number>();
    for (let i = 0; i < 100; i++) {
        scoreMap.set(i.toString().padStart(2, '0'), 0);
    }

    // Source 1: Số Đơn (35%)
    try {
        const data = await analyzeBacNhoSoDon(120);
        data.todayPredictions.forEach(tp => {
            tp.predictions.forEach(p => {
                const cur = scoreMap.get(p.number) || 0;
                scoreMap.set(p.number, cur + p.correlationRate * WEIGHTS.soDon);
            });
        });
        console.log(`  ✅ Nguồn 1 (Số Đơn): ${data.todayPredictions.length} trigger hôm qua`);
    } catch (e: any) {
        console.warn('  ⚠️ Nguồn 1 lỗi:', e.message);
    }

    // Source 2: Khung 3 Ngày (25%)
    try {
        const data = await analyzeBacNhoSoDonKhung3Ngay(120);
        data.todayPredictions.forEach(tp => {
            tp.predictions.forEach(p => {
                const cur = scoreMap.get(p.number) || 0;
                scoreMap.set(p.number, cur + p.correlationRate * WEIGHTS.khung3Ngay);
            });
        });
        console.log(`  ✅ Nguồn 2 (Khung 3 Ngày): ${data.todayPredictions.length} trigger hôm qua`);
    } catch (e: any) {
        console.warn('  ⚠️ Nguồn 2 lỗi:', e.message);
    }

    // Source 3: Cặp 2 (20%)
    try {
        const data = await analyzeBacNhoCap2(120);
        data.todayPredictions.forEach(tp => {
            tp.predictions.forEach(p => {
                const cur = scoreMap.get(p.number) || 0;
                scoreMap.set(p.number, cur + p.correlationRate * WEIGHTS.cap2);
            });
        });
        console.log(`  ✅ Nguồn 3 (Cặp 2): ${data.todayPredictions.length} cặp trigger`);
    } catch (e: any) {
        console.warn('  ⚠️ Nguồn 3 lỗi:', e.message);
    }

    // Source 4: Cặp 3 (20%)
    try {
        const data = await analyzeBacNhoCap3(120);
        data.todayPredictions.forEach(tp => {
            tp.predictions.forEach(p => {
                const cur = scoreMap.get(p.number) || 0;
                scoreMap.set(p.number, cur + p.correlationRate * WEIGHTS.cap3);
            });
        });
        console.log(`  ✅ Nguồn 4 (Cặp 3): ${data.todayPredictions.length} cặp trigger`);
    } catch (e: any) {
        console.warn('  ⚠️ Nguồn 4 lỗi:', e.message);
    }

    return scoreMap;
}

async function generateAnalysisContent(top10: any[], aiRules: string): Promise<string> {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return 'Chưa có API Key để phân tích sâu.';
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Bạn là AI chuyên phân tích xổ số XSMB dựa trên thống kê Bạc Nhớ.

Top 10 số được Hội Đồng Bạc Nhớ chọn hôm nay (sorted by score):
${top10.map((n, i) => `${i + 1}. Số ${n.number} - Điểm: ${n.score.toFixed(2)} - Nhóm: ${n.tier}`).join('\n')}

Quy tắc đã học từ 30 ngày gần nhất:
${aiRules || '(Chưa có dữ liệu học)'}

Hãy viết một đoạn tóm tắt NGẮN GỌN (3-5 câu) bằng tiếng Việt, giải thích tại sao các nhóm số này được chọn và chiến thuật đề xuất cho người dùng. Không liệt kê lại số.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e: any) {
        return `Phân tích tự động đang xử lý. Top số hôm nay được tổng hợp từ 4 nguồn Bạc Nhớ với trọng số khác nhau.`;
    }
}

async function fetchBacNho() {
    console.log(`[${new Date().toISOString()}] 🧠 Bắt đầu tính toán Hội Đồng Bạc Nhớ...`);

    const todayVN = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // Check duplicate
    const existing = await queryOne<any>(`SELECT id FROM bac_nho_history WHERE draw_date = ?`, [todayVN]);
    if (existing) {
        console.log(`ℹ️ Đã có dữ liệu cho ngày ${todayVN}. Ghi đè...`);
    }

    console.log('📊 Đang tổng hợp điểm từ 4 nguồn Bạc Nhớ...');
    const scoreMap = await buildScoreMap();

    // Rank all numbers
    const ranked = Array.from(scoreMap.entries())
        .map(([number, score]) => ({ number, score }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);

    // Assign tiers and take top 10
    const top10 = ranked.slice(0, 10).map((item, idx) => ({
        ...item,
        tier: idx < 3 ? 'main' : idx < 7 ? 'potential' : 'support',
        rank: idx + 1,
    }));

    console.log(`🏆 Top 10 số: ${top10.map(n => n.number).join(', ')}`);

    // Load historical AI rules for context
    const aiRules = await getAiRulesFromHistory();

    // Generate analysis with Gemini
    console.log('🤖 Đang tạo phân tích bằng Gemini...');
    const analysisContent = await generateAnalysisContent(top10, aiRules);

    // Score breakdown (top 20 for reference)
    const scoreBreakdown = ranked.slice(0, 20);

    // Save to DB
    await query(`
        INSERT INTO bac_nho_history (draw_date, predicted_numbers, score_breakdown, analysis_content, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(draw_date) DO UPDATE SET
            predicted_numbers = excluded.predicted_numbers,
            score_breakdown = excluded.score_breakdown,
            analysis_content = excluded.analysis_content,
            is_verified = 0,
            hit_numbers = NULL,
            hit_count = 0
    `, [todayVN, JSON.stringify(top10), JSON.stringify(scoreBreakdown), analysisContent]);

    console.log(`✅ Đã lưu dữ liệu Hội Đồng Bạc Nhớ cho ngày ${todayVN}`);
    process.exit(0);
}

fetchBacNho().catch(err => {
    console.error('❌ Lỗi:', err);
    process.exit(1);
});
