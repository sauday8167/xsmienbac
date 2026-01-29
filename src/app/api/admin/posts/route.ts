import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;
        const search = searchParams.get('search') || '';

        let sql = 'SELECT * FROM posts';
        let countSql = 'SELECT COUNT(*) as total FROM posts';
        let params: any[] = [];

        if (search) {
            const searchCondition = ' WHERE title LIKE ? OR excerpt LIKE ?';
            sql += searchCondition;
            countSql += searchCondition;
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const posts = await query(sql, params);
        const totalResult = await query(countSql, search ? [`%${search}%`, `%${search}%`] : []);
        // In SQLite with 'sqlite' package, totalResult is an array
        const total = (totalResult as any)[0]?.total || 0;

        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                posts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching admin posts:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Lỗi khi lấy danh sách bài viết'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, slug, excerpt, content, category, thumbnail, meta_title, meta_description, status } = body;

        // Validation
        if (!title || !slug || !content) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            }, { status: 400 });
        }

        const postStatus = status || 'published';
        const now = new Date().toISOString().slice(0, 19).replace('T', ' '); // SQLite format

        // Insert into database
        const result = await query(
            `INSERT INTO posts 
            (title, slug, excerpt, content, category, thumbnail_url, meta_title, meta_description, status, published_at, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                title,
                slug,
                excerpt,
                content,
                category || 'news',
                thumbnail,
                meta_title,
                meta_description,
                postStatus,
                postStatus === 'published' ? now : null
            ]
        );

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Tạo bài viết thành công',
            data: { id: (result as any).lastID }
        });
    } catch (error) {
        console.error('Error creating post:', error);
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Slug bài viết đã tồn tại'
            }, { status: 400 });
        }
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Lỗi khi tạo bài viết'
        }, { status: 500 });
    }
}
