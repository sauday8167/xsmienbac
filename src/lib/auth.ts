import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface AdminPayload {
    id: number;
    username: string;
    role: string;
}

export function verifyAdmin(request: NextRequest): AdminPayload | null {
    try {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return null;
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
