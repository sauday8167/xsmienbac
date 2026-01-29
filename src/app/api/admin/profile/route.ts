export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function getUserId() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token) return null;
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'xsmb_lottery_secret_key_change_in_production_2026');
        return decoded.id;
    } catch (e) {
        return null;
    }
}

export async function GET() {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = await queryOne('SELECT id, username, full_name, email, avatar FROM admins WHERE id = ?', [userId]);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Database Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { full_name, email, password, new_password, avatar } = body;

        // 1. Password change logic
        if (new_password) {
            if (!password) {
                return NextResponse.json({ success: false, error: 'Mật khẩu hiện tại là bắt buộc' }, { status: 400 });
            }

            const user = await queryOne<{ password_hash: string }>('SELECT password_hash FROM admins WHERE id = ?', [userId]);
            if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) {
                return NextResponse.json({ success: false, error: 'Mật khẩu hiện tại không đúng' }, { status: 400 });
            }

            const hashed = await bcrypt.hash(new_password, 10);
            await query('UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashed, userId]);

            // If only password was provided, we can return early
            if (Object.keys(body).length <= 3) { // password, new_password, confirm (confirm might be there)
                return NextResponse.json({ success: true, message: 'Đổi mật khẩu thành công' });
            }
        }

        // 2. Profile info update logic (Dynamic SQL)
        const updateFields: string[] = [];
        const params: any[] = [];

        if (full_name !== undefined) {
            updateFields.push('full_name = ?');
            params.push(full_name);
        }
        if (email !== undefined) {
            updateFields.push('email = ?');
            params.push(email);
        }
        if (avatar !== undefined) {
            updateFields.push('avatar = ?');
            params.push(avatar);
        }

        if (updateFields.length > 0) {
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            const sql = `UPDATE admins SET ${updateFields.join(', ')} WHERE id = ?`;
            params.push(userId);

            const result = await query<{ changes: number }>(sql, params);

            if (result && result.changes === 0) {
                // Query ran but no rows found/changed
                // Could act as warning or silent success depending on preference, 
                // but usually means ID didn't match if we assume fields actually changed
                // However, "UPDATE ... WHERE id = ?" should encounter 1 row.
                // If changes=0, maybe ID is wrong.
                // Let's verify if user exists
                const check = await queryOne('SELECT id FROM admins WHERE id = ?', [userId]);
                if (!check) return NextResponse.json({ success: false, error: 'User not found during update' }, { status: 404 });
            }

            return NextResponse.json({ success: true, message: 'Cập nhật hồ sơ thành công' });
        }

        return NextResponse.json({ success: true, message: 'Không có thông tin nào được thay đổi' });
    } catch (error: any) {
        console.error('Profile Update Error:', error);
        return NextResponse.json({ success: false, error: 'Lỗi hệ thống: ' + error.message }, { status: 500 });
    }
}
