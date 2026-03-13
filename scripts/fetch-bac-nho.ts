import 'dotenv/config';
import { query, queryOne } from '../src/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

const WEIGHTS = {
    soDon: 0.35,
    khung3Ngay: 0.25,
    cap2: 0.15,
    cap3: 0.15,
};

const DAY_RANGES = [100, 180, 365, 730, 1000];

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

    // Get latest date to ensure we use the freshest cache
    const latestResult = await queryOne<{ draw_date: string }>(
        'SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1'
    );
    const dbLatestDate = latestResult?.draw_date || new Date().toISOString().split('T')[0];

    const types = [
        { key: 'so-don', weight: WEIGHTS.soDon },
        { key: 'khung-3-ngay-so-don', weight: WEIGHTS.khung3Ngay },
        { key: 'cap-2', weight: WEIGHTS.cap2 },
        { key: 'cap-3', weight: WEIGHTS.cap3 },
    ];

    for (const type of types) {
        let componentTriggerCount = 0;
        for (const days of DAY_RANGES) {
            const nameSuffix = days === 100 ? '' : `-${days}`;
            const statType = `bac-nho-${type.key}${nameSuffix}`;

            try {
                const cachedRow = await queryOne<{ stat_value: string }>(
                    'SELECT stat_value FROM statistics_cache WHERE stat_type = ? AND stat_key = ?',
                    [statType, dbLatestDate]
                );

                if (cachedRow) {
                    const data = JSON.parse(cachedRow.stat_value);
                    const todayPredictions = data.todayPredictions || [];
                    componentTriggerCount += todayPredictions.length;

                    todayPredictions.forEach((tp: any) => {
                        (tp.predictions || []).forEach((p: any) => {
                            const cur = scoreMap.get(p.number) || 0;
                            // Aggregate score: componentWeight divided by number of ranges used
                            const contribution = p.correlationRate * (type.weight / DAY_RANGES.length);
                            scoreMap.set(p.number, cur + contribution);
                        });
                    });
                }
            } catch (e: any) {
                console.warn(`  ⚠️ Lỗi fetch cache ${statType}:`, e.message);
            }
        }
        console.log(`  ✅ Nguồn ${type.key}: Tổng ${componentTriggerCount} trigger trên ${DAY_RANGES.length} khung.`);
    }

    return scoreMap;
}

async function generateAnalysisContent(top10: any[], aiRules: string): Promise<string> {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return 'Chưa có API Key để phân tích sâu.';
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Bạn là AI chuyên phân tích xổ số XSMB dựa trên hệ thống "Hội Đồng Bạc Nhớ" đa khung thời gian.
        
Hội Đồng vừa phân tích dữ liệu Bạc Nhớ từ 5 khung thời gian (100-1000 ngày) với 4 thuật toán khác nhau.

Top 10 số được chọn hôm nay (đã xếp hạng theo điểm tổng hợp):
${top10.map((n, i) => `${i + 1}. Số ${n.number} - Điểm: ${n.score.toFixed(2)} - Nhóm: ${n.tier}`).join('\n')}

Quy tắc đã học từ 30 ngày gần nhất (AI Insight):
${aiRules || '(Chưa có dữ liệu học)'}

Hãy viết một đoạn tóm tắt NGẮN GỌN (3-5 câu) bằng tiếng Việt, giải thích ưu thế của việc tổng hợp đa khung thời gian hôm nay và chiến thuật đề xuất. Tránh liệt kê lại số.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e: any) {
        return `Phân tích tổng hợp đa khung thời gian cho thấy sự đồng thuận cao ở một số bộ số chủ lực. Top số hôm nay được tính toán từ 20 tổ hợp thống kê khác nhau (4 thuật toán x 5 khung thời gian).`;
    }
}

async function fetchBacNho() {
    console.log(`[${new Date().toISOString()}] 🧠 Bắt đầu tính toán Hội Đồng Bạc Nhớ (Hệ thống Multi-Range DB)...`);

    const todayVN = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    console.log('📊 Đang tổng hợp điểm từ Database Cache (Multi-Range 100-1000 days)...');
    const scoreMap = await buildScoreMap();

    // Rank all numbers
    const ranked = Array.from(scoreMap.entries())
        .map(([number, score]) => ({ number, score }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);

    if (ranked.length === 0) {
        console.warn('⚠️ Không tìm thấy trigger nào từ cache. Có thể cache chưa được cập nhật cho ngày hôm nay.');
    }

    // Assign tiers and take top 10
    const top10 = ranked.slice(0, 10).map((item, idx) => ({
        ...item,
        tier: idx < 3 ? 'main' : idx < 7 ? 'potential' : 'support',
        rank: idx + 1,
    }));

    console.log(`🏆 Top 10 số Tổng Hợp: ${top10.map(n => n.number).join(', ')}`);

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

    console.log(`✅ Đã lưu dữ liệu Hội Đồng Bạc Nhớ Tổng Hợp cho ngày ${todayVN}`);
    process.exit(0);
}

fetchBacNho().catch(err => {
    console.error('❌ Lỗi:', err);
    process.exit(1);
});
