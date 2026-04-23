import { query, queryOne } from './db';
import { OpenRouterClient } from './ai/openrouter-client';
import { extractAllLotoNumbers } from './lottery-helpers';
import { analyzeBacNhoCap3 } from './bac-nho-cap-3';
import { analyzeBacNho2Ngay } from './bac-nho-2-ngay';
import { analyzeBacNho3Ngay } from './bac-nho-3-ngay';
import { getOrUpdateBacNhoData } from './bac-nho-cache-service';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getTopByDayOfWeek(anchorDate: string, limit = 10): Promise<string[]> {
    const dow = new Date(anchorDate).getDay(); // 0=Sun ... 6=Sat
    const sql = `
        SELECT * FROM xsmb_results
        WHERE draw_date >= date(?, '-365 days')
        AND CAST(strftime('%w', draw_date) AS INTEGER) = ?
        ORDER BY draw_date DESC
    `;
    const results = await query<any[]>(sql, [anchorDate, dow]);
    const freq: Record<string, number> = {};
    results.forEach((r: any) => extractAllLotoNumbers(r).forEach((n: string) => { freq[n] = (freq[n] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);
}

async function getTopByDayOfMonth(anchorDate: string, limit = 10): Promise<string[]> {
    const dom = new Date(anchorDate).getDate().toString().padStart(2, '0');
    const sql = `
        SELECT * FROM xsmb_results
        WHERE draw_date >= date(?, '-18 months')
        AND strftime('%d', draw_date) = ?
        ORDER BY draw_date DESC
    `;
    const results = await query<any[]>(sql, [anchorDate, dom]);
    const freq: Record<string, number> = {};
    results.forEach((r: any) => extractAllLotoNumbers(r).forEach((n: string) => { freq[n] = (freq[n] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);
}

async function getTopByDayOfYear(anchorDate: string, limit = 10): Promise<string[]> {
    // Day-of-year: use draw_date month+day pattern
    const dt = new Date(anchorDate);
    const mm = (dt.getMonth() + 1).toString().padStart(2, '0');
    const dd = dt.getDate().toString().padStart(2, '0');
    const sql = `
        SELECT * FROM xsmb_results
        WHERE strftime('%m-%d', draw_date) = ?
        ORDER BY draw_date DESC
    `;
    const results = await query<any[]>(sql, [`${mm}-${dd}`]);
    const freq: Record<string, number> = {};
    results.forEach((r: any) => extractAllLotoNumbers(r).forEach((n: string) => { freq[n] = (freq[n] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);
}

function extractTopFromPredictions(predictions: any[], limit = 15): string[] {
    const scoreMap: Record<string, number> = {};
    predictions.forEach((p: any) => {
        (p.predictions || []).forEach((pred: any) => {
            scoreMap[pred.number] = (scoreMap[pred.number] || 0) + pred.correlationRate;
        });
    });
    return Object.entries(scoreMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(e => e[0]);
}

/**
 * Chụp snapshot dữ liệu phân tích của ngày `sourceDate` (D-1).
 * target_date là ngày D (ngày xổ số mà chúng ta muốn dự đoán).
 */
export async function snapshotSourcePredictions(sourceDate: string): Promise<void> {
    console.log(`📸 [AI Snapshot] Đang chụp dữ liệu phân tích ngày ${sourceDate}...`);

    // Tính target_date = sourceDate + 1
    const tDate = new Date(sourceDate);
    tDate.setDate(tDate.getDate() + 1);
    const targetDate = tDate.toISOString().split('T')[0];

    // Kiểm tra đã có chưa
    const existing = await queryOne<any>(`SELECT id FROM ai_source_snapshots WHERE snapshot_date = ?`, [sourceDate]);
    if (existing) {
        console.log(`ℹ️ Snapshot ngày ${sourceDate} đã tồn tại.`);
        return;
    }

    let bacNhoCap3Numbers: string[] = [];
    let bacNho2NgayNumbers: string[] = [];
    let bacNho3NgayNumbers: string[] = [];

    const RANGE = 500;

    // 1. Bạc Nhớ Cặp 3
    try {
        const data = await getOrUpdateBacNhoData('cap-3', (d) => analyzeBacNhoCap3(d, sourceDate), RANGE);
        bacNhoCap3Numbers = extractTopFromPredictions(data.todayPredictions, 20);
        console.log(`  ✅ Bạc Nhớ Cặp 3: ${bacNhoCap3Numbers.length} số (từ Cache)`);
    } catch (e: any) { console.warn('  ⚠️ Bạc Nhớ Cặp 3 lỗi:', e.message); }

    // 2. Bạc Nhớ 2 Ngày
    try {
        const data = await getOrUpdateBacNhoData('2-ngay', (d) => analyzeBacNho2Ngay(d, sourceDate), RANGE);
        bacNho2NgayNumbers = extractTopFromPredictions(data.todayPredictions, 20);
        console.log(`  ✅ Bạc Nhớ 2 Ngày: ${bacNho2NgayNumbers.length} số (từ Cache)`);
    } catch (e: any) { console.warn('  ⚠️ Bạc Nhớ 2 Ngày lỗi:', e.message); }

    // 3. Bạc Nhớ 3 Ngày
    try {
        const data = await getOrUpdateBacNhoData('3-ngay', (d) => analyzeBacNho3Ngay(d, sourceDate), RANGE);
        bacNho3NgayNumbers = extractTopFromPredictions(data.todayPredictions, 20);
        console.log(`  ✅ Bạc Nhớ 3 Ngày: ${bacNho3NgayNumbers.length} số (từ Cache)`);
    } catch (e: any) { console.warn('  ⚠️ Bạc Nhớ 3 Ngày lỗi:', e.message); }

    await query(`
        INSERT INTO ai_source_snapshots 
        (snapshot_date, target_date, bac_nho_cap_3_numbers, bac_nho_2_ngay_numbers, bac_nho_3_ngay_numbers)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(snapshot_date) DO UPDATE SET
            bac_nho_cap_3_numbers = excluded.bac_nho_cap_3_numbers,
            bac_nho_2_ngay_numbers = excluded.bac_nho_2_ngay_numbers,
            bac_nho_3_ngay_numbers = excluded.bac_nho_3_ngay_numbers
    `, [
        sourceDate, targetDate,
        JSON.stringify(bacNhoCap3Numbers),
        JSON.stringify(bacNho2NgayNumbers),
        JSON.stringify(bacNho3NgayNumbers)
    ]);

    console.log(`✅ [AI Snapshot] Đã lưu snapshot ngày ${sourceDate} → dự đoán cho ${targetDate}`);
}

// ─── 2. VERIFY & LEARN: So sánh với KQXS thực tế và học quy tắc ────────────

function calcAccuracy(predicted: string[], actual: string[]): { hits: string[]; rate: number } {
    const hits = predicted.filter(n => actual.includes(n));
    const rate = predicted.length > 0 ? Math.round((hits.length / predicted.length) * 100) : 0;
    return { hits, rate };
}

/**
 * Sau khi có KQXS ngày `resultDate` (D):
 * - Lấy snapshot của ngày D-1
 * - So sánh từng nguồn với KQXS thực tế
 * - Lấy 15 ngày lịch sử → Claude phân tích → Rút quy tắc
 * - Lưu vào ai_source_snapshots
 */
export async function verifyAndLearnFromSources(resultDate: string): Promise<void> {
    console.log(`🎓 [AI Learn] Bắt đầu học từ KQXS ngày ${resultDate}...`);

    // Lấy KQXS thực tế
    const actual = await queryOne<any>(`SELECT * FROM xsmb_results WHERE draw_date = ?`, [resultDate]);
    if (!actual) {
        console.warn(`⚠️ Chưa có KQXS ngày ${resultDate}`);
        return;
    }
    const actualNumbers = extractAllLotoNumbers(actual);

    // Lấy snapshot của ngày D-1 (sourceDate)
    const sDate = new Date(resultDate);
    sDate.setDate(sDate.getDate() - 1);
    const sourceDate = sDate.toISOString().split('T')[0];

    const snapshot = await queryOne<any>(`SELECT * FROM ai_source_snapshots WHERE snapshot_date = ?`, [sourceDate]);
    if (!snapshot) {
        console.warn(`⚠️ Chưa có snapshot ngày ${sourceDate}. Hãy chạy snapshot trước.`);
        return;
    }

    // Tính accuracy từng nguồn
    const parse = (s: string | null): string[] => { try { return s ? JSON.parse(s) : []; } catch { return []; } };

    const sourceAccuracy = {
        bac_nho_cap_3: calcAccuracy(parse(snapshot.bac_nho_cap_3_numbers), actualNumbers),
        bac_nho_2_ngay: calcAccuracy(parse(snapshot.bac_nho_2_ngay_numbers), actualNumbers),
        bac_nho_3_ngay: calcAccuracy(parse(snapshot.bac_nho_3_ngay_numbers), actualNumbers),
    };

    console.log(`  📊 Accuracy (Claude Learning): Cặp3=${sourceAccuracy.bac_nho_cap_3.rate}% | 2Ngày=${sourceAccuracy.bac_nho_2_ngay.rate}% | 3Ngày=${sourceAccuracy.bac_nho_3_ngay.rate}%`);

    // Cập nhật DB với actual_numbers + source_accuracy
    await query(`
        UPDATE ai_source_snapshots 
        SET actual_numbers = ?, source_accuracy = ?
        WHERE snapshot_date = ?
    `, [JSON.stringify(actualNumbers), JSON.stringify(sourceAccuracy), sourceDate]);

    // Lấy 15 ngày lịch sử đã verify để Claude học
    const history15 = await query<any[]>(`
        SELECT snapshot_date, source_accuracy, actual_numbers,
               bac_nho_cap_3_numbers, bac_nho_2_ngay_numbers, bac_nho_3_ngay_numbers
        FROM ai_source_snapshots
        WHERE actual_numbers IS NOT NULL AND source_accuracy IS NOT NULL
        ORDER BY snapshot_date DESC
        LIMIT 15
    `);

    if (history15.length < 3) {
        console.log(`ℹ️ Chưa đủ 3 ngày lịch sử để Claude học. Hiện có: ${history15.length} ngày.`);
        return;
    }

    // Chuẩn bị dữ liệu cho Claude
    const historySummary = history15.map(h => {
        const acc = JSON.parse(h.source_accuracy || '{}');
        return {
            date: h.snapshot_date,
            accuracy: {
                bac_nho_cap_3: acc.bac_nho_cap_3?.rate || 0,
                bac_nho_2_ngay: acc.bac_nho_2_ngay?.rate || 0,
                bac_nho_3_ngay: acc.bac_nho_3_ngay?.rate || 0,
            },
            hits: {
                bac_nho_cap_3: acc.bac_nho_cap_3?.hits || [],
                bac_nho_2_ngay: acc.bac_nho_2_ngay?.hits || [],
                bac_nho_3_ngay: acc.bac_nho_3_ngay?.hits || [],
            },
            actual: JSON.parse(h.actual_numbers || '[]').slice(0, 15),
        };
    });

    const prompt = `Bạn là Claude - AI Siêu cấp chuyên phân tích độ chính xác của các nguồn dự đoán XSMB.
CHIẾN THUẬT KPI: Mục tiêu chốt số nổ từ 5 NHÁY trở lên mỗi ngày.

Dưới đây là lịch sử ${historySummary.length} ngày so sánh dự đoán từ 3 nguồn Bạc Nhớ chuyên sâu với kết quả thực tế:

${JSON.stringify(historySummary, null, 2)}

NHIỆM VỤ: Phân tích cực kỳ khắt khe và rút ra QUY TẮC CHỌN SỐ cho ngày tiếp theo:
1. Nguồn nào (Cặp 3, 2 Ngày, 3 Ngày) đang có phong độ ổn định nhất để nổ nhiều nháy?
2. Khi các nguồn cùng hội tụ (consensus) vào một số, xác suất nổ 5 nháy có khả thi không?
3. Nguồn nào hiện đang "vào dây đen" (nên giảm mạnh trọng số)?
4. Nguồn nào đang "vào dây đỏ" (nên tăng mạnh trọng số)?
5. Rút ra bài học cốt lõi để đạt KPI 5 nháy.

TRẢ VỀ JSON NGHIÊM NGẶT:
{
  "source_weights": {
    "bac_nho_cap_3": 1.0,
    "bac_nho_2_ngay": 1.0,
    "bac_nho_3_ngay": 1.0
  },
  "consensus_threshold": 2,
  "analysis": "Phân tích chiến thuật đạt KPI 5 nháy dựa trên 15 ngày qua...",
  "top_rule": "Quy tắc vàng để nổ 5 nháy ngày mai...",
  "weak_sources": ["nguồn đang yếu"],
  "strong_sources": ["nguồn đang mạnh"]
}`;

    try {
        const aiResponse = await OpenRouterClient.generateContent(prompt);
        if (!aiResponse) { console.warn('⚠️ Claude không trả về kết quả'); return; }

        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) { console.warn('⚠️ Không parse được JSON từ Claude'); return; }

        const rules = JSON.parse(jsonMatch[0]);
        await query(`UPDATE ai_source_snapshots SET ai_rules = ? WHERE snapshot_date = ?`,
            [JSON.stringify(rules), sourceDate]);

        console.log(`✅ [AI Learn - Claude] Đã lưu quy tắc mới hướng tới KPI 5 nháy: ${rules.top_rule?.substring(0, 100)}...`);
        console.log(`  💪 Nguồn mạnh: ${rules.strong_sources?.join(', ')} | Nguồn yếu: ${rules.weak_sources?.join(', ')}`);
    } catch (e: any) {
        console.error('❌ Claude học thất bại:', e.message);
    }
}

// ─── 3. LẤY QUY TẮC MỚI NHẤT cho analyst.ts sử dụng ───────────────────────

export interface SourceRules {
    source_weights: Record<string, number>;
    consensus_threshold: number;
    analysis: string;
    top_rule: string;
    weak_sources: string[];
    strong_sources: string[];
}

export async function getLatestSourceRules(): Promise<SourceRules | null> {
    try {
        const latest = await queryOne<any>(`
            SELECT ai_rules, snapshot_date FROM ai_source_snapshots
            WHERE ai_rules IS NOT NULL
            ORDER BY snapshot_date DESC
            LIMIT 1
        `);
        if (!latest?.ai_rules) return null;
        return JSON.parse(latest.ai_rules);
    } catch {
        return null;
    }
}

// ─── 4. GIỮ LẠI hàm cũ để tương thích ngược ─────────────────────────────────

export async function getLatestTacticalAdvice(): Promise<any | null> {
    // Bridge to new system
    const rules = await getLatestSourceRules();
    if (!rules) return null;
    return {
        advice: `${rules.top_rule} | Nguồn mạnh: ${rules.strong_sources?.join(', ')}`,
        risk_level: rules.weak_sources?.length > 2 ? 'high' : 'medium',
        weights: rules.source_weights,
        preferred_numbers: [],
        banned_numbers: [],
    };
}

export async function generateDailyCouncilLessons(date: string) {
    // Redirected to new engine
    await verifyAndLearnFromSources(date);
}
