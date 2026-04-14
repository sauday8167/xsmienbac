import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        const rows = await query<any[]>(
            'SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const countResult = await query<any[]>(
            'SELECT COUNT(*) as total FROM xsmb_results'
        );
        const total = countResult[0]?.total || 0;

        return NextResponse.json({
            success: true,
            data: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { draw_date, special_prize, prize_1, prize_2, prize_3, prize_4, prize_5, prize_6, prize_7 } = body;

        // Validation: Only draw_date is strictly required
        if (!draw_date) {
            return NextResponse.json(
                { success: false, error: 'Thiếu ngày quay thưởng' },
                { status: 400 }
            );
        }

        // Treat undefined prizes as empty strings/null for DB
        const sp = special_prize || null;
        const p1 = prize_1 || null;

        // Format Prizes as JSON strings if they are arrays
        const p2 = Array.isArray(prize_2) ? JSON.stringify(prize_2) : prize_2;
        const p3 = Array.isArray(prize_3) ? JSON.stringify(prize_3) : prize_3;
        const p4 = Array.isArray(prize_4) ? JSON.stringify(prize_4) : prize_4;
        const p5 = Array.isArray(prize_5) ? JSON.stringify(prize_5) : prize_5;
        const p6 = Array.isArray(prize_6) ? JSON.stringify(prize_6) : prize_6;
        const p7 = Array.isArray(prize_7) ? JSON.stringify(prize_7) : prize_7;

        const result = await query<ResultSetHeader>(
            `INSERT INTO xsmb_results 
            (draw_date, special_prize, prize_1, prize_2, prize_3, prize_4, prize_5, prize_6, prize_7)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [draw_date, sp, p1, p2, p3, p4, p5, p6, p7]
        );

        return NextResponse.json({
            success: true,
            message: 'Thêm kết quả thành công',
            data: { id: result.insertId, ...body }
        });
    } catch (error: any) {
        console.error('Database Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                { success: false, error: 'Kết quả ngày này đã tồn tại' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
