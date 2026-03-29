const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function seedPosts() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        const count = await db.get('SELECT count(*) as count FROM posts');
        if (count.count > 0) {
            console.log('Posts table already has data. Skipping seed.');
            return;
        }

        console.log('Seeding sample posts...');
        const today = new Date().toISOString();

        const posts = [
            {
                title: 'Hướng dẫn dò vé số XSMB online nhanh chóng',
                slug: 'huong-dan-do-ve-so-xsmb-online',
                content: '<h2>Cách dò vé số XSMB</h2><p>Để dò vé số trực tuyến, bạn chỉ cần nhập các số trên vé của mình vào ô tìm kiếm và chọn ngày quay. Hệ thống sẽ tự động kiểm tra và thông báo kết quả trúng thưởng.</p><h3>Các bước thực hiện:</h3><ol><li>Truy cập trang Dò vé số</li><li>Nhập số trên vé của bạn</li><li>Chọn ngày quay số</li><li>Nhấn "Kiểm tra" để xem kết quả</li></ol>',
                excerpt: 'Hướng dẫn chi tiết cách dò vé số XSMB trực tuyến nhanh chóng và chính xác',
                category: 'tips',
                status: 'published'
            },
            {
                title: 'Thống kê tần suất xuất hiện các cặp số XSMB',
                slug: 'thong-ke-tan-suat-xuat-hien-cac-cap-so-xsmb',
                content: '<h2>Phân tích thống kê</h2><p>Dựa trên dữ liệu lịch sử, một số cặp số có xu hướng xuất hiện thường xuyên hơn. Tuy nhiên, xổ số là trò chơi may rủi và kết quả hoàn toàn ngẫu nhiên.</p><p><strong>Lưu ý:</strong> Thống kê chỉ mang tính chất tham khảo, không đảm bảo kết quả trong tương lai.</p>',
                excerpt: 'Phân tích thống kê tần suất xuất hiện các cặp số trong XSMB',
                category: 'analysis',
                status: 'published'
            },
            {
                title: 'Cơ cấu giải thưởng xổ số miền Bắc',
                slug: 'co-cau-giai-thuong-xo-so-mien-bac',
                content: '<h2>Cơ cấu giải thưởng XSMB</h2><p>Xổ số miền Bắc có 8 giải thưởng chính:</p><ul><li><strong>Giải Đặc biệt:</strong> 1 giải (5 số)</li><li><strong>Giải Nhất:</strong> 1 giải (5 số)</li><li><strong>Giải Nhì:</strong> 2 giải (5 số)</li><li><strong>Giải Ba:</strong> 6 giải (5 số)</li><li><strong>Giải Tư:</strong> 4 giải (4 số)</li><li><strong>Giải Năm:</strong> 6 giải (4 số)</li><li><strong>Giải Sáu:</strong> 3 giải (3 số)</li><li><strong>Giải Bảy:</strong> 4 giải (2 số)</li></ul>',
                excerpt: 'Tìm hiểu về cơ cấu giải thưởng và cách tính tiền thưởng XSMB',
                category: 'news',
                status: 'published'
            }
        ];

        for (const post of posts) {
            await db.run(
                `INSERT INTO posts (title, slug, content, excerpt, category, status, published_at, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [post.title, post.slug, post.content, post.excerpt, post.category, post.status, today, today, today]
            );
            console.log(`Inserted: ${post.title}`);
        }

        console.log('Seeding completed.');

    } catch (e) {
        console.error('Seeding failed:', e);
    } finally {
        await db.close();
    }
}

seedPosts();
