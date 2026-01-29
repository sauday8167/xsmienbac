import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Post, ApiResponse } from '@/types';

// Fallback: Generate sample posts when DB is unavailable
function generateSamplePosts(): Post[] {
    const today = new Date().toISOString();

    return [
        {
            id: 1,
            title: 'Hướng dẫn dò vé số XSMB online nhanh chóng',
            slug: 'huong-dan-do-ve-so-xsmb-online',
            content: '<h2>Cách dò vé số XSMB</h2><p>Để dò vé số trực tuyến, bạn chỉ cần nhập các số trên vé của mình vào ô tìm kiếm và chọn ngày quay. Hệ thống sẽ tự động kiểm tra và thông báo kết quả trúng thưởng.</p><h3>Các bước thực hiện:</h3><ol><li>Truy cập trang Dò vé số</li><li>Nhập số trên vé của bạn</li><li>Chọn ngày quay số</li><li>Nhấn "Kiểm tra" để xem kết quả</li></ol>',
            excerpt: 'Hướng dẫn chi tiết cách dò vé số XSMB trực tuyến nhanh chóng và chính xác',
            thumbnail: null,
            category: 'tips',
            meta_title: 'Hướng dẫn dò vé số XSMB online',
            meta_description: 'Cách dò vé số XSMB online nhanh chóng, chính xác',
            status: 'published',
            views: 1250,
            created_at: today,
            updated_at: today,
            published_at: today,
        },
        {
            id: 2,
            title: 'Thống kê tần suất xuất hiện các cặp số XSMB',
            slug: 'thong-ke-tan-suat-xuat-hien-cac-cap-so-xsmb',
            content: '<h2>Phân tích thống kê</h2><p>Dựa trên dữ liệu lịch sử, một số cặp số có xu hướng xuất hiện thường xuyên hơn. Tuy nhiên, xổ số là trò chơi may rủi và kết quả hoàn toàn ngẫu nhiên.</p><p><strong>Lưu ý:</strong> Thống kê chỉ mang tính chất tham khảo, không đảm bảo kết quả trong tương lai.</p>',
            excerpt: 'Phân tích thống kê tần suất xuất hiện các cặp số trong XSMB',
            thumbnail: null,
            category: 'analysis',
            meta_title: 'Thống kê XSMB',
            meta_description: 'Thống kê tần suất các cặp số XSMB',
            status: 'published',
            views: 890,
            created_at: today,
            updated_at: today,
            published_at: today,
        },
        {
            id: 3,
            title: 'Cơ cấu giải thưởng xổ số miền Bắc',
            slug: 'co-cau-giai-thuong-xo-so-mien-bac',
            content: '<h2>Cơ cấu giải thưởng XSMB</h2><p>Xổ số miền Bắc có 8 giải thưởng chính:</p><ul><li><strong>Giải Đặc biệt:</strong> 1 giải (5 số)</li><li><strong>Giải Nhất:</strong> 1 giải (5 số)</li><li><strong>Giải Nhì:</strong> 2 giải (5 số)</li><li><strong>Giải Ba:</strong> 6 giải (5 số)</li><li><strong>Giải Tư:</strong> 4 giải (4 số)</li><li><strong>Giải Năm:</strong> 6 giải (4 số)</li><li><strong>Giải Sáu:</strong> 3 giải (3 số)</li><li><strong>Giải Bảy:</strong> 4 giải (2 số)</li></ul>',
            excerpt: 'Tìm hiểu về cơ cấu giải thưởng và cách tính tiền thưởng XSMB',
            thumbnail: null,
            category: 'news',
            meta_title: 'Cơ cấu giải thưởng XSMB',
            meta_description: 'Cơ cấu giải thưởng xổ số miền Bắc chi tiết',
            status: 'published',
            views: 2100,
            created_at: today,
            updated_at: today,
            published_at: today,
        },
    ];
}

// GET /api/posts - Get all posts
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        try {
            let sql = 'SELECT * FROM posts WHERE status = ?';
            const params: any[] = ['published'];

            if (category) {
                sql += ' AND category = ?';
                params.push(category);
            }

            sql += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const posts = await query<Post[]>(sql, params);

            // Get total count
            let countSql = 'SELECT COUNT(*) as total FROM posts WHERE status = ?';
            const countParams: any[] = ['published'];

            if (category) {
                countSql += ' AND category = ?';
                countParams.push(category);
            }

            const [countResult] = await query<[{ total: number }]>(countSql, countParams);

            return NextResponse.json<ApiResponse<{ posts: Post[]; total: number }>>({
                success: true,
                data: {
                    posts,
                    total: countResult.total,
                },
            });
        } catch (dbError) {
            console.error('Database error, falling back to sample posts:', dbError);

            // Fallback to sample posts
            const samplePosts = generateSamplePosts();
            let filteredPosts = samplePosts;

            if (category) {
                filteredPosts = samplePosts.filter(post => post.category === category);
            }

            return NextResponse.json<ApiResponse<{ posts: Post[]; total: number }>>({
                success: true,
                data: {
                    posts: filteredPosts.slice(offset, offset + limit),
                    total: filteredPosts.length,
                },
            });
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Lỗi khi lấy danh sách bài viết',
        }, { status: 500 });
    }
}

// POST /api/posts - Create new post (Admin only)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            title,
            slug,
            content,
            excerpt,
            thumbnail,
            category,
            meta_title,
            meta_description,
            status,
        } = body;

        // Validate required fields
        if (!title || !slug || !content) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Thiếu thông tin bắt buộc',
            }, { status: 400 });
        }

        // Insert new post
        await query(
            `INSERT INTO posts 
       (title, slug, content, excerpt, thumbnail, category, meta_title, meta_description, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                slug,
                content,
                excerpt || null,
                thumbnail || null,
                category || 'news',
                meta_title || title,
                meta_description || excerpt,
                status || 'draft',
                status === 'published' ? new Date() : null,
            ]
        );

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Tạo bài viết thành công',
        });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Lỗi khi tạo bài viết',
        }, { status: 500 });
    }
}
