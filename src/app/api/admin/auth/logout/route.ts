import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export async function POST(request: Request) {
    const response = NextResponse.json<ApiResponse>({
        success: true,
        message: 'Đăng xuất thành công',
    });

    // Clear the admin token cookie
    response.cookies.delete('admin_token');

    return response;
}
