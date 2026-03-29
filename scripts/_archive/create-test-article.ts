import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'xsmb.db');
const db = new Database(dbPath);

const testArticle = {
    title: 'Phân Tích Soi Cầu XSMB Ngày 19/01/2026 - Dự Đoán AI Chính Xác',
    slug: 'phan-tich-soi-cau-xsmb-19-01-2026',
    excerpt: 'Phân tích chi tiết kết quả XSMB ngày 18/01 và dự đoán số đẹp cho ngày 19/01/2026 dựa trên AI và thống kê chuyên sâu.',
    content: `
<p>Chào quý bạn đọc.</p>

<p>Phiên quay thưởng ngày hôm qua ghi nhận sự xuất hiện của bộ số đặc biệt <strong>17151</strong> và giải nhất <strong>22960</strong>. Chúng ta sẽ đi sâu vào phân tích dữ liệu để tìm kiếm những tin hiệu cho kỳ quay thưởng ngày 19-01-2026.</p>

<h2>🔍 Thống Kê Số Vắng (Lô Gan)</h2>

<p>Các số có tần suất xuất hiện cao trong 30 ngày gần nhất:</p>

<ul>
    <li><strong>90</strong> (21 ngày) - Đang trong chu kỳ gan dài</li>
    <li><strong>59</strong> (14 ngày) - Cần lưu ý</li>
    <li><strong>06, 18</strong> (12 ngày) - Khả năng về cao</li>
    <li><strong>05, 09</strong> (11 ngày)</li>
    <li><strong>65</strong> (10 ngày)</li>
</ul>

<h2>🔥 Thống Kê Nhịp Số (Về Nhiều)</h2>

<p>Các số có tần suất xuất hiện cao trong 30 ngày gần nhất:</p>

<ul>
    <li><strong>17</strong> (14 lần), <strong>83</strong> (14 lần)</li>
    <li><strong>12, 21, 22, 36, 45, 52, 88</strong> (13 lần)</li>
    <li><strong>14</strong> (12 lần)</li>
</ul>

<h3>Góc Nhìn Kỹ Thuật & Bạc Nhớ</h3>

<p>Phân tích số rơi cho thấy cặp <strong>51-15</strong> đang có dấu hiệu khan, cần lưu ý. Các số rơi khác như <strong>21, 89, 94</strong> cũng là những yếu tố đáng cân nhắc.</p>

<p>Dựa trên phương pháp Bạc Nhớ, chúng ta có các cặp số tiềm năng:</p>

<ol>
    <li>Cầu 21 gợi ý cặp 21-12</li>
    <li>Cầu 43 gợi ý cặp 43-34</li>
    <li>Cầu 83 gợi ý cặp 83-38</li>
    <li>Cầu 45 gợi ý cặp 45-54</li>
    <li>Cầu 69 gợi ý cặp 69-96</li>
</ol>

<h2>💎 Dự Đoán AI Cho Ngày 19/01/2026</h2>

<blockquote>
    <p>Dựa trên phân tích tổng hợp từ nhiều phương pháp khác nhau, hệ thống AI đưa ra dự đoán top 5 số có khả năng xuất hiện cao nhất.</p>
</blockquote>

<p><strong>Top 5 Dàn Loto Dự Đoán:</strong></p>

<ul>
    <li><strong style="color: #dc2626; font-size: 1.25rem;">41</strong> - Độ tin cậy: 85%</li>
    <li><strong style="color: #dc2626; font-size: 1.25rem;">04</strong> - Độ tin cậy: 82%</li>
    <li><strong style="color: #dc2626; font-size: 1.25rem;">71</strong> - Độ tin cậy: 78%</li>
    <li><strong style="color: #dc2626; font-size: 1.25rem;">17</strong> - Độ tin cậy: 75%</li>
    <li><strong style="color: #dc2626; font-size: 1.25rem;">10</strong> - Độ tin cậy: 72%</li>
</ul>

<h3>Lưu Ý Quan Trọng</h3>

<p><em>Tất cả các phân tích và dự đoán trên đây chỉ mang tính chất tham khảo, dựa trên thống kê và AI. Kết quả thực tế có thể khác biệt. Vui lòng chơi có trách nhiệm.</em></p>

<h2>📊 Bảng Thống Kê Chi Tiết</h2>

<table>
    <thead>
        <tr>
            <th>Số</th>
            <th>Tần Suất (30 ngày)</th>
            <th>Gan (ngày)</th>
            <th>Khuyến Nghị</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>17</strong></td>
            <td>14 lần</td>
            <td>0</td>
            <td>Nóng 🔥</td>
        </tr>
        <tr>
            <td><strong>90</strong></td>
            <td>2 lần</td>
            <td>21</td>
            <td>Sắp về ⚡</td>
        </tr>
        <tr>
            <td><strong>41</strong></td>
            <td>8 lần</td>
            <td>3</td>
            <td>Cân nhắc 💡</td>
        </tr>
    </tbody>
</table>

<p>Chúc quý bạn may mắn!</p>
`,
    category: 'Phân Tích',
    status: 'published',
    thumbnail: 'https://via.placeholder.com/1200x630/dc2626/ffffff?text=XSMB+Phan+Tich',
    meta_title: 'Phân Tích Soi Cầu XSMB 19/01/2026 | Dự Đoán AI',
    meta_description: 'Phân tích chi tiết kết quả XSMB, thống kê lô gan, nhịp số và dự đoán AI cho ngày 19/01/2026. Độ chính xác cao.',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 0,
    author: 'XSMB AI'
};

try {
    const stmt = db.prepare(`
        INSERT INTO posts (
            title, slug, excerpt, content, category, status, 
            thumbnail, meta_title, meta_description, 
            published_at, created_at, updated_at, views, author
        ) VALUES (
            ?, ?, ?, ?, ?, ?, 
            ?, ?, ?, 
            ?, ?, ?, ?, ?
        )
    `);

    const result = stmt.run(
        testArticle.title,
        testArticle.slug,
        testArticle.excerpt,
        testArticle.content,
        testArticle.category,
        testArticle.status,
        testArticle.thumbnail,
        testArticle.meta_title,
        testArticle.meta_description,
        testArticle.published_at,
        testArticle.created_at,
        testArticle.updated_at,
        testArticle.views,
        testArticle.author
    );

    console.log('✅ Test article created successfully!');
    console.log(`📝 Article ID: ${result.lastInsertRowid}`);
    console.log(`🔗 URL: http://localhost:3000/tin-tuc/${testArticle.slug}`);
    console.log(`\n✨ Features to test:`);
    console.log('   - Enhanced typography (h2, h3, p, lists)');
    console.log('   - Facebook Follow CTA in sidebar');
    console.log('   - Mobile responsive layout');
    console.log('   - Open Graph tags for Facebook sharing');

} catch (error) {
    console.error('❌ Error creating test article:', error);
} finally {
    db.close();
}
