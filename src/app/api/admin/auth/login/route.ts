import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { ApiResponse } from '@/types';

interface Admin {
    id: number;
    username: string;
    password_hash: string;
    full_name: string;
    role: string;
    is_active: boolean;
}

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // Validate input
        if (!username || !password) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Vui lòng nhập tên đăng nhập và mật khẩu',
            }, { status: 400 });
        }

        try {
            // Find admin user
            const admin = await queryOne<Admin>(
                'SELECT * FROM admins WHERE username = ? AND is_active = TRUE',
                [username]
            );

            if (!admin) {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Tên đăng nhập hoặc mật khẩu không đúng',
                }, { status: 401 });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, admin.password_hash);

            if (!isValidPassword) {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Tên đăng nhập hoặc mật khẩu không đúng',
                }, { status: 401 });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                },
                process.env.JWT_SECRET || 'xsmb_lottery_secret_key_change_in_production_2026',
                { expiresIn: '24h' }
            );

            // Create response with HTTP-only cookie
            const response = NextResponse.json<ApiResponse>({
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    user: {
                        id: admin.id,
                        username: admin.username,
                        full_name: admin.full_name,
                        role: admin.role,
                    },
                },
            });

            // Set HTTP-only cookie
            response.cookies.set('admin_token', token, {
                httpOnly: true,
                secure: false, // Allow HTTP for IP access
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });

            return response;
        } catch (dbError) {
            console.error('Database error during login:', dbError);

            // Fallback for development without database
            if (username === 'admin' && password === 'admin123') {
                const token = jwt.sign(
                    {
                        id: 1,
                        username: 'admin',
                        role: 'super_admin',
                    },
                    process.env.JWT_SECRET || 'xsmb_lottery_secret_key_change_in_production_2026',
                    { expiresIn: '24h' }
                );

                const response = NextResponse.json<ApiResponse>({
                    success: true,
                    message: 'Đăng nhập thành công (Demo mode)',
                    data: {
                        user: {
                            id: 1,
                            username: 'admin',
                            full_name: 'Administrator',
                            role: 'super_admin',
                        },
                    },
                });

                response.cookies.set('admin_token', token, {
                    httpOnly: true,
                    secure: false, // Allow HTTP for IP access
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24,
                    path: '/',
                });

                return response;
            }

            throw dbError;
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Lỗi hệ thống. Vui lòng thử lại sau.',
        }, { status: 500 });
    }
}
