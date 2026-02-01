import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { LotteryResultRaw, LotteryResult, ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Transform raw database result to proper format
function transformResult(raw: LotteryResultRaw): LotteryResult {
    const parseSafe = (val: string) => {
        try {
            if (!val || val === 'null') return [];
            const parsed = JSON.parse(val);
            if (parsed === null) return [];
            return Array.isArray(parsed) ? parsed : [String(val)];
        } catch (e) {
            return [String(val)];
        }
    };

    const parseStringSafe = (val: string) => {
        try {
            if (!val) return '';
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? (parsed[0] || '') : String(val);
        } catch (e) {
            return String(val || '');
        }
    };

    return {
        ...raw,
        prize_1: parseStringSafe(raw.prize_1),
        prize_2: parseSafe(raw.prize_2),
        prize_3: parseSafe(raw.prize_3),
        prize_4: parseSafe(raw.prize_4),
        prize_5: parseSafe(raw.prize_5),
        prize_6: parseSafe(raw.prize_6),
        prize_7: parseSafe(raw.prize_7),
    };
}


// Fetch data directly from external API (fallback when DB is unavailable)
async function fetchFromExternalApi(): Promise<LotteryResult | null> {
    try {
        const apiUrl = process.env.LOTTERY_API_URL || 'https://api-xsmb-today.onrender.com/api/v1';
        console.log('Fetching from external API:', apiUrl);

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const apiData = await response.json();

        // Transform date from "7-1-2026" to "2026-01-07"
        const [day, month, year] = apiData.time.split('-');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        // Transform to our format
        return {
            id: 1,
            draw_date: formattedDate,
            special_prize: apiData.results.ĐB[0],
            prize_1: apiData.results.G1[0],
            prize_2: apiData.results.G2,
            prize_3: apiData.results.G3,
            prize_4: apiData.results.G4,
            prize_5: apiData.results.G5,
            prize_6: apiData.results.G6,
            prize_7: apiData.results.G7,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error fetching from external API:', error);
        return null;
    }
}

// GET /api/results - Get lottery results
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const limit = parseInt(searchParams.get('limit') || '30');
        const offset = parseInt(searchParams.get('offset') || '0');

        if (date) {
            // Get specific date result
            try {
                const result = await queryOne<LotteryResultRaw>(
                    'SELECT * FROM xsmb_results WHERE draw_date = ?',
                    [date]
                );

                if (!result) {
                    return NextResponse.json<ApiResponse>({
                        success: false,
                        error: 'Không tìm thấy kết quả cho ngày này',
                    }, { status: 404 });
                }

                return NextResponse.json<ApiResponse<LotteryResult>>({
                    success: true,
                    data: transformResult(result),
                });
            } catch (dbError) {
                console.error('Database error, falling back to API:', dbError);
                // Fallback to API if date matches today
                const apiResult = await fetchFromExternalApi();
                if (apiResult && apiResult.draw_date === date) {
                    return NextResponse.json<ApiResponse<LotteryResult>>({
                        success: true,
                        data: apiResult,
                    });
                }
                throw dbError;
            }
        } else {
            // Get latest results (default 30 days)
            try {
                const results = await query<LotteryResultRaw[]>(
                    'SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT ? OFFSET ?',
                    [limit, offset]
                );

                return NextResponse.json<ApiResponse<LotteryResult[]>>({
                    success: true,
                    data: results.map(transformResult),
                });
            } catch (dbError) {
                console.error('Database error, falling back to API:', dbError);
                // Fallback to external API
                const apiResult = await fetchFromExternalApi();
                if (apiResult) {
                    return NextResponse.json<ApiResponse<LotteryResult[]>>({
                        success: true,
                        data: [apiResult],
                    });
                }
                throw dbError;
            }
        }
    } catch (error) {
        console.error('Error fetching lottery results:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Lỗi khi lấy kết quả xổ số',
        }, { status: 500 });
    }
}

// POST /api/results - Create/Update result (Admin only)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            draw_date,
            special_prize,
            prize_1,
            prize_2,
            prize_3,
            prize_4,
            prize_5,
            prize_6,
            prize_7,
        } = body;

        // Validate required fields
        if (!draw_date || !special_prize || !prize_1) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Thiếu thông tin bắt buộc',
            }, { status: 400 });
        }

        // Check if result exists
        const existing = await queryOne<{ id: number }>(
            'SELECT id FROM xsmb_results WHERE draw_date = ?',
            [draw_date]
        );

        if (existing) {
            // Update existing
            await query(
                `UPDATE xsmb_results SET 
         special_prize = ?, prize_1 = ?, prize_2 = ?, prize_3 = ?,
         prize_4 = ?, prize_5 = ?, prize_6 = ?, prize_7 = ?
         WHERE draw_date = ?`,
                [
                    special_prize,
                    prize_1,
                    JSON.stringify(prize_2 || []),
                    JSON.stringify(prize_3 || []),
                    JSON.stringify(prize_4 || []),
                    JSON.stringify(prize_5 || []),
                    JSON.stringify(prize_6 || []),
                    JSON.stringify(prize_7 || []),
                    draw_date,
                ]
            );

            return NextResponse.json<ApiResponse>({
                success: true,
                message: 'Cập nhật kết quả thành công',
            });
        } else {
            // Insert new
            await query(
                `INSERT INTO xsmb_results 
         (draw_date, special_prize, prize_1, prize_2, prize_3, prize_4, prize_5, prize_6, prize_7)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    draw_date,
                    special_prize,
                    prize_1,
                    JSON.stringify(prize_2 || []),
                    JSON.stringify(prize_3 || []),
                    JSON.stringify(prize_4 || []),
                    JSON.stringify(prize_5 || []),
                    JSON.stringify(prize_6 || []),
                    JSON.stringify(prize_7 || []),
                ]
            );

            return NextResponse.json<ApiResponse>({
                success: true,
                message: 'Thêm kết quả thành công',
            });
        }
    } catch (error) {
        console.error('Error saving lottery result:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Lỗi khi lưu kết quả',
        }, { status: 500 });
    }
}
