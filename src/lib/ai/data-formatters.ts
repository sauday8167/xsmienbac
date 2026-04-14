import type { LotteryResult } from '@/types';

/**
 * Helper functions to format analysis data for AI consumption
 */

export function extractAllLotos(result: any): string[] {
    const lotos = new Set<string>();

    const addLoto = (val: string | null) => {
        if (!val) return;
        const str = String(val).trim();
        if (str.length >= 2) {
            lotos.add(str.slice(-2));
        }
    };

    // Special prize
    addLoto(result.special_prize);

    // Prize 1
    addLoto(result.prize_1);

    // Parse JSON arrays
    const parseAndAdd = (jsonStr: string | null) => {
        if (!jsonStr) return;
        try {
            const arr = JSON.parse(jsonStr);
            if (Array.isArray(arr)) {
                arr.forEach((val: any) => addLoto(String(val)));
            }
        } catch (e) {
            // If not JSON, try as single value
            addLoto(jsonStr);
        }
    };

    parseAndAdd(result.prize_2);
    parseAndAdd(result.prize_3);
    parseAndAdd(result.prize_4);
    parseAndAdd(result.prize_5);
    parseAndAdd(result.prize_6);
    parseAndAdd(result.prize_7);

    return Array.from(lotos).sort();
}

export function formatRecentResults(results: any[]): string {
    if (!results || results.length === 0) return 'No recent data';

    let text = '';
    results.forEach((r, idx) => {
        const lotos = extractAllLotos(r);
        text += `### Day ${idx + 1} (${r.draw_date}):\n`;
        text += `- Special Prize: **${r.special_prize}**\n`;
        text += `- First Prize: **${r.prize_1}**\n`;
        text += `- All Lotos: ${lotos.join(', ')}\n\n`;
    });

    return text;
}

export function formatFrequencyStats(stats: any): string {
    if (!stats) return 'No frequency data';

    let text = '### Frequency Analysis (30 days):\n';

    if (stats.hot_lotos && stats.hot_lotos.length > 0) {
        text += `**Hot Numbers** (Most Frequent):\n`;
        stats.hot_lotos.slice(0, 10).forEach((item: any, idx: number) => {
            text += `${idx + 1}. **${item.number}** (${item.count} times)\n`;
        });
        text += '\n';
    }

    if (stats.cold_lotos && stats.cold_lotos.length > 0) {
        text += `**Cold Numbers** (Lô Gan - Not appeared recently):\n`;
        stats.cold_lotos.slice(0, 10).forEach((item: any, idx: number) => {
            text += `${idx + 1}. **${item.number}** (${item.daysSince} days)\n`;
        });
        text += '\n';
    }

    return text;
}

export function formatBacNhoData(bacNho: any): string {
    if (!bacNho) return 'No Bạc Nhớ data';

    let text = '### Bạc Nhớ (Silver Memory) Analysis:\n\n';

    if (bacNho.so_don && bacNho.so_don.length > 0) {
        text += `**Single Numbers** from yesterday:\n`;
        text += `${bacNho.so_don.slice(0, 10).map((item: any) =>
            `**${item.pattern}** (${item.frequency} times, avg ${item.avgDaysApart}d apart)`
        ).join(', ')}\n\n`;
    }

    if (bacNho.cap_2 && bacNho.cap_2.length > 0) {
        text += `**Pair-2** patterns:\n`;
        text += `${bacNho.cap_2.slice(0, 5).map((item: any) =>
            `**${item.pattern}** (${item.frequency}x)`
        ).join(', ')}\n\n`;
    }

    if (bacNho.cap_3 && bacNho.cap_3.length > 0) {
        text += `**Pair-3** patterns:\n`;
        text += `${bacNho.cap_3.slice(0, 5).map((item: any) =>
            `**${item.pattern}** (${item.frequency}x)`
        ).join(', ')}\n\n`;
    }

    return text;
}

export function formatLotoRoiData(lotoRoi: any): string {
    if (!lotoRoi || !lotoRoi.predictions) return 'No Loto Rơi data';

    let text = '### Loto Rơi (Scientific Algorithm):\n\n';

    if (lotoRoi.typeA && lotoRoi.typeA.length > 0) {
        text += `**Type A** (From Special Prize):\n`;
        lotoRoi.typeA.forEach((item: any) => {
            text += `- **${item.pair.join(' ↔ ')}** (Gan: ${item.gan || 'N/A'})\n`;
        });
        text += '\n';
    }

    if (lotoRoi.typeB && lotoRoi.typeB.length > 0) {
        text += `**Type B** (From First Prize):\n`;
        lotoRoi.typeB.forEach((item: any) => {
            text += `- **${item.pair.join(' ↔ ')}** (Gan: ${item.gan || 'N/A'})\n`;
        });
        text += '\n';
    }

    if (lotoRoi.predictions && lotoRoi.predictions.length > 0) {
        text += `**Top Predictions**: ${lotoRoi.predictions.join(', ')}\n`;
    }

    return text;
}

