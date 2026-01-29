import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const slug = params.slug;

        // Find post by slug
        const post = await queryOne(
            'SELECT * FROM posts WHERE slug = ?',
            [slug]
        );

        if (!post) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Bài viết không tồn tại'
            }, { status: 404 });
        }

        // Increment views
        try {
            await query('UPDATE posts SET views = views + 1 WHERE id = ?', [post.id]);
        } catch (viewError) {
            console.error('Error incrementing views:', viewError);
            // Don't fail the request if view increment fails
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Error fetching post detail:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Lỗi khi lấy thông tin bài viết'
        }, { status: 500 });
    }
}
