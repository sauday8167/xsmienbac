import { queryOne, query } from '../src/lib/db';
import { GeminiClient } from '../src/lib/ai/gemini-client';
import { ClaudeClient } from '../src/lib/ai/claude-client';
import { ArticleInputBuilder } from '../src/lib/services/article-input-builder';

async function main() {
    console.log('[BacNhoBot] Khởi động AI Bạc Nhớ Lô ra cùng Lô...');
    try {
        const latestResult = await queryOne('SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
        if (!latestResult) return;
        
        const date = latestResult.draw_date;
        const [y, m, d] = date.split('-');
        const formattedDate = `${d}-${m}-${y}`;

        const context = await ArticleInputBuilder.buildContext(date, latestResult);
        if (!context.statistics.frequentLoto || context.statistics.frequentLoto.length === 0) return;

        // Bắt con lô về nhiều nhất hôm qua
        const hotLoto = context.statistics.frequentLoto[0].number;
        const count = context.statistics.frequentLoto[0].count;
        const slug = `lo-${hotLoto}-ve-hom-sau-danh-con-gi-${date}`;

        const existing = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing) { console.log(`[BacNhoBot] Bài đã tồn tại.`); return; }

        const prompt = `
            ROLE: Đầu tàu soi cầu Bạc Nhớ miền Bắc.
            MISSION: Giải mã "Hôm qua lô ${hotLoto} nổ ${count} nháy, hôm sau đánh con gì theo bạc nhớ XSMB?". Ngữ cảnh từ KQXS ${formattedDate}.
            
            YÊU CẦU DÀI ÍT NHẤT 800 TỪ:
            - H1: Mê thuật soi cầu: Lô ${hotLoto} về ${count} nháy báo hiệu điềm gì?
            - Cấu trúc: Phân tích thống kê quá khứ khi lô ${hotLoto} nổ rực rỡ thì cặp bài trùng nào hay ra theo (Cầu lô ra cùng lô).
            - Chốt 1 cặp Song Thủ Lô Bạc Nhớ ở đầu bài.
            - Chèn link tự nhiên: <a href="/soi-cau-bac-nho" title="Bạc nhớ lô tô">soi cầu bạc nhớ</a>, <a href="/so-mo" title="Sổ mơ">sổ mơ</a>.
            - Chèn lưu ý cờ bạc rủi ro ở chân trang.

            TRẢ VỀ JSON:
            {
                "title": "XSMB ${formattedDate}: Lô ${hotLoto} về nổ ${count} nháy nay đánh con gì?",
                "excerpt": "Cùng chuyên gia áp dụng thuật toán soi cầu bạc nhớ khi thấy loto ${hotLoto} rơi. Nhận định cặp số chuẩn tài lộc XSMB hôm nay.",
                "meta_description": "Khám phá quy luật lô ra cùng lô khi con ${hotLoto} về hôm qua. Thống kê soi cầu bạc nhớ XSMB cực chuẩn chỉ ra bạch thủ lô dễ trúng nhất.",
                "content_html": "<div class='analysis-article'><h2>Hôm qua lô ${hotLoto} ra báo hiệu gì?</h2><p>...</p></div>"
            }
        `;

        let articleResponse = await ClaudeClient.generateContent(prompt);
        let articleJson;
        try {
            const match = articleResponse?.match(/\{[\s\S]*\}/);
            articleJson = JSON.parse(match![0]);
        } catch (e) {
            articleResponse = await GeminiClient.generateContent(prompt);
            const match = articleResponse?.match(/\{[\s\S]*\}/);
            articleJson = JSON.parse(match![0]);
        }

        if (articleJson?.title && articleJson?.content_html) {
            console.log('[BacNhoBot] Đang vẽ ảnh bằng Imagen...');
            let thumbnail = '/images/ai-post-default.jpg';
            const imgPrompt = `A high quality cinematic digital art of glowing lucky lottery numbers with sparkling light, the number ${hotLoto} at center, Vietnamese lottery theme, dark atmospheric background, dramatic lighting`;
            const generatedLocation = await GeminiClient.generateImage(imgPrompt);
            if (generatedLocation) thumbnail = generatedLocation;

            const now = new Date().toISOString();
            await query(`
                INSERT INTO posts (title, slug, content, excerpt, meta_title, meta_description, thumbnail_url, category, status, published_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                articleJson.title, slug, articleJson.content_html, articleJson.excerpt,
                articleJson.title, articleJson.meta_description, thumbnail,
                'tin-tuc', 'published', now, now, now
            ]);
            console.log(`[BacNhoBot] Đã đăng bài: ${articleJson.title}`);
        }
    } catch (err) { console.error('[BacNhoBot] Error:', err); }
}
main();
