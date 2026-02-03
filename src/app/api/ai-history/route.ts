import { NextResponse } from 'next/server';
import { findAIPatternsV2, findAIPatternsLotoDau, findAIPatterns3D, findAIPatterns4D } from '@/lib/ai-patterns';
import { query } from '@/lib/db';
import { LotteryResultRaw, extractAllLotoNumbers, extractHeadLotoNumbers, extractAll3DNumbers, extractAll4DNumbers } from '@/lib/lottery-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        // 1. Fetch enough history for robust stats
        const type = searchParams.get('type') || '2d';

        // User requested 1000 days for 3D/4D. 100 days for others (2D, Loto Dau).
        const analysisDays = (type === '3d' || type === '4d') ? 1000 : 100;
        const displayDays = 10;

        const results = await query<LotteryResultRaw[]>(`
            SELECT * FROM xsmb_results 
            ORDER BY draw_date DESC 
            LIMIT ?
        `, [analysisDays + 5]); // Buffer

        if (results.length === 0) {
            return NextResponse.json({ success: false, error: 'No data' });
        }

        // Generate History for ALL analyzed days
        const historyData: { date: string, results: Record<string, string> }[] = [];

        // Iterate over the results (Target Dates)
        // We only process up to (results.length - 1) because we need prevRecord
        const processLimit = Math.min(results.length - 1, analysisDays);

        for (let i = 0; i < processLimit; i++) {
            const targetResult = results[i];
            const targetDate = targetResult.draw_date;

            // Define Win Condition based on Type
            let targetLotos: Set<string>;

            if (type === 'loto-dau') {
                targetLotos = extractHeadLotoNumbers(targetResult);
            } else if (type === '3d') {
                targetLotos = new Set(extractAll3DNumbers(targetResult));
            } else if (type === '4d') {
                targetLotos = new Set(extractAll4DNumbers(targetResult));
            } else {
                targetLotos = new Set(extractAllLotoNumbers(targetResult));
            }

            // Previous record is at index i + 1 (since sorted DESC)
            const prevRecord = results[i + 1];

            if (!prevRecord) continue;

            const aiInputDate = prevRecord.draw_date;

            // Run AI based on Type
            let patterns: any[] = [];
            if (type === 'loto-dau') {
                patterns = await findAIPatternsLotoDau(aiInputDate);
            } else if (type === '3d') {
                patterns = await findAIPatterns3D(aiInputDate);
            } else if (type === '4d') {
                patterns = await findAIPatterns4D(aiInputDate);
            } else {
                patterns = await findAIPatternsV2(aiInputDate);
            }

            const methodResults: Record<string, string> = {}; // Name -> "WIN" | "LOSS"

            for (const p of patterns) {
                // p.numbers is array of strings.
                const isWin = p.numbers.some((num: string) => targetLotos.has(num));
                methodResults[p.name] = isWin ? 'WIN' : 'LOSS';
            }

            historyData.push({
                date: targetDate,
                results: methodResults
            });
        }

        // 2. Compute Statistics based on ALL historyData
        const methodNames = new Set<string>();
        if (historyData.length > 0) {
            Object.keys(historyData[0].results).forEach(k => methodNames.add(k));
        }

        const stats = Array.from(methodNames).map(name => {
            let wins = 0;
            let total = 0;
            let currentStreak = 0;
            let streakType = 'NONE';

            let maxGan = 0;
            let currentGan = 0;

            let cycleGaps: number[] = [];
            let lastWinIndex = -1;

            // Iterate Chronologically (Past -> Present)
            // historyData is DESC. Reverse it.
            const chronological = [...historyData].reverse();

            for (let i = 0; i < chronological.length; i++) {
                const day = chronological[i];
                const res = day.results[name];
                if (!res) continue;

                total++;

                if (res === 'WIN') {
                    wins++;
                    // Cycle calculation
                    if (lastWinIndex !== -1) {
                        cycleGaps.push(i - lastWinIndex);
                    }
                    lastWinIndex = i;

                    // Gan reset
                    if (currentGan > maxGan) maxGan = currentGan;
                    currentGan = 0;
                } else {
                    currentGan++;
                }

                // Live Streak
                if (streakType === 'NONE') {
                    streakType = res;
                    currentStreak = 1;
                } else if (res === streakType) {
                    currentStreak++;
                } else {
                    streakType = res;
                    currentStreak = 1;
                }
            }

            // Final check maxGan
            if (currentGan > maxGan) maxGan = currentGan;

            // Avg Cycle
            let avgCycle = 0;
            if (cycleGaps.length > 0) {
                avgCycle = cycleGaps.reduce((a, b) => a + b, 0) / cycleGaps.length;
            }

            return {
                name,
                winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
                streak: currentStreak,
                streakType,
                maxGan,
                currentGan, // Explicitly return current Gan
                avgCycle: parseFloat(avgCycle.toFixed(1))
            };
        });

        // 3. Return Stats + Sliced History (Display only last 10 days)
        return NextResponse.json({
            success: true,
            data: {
                history: historyData.slice(0, displayDays),
                stats: stats
            }
        });

    } catch (error: any) {
        console.error('AI History Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to generate history' }, { status: 500 });
    }
}
