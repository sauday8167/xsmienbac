import { ClaudeClient } from './claude-client';
import { OpenRouterClient } from './openrouter-client';
import { query, queryOne } from '@/lib/db';
import { calculateLoGan, calculateFrequent } from '@/lib/statistics';

// ─────────────────────────────────────────────────────────────
// STATISTICAL VOTING ENGINE
// Mỗi phương pháp thống kê bỏ phiếu cho từng số (00-99).
// Số có tổng điểm cao nhất → top picks.
// AI chỉ viết giải thích — KHÔNG chọn số.
// ─────────────────────────────────────────────────────────────

interface VoteResult {
    scores: Record<string, number>;
    reasons: Record<string, string[]>;
}

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

    // ── METHOD 1: Lô rơi từ Giải Đặc Biệt hôm qua (+4 điểm) ──
    // Xác suất thực tế đo được: 25.4% (cao hơn 27% baseline/7% mỗi số)
    const lastResult = await queryOne<any>(
        'SELECT special_prize, prize_1 FROM xsmb_results WHERE draw_date = ?',
        [yesterdayStr]
    );
    if (lastResult?.special_prize?.length >= 2) {
        const gdbLo = lastResult.special_prize.slice(-2);
        addScore(gdbLo, 4, `Lô rơi GĐB (${gdbLo}) — xác suất 25.4%`);
        const rev = gdbLo[1] + gdbLo[0];
        if (rev !== gdbLo) addScore(rev, 2, `Cặp đảo lô rơi GĐB (${rev})`);
    }
    if (lastResult?.prize_1?.length >= 2) {
        const g1Lo = lastResult.prize_1.slice(-2);
        addScore(g1Lo, 2, `Lô rơi Giải Nhất (${g1Lo})`);
    }

    // ── METHOD 2: Tần suất cao 30 ngày (+2/+1 điểm) ──
    try {
        const frequent = await calculateFrequent(30, 30);
        frequent.forEach((item: any, idx: number) => {
            const pts = idx < 10 ? 2 : 1;
            addScore(item.number, pts, `Tần suất cao 30 ngày (hạng ${idx + 1}, ${item.count} lần)`);
        });
    } catch (e) { /* bỏ qua nếu lỗi */ }

    // ── METHOD 3: Bạc Nhớ từ DB cache (+2 điểm mỗi method) ──
    const bacNhoTypes = [
        'bac-nho-cap-2', 'bac-nho-cap-3', 'bac-nho-2-ngay',
        'bac-nho-khung-3-ngay-cap-2', 'bac-nho-khung-3-ngay-cap-3'
    ];
    for (const statType of bacNhoTypes) {
        try {
            // Thử key của hôm qua, nếu không có lấy bản gần nhất
            let cached = await queryOne<any>(
                'SELECT stat_value FROM statistics_cache WHERE stat_type = ? AND stat_key = ?',
                [statType, yesterdayStr]
            );
            if (!cached) {
                cached = await queryOne<any>(
                    'SELECT stat_value FROM statistics_cache WHERE stat_type = ? ORDER BY updated_at DESC LIMIT 1',
                    [statType]
                );
            }
            if (cached?.stat_value) {
                const data = JSON.parse(cached.stat_value);
                const preds = data.todayPredictions || data.predictions || [];
                preds.slice(0, 8).forEach((p: any) => {
                    // Trích 2 chữ số cuối từ bất kỳ field nào
                    const raw = p.number ?? p.pair ?? p.lo ?? (Array.isArray(p) ? p[0] : null) ?? String(p);
                    const n = String(raw).padStart(2, '0').slice(-2);
                    if (/^\d{2}$/.test(n)) {
                        addScore(n, 2, `Bạc Nhớ ${statType}`);
                    }
                });
            }
        } catch (e) { /* bỏ qua */ }
    }

    // ── METHOD 4: Lô gan chín (12-22 ngày vắng = sweet spot) (+3/+1 điểm) ──
    try {
        const loGan = await calculateLoGan(100, 100);
        loGan.forEach((item: any) => {
            if (item.daysSince >= 12 && item.daysSince <= 22) {
                addScore(item.number, 3, `Lô gan chín ${item.daysSince} ngày — sắp nổ`);
            } else if (item.daysSince >= 8 && item.daysSince < 12) {
                addScore(item.number, 1, `Lô gan tích tụ ${item.daysSince} ngày`);
            }
        });
    } catch (e) { /* bỏ qua */ }

    // ── METHOD 5: Bias theo thứ trong tuần (+2 điểm) ──
    try {
        const weekday = new Date(targetDate).getDay(); // 0=CN, 1=T2, ..., 6=T7
        const weekdayRows = await query<any[]>(
            `SELECT special_prize, prize_1, prize_2, prize_3, prize_4, prize_5, prize_6, prize_7
             FROM xsmb_results
             WHERE strftime('%w', draw_date) = ?
             ORDER BY draw_date DESC LIMIT 52`,
            [String(weekday)]
        );
        if (weekdayRows.length >= 10) {
            const counts: Record<string, number> = {};
            weekdayRows.forEach(row => {
                const lo: string[] = [];
                if (row.special_prize) lo.push(row.special_prize.slice(-2));
                if (row.prize_1) lo.push(row.prize_1.slice(-2));
                ['prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'].forEach(p => {
                    if (row[p]) {
                        try { (JSON.parse(row[p]) as string[]).forEach(n => lo.push(n.slice(-2))); }
                        catch { lo.push(row[p].slice(-2)); }
                    }
                });
                lo.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
            });
            const total = Object.values(counts).reduce((a, b) => a + b, 0);
            const avg = total / 100;
            Object.entries(counts)
                .filter(([, cnt]) => cnt > avg * 1.35)
                .forEach(([n]) => addScore(n, 2, `Hay về theo thứ trong tuần (${cnt(n, counts)} lần/${weekdayRows.length} tuần)`));
        }
    } catch (e) { /* bỏ qua */ }

    // ── METHOD 6: GĐB follow-up — số hay về ngày sau GĐB có đuôi tương tự (+2 điểm) ──
    try {
        if (lastResult?.special_prize?.length >= 2) {
            const gdbLo = lastResult.special_prize.slice(-2);
            const followRows = await query<any[]>(
                `SELECT r2.special_prize, r2.prize_1, r2.prize_2, r2.prize_3, r2.prize_4, r2.prize_5, r2.prize_6, r2.prize_7
                 FROM xsmb_results r1
                 JOIN xsmb_results r2 ON date(r2.draw_date) = date(r1.draw_date, '+1 day')
                 WHERE substr(r1.special_prize, -2) = ?
                 ORDER BY r1.draw_date DESC LIMIT 30`,
                [gdbLo]
            );
            if (followRows.length >= 5) {
                const followCounts: Record<string, number> = {};
                followRows.forEach(row => {
                    const lo: string[] = [];
                    if (row.special_prize) lo.push(row.special_prize.slice(-2));
                    if (row.prize_1) lo.push(row.prize_1.slice(-2));
                    ['prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'].forEach(p => {
                        if (row[p]) {
                            try { (JSON.parse(row[p]) as string[]).forEach(n => lo.push(n.slice(-2))); }
                            catch { lo.push(row[p].slice(-2)); }
                        }
                    });
                    lo.forEach(n => { followCounts[n] = (followCounts[n] || 0) + 1; });
                });
                Object.entries(followCounts)
                    .filter(([, c]) => c >= Math.ceil(followRows.length * 0.3))
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .forEach(([n, c]) => addScore(n, 2, `Hay về sau GĐB đuôi ${gdbLo} (${c}/${followRows.length} lần)`));
            }
        }
    } catch (e) { /* bỏ qua */ }

    return { scores, reasons };
}

