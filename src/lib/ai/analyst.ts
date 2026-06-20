import { query, queryOne } from '@/lib/db';

// ─────────────────────────────────────────────────────────────
// BẠC NHỚ CONSENSUS ENGINE
// CHỈ dùng dữ liệu dự đoán của 3 tab Bạc Nhớ trong /soi-cau-bac-nho:
//   - Cặp 3, 2 Ngày, 3 Ngày
// Mỗi số được cộng điểm theo tỷ lệ tương quan ở từng tab; số được
// nhiều tab đồng thuận sẽ có tổng điểm cao nhất → top picks.
// AI chỉ viết giải thích — KHÔNG chọn số.
// ─────────────────────────────────────────────────────────────

interface VoteResult {
    scores: Record<string, number>;
    reasons: Record<string, string[]>;
}

// 3 nguồn dữ liệu duy nhất (khớp stat_type trong statistics_cache)
const BAC_NHO_SOURCES: { statType: string; label: string }[] = [
    { statType: 'bac-nho-cap-3', label: 'Bạc Nhớ Cặp 3' },
    { statType: 'bac-nho-2-ngay', label: 'Bạc Nhớ 2 Ngày' },
    { statType: 'bac-nho-3-ngay', label: 'Bạc Nhớ 3 Ngày' },
];

