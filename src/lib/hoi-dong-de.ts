import { query, queryOne } from './db';
import { extractAllLotoNumbers } from './lottery-helpers';
import { analyzeBacNhoSoDon } from './bac-nho-so-don';
import { analyzeBacNhoSoDonKhung3Ngay } from './bac-nho-khung-3-ngay-so-don';

export interface HoiDongDePrediction {
    draw_date: string;
    prediction_36: string[];
    analysis_meta: {
        weights: Record<string, number>;
        sources: string[];
        top_rule?: string;
    };
}

/**
 * Core analysis library for "Hội Đồng Đề"
 * Focuses on Special Prize (GDB) prediction using multiple methods and self-learning.
 */
export async function analyzeHoiDongDe(targetDate?: string): Promise<HoiDongDePrediction | null> {
    // 1. Determine target date (default to today/tomorrow)
    const latestResult = await queryOne('SELECT draw_date, special_prize FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
    if (!latestResult) return null;

    const sourceDate = targetDate || latestResult.draw_date;
    
    // Calculate actual target date (next day)
    const tDate = new Date(sourceDate);
    tDate.setDate(tDate.getDate() + 1);
    const actualTargetDate = tDate.toISOString().split('T')[0];

    // 2. Aggregate candidates from different sources
    // Method A: GDB Sum (Top 10)
    const sumCandidates = await getCandidatesBySum(sourceDate);
    // Method B: Edge Pairing (Top 10)
    const edgeCandidates = await getCandidatesByEdge(sourceDate);
    // Method C: Pivot Touch (Top 20)
    const touchCandidates = await getCandidatesByTouch(sourceDate);
    // Method D: Frequency based on day of week/month
    const freqCandidates = await getCandidatesByFreq(sourceDate);
    
    // Method E: Bạc Nhớ Số Đơn
    const bacNhoSoDonCandidates = await getCandidatesByBacNhoSoDon(sourceDate);
    // Method F: Bạc Nhớ Khung 3 Ngày
    const bacNhoKhung3Candidates = await getCandidatesByBacNhoKhung3(sourceDate);

    // 3. Weighting & Ranking (Self-learning logic)
    const scores: Record<string, number> = {};
    const increment = (num: string, weight: number) => {
        scores[num] = (scores[num] || 0) + weight;
    };

    // Default weights (updated to include Bạc Nhớ)
    const weights = { 
        sum: 1.2, 
        edge: 1.0, 
        touch: 0.8, 
        freq: 0.6,
        bac_nho: 1.5,
        khung_3: 1.3
    };

    sumCandidates.forEach(n => increment(n, weights.sum));
    edgeCandidates.forEach(n => increment(n, weights.edge));
    touchCandidates.forEach(n => increment(n, weights.touch));
    freqCandidates.forEach(n => increment(n, weights.freq));
    bacNhoSoDonCandidates.forEach(n => increment(n, weights.bac_nho));
    bacNhoKhung3Candidates.forEach(n => increment(n, weights.khung_3));

    // 4. Select exactly 36 numbers
    const allNumbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
    const ranked = allNumbers.sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
    
    const prediction36 = ranked.slice(0, 36);

    return {
        draw_date: actualTargetDate,
        prediction_36: prediction36,
        analysis_meta: {
            weights,
            sources: ['Sum', 'Edge', 'Touch', 'Freq', 'Bạc Nhớ', 'Khung 3N'],
            top_rule: "Kết hợp đa luồng: Bạc Nhớ + Tổng Đề + Chạm Pivot."
        }
    };
}

async function getCandidatesBySum(date: string): Promise<string[]> {
    const res = await queryOne('SELECT special_prize FROM xsmb_results WHERE draw_date <= ? ORDER BY draw_date DESC LIMIT 1', [date]);
    if (!res?.special_prize) return [];
    const digits = res.special_prize.split('').map(Number);
    const sum = digits.reduce((a: number, b: number) => a + b, 0);
    const s = sum.toString();
    const rev = s.split('').reverse().join('');
    return Array.from(new Set([s.padStart(2, '0'), rev.padStart(2, '0')]));
}

async function getCandidatesByEdge(date: string): Promise<string[]> {
    const res = await queryOne('SELECT special_prize FROM xsmb_results WHERE draw_date <= ? ORDER BY draw_date DESC LIMIT 1', [date]);
    if (!res?.special_prize) return [];
    const s = res.special_prize;
    return [s[0] + s[4], s[4] + s[0]];
}

async function getCandidatesByTouch(date: string): Promise<string[]> {
    const res = await queryOne('SELECT special_prize FROM xsmb_results WHERE draw_date <= ? ORDER BY draw_date DESC LIMIT 1', [date]);
    if (!res?.special_prize) return [];
    const touch = res.special_prize[2];
    const set = [];
    for(let i=0; i<10; i++) {
        set.push(touch + i);
        set.push(i + touch);
    }
    return Array.from(new Set(set));
}

async function getCandidatesByFreq(date: string): Promise<string[]> {
    const results = await query('SELECT special_prize FROM xsmb_results WHERE draw_date <= ? ORDER BY draw_date DESC LIMIT 50', [date]);
    const freq: Record<string, number> = {};
    results.forEach((r: any) => {
        const de = r.special_prize.slice(-2);
        freq[de] = (freq[de] || 0) + 1;
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20).map(e => e[0]);
}

async function getCandidatesByBacNhoSoDon(date: string): Promise<string[]> {
    try {
        const data = await analyzeBacNhoSoDon(150, date);
        // Extract top 15 predicted numbers from Bạc Nhớ
        const numbers = new Set<string>();
        data.todayPredictions.forEach(pred => {
            pred.predictions.slice(0, 3).forEach(p => numbers.add(p.number));
        });
        return Array.from(numbers).slice(0, 15);
    } catch (e) {
        console.error('Error fetching Bạc Nhớ Số Đơn candidates:', e);
        return [];
    }
}

async function getCandidatesByBacNhoKhung3(date: string): Promise<string[]> {
    try {
        const data = await analyzeBacNhoSoDonKhung3Ngay(150, date);
        // Extract top 15 predicted numbers from Bạc Nhớ Khung 3 Ngày
        const numbers = new Set<string>();
        data.todayPredictions.forEach(pred => {
            pred.predictions.slice(0, 3).forEach(p => numbers.add(p.number));
        });
        return Array.from(numbers).slice(0, 15);
    } catch (e) {
        console.error('Error fetching Bạc Nhớ Khung 3 Ngày candidates:', e);
        return [];
    }
}

/**
 * Verification logic: Compare previous prediction with actual results
 */
export async function verifyHoiDongDe(resultDate: string) {
    const actual = await queryOne('SELECT special_prize FROM xsmb_results WHERE draw_date = ?', [resultDate]);
    if (!actual?.special_prize) return;

    const actualDe = actual.special_prize.slice(-2);
    
    // Find prediction for this date in history
    const history = await queryOne('SELECT * FROM hoi_dong_de_history WHERE draw_date = ?', [resultDate]);
    if (history) {
        const pred36 = JSON.parse(history.prediction_36);
        const isHit = pred36.includes(actualDe);
        
        await query('UPDATE hoi_dong_de_history SET actual_de = ?, is_hit = ? WHERE draw_date = ?', [actualDe, isHit ? 1 : 0, resultDate]);
    }
}
