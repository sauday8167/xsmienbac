import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        console.log(`[Admin Results] Fetching result ID: ${id}`);

        const rows = await query<any[]>(
            'SELECT * FROM xsmb_results WHERE id = ?',
            [id]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Kết quả không tồn tại' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('[Admin Results] GET Error:', error);
        return NextResponse.json(
            { success: false, error: 'Lỗi server khi lấy dữ liệu' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { draw_date, special_prize, prize_1, prize_2, prize_3, prize_4, prize_5, prize_6, prize_7 } = body;

        console.log(`[Admin Results] Updating result ID: ${id}`);

        // Validation
        if (!draw_date || !special_prize || !prize_1) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            );
        }

        const p2 = Array.isArray(prize_2) ? JSON.stringify(prize_2) : (prize_2 || '[]');
        const p3 = Array.isArray(prize_3) ? JSON.stringify(prize_3) : (prize_3 || '[]');
        const p4 = Array.isArray(prize_4) ? JSON.stringify(prize_4) : (prize_4 || '[]');
        const p5 = Array.isArray(prize_5) ? JSON.stringify(prize_5) : (prize_5 || '[]');
        const p6 = Array.isArray(prize_6) ? JSON.stringify(prize_6) : (prize_6 || '[]');
        const p7 = Array.isArray(prize_7) ? JSON.stringify(prize_7) : (prize_7 || '[]');

        const result = await query(
            `UPDATE xsmb_results SET 
            draw_date = ?, special_prize = ?, prize_1 = ?, 
            prize_2 = ?, prize_3 = ?, prize_4 = ?, 
            prize_5 = ?, prize_6 = ?, prize_7 = ?,
            updated_at = datetime('now')
            WHERE id = ?`,
            [draw_date, special_prize, prize_1, p2, p3, p4, p5, p6, p7, id]
        );

        if ((result as any).changes === 0) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy bản ghi để cập nhật' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        console.error('[Admin Results] PUT Error:', error);
        return NextResponse.json(
            { success: false, error: 'Lỗi khi cập nhật kết quả' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        console.log(`[Admin Results] Deleting result ID: ${id}`);

        const result = await query('DELETE FROM xsmb_results WHERE id = ?', [id]);

        if ((result as any).changes === 0) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy kết quả để xóa' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Xóa kết quả thành công' });
    } catch (error) {
        console.error('[Admin Results] DELETE Error:', error);
        return NextResponse.json(
            { success: false, error: 'Lỗi khi xóa kết quả' },
            { status: 500 }
        );
    }
}
