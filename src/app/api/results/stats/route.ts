export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { LotteryResultRaw, NumberFrequency, LotoStats, ApiResponse } from '@/types';

// Fallback: Generate statistics from external API when DB is unavailable
async function generateStatsFromApi(): Promise<LotoStats | null> {
    try {
        const apiUrl = process.env.LOTTERY_API_URL || 'https://api-xsmb-today.onrender.com/api/v1';
        console.log('Generating statistics from external API:', apiUrl);

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const apiData = await response.json();

        // Initialize frequency maps
        const dauFreq: { [key: string]: { [num: string]: { count: number; lastSeen: string } } } = {};
        const duoiFreq: { [key: string]: { [num: string]: { count: number; lastSeen: string } } } = {};

        for (let i = 0; i <= 9; i++) {
            dauFreq[i] = {};
            duoiFreq[i] = {};
        }

        // Transform date
        const [day, month, year] = apiData.time.split('-');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        // Collect all numbers from API result
        const allNumbers: string[] = [
            ...apiData.results.ĐB,
            ...apiData.results.G1,
            ...apiData.results.G2,
            ...apiData.results.G3,
            ...apiData.results.G4,
            ...apiData.results.G5,
            ...apiData.results.G6,
            ...apiData.results.G7,
        ];

        // Process each number
        allNumbers.forEach((num) => {
            if (!num) return;

            // Get last 2 digits for loto
            const loto = num.slice(-2).padStart(2, '0');
            const dau = loto[0];
            const duoi = loto[1];

            // Count đầu
            if (!dauFreq[dau][loto]) {
                dauFreq[dau][loto] = { count: 0, lastSeen: formattedDate };
            }
            dauFreq[dau][loto].count++;

            // Count đuôi
            if (!duoiFreq[duoi][loto]) {
                duoiFreq[duoi][loto] = { count: 0, lastSeen: formattedDate };
            }
            duoiFreq[duoi][loto].count++;
        });

        // Transform to array format
        const stats: LotoStats = {
            dau: {},
            duoi: {},
        };

        for (let i = 0; i <= 9; i++) {
            const key = String(i);

            stats.dau[key] = Object.entries(dauFreq[i])
                .map(([number, data]) => ({
                    number,
                    count: data.count,
                    lastSeen: data.lastSeen,
                }))
                .sort((a, b) => b.count - a.count);

            stats.duoi[key] = Object.entries(duoiFreq[i])
                .map(([number, data]) => ({
                    number,
                    count: data.count,
                    lastSeen: data.lastSeen,
                }))
                .sort((a, b) => b.count - a.count);
        }

        return stats;
    } catch (error) {
        console.error('Error generating stats from API:', error);
        return null;
    }
}

// Calculate loto statistics (đầu/đuôi)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        try {
            // Try to get data from database first
            const results = await query<LotteryResultRaw[]>(
                'SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT ?',
                [days]
            );

            if (results.length === 0) {
                throw new Error('No data in database');
            }

            // Initialize frequency maps
            const dauFreq: { [key: string]: { [num: string]: { count: number; lastSeen: string } } } = {};
            const duoiFreq: { [key: string]: { [num: string]: { count: number; lastSeen: string } } } = {};

            // Initialize 0-9 buckets
            for (let i = 0; i <= 9; i++) {
                dauFreq[i] = {};
                duoiFreq[i] = {};
            }

            // Process each result
            results.forEach((result) => {
                const allNumbers: string[] = [];

                // Collect all numbers
                allNumbers.push(result.special_prize);
                allNumbers.push(result.prize_1);
                allNumbers.push(...JSON.parse(result.prize_2));
                allNumbers.push(...JSON.parse(result.prize_3));
                allNumbers.push(...JSON.parse(result.prize_4));
                allNumbers.push(...JSON.parse(result.prize_5));
                allNumbers.push(...JSON.parse(result.prize_6));
                allNumbers.push(...JSON.parse(result.prize_7));

                // Process each number
                allNumbers.forEach((num) => {
                    if (!num) return;

                    // Get last 2 digits for loto
                    const loto = num.slice(-2).padStart(2, '0');
                    const dau = loto[0];
                    const duoi = loto[1];

                    // Count đầu
                    if (!dauFreq[dau][loto]) {
                        dauFreq[dau][loto] = { count: 0, lastSeen: result.draw_date };
                    }
                    dauFreq[dau][loto].count++;
                    if (result.draw_date > dauFreq[dau][loto].lastSeen) {
                        dauFreq[dau][loto].lastSeen = result.draw_date;
                    }

                    // Count đuôi
                    if (!duoiFreq[duoi][loto]) {
                        duoiFreq[duoi][loto] = { count: 0, lastSeen: result.draw_date };
                    }
                    duoiFreq[duoi][loto].count++;
                    if (result.draw_date > duoiFreq[duoi][loto].lastSeen) {
                        duoiFreq[duoi][loto].lastSeen = result.draw_date;
                    }
                });
            });

            // Transform to array format
            const stats: LotoStats = {
                dau: {},
                duoi: {},
            };

            for (let i = 0; i <= 9; i++) {
                const key = String(i);

                stats.dau[key] = Object.entries(dauFreq[i])
                    .map(([number, data]) => ({
                        number,
                        count: data.count,
                        lastSeen: data.lastSeen,
                    }))
                    .sort((a, b) => b.count - a.count);

                stats.duoi[key] = Object.entries(duoiFreq[i])
                    .map(([number, data]) => ({
                        number,
                        count: data.count,
                        lastSeen: data.lastSeen,
                    }))
                    .sort((a, b) => b.count - a.count);
            }

            return NextResponse.json<ApiResponse<LotoStats>>({
                success: true,
                data: stats,
            });
        } catch (dbError) {
            console.error('Database error, falling back to API:', dbError);

            // Fallback to external API
            const apiStats = await generateStatsFromApi();
            if (apiStats) {
                return NextResponse.json<ApiResponse<LotoStats>>({
                    success: true,
                    data: apiStats,
                });
            }

            throw dbError;
        }
    } catch (error) {
        console.error('Error calculating statistics:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Lỗi khi tính toán thống kê',
        }, { status: 500 });
    }
}
