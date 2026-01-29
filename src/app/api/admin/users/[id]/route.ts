import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { password, full_name, role, is_active } = body;

        let sql = 'UPDATE admins SET full_name = ?, role = ?, is_active = ?';
        let values = [full_name, role, is_active];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql += ', password_hash = ?';
            values.push(hashedPassword);
        }

        sql += ' WHERE id = ?';
        values.push(id);

        await query(sql, values);

        return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Database Error' },
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
        // Optional: Prevent deleting self or super_admin
        await query('DELETE FROM admins WHERE id = ?', [id]);
        return NextResponse.json({ success: true, message: 'Xóa người dùng thành công' });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Database Error' },
            { status: 500 }
        );
    }
}
