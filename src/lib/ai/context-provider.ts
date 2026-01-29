import { query, queryOne } from '@/lib/db';
import { calculateLoGan, calculateFrequent } from '@/lib/statistics';
import { analyzeBacNhoSoDon } from '@/lib/bac-nho-so-don';
import { analyzeBacNhoCap2 } from '@/lib/bac-nho-cap-2';
import { analyzeBacNhoCap3 } from '@/lib/bac-nho-cap-3';
import { analyzeBacNho2Ngay } from '@/lib/bac-nho-2-ngay';
// Temporarily disabled - export names don't match
// import { analyzeBacNhoKhung3SoDon } from '@/lib/bac-nho-khung-3-ngay-so-don';
// import { analyzeBacNhoKhung3Cap2 } from '@/lib/bac-nho-khung-3-ngay-cap-2';
// import { analyzeBacNhoKhung3Cap3 } from '@/lib/bac-nho-khung-3-ngay-cap-3';
import { analyzeBacNho2NgayKhung3Ngay } from '@/lib/bac-nho-khung-3-ngay-2-ngay';
import { analyzeLotoRoi } from '@/lib/loto-roi';
import { analyzeAntigravityGdb } from '@/lib/gdb-analysis';
import { getDbTomorrowStats } from '@/lib/db-tomorrow-stats';
import { getPrize1TomorrowStats } from '@/lib/prize1-tomorrow-stats';
import { aggregatePredictionsV2 } from '@/lib/prediction-aggregator-v2';
import { extractAllLotos } from './data-formatters';