async function runVotingEngine(targetDate: string): Promise<VoteResult> {
    const scores: Record<string, number> = {};
    const reasons: Record<string, string[]> = {};
    for (let i = 0; i <= 99; i++) {
        const n = String(i).padStart(2, '0');
        scores[n] = 0;
        reasons[n] = [];
    }

    const addScore = (num: string, pts: number, reason: string) => {
        const n = String(num).padStart(2, '0').slice(-2);
        if (/^\d{2}$/.test(n)) {
            scores[n] = (scores[n] || 0) + pts;
            if (!reasons[n]) reasons[n] = [];
            reasons[n].push(reason);
        }
    };

    const yesterday = new Date(targetDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('sv-SE');

    // CHỈ dùng dự đoán của 3 tab Bạc Nhớ (Cặp 3, 2 Ngày, 3 Ngày) từ /soi-cau-bac-nho.
    // Mỗi số cộng điểm theo tỷ lệ tương quan cao nhất trong từng tab; số được
    // nhiều tab cùng dự đoán (đồng thuận) sẽ có tổng điểm cao nhất.
    for (const src of BAC_NHO_SOURCES) {
        try {
            // Ưu tiên bản cache của hôm qua; nếu chưa có lấy bản mới nhất
            let cached = await queryOne<any>(
                'SELECT stat_value FROM statistics_cache WHERE stat_type = ? AND stat_key = ?',
                [src.statType, yesterdayStr]
            );
            if (!cached) {
                cached = await queryOne<any>(
                    'SELECT stat_value FROM statistics_cache WHERE stat_type = ? ORDER BY updated_at DESC LIMIT 1',
                    [src.statType]
                );
            }
            if (!cached?.stat_value) continue;

            const data = JSON.parse(cached.stat_value);
            const groups = data.todayPredictions || [];

            // Lấy tỷ lệ tương quan CAO NHẤT cho mỗi số trong nguồn này
            const bestRate: Record<string, number> = {};
            groups.forEach((g: any) => {
                (g.predictions || []).forEach((p: any) => {
                    const n = String(p.number ?? '').padStart(2, '0').slice(-2);
                    if (!/^\d{2}$/.test(n)) return;
                    const rate = Number(p.correlationRate) || 0;
                    if (rate > (bestRate[n] || 0)) bestRate[n] = rate;
                });
            });

            // Cộng điểm theo bậc tỷ lệ tương quan
            Object.entries(bestRate).forEach(([n, rate]) => {
                const pts = rate >= 70 ? 3 : rate >= 50 ? 2 : 1;
                addScore(n, pts, `${src.label} (tương quan ${Math.round(rate)}%)`);
            });
        } catch (e) { /* bỏ qua nếu thiếu cache nguồn này */ }
    }

    return { scores, reasons };
}

// ─────────────────────────────────────────────────────────────
// MAIN AI ANALYST CLASS
// ─────────────────────────────────────────────────────────────

export class AIAnalyst {
    static async runDailyAnalysis(customTargetDate?: string, _mode: string = 'du-doan-3-số') {
        try {
            // 1. Xác định ngày dự đoán
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric', month: '2-digit', day: '2-digit'
            });
            const hourFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Ho_Chi_Minh', hour: 'numeric', hour12: false
            });

            let targetDate = customTargetDate;
            if (!targetDate) {
                const dateObj = new Date(now);
                const vnHour = parseInt(hourFormatter.format(now));
                if (vnHour >= 19) dateObj.setDate(dateObj.getDate() + 1);
                targetDate = formatter.format(dateObj);
            }

            const modelKey = 'claude-3-haiku-3-so';

            // 2. Cập nhật accuracy cho các ngày trước
            const vnDate = new Date(targetDate);
            for (let i = 1; i <= 3; i++) {
                const d = new Date(vnDate);
                d.setDate(d.getDate() - i);
                await this.checkAccuracy(d.toLocaleDateString('sv-SE'));
            }

            // 3. Kiểm tra đã có prediction chưa
            const existing = await queryOne(
                'SELECT id FROM ai_predictions WHERE draw_date = ? AND model_used = ?',
                [targetDate, modelKey]
            );
            if (existing) {
                console.log(`[Voting] Prediction for ${targetDate} already exists. Skipping.`);
                return;
            }

            // 4. Chạy Statistical Voting Engine
            console.log(`[Voting] Running statistical voting engine for ${targetDate}...`);
            const { scores, reasons } = await runVotingEngine(targetDate);

            // 5. Chọn top 5 số có điểm cao nhất (đồng thuận bạc nhớ)
            const ranked = Object.entries(scores)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);

            const top5: string[] = ranked.map(([n]) => n);
            const top5WithReasons = ranked.map(([n, score]) => ({
                number: n,
                score,
                reasons: reasons[n] || []
            }));

            console.log('[Voting] Top 5:', top5WithReasons.map(x => `${x.number}(${x.score}đ)`).join(' '));

            // 6. Diễn giải THỐNG KÊ THUẦN — KHÔNG gọi bất kỳ model AI nào
            const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            const weekdayName = weekdays[new Date(targetDate).getDay()];
            const [dd, mm] = targetDate.split('-').slice(1).reverse();

            const summary = `5 số được chọn từ sự đồng thuận của 3 phương pháp Bạc Nhớ (Cặp 3, 2 Ngày, 3 Ngày) cho kỳ ${weekdayName} ${dd}/${mm}.`;
            const topEvidence: string[] = top5WithReasons.map(x => `Số ${x.number} (${x.score}đ): ${x.reasons.join(' · ') || 'Tương quan bạc nhớ cao'}`);
            const advice = `Danh sách dựa hoàn toàn trên dữ liệu bạc nhớ lịch sử (Cặp 3, 2 Ngày, 3 Ngày). Chỉ mang tính tham khảo, chơi có trách nhiệm.`;

            // 7. Lưu vào DB
            const analysisContent = JSON.stringify({
                method: 'bac-nho-consensus-v1',
                summary,
                top_evidence: topEvidence,
                advice,
                analysis: { summary, top_evidence: topEvidence, advice },
                voting_scores: Object.fromEntries(ranked),
                voting_reasons: Object.fromEntries(top5WithReasons.map(x => [x.number, x.reasons])),
                top_detail: top5WithReasons
            });

            // Điểm trung bình của top 5 làm "confidence" (scaled 0-100)
            const maxPossibleScore = BAC_NHO_SOURCES.length * 3; // 3 nguồn × tối đa 3 điểm = 9
            const avgScore = ranked.reduce((s, [, v]) => s + v, 0) / ranked.length;
            const confidence = Math.min(100, Math.round((avgScore / maxPossibleScore) * 100));

            await query(
                `INSERT OR REPLACE INTO ai_predictions
                 (draw_date, analysis_content, predicted_pairs, confidence_score, model_used)
                 VALUES (?, ?, ?, ?, ?)`,
                [targetDate, analysisContent, JSON.stringify(top5), confidence, modelKey]
            );

            console.log(`[Voting] Saved prediction for ${targetDate}: [${top5.join(', ')}] confidence=${confidence}`);
            return { targetDate, predictedPairs: top5, confidence, analysisContent };

        } catch (error) {
            console.error('[Voting] Analysis failed:', error);
            throw error;
        }
    }

    static async checkAccuracy(drawDate: string) {
        try {
            const predictions = await query<any[]>(
                'SELECT id, predicted_pairs, actual_result FROM ai_predictions WHERE draw_date = ?',
                [drawDate]
            );
            if (!predictions?.length) return;

            const result = await queryOne<any>(
                'SELECT * FROM xsmb_results WHERE draw_date = ?',
                [drawDate]
            );
            if (!result) return;

            // Lấy tất cả lô (2 chữ số cuối) từ kết quả thực
            const winningLotos = new Set<string>();
            ['special_prize', 'prize_1', 'prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'].forEach(key => {
                const val = result[key];
                if (!val) return;
                try {
                    const prizes = String(val).startsWith('[') ? JSON.parse(val) : [val];
                    prizes.forEach((p: any) => {
                        const s = String(p);
                        if (s.length >= 2) winningLotos.add(s.slice(-2));
                    });
                } catch {
                    const s = String(val);
                    if (s.length >= 2) winningLotos.add(s.slice(-2));
                }
            });

            for (const pred of predictions) {
                if (pred.actual_result) continue; // Đã kiểm tra rồi

                const predicted: string[] = JSON.parse(pred.predicted_pairs || '[]');
                const matches = predicted.filter(n => winningLotos.has(n));
                const isCorrect = matches.length >= 2;

                await query(
                    `UPDATE ai_predictions
                     SET actual_result = ?, is_correct = ?, accuracy_notes = ?
                     WHERE id = ?`,
                    [
                        Array.from(winningLotos).sort().join(','),
                        isCorrect ? 1 : 0,
                        isCorrect
                            ? `Trúng ${matches.length}/${predicted.length} loto (${matches.join(', ')})`
                            : `Chỉ trúng ${matches.length}/${predicted.length} loto`,
                        pred.id
                    ]
                );
                console.log(`[Accuracy] ${drawDate}: ${isCorrect ? 'WIN' : 'FAIL'} (${matches.length} hits)`);
            }
        } catch (error) {
            console.error(`[Accuracy] Error for ${drawDate}:`, error);
        }
    }
}
