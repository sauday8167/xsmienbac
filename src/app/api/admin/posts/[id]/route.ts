import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const post = await queryOne('SELECT *, thumbnail_url as thumbnail FROM posts WHERE id = ?', [id]);

        if (!post) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Bài viết không tồn tại'
            }, { status: 404 });
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Lỗi khi lấy thông tin bài viết'
        }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { title, slug, excerpt, content, category, thumbnail, meta_title, meta_description, status } = body;

        // Validation
        if (!title || !slug || !content) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            }, { status: 400 });
        }

        await query(
            `UPDATE posts SET 
            title = ?, slug = ?, excerpt = ?, content = ?, category = ?, 
            thumbnail_url = ?, meta_title = ?, meta_description = ?, status = ?, updated_at = datetime('now')
            WHERE id = ?`,
            [title, slug, excerpt, content, category, thumbnail, meta_title, meta_description, status || 'draft', id]
        );

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Cập nhật bài viết thành công'
        });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Lỗi khi cập nhật bài viết'
        }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const result = await query('DELETE FROM posts WHERE id = ?', [id]);

        // sqlite result has a 'changes' property
        if ((result as any).changes === 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Không tìm thấy bài viết để xóa hoặc đã bị xóa trước đó'
            }, { status: 404 });
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Xóa bài viết thành công'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Lỗi khi xóa bài viết'
        }, { status: 500 });
    }
}
