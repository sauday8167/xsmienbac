import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface AdminPayload {
    id: number;
    username: string;
    role: string;
}

export function verifyAdmin(request: NextRequest): AdminPayload | null {
    try {
        // 1. Check Cookies (for Web Admin)
        const cookieToken = request.cookies.get('admin_token')?.value;

        // 2. Check Authorization Header (for Cron Jobs)
        const authHeader = request.headers.get('authorization');
        const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        // Use header token if cookie is missing
        const token = cookieToken || headerToken;

        if (!token) {
            return null;
        }

        // 3. Special case: Cron Secret bypass
        if (token === process.env.CRON_SECRET) {
            return {
                id: 0,
                username: 'system_cron',
                role: 'admin'
            };
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'xsmb_lottery_secret_key_change_in_production_2026'
        ) as AdminPayload;

        return decoded;
    } catch (error) {
        console.error('Admin verification failed:', error);
        return null;
    }
}