function cnt(n: string, counts: Record<string, number>): number {
    return counts[n] || 0;
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

            // 5. Chọn top 7 số có điểm cao nhất
            const ranked = Object.entries(scores)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 7);

            const top7: string[] = ranked.map(([n]) => n);
            const top7WithReasons = ranked.map(([n, score]) => ({
                number: n,
                score,
                reasons: reasons[n] || []
            }));

            console.log('[Voting] Top 7:', top7WithReasons.map(x => `${x.number}(${x.score}đ)`).join(' '));

            // 6. Gọi AI để viết giải thích (không chọn số)
            const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            const weekdayName = weekdays[new Date(targetDate).getDay()];
            const [dd, mm] = targetDate.split('-').slice(1).reverse();

            const explainPrompt = `Hệ thống thống kê XSMB đã chọn 7 số dự đoán cho kỳ ${weekdayName} ngày ${dd}/${mm} dựa trên 6 phương pháp phân tích dữ liệu:

${top7WithReasons.map((x, i) => `${i + 1}. Số ${x.number} (điểm: ${x.score}): ${x.reasons.slice(0, 2).join(' | ')}`).join('\n')}

Viết phân tích ngắn gọn bằng tiếng Việt, giải thích tại sao những con số này được thống kê chọn ra. Tập trung vào bằng chứng dữ liệu, không dùng ngôn ngữ hoa mỹ.

Trả về JSON (KHÔNG có markdown, CHỈ JSON thuần):
{
  "summary": "1-2 câu tóm tắt chiến thuật hôm nay",
  "top_evidence": ["bằng chứng 1", "bằng chứng 2", "bằng chứng 3"],
  "advice": "Lời khuyên thực tế ngắn gọn cho người chơi"
}`;

            let summary = `7 số được chọn bởi hệ thống bỏ phiếu thống kê từ 6 phương pháp phân tích độc lập cho kỳ ${weekdayName} ${dd}/${mm}.`;
            let topEvidence: string[] = top7WithReasons.slice(0, 3).map(x => `Số ${x.number}: ${x.reasons[0] || 'Điểm thống kê cao'}`);
            let advice = `Theo dõi sát kết quả và điều chỉnh danh sách hàng ngày. Chỉ tham khảo, không đầu tư quá mức.`;

            try {
                console.log('[Voting] Requesting AI explanation via Claude...');
                let rawResponse: string | null = null;
                try {
                    rawResponse = await ClaudeClient.generateContent(explainPrompt, 'claude-haiku-4-5-20251001', 0.2, 1000);
                } catch (claudeErr) {
                    console.warn('[Voting] Claude failed, trying OpenRouter...', (claudeErr as Error).message);
                    rawResponse = await OpenRouterClient.generateContent(explainPrompt, 0.2);
                }
                if (rawResponse) {
                    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        if (parsed.summary) summary = parsed.summary;
                        if (Array.isArray(parsed.top_evidence)) topEvidence = parsed.top_evidence;
                        if (parsed.advice) advice = parsed.advice;
                    }
                }
            } catch (e) {
                console.warn('[Voting] AI explanation failed, using statistical fallback:', (e as Error).message);
            }

            // 7. Lưu vào DB
            const analysisContent = JSON.stringify({
                method: 'statistical_voting_v2',
                summary,
                top_evidence: topEvidence,
                advice,
                analysis: { summary, top_evidence: topEvidence, advice },
                voting_scores: Object.fromEntries(ranked),
                voting_reasons: Object.fromEntries(top7WithReasons.map(x => [x.number, x.reasons])),
                top7_detail: top7WithReasons
            });

            // Sử dụng điểm trung bình của top 7 làm "confidence" (scaled 0-100)
            const maxPossibleScore = 4 + 2 + 10 + 3 + 2 + 2; // max từ tất cả methods
            const avgScore = ranked.reduce((s, [, v]) => s + v, 0) / ranked.length;
            const confidence = Math.min(100, Math.round((avgScore / maxPossibleScore) * 100));

            await query(
                `INSERT OR REPLACE INTO ai_predictions
                 (draw_date, analysis_content, predicted_pairs, confidence_score, model_used)
                 VALUES (?, ?, ?, ?, ?)`,
                [targetDate, analysisContent, JSON.stringify(top7), confidence, modelKey]
            );

            console.log(`[Voting] Saved prediction for ${targetDate}: [${top7.join(', ')}] confidence=${confidence}`);
            return { targetDate, predictedPairs: top7, confidence, analysisContent };

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
