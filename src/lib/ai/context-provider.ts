import { query, queryOne } from '@/lib/db';
import { calculateLoGan, calculateFrequent } from '@/lib/statistics';
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

            // 3. BAC NHO (Silver Memory) - Aggregated from Multi-Range DB Cache
            console.log('  - Running Bạc Nhớ analysis (Multi-Range DB)...');
            const DAY_RANGES = [100, 180, 365, 730, 1000];
            
            const getAggregatedBacNho = async (key: string) => {
                const aggregated: any[] = [];
                for (const days of DAY_RANGES) {
                    const nameSuffix = days === 100 ? '' : `-${days}`;
                    const statType = `bac-nho-${key}${nameSuffix}`;
                    const cached = await queryOne<{ stat_value: string }>(
                        'SELECT stat_value FROM statistics_cache WHERE stat_type = ? AND stat_key = ?',
                        [statType, yesterdayStr]
                    );
                    if (cached) {
                        try {
                            const data = JSON.parse(cached.stat_value);
                            if (data.todayPredictions) {
                                aggregated.push(...data.todayPredictions.map((p: any) => ({ ...p, range: days })));
                            }
                        } catch (e) { }
                    }
                }
                return aggregated;
            };

            const bacNhoSoDon = await getAggregatedBacNho('so-don');
            const bacNhoCap2 = await getAggregatedBacNho('cap-2');
            const bacNhoCap3 = await getAggregatedBacNho('cap-3');
            const bacNho2Ngay = await getAggregatedBacNho('2-ngay');

            // 4. BAC NHO KHUNG 3 NGÀY - Aggregated from Multi-Range DB Cache
            console.log('  - Running Bạc Nhớ Khung 3 Ngày (Multi-Range DB)...');
            const bacNhoK3SoDon = await getAggregatedBacNho('khung-3-ngay-so-don');
            const bacNhoK3Cap2 = await getAggregatedBacNho('khung-3-ngay-cap-2');
            const bacNhoK3Cap3 = await getAggregatedBacNho('khung-3-ngay-cap-3');
            const bacNhoK3_2Ngay = await getAggregatedBacNho('khung-3-ngay-2-ngay');

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
