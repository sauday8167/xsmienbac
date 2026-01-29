export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { analyzeBacNhoCap3 } from '@/lib/bac-nho-cap-3';
import { analyzeBacNho2Ngay } from '@/lib/bac-nho-2-ngay';
import { analyzeBacNhoCap3Khung3Ngay } from '@/lib/bac-nho-khung-3-ngay-cap-3';
import { getOrUpdateBacNhoData } from '@/lib/bac-nho-cache-service';

const TIMEFRAMES = [100, 180, 365, 730, 1000];

// Helper to aggregate stats from a list of analysis results
function aggregateStats(results: any[]) {
    // Filter valid results
    const validResults = results.filter(r => r !== null && r.data && r.data.todayPredictions && r.data.todayPredictions.length > 0);

    const highestRateMap = new Map<string, { totalCount: number; details: Record<number, number> }>();

    validResults.forEach((result) => {
        if (!result) return;
        const { days, data } = result;

        // For each prediction group
        data.todayPredictions.forEach((group: any) => {
            if (!group.predictions || group.predictions.length === 0) return;

            // Sort descending to find max correlationRate
            const sorted = [...group.predictions].sort((a: any, b: any) => b.correlationRate - a.correlationRate);
            const maxRate = sorted[0].correlationRate;

            // Take ALL numbers that have the maxRate (tie-breaking)
            const bestNumbers = sorted.filter((p: any) => Math.abs(p.correlationRate - maxRate) < 0.001);

            bestNumbers.forEach((p: any) => {
                const num = p.number;
                if (!highestRateMap.has(num)) {
                    highestRateMap.set(num, { totalCount: 0, details: {} });
                }
                const entry = highestRateMap.get(num)!;
                entry.totalCount += 1;
                entry.details[days] = (entry.details[days] || 0) + 1;
            });
        });
    });

    // Format output
    return Array.from(highestRateMap.entries())
        .map(([number, info]) => ({
            number,
            totalCount: info.totalCount,
            details: info.details
        }))
        .sort((a, b) => b.totalCount - a.totalCount);
}

export async function GET() {
    try {
        // --- 1. Analyze Bac Nho Cap 3 ---
        const cap3Results = await Promise.all(
            TIMEFRAMES.map(async (days) => {
                try {
                    const data = await getOrUpdateBacNhoData(
                        `cap-3-${days}`,
                        async (d) => await analyzeBacNhoCap3(d),
                        days
                    );
                    return { days, data };
                } catch (e) {
                    console.error(`Error analyzing Bac Nho Cap 3 for ${days} days:`, e);
                    return null;
                }
            })
        );

        // --- 2. Analyze Bac Nho 2 Ngay ---
        const haiNgayResults = await Promise.all(
            TIMEFRAMES.map(async (days) => {
                try {
                    const data = await getOrUpdateBacNhoData(
                        `2-ngay-${days}`,
                        async (d) => await analyzeBacNho2Ngay(d),
                        days
                    );
                    return { days, data };
                } catch (e) {
                    console.error(`Error analyzing Bac Nho 2 Ngay for ${days} days:`, e);
                    return null;
                }
            })
        );

        // --- 3. Analyze Bac Nho Nuoi (Khung 3 Ngay Cap 3) ---
        const nuoiResults = await Promise.all(
            TIMEFRAMES.map(async (days) => {
                try {
                    const data = await getOrUpdateBacNhoData(
                        `cap-3-khung-3-ngay-${days}`,
                        async (d) => await analyzeBacNhoCap3Khung3Ngay(d),
                        days
                    );
                    return { days, data };
                } catch (e) {
                    console.error(`Error analyzing Bac Nho Nuoi for ${days} days:`, e);
                    return null;
                }
            })
        );

        // Extract latest date from any successful result
        let latestDate = '';
        const allResults = [...cap3Results, ...haiNgayResults, ...nuoiResults];
        for (const res of allResults) {
            if (res && res.data && res.data.overview && res.data.overview.latestDate) {
                latestDate = res.data.overview.latestDate;
                break;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                date: latestDate,
                cap3: {
                    highestRate: aggregateStats(cap3Results)
                },
                haiNgay: {
                    highestRate: aggregateStats(haiNgayResults)
                },
                nuoi: {
                    highestRate: aggregateStats(nuoiResults)
                }
            }
        });

    } catch (error: any) {
        console.error('Bac Nho Stats Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