export class ContextProvider {
    /**
     * Enhanced context gathering - collects ALL available analysis data
     */
    static async getDailyContext(targetDate: string): Promise<any> {
        console.log(`Building comprehensive context for ${targetDate}...`);

        // Get yesterday's date (the data we're analyzing FROM)
        const yesterday = new Date(targetDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        try {
            // 1. RAW DATA - Recent 30 days
            const recent30 = await query(`
                SELECT * FROM xsmb_results 
                ORDER BY draw_date DESC 
                LIMIT 30
            `);

            const latestResult = await queryOne(`
                SELECT * FROM xsmb_results 
                WHERE draw_date = ?
            `, [yesterdayStr]);

            // 2. FREQUENCY STATS
            console.log('  - Calculating frequency stats...');
            const hotLotos = await calculateFrequent(20, 30);
            const coldLotos = await calculateLoGan(20, 50);

            // 3. BAC NHO (Silver Memory) - All 4 types
            console.log('  - Running Bạc Nhớ analysis...');
            const bacNhoSoDonResult = await analyzeBacNhoSoDon(100, yesterdayStr);
            const bacNhoCap2Result = await analyzeBacNhoCap2(100, yesterdayStr);
            const bacNhoCap3Result = await analyzeBacNhoCap3(100, yesterdayStr);
            const bacNho2NgayResult = await analyzeBacNho2Ngay(100, yesterdayStr);

            // Extract predictions from results
            const bacNhoSoDon = bacNhoSoDonResult.todayPredictions;
            const bacNhoCap2 = bacNhoCap2Result.todayPredictions;
            const bacNhoCap3 = bacNhoCap3Result.todayPredictions;
            const bacNho2Ngay = bacNho2NgayResult.todayPredictions;

            // 4. BAC NHO KHUNG 3 NGAY - Temporarily disabled due to import errors
            console.log('  - Running Bạc Nhớ Khung 3 Ngày...');
            // const bacNhoK3SoDonResult = await analyzeBacNhoKhung3SoDon(100, yesterdayStr);
            // const bacNhoK3Cap2Result = await analyzeBacNhoKhung3Cap2(100, yesterdayStr);
            // const bacNhoK3Cap3Result = await analyzeBacNhoKhung3Cap3(100, yesterdayStr);
            const bacNhoK3_2NgayResult = await analyzeBacNho2NgayKhung3Ngay(100, yesterdayStr);

            // Extract predictions
            const bacNhoK3SoDon = null; // bacNhoK3SoDonResult.todayPredictions;
            const bacNhoK3Cap2 = null; // bacNhoK3Cap2Result.todayPredictions;
            const bacNhoK3Cap3 = null; // bacNhoK3Cap3Result.todayPredictions;
            const bacNhoK3_2Ngay = bacNhoK3_2NgayResult.todayPredictions;

            // 5. LOTO ROI ALGORITHM
            console.log('  - Running Loto Rơi algorithm...');
            const lotoRoi = await analyzeLotoRoi(yesterdayStr);

            // 6. SPECIAL PRIZE ANALYSIS
            console.log('  - Analyzing special prize patterns...');
            const gdbAnalysis = latestResult ? await analyzeAntigravityGdb(latestResult.special_prize) : null;
            const dbTomorrowStats = latestResult ? await getDbTomorrowStats(latestResult.special_prize) : null;

            // 7. FIRST PRIZE ANALYSIS
            console.log('  - Analyzing first prize patterns...');
            const g1TomorrowStats = latestResult ? await getPrize1TomorrowStats(latestResult.prize_1) : null;

            // 8. AGGREGATED PREDICTIONS (combines all methods with weighted scoring)
            console.log('  - Running prediction aggregator...');
            const aggregated = await aggregatePredictionsV2();

            // 9. PREDICTION HISTORY (Self-Correction)
            console.log('  - Fetching prediction history...');
            const history = await query(`
                SELECT * FROM ai_predictions 
                WHERE draw_date < ? 
                ORDER BY draw_date DESC 
                LIMIT 5
            `, [targetDate]);

            console.log('✓ Context building complete');

            return {
                date: targetDate,
                yesterday: yesterdayStr,

                // Raw data
                recent_results: recent30,
                latest_result: latestResult,
                all_lotos_latest: latestResult ? extractAllLotos(latestResult) : [],

                // Frequency
                frequency: {
                    hot_lotos: hotLotos,
                    cold_lotos: coldLotos
                },

                // Bạc Nhớ
                bac_nho: {
                    so_don: bacNhoSoDon,
                    cap_2: bacNhoCap2,
                    cap_3: bacNhoCap3,
                    hai_ngay: bacNho2Ngay
                },

                // Bạc Nhớ Khung 3 Ngày
                bac_nho_khung_3: {
                    so_don: bacNhoK3SoDon,
                    cap_2: bacNhoK3Cap2,
                    cap_3: bacNhoK3Cap3,
                    hai_ngay: bacNhoK3_2Ngay
                },

                // Loto Rơi
                loto_roi: lotoRoi,

                // Special Prize
                special_prize_analysis: {
                    gdb: gdbAnalysis,
                    tomorrow_stats: dbTomorrowStats
                },

                // First Prize
                first_prize_analysis: {
                    tomorrow_stats: g1TomorrowStats
                },

                // Aggregated
                aggregated_predictions: aggregated,

                // History
                history: history
            };

        } catch (error) {
            console.error('Error building context:', error);
            // Return minimal context on error
            return {
                date: targetDate,
                yesterday: yesterdayStr,
                error: 'Failed to build full context',
                recent_results: []
            };
        }
    }

    /**
     * Format the context into a readable prompt for AI
     */
    static formatContextForPrompt(context: any): string {
        const {
            formatRecentResults,
            formatFrequencyStats,
            formatBacNhoData,
            format3DayBacNho,
            formatLotoRoiData,
            formatDBStats,
            formatPrizeStats,
            formatAggregatedPredictions,
            formatPredictionHistory
        } = require('./data-formatters');

        let text = `# COMPREHENSIVE LOTTERY ANALYSIS\n\n`;
        text += `Analysis Date: ${context.date}\n`;
        text += `Data Source: ${context.yesterday} and previous 30 days\n\n`;

        // 0. History (Self-Correction) - PUT FIRST for emphasis
        if (context.history && context.history.length > 0) {
            text += formatPredictionHistory(context.history);
            text += `\n---\n\n`;
        }

        text += `---\n\n`;

        // 1. Recent Results
        text += `## 1. RECENT RESULTS (Last 5 Days)\n\n`;
        text += formatRecentResults(context.recent_results?.slice(0, 5) || []);
        text += `\n---\n\n`;

        // 2. Frequency Analysis
        text += `## 2. FREQUENCY ANALYSIS\n\n`;
        text += formatFrequencyStats(context.frequency);
        text += `\n---\n\n`;

        // 3. Bạc Nhớ
        text += `## 3. BẠC NHỚ (SILVER MEMORY)\n\n`;
        text += formatBacNhoData(context.bac_nho);
        text += `\n---\n\n`;

        // 4. Bạc Nhớ Khung 3 Ngày
        text += `## 4. BẠC NHỚ KHUNG 3 NGÀY\n\n`;
        text += format3DayBacNho(context.bac_nho_khung_3);
        text += `\n---\n\n`;

        // 5. Loto Rơi
        text += `## 5. LOTO RƠI ALGORITHM\n\n`;
        text += formatLotoRoiData(context.loto_roi);
        text += `\n---\n\n`;

        // 6. Special Prize
        if (context.special_prize_analysis) {
            text += `## 6. SPECIAL PRIZE PATTERNS\n\n`;
            if (context.special_prize_analysis.gdb) {
                text += `**Antigravity GDB**: ${JSON.stringify(context.special_prize_analysis.gdb).substring(0, 200)}...\n\n`;
            }
            if (context.special_prize_analysis.tomorrow_stats) {
                text += formatPrizeStats(
                    context.special_prize_analysis.tomorrow_stats,
                    'Tomorrow After This DB Pattern'
                );
            }
            text += `\n---\n\n`;
        }

        // 7. First Prize
        if (context.first_prize_analysis?.tomorrow_stats) {
            text += `## 7. FIRST PRIZE PATTERNS\n\n`;
            text += formatPrizeStats(
                context.first_prize_analysis.tomorrow_stats,
                'Tomorrow After This G1 Pattern'
            );
            text += `\n---\n\n`;
        }

        // 8. Aggregated Predictions
        text += `## 8. MULTI-METHOD AGGREGATED PREDICTIONS\n\n`;
        text += formatAggregatedPredictions(context.aggregated_predictions);
        text += `\n---\n\n`;

        return text;
    }
}
