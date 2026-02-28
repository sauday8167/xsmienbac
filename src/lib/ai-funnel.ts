import { query, queryOne } from './db';
import { LotteryResultRaw, extractAllLotoNumbers } from './lottery-helpers';
import { PERSONALITIES, AIWeights, AIPersonality, saveAIPrediction } from './ai-brain';
import { analyzeBacNho } from './bac-nho';
import { analyzeLotoRoi } from './loto-roi';
import { findBridges } from './soi-cau-bach-thu';
import { calculateLoGan, calculateFrequent } from './statistics';
import { getLatestTacticalAdvice, getCouncilHistory } from './ai-learning';

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
    reasons: string[];
    badges?: string[];
}

export interface AIFunnelResponse {
    date: string;
    personalities: AIPersonality[];
    reflectionLog: {
        speaker: string;
        message: string;
        type: 'info' | 'argument' | 'consensus' | 'dissent';
    }[];
    funnel: FunnelStage[];
    finalPrediction: string[];
}

// Simple seeded random based on string
function seededRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
}

/**
 * QUY TRÌNH ĐỒNG THUẬN & TRANH LUẬN (GEN-NEXT 3.0)
 */
export async function generateConsensusPrediction(daysToAnalyze: number = 100): Promise<AIFunnelResponse> {
    const results = await query<LotteryResultRaw[]>(`
        SELECT * FROM xsmb_results 
        ORDER BY draw_date DESC 
        LIMIT ?
    `, [daysToAnalyze + 10]);

    if (results.length < 10) throw new Error("Cơ sở dữ liệu không đủ dữ liệu để AI phân tích.");

    const latestResult = results[0];
    const latestDate = new Date(latestResult.draw_date);
    const targetDateObj = new Date(latestDate);
    targetDateObj.setDate(targetDateObj.getDate() + 1);
    const drawDate = targetDateObj.toISOString().split('T')[0];

    const rng = (offset: number = 0) => seededRandom(drawDate + offset);

    // --- 💾 CACHE CHECK: Nếu đã có dự đoán cho ngày này, trả về từ cache ---
    let hasCached = false;
    let cachedPredictedNumbers: string[] | null = null;
    try {
        const cached = await queryOne<any>(`
            SELECT predicted_numbers, created_at
            FROM ai_experience
            WHERE draw_date = ? AND prediction_type = 'funnel' AND personality_id = 'consensus_team'
            ORDER BY created_at DESC
            LIMIT 1
        `, [drawDate]);

        if (cached) {
            cachedPredictedNumbers = JSON.parse(cached.predicted_numbers);
            console.log(`💾 AI Funnel Cache HIT for ${drawDate}: ${cachedPredictedNumbers?.join(', ')}`);
            hasCached = true;
        }
    } catch (e) {
        console.warn('Cache check failed, recalculating:', e);
    }

    // --- 🔮 LATEST TACTICAL ADVICE (Gemini Memory) ---
    const tacticalAdvice = await getLatestTacticalAdvice();


    // --- 🌍 DATA GATHERING (Parallel) ---
    const [bacNho, lotoRoi, bridges, loGan, frequent] = await Promise.all([
        analyzeBacNho(30),
        analyzeLotoRoi(),
        findBridges(drawDate, 3),
        calculateLoGan(20, 100),
        calculateFrequent(20, 30)
    ]);

    const logs: AIFunnelResponse['reflectionLog'] = [
        { speaker: 'Hệ thống', message: `🚀 Khởi động phiên thảo luận Gen-Next 3.0 cho kỳ quay ${drawDate}.`, type: 'info' },
        { speaker: 'Hệ thống', message: `👥 Đang triệu tập Hội đồng chuyên gia: ${PERSONALITIES.map(p => p.name).join(', ')}.`, type: 'info' }
    ];

    if (hasCached) {
        logs.push({ speaker: 'Hệ thống', message: `💾 Đang tái hiện lại tiến trình thảo luận đã cached cho kỳ ${drawDate}. Hội đồng đã họp và chốt số này hôm nay.`, type: 'info' });
    }

    // 1. INDIVIDUAL PROPOSALS
    const expertPicks = new Map<string, { number: string, score: number, reasons: string[] }[]>();

    for (const p of PERSONALITIES) {
        const candidates: { number: string, score: number, reasons: string[] }[] = [];
        const weights = getWeightsForPersonality(p.id);

        for (let i = 0; i < 100; i++) {
            const numStr = i.toString().padStart(2, '0');
            let score = 0;
            const reasons: string[] = [];

            // Context-aware scoring
            if (p.id === 'strategist') {
                const freq = frequent.find(f => f.number === numStr);
                if (freq) {
                    score += freq.count * 2;
                    if (freq.count > 5) reasons.push(`Tần suất cao (${freq.count} lần)`);
                }
                const bridge = bridges.find(b => b.predictedNumber === numStr);
                if (bridge) {
                    score += 15;
                    reasons.push(`Cầu bạch thủ biên độ ${bridge.amplitude}`);
                }
            }

            if (p.id === 'maverick') {
                const gan = loGan.find(g => g.number === numStr);
                if (gan && gan.daysSince! > 10) {
                    score += gan.daysSince! * 0.8;
                    reasons.push(`Lô gan ${gan.daysSince} ngày`);
                }
                const bn = bacNho.todayPredictions.find(t => t.yesterdayNumber === numStr);
                if (bn) {
                    score += 10;
                    reasons.push("Bạc nhớ đặc biệt");
                }
            }

            if (p.id === 'intuitive') {
                const roi = lotoRoi.typeB.intersection.numbers.includes(numStr) || lotoRoi.typeB.multiHit.numbers.includes(numStr);
                if (roi) {
                    score += 12;
                    reasons.push("Nhịp lô rơi ổn định");
                }
                score += rng(i) * 10; // Chaos factor
            }

            if (p.id === 'mathematician') {
                if (isPrime(i)) { score += 10; reasons.push("Số nguyên tố"); }
                if (isFibonacci(i)) { score += 8; reasons.push("Dãy Fibonacci"); }
            }

            if (p.id === 'gan_expert') {
                const gan = loGan.find(g => g.number === numStr);
                if (gan && gan.daysSince! > 12) {
                    score += 5; // Cung cấp dữ liệu gan
                    reasons.push(`Số đang gan ${gan.daysSince} ngày`);
                }
            }

            // Apply Tactical Adjustments from Gemini (Dynamic Weights)
            if (tacticalAdvice && tacticalAdvice.weights) {
                const tw = tacticalAdvice.weights;
                if (tw.frequency) score *= (1 + (tw.frequency - 1) * (weights.frequency || 1));
                if (tw.gan) score *= (1 + (tw.gan - 1) * (weights.gan || 1));

                // New weight categories from Gen-Next 3.5
                if (tw.loto_roi && (p.id === 'intuitive' || p.id === 'strategist')) score *= tw.loto_roi;
                if (tw.bac_nho && (p.id === 'maverick' || p.id === 'strategist')) score *= tw.bac_nho;
                if (tw.bridges && (p.id === 'strategist')) score *= tw.bridges;
            }

            // Preferred Numbers Boost
            if (tacticalAdvice?.preferred_numbers?.includes(numStr)) {
                score *= 1.5;
                reasons.push("⭐ Nằm trong danh sách ưu tiên của Hội đồng");
            }

            // Banned Numbers Penalty
            if (tacticalAdvice?.banned_numbers?.includes(numStr)) {
                score *= 0.1; // Gần như loại bỏ
                reasons.push("🚫 Bị Hội đồng cảnh báo rủi ro cao");
            }

            if (score > 0) {
                candidates.push({ number: numStr, score, reasons });
            }
        }

        candidates.sort((a, b) => b.score - a.score);
        expertPicks.set(p.id, candidates.slice(0, 10));
    }

    // 2. THE DEBATE & AGGREGATION
    const consensusMap = new Map<string, { totalScore: number, support: string[], arguments: string[] }>();

    PERSONALITIES.forEach(p => {
        const picks = expertPicks.get(p.id) || [];
        picks.forEach(pick => {
            if (!consensusMap.has(pick.number)) {
                consensusMap.set(pick.number, { totalScore: 0, support: [], arguments: [] });
            }
            const data = consensusMap.get(pick.number)!;

            // Influence scaling: support from multiple experts increases visibility
            data.totalScore += pick.score;
            data.support.push(p.id);
            if (pick.reasons.length > 0) data.arguments.push(`${p.name}: ${pick.reasons[0]}`);
        });
    });

    // 2.5 DISSENT LOGIC & RISK AUDIT (Gan Expert Audit)
    const ganExpertID = 'gan_expert';

    consensusMap.forEach((data, num) => {
        const isSupportedByGan = data.support.includes(ganExpertID);
        const ganInfo = loGan.find(g => g.number === num);

        if (!isSupportedByGan && data.support.length >= 2) {
            if (ganInfo && ganInfo.daysSince! > 15) {
                data.totalScore *= 0.5;
                data.arguments.push(`Chuyên gia Gan: ⚠️ CẢNH BÁO ĐỎ! Số ${num} đang gan ${ganInfo.daysSince} ngày, cực kỳ rủi ro.`);
            }
        }

        // Bonus for multi-expert consensus (Convergence)
        if (data.support.length >= 3) {
            data.totalScore *= 1.3;
        }
    });

    // 3. FINAL SELECTION & REVIEW PHASE
    let topCandidates = Array.from(consensusMap.entries())
        .sort((a, b) => b[1].totalScore - a[1].totalScore)
        .slice(0, 12); // Take 12 for the review phase

    // --- 🛡️ REVIEW PHASE (KPI Alignment) ---
    logs.push({ speaker: 'Hệ thống', message: `🔍 Đang tiến hành giai đoạn Phản biện & Đối soát KPI...`, type: 'info' });

    // Filter out banned numbers if they somehow slipped through
    topCandidates = topCandidates.filter(([num]) => !tacticalAdvice?.banned_numbers?.includes(num));

    // Ensure we have 5 VIPs
    const finalNumbers = topCandidates.slice(0, 5).map(([num]) => num);

    // Add additional logic logs for interesting candidates
    topCandidates.slice(0, 10).forEach(([num, data]) => {
        if (data.support.length >= 3) {
            logs.push({
                speaker: PERSONALITIES.find(p => p.id === data.support[0])?.name || 'Chuyên gia',
                message: `Tôi thấy số **${num}** rất triển vọng. ${data.arguments[0] || ''}.`,
                type: 'consensus'
            });
            logs.push({
                speaker: PERSONALITIES.find(p => p.id === data.support[1])?.name || 'Hội đồng',
                message: `Đồng ý, tôi cũng có dữ liệu ủng hộ con số này.`,
                type: 'consensus'
            });
        } else if (data.support.length === 1) {
            const p = PERSONALITIES.find(p => p.id === data.support[0])!;
            logs.push({
                speaker: p.name,
                message: `Tôi muốn bảo vệ số **${num}**. Dù một mình tôi chọn nhưng ${data.arguments[0] || 'nó có nhịp rất riêng'}.`,
                type: 'argument'
            });
        }
    });

    // 3. FINAL SELECTION (Done in review phase)
    logs.push({ speaker: 'Hệ thống', message: `✅ Hội đồng đã đạt được đồng thuận cuối cùng. Chốt 5 bộ số VIP hướng tới KPI 2+ nháy.`, type: 'info' });

    // Format stages for UI components (simulating the funnel for backward compatibility)
    const stages: FunnelStage[] = [
        { level: 1, name: "Đề Xuất", description: "Các chuyên gia đưa ra lựa chọn riêng lẻ", count: 40, numbers: [] },
        { level: 2, name: "Tranh Luận", description: "Phản biện và dẫn chứng số liệu", count: 20, numbers: [] },
        { level: 3, name: "Sàng Lọc", description: "Loại bỏ các số ít sự đồng thuận", count: 10, numbers: [] },
        { level: 4, name: "Đồng Thuận", description: "Hội tụ tinh hoa (Top 5 VIP)", count: 5, numbers: [] },
    ];

    // Map top candidates into stages for visual funnel
    topCandidates.forEach(([num, data], idx) => {
        const item: FunnelNumber = {
            number: num,
            score: data.totalScore,
            reasons: data.arguments,
            badges: data.support.length > 1 ? [`${data.support.length} Expert`] : []
        };
        if (idx < 5) {
            item.badges?.push("💎 VIP");
            stages[3].numbers.push(item);
        }
        if (idx < 10) stages[2].numbers.push(item);
    });

    if (!hasCached) {
        await saveAIPrediction({
            draw_date: drawDate,
            personality_id: 'consensus_team',
            prediction_type: 'funnel',
            predicted_numbers: finalNumbers,
            weights_used: { consensus: true }
        });
    }

    return {
        date: drawDate,
        personalities: PERSONALITIES,
        reflectionLog: logs,
        funnel: stages,
        finalPrediction: finalNumbers
    };
}

function getWeightsForPersonality(id: string): AIWeights {
    const base: AIWeights = { frequency: 1, gan: 1, tail: 1, primality: 0.2, entropy: 0.5, chaos: 0.3 };
    switch (id) {
        case 'strategist': base.frequency += 1.0; break;
        case 'maverick': base.gan += 1.5; break;
        case 'mathematician': base.primality += 2.0; break;
        case 'intuitive': base.chaos += 2.0; break;
    }
    return base;
}

function isPrime(n: number): boolean {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
}

const FIB_NUMS = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
function isFibonacci(n: number): boolean {
    return FIB_NUMS.includes(n);
}
