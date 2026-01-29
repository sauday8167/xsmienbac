import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
    try {
        const rows = await query<RowDataPacket[]>(
            'SELECT id, username, full_name, email, role, is_active, last_login, created_at FROM admins ORDER BY created_at DESC'
        );
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Database Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password, full_name, email, role } = body;

        if (!username || !password) {
            return NextResponse.json(
                { success: false, error: 'Thiếu username hoặc password' },
                { status: 400 }
            );
        }

        // Check if username exists
        const existing = await query<RowDataPacket[]>(
            'SELECT id FROM admins WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Username đã tồn tại' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await query<ResultSetHeader>(
            `INSERT INTO admins (username, password_hash, full_name, email, role)
            VALUES (?, ?, ?, ?, ?)`,
            [username, hashedPassword, full_name, email, role || 'editor']
        );

        return NextResponse.json({
            success: true,
            message: 'Tạo người dùng thành công',
            data: { id: result.insertId, username, full_name, role }
        });
    } catch (error) {
        console.error('Create User Error:', error);
        return NextResponse.json(
            { success: false, error: 'Lỗi khi tạo người dùng' },
            { status: 500 }
        );
    }
}