export function formatDBStats(dbStats: any): string {
    if (!dbStats) return 'No DB stats';

    let text = '### Special Prize Analysis:\n\n';

    if (dbStats.by_weekday) {
        text += `**Pattern by Weekday**:\n`;
        Object.entries(dbStats.by_weekday).forEach(([day, data]: [string, any]) => {
            if (data && data.lotos) {
                text += `- ${day}: ${data.lotos.slice(0, 5).join(', ')}\n`;
            }
        });
        text += '\n';
    }

    if (dbStats.tomorrow_after_db && dbStats.tomorrow_after_db.length > 0) {
        text += `**Tomorrow after this DB pattern**: ${dbStats.tomorrow_after_db.slice(0, 10).join(', ')}\n\n`;
    }

    return text;
}

export function formatAggregatedPredictions(aggregated: any): string {
    if (!aggregated || aggregated.length === 0) return 'No aggregated data';

    let text = '### Multi-Method Aggregated Predictions:\n\n';
    text += 'These numbers scored highest across multiple analysis methods:\n\n';

    aggregated.slice(0, 15).forEach((item: any, idx: number) => {
        const sources = item.sources ? item.sources.join(', ') : 'Unknown';
        text += `${idx + 1}. **${item.number}** - Score: ${item.totalScore.toFixed(1)} - Confidence: ${item.confidence}% - Sources: [${sources}]\n`;
    });

    return text;
}

export function formatPrizeStats(stats: any, title: string): string {
    if (!stats || !Array.isArray(stats) || stats.length === 0) return `No ${title} data`;

    let text = `### ${title}:\n\n`;
    text += 'Top predicted numbers:\n';
    stats.slice(0, 10).forEach((item: any, idx: number) => {
        text += `${idx + 1}. **${item.number}** (${item.frequency} times)\n`;
    });
    text += '\n';

    return text;
}

export function format3DayBacNho(bacNho3Day: any): string {
    if (!bacNho3Day) return 'No 3-day Bạc Nhớ data';

    let text = '### Bạc Nhớ Khung 3 Ngày (3-Day Frame):\n\n';

    if (bacNho3Day.so_don && bacNho3Day.so_don.length > 0) {
        text += `**Single**: ${bacNho3Day.so_don.slice(0, 10).map((i: any) => i.pattern).join(', ')}\n`;
    }

    if (bacNho3Day.cap_2 && bacNho3Day.cap_2.length > 0) {
        text += `**Pair-2**: ${bacNho3Day.cap_2.slice(0, 5).map((i: any) => i.pattern).join(', ')}\n`;
    }

    return text;
}

export function formatPredictionHistory(history: any[]): string {
    if (!history || history.length === 0) return 'No previous prediction history available.';

    let text = '### PREVIOUS AI PERFORMANCE (Last 5 Days):\n\n';
    text += 'Review your recent performance to adjust your strategy:\n\n';

    history.forEach((item) => {
        const predicted = JSON.parse(item.predicted_pairs || '[]');
        const actual = item.actual_result;
        const isWin = item.is_correct === 1;

        text += `- **Date: ${item.draw_date}**\n`;
        text += `  - Predicted: [${predicted.join(', ')}]\n`;
        text += `  - Result: ${actual ? `[${actual}]` : 'Pending'}\n`;
        text += `  - Status: **${isWin ? 'WIN ✅' : 'LOSS ❌'}**\n`;
        if (item.accuracy_notes) {
            text += `  - Notes: ${item.accuracy_notes}\n`;
        }
        text += '\n';
    });

    return text;
}

export function formatRarePairs(rarePairs: any[]): string {
    if (!rarePairs || rarePairs.length === 0) return 'No rare pair data available.';

    let text = '';
    rarePairs.forEach((item, idx) => {
        text += `${idx + 1}. **${item.pair.join(' & ')}** - History: ${item.frequency} times - Days Since: ${item.daysSince} days\n`;
    });
    return text;
}
