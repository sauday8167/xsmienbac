import { query, queryOne } from './db';
import { GeminiClient } from './ai/gemini-client';
import { extractAllLotoNumbers } from './lottery-helpers';
import { analyzeBacNhoSoDon } from './bac-nho-so-don';
import { analyzeBacNhoSoDonKhung3Ngay } from './bac-nho-khung-3-ngay-so-don';
import { findBridges } from './soi-cau-bach-thu';

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

// ─── 1. SNAPSHOT: Lưu dự đoán của 6 nguồn cho ngày D (target: D+1) ────────

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

    let bacNhoNumbers: string[] = [];
    let khung3NgayNumbers: string[] = [];
    let bachThuNumbers: string[] = [];
    let thongKeThuNumbers: string[] = [];
    let thongKeNgayNumbers: string[] = [];
    let thongKeNamNumbers: string[] = [];

    // 1. Bạc Nhớ Số Đơn
    try {
        const data = await analyzeBacNhoSoDon(120, sourceDate);
        bacNhoNumbers = extractTopFromPredictions(data.todayPredictions, 15);
        console.log(`  ✅ Bạc Nhớ: ${bacNhoNumbers.length} số`);
    } catch (e: any) { console.warn('  ⚠️ Bạc Nhớ lỗi:', e.message); }

    // 2. Bạc Nhớ Khung 3 Ngày
    try {
        const data = await analyzeBacNhoSoDonKhung3Ngay(120, sourceDate);
        khung3NgayNumbers = extractTopFromPredictions(data.todayPredictions, 15);
        console.log(`  ✅ Khung 3 Ngày: ${khung3NgayNumbers.length} số`);
    } catch (e: any) { console.warn('  ⚠️ Khung 3 Ngày lỗi:', e.message); }

    // 3. Bạch Thủ (findBridges)
    try {
        const bridges = await findBridges(sourceDate, 3, 'loto');
        const bridgeMap: Record<string, number> = {};
        bridges.forEach(b => { bridgeMap[b.predictedNumber] = (bridgeMap[b.predictedNumber] || 0) + 1; });
        bachThuNumbers = Object.entries(bridgeMap).sort((a, b) => b[1] - a[1]).slice(0, 15).map(e => e[0]);
        console.log(`  ✅ Bạch Thủ: ${bachThuNumbers.length} số`);
    } catch (e: any) { console.warn('  ⚠️ Bạch Thủ lỗi:', e.message); }

    // 4. Thống kê Theo Thứ
    try {
        thongKeThuNumbers = await getTopByDayOfWeek(sourceDate);
        console.log(`  ✅ Thống Kê Thứ: ${thongKeThuNumbers.length} số`);
    } catch (e: any) { console.warn('  ⚠️ Thống kê thứ lỗi:', e.message); }

    // 5. Thống kê Theo Ngày
    try {
        thongKeNgayNumbers = await getTopByDayOfMonth(sourceDate);
        console.log(`  ✅ Thống Kê Ngày: ${thongKeNgayNumbers.length} số`);
    } catch (e: any) { console.warn('  ⚠️ Thống kê ngày lỗi:', e.message); }

    // 6. Thống kê Theo Ngày Trong Năm
    try {
        thongKeNamNumbers = await getTopByDayOfYear(sourceDate);
        console.log(`  ✅ Thống Kê Năm: ${thongKeNamNumbers.length} số`);
    } catch (e: any) { console.warn('  ⚠️ Thống kê năm lỗi:', e.message); }

    await query(`
        INSERT INTO ai_source_snapshots 
        (snapshot_date, target_date, bac_nho_numbers, khung_3_ngay_numbers, bach_thu_numbers, thong_ke_thu_numbers, thong_ke_ngay_numbers, thong_ke_nam_numbers)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(snapshot_date) DO UPDATE SET
            bac_nho_numbers = excluded.bac_nho_numbers,
            khung_3_ngay_numbers = excluded.khung_3_ngay_numbers,
            bach_thu_numbers = excluded.bach_thu_numbers,
            thong_ke_thu_numbers = excluded.thong_ke_thu_numbers,
            thong_ke_ngay_numbers = excluded.thong_ke_ngay_numbers,
            thong_ke_nam_numbers = excluded.thong_ke_nam_numbers
    `, [
        sourceDate, targetDate,
        JSON.stringify(bacNhoNumbers),
        JSON.stringify(khung3NgayNumbers),
        JSON.stringify(bachThuNumbers),
        JSON.stringify(thongKeThuNumbers),
        JSON.stringify(thongKeNgayNumbers),
        JSON.stringify(thongKeNamNumbers),
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
 * - Lấy 15 ngày lịch sử → Gemini phân tích → Rút quy tắc
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
        bac_nho: calcAccuracy(parse(snapshot.bac_nho_numbers), actualNumbers),
        khung_3_ngay: calcAccuracy(parse(snapshot.khung_3_ngay_numbers), actualNumbers),
        bach_thu: calcAccuracy(parse(snapshot.bach_thu_numbers), actualNumbers),
        thong_ke_thu: calcAccuracy(parse(snapshot.thong_ke_thu_numbers), actualNumbers),
        thong_ke_ngay: calcAccuracy(parse(snapshot.thong_ke_ngay_numbers), actualNumbers),
        thong_ke_nam: calcAccuracy(parse(snapshot.thong_ke_nam_numbers), actualNumbers),
    };

    console.log(`  📊 Accuracy: BạcNhớ=${sourceAccuracy.bac_nho.rate}% | Khung3=${sourceAccuracy.khung_3_ngay.rate}% | BạchThủ=${sourceAccuracy.bach_thu.rate}% | Thu=${sourceAccuracy.thong_ke_thu.rate}% | Ngay=${sourceAccuracy.thong_ke_ngay.rate}% | Nam=${sourceAccuracy.thong_ke_nam.rate}%`);

    // Cập nhật DB với actual_numbers + source_accuracy
    await query(`
        UPDATE ai_source_snapshots 
        SET actual_numbers = ?, source_accuracy = ?
        WHERE snapshot_date = ?
    `, [JSON.stringify(actualNumbers), JSON.stringify(sourceAccuracy), sourceDate]);

    // Lấy 15 ngày lịch sử đã verify để Gemini học
    const history15 = await query<any[]>(`
        SELECT snapshot_date, source_accuracy, actual_numbers,
               bac_nho_numbers, khung_3_ngay_numbers, bach_thu_numbers,
               thong_ke_thu_numbers, thong_ke_ngay_numbers, thong_ke_nam_numbers
        FROM ai_source_snapshots
        WHERE actual_numbers IS NOT NULL AND source_accuracy IS NOT NULL
        ORDER BY snapshot_date DESC
        LIMIT 15
    `);

    if (history15.length < 3) {
        console.log(`ℹ️ Chưa đủ 3 ngày lịch sử để Gemini học. Hiện có: ${history15.length} ngày.`);
        return;
    }

    // Chuẩn bị dữ liệu cho Gemini
    const historySummary = history15.map(h => {
        const acc = JSON.parse(h.source_accuracy || '{}');
        return {
            date: h.snapshot_date,
            accuracy: {
                bac_nho: acc.bac_nho?.rate || 0,
                khung_3_ngay: acc.khung_3_ngay?.rate || 0,
                bach_thu: acc.bach_thu?.rate || 0,
                thong_ke_thu: acc.thong_ke_thu?.rate || 0,
                thong_ke_ngay: acc.thong_ke_ngay?.rate || 0,
                thong_ke_nam: acc.thong_ke_nam?.rate || 0,
            },
            hits: {
                bac_nho: acc.bac_nho?.hits || [],
                bach_thu: acc.bach_thu?.hits || [],
                khung_3_ngay: acc.khung_3_ngay?.hits || [],
            },
            actual: JSON.parse(h.actual_numbers || '[]').slice(0, 15),
        };
    });

    const prompt = `Bạn là AI chuyên phân tích độ chính xác của các nguồn dự đoán XSMB.

Dưới đây là lịch sử ${historySummary.length} ngày so sánh dự đoán từ 6 nguồn với kết quả thực tế:

${JSON.stringify(historySummary, null, 2)}

NHIỆM VỤ: Phân tích và rút ra QUY TẮC CHỌN SỐ cho ngày tiếp theo dựa trên các câu hỏi:
1. Nguồn nào đang có accuracy cao nhất? Xu hướng tăng hay giảm?
2. Khi nhiều nguồn cùng dự báo một số → xác suất trúng có tăng không?
3. Nguồn nào hiện đang YẾU (nên giảm trọng số)?
4. Nguồn nào hiện đang MẠNH (nên tăng trọng số)?
5. Có quy tắc nào về ngày thứ hay ngày trong tháng đang cho chính xác cao?

TRẢ VỀ JSON NGHIÊM NGẶT:
{
  "source_weights": {
    "bac_nho": 1.0,
    "khung_3_ngay": 1.0,
    "bach_thu": 1.0,
    "thong_ke_thu": 1.0,
    "thong_ke_ngay": 1.0,
    "thong_ke_nam": 1.0
  },
  "consensus_threshold": 3,
  "analysis": "Phân tích tình hình 15 ngày qua...",
  "top_rule": "Quy tắc quan trọng nhất cần áp dụng ngày mai...",
  "weak_sources": ["nguồn đang yếu"],
  "strong_sources": ["nguồn đang mạnh"]
}`;

    try {
        const aiResponse = await GeminiClient.generateContent(prompt);
        if (!aiResponse) { console.warn('⚠️ Gemini không trả về kết quả'); return; }

        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) { console.warn('⚠️ Không parse được JSON từ Gemini'); return; }

        const rules = JSON.parse(jsonMatch[0]);
        await query(`UPDATE ai_source_snapshots SET ai_rules = ? WHERE snapshot_date = ?`,
            [JSON.stringify(rules), sourceDate]);

        console.log(`✅ [AI Learn] Đã lưu quy tắc mới: ${rules.top_rule?.substring(0, 100)}...`);
        console.log(`  💪 Nguồn mạnh: ${rules.strong_sources?.join(', ')} | Nguồn yếu: ${rules.weak_sources?.join(', ')}`);
    } catch (e: any) {
        console.error('❌ Gemini học thất bại:', e.message);
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
