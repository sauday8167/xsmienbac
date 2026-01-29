import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if it's an admin route
    if (pathname.startsWith('/admin')) {
        // Allow access to login page and static assets
        if (
            pathname === '/admin/login' ||
            pathname.startsWith('/admin/_next') ||
            pathname.startsWith('/api/admin/auth')
        ) {
            return NextResponse.next();
        }

        // Check for admin token in cookies
        const adminToken = request.cookies.get('admin_token');

        if (!adminToken) {
            // Redirect to login if no token
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
