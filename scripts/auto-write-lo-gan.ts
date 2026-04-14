import { queryOne, query } from '../src/lib/db';
import { GeminiClient } from '../src/lib/ai/gemini-client';
import { ClaudeClient } from '../src/lib/ai/claude-client';
import { ArticleInputBuilder } from '../src/lib/services/article-input-builder';

async function main() {
    console.log('[LoGanBot] Khởi động AI Lô Gan...');
    try {
        const latestResult = await queryOne('SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
        if (!latestResult) return;
        
        const date = latestResult.draw_date;
        const [y, m, d] = date.split('-');
        const formattedDate = `${d}-${m}-${y}`;

        const context = await ArticleInputBuilder.buildContext(date, latestResult);
        if (!context.statistics.loGan || context.statistics.loGan.length === 0) {
            console.log('[LoGanBot] Không tìm thấy dữ liệu lô gan.'); return;
        }

        const maxGan = context.statistics.loGan.reduce((prev: any, current: any) => ((prev.daysSince || 0) > (current.daysSince || 0)) ? prev : current);
        
        if ((maxGan.daysSince || 0) < 10) {
            console.log('[LoGanBot] Lô gan cao nhất chưa đạt ngưỡng 10 ngày. Bỏ qua.'); return;
        }

        const loto = maxGan.number;
        const days = maxGan.daysSince || 0;
        const slug = `lo-gan-${loto}-xsmb-cuc-dai-bao-nhieu-ngay-${date}`;

        const existing = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing) { console.log(`[LoGanBot] Bài đã tồn tại.`); return; }

        const prompt = `
            ROLE: Chuyên gia phân tích dữ liệu xổ số chuẩn SEO.
            MISSION: Viết bài giải đáp từ khoá: "Lô gan ${loto} cực đại XSMB bao nhiêu ngày chưa về". (Dữ liệu thật: Đã gan ${days} ngày tính đến KQXS ngày ${formattedDate}).
            
            YÊU CẦU DÀI 800 TỪ:
            - H1: Thống kê chi tiết lô gan ${loto} XSMB hôm nay.
            - Nội dung: Phân tích sâu thói quen lỳ lợm của lô ${loto}. Giải thích chu kỳ loto.
            - Chốt số VIP đầu bài: Khuyên nên nuôi khung lô ${loto} kèm 1 cặp song thủ lô khác.
            - Khẳng định disclaimer không khuyến khích đánh bạc trái phép.
            - Link nội bộ: <a href="/thong-ke" title="Thống kê xổ số">thống kê lô gan</a>, <a href="/" title="KQXS MB">xổ số miền Bắc</a>.

            TRẢ VỀ JSON DUY NHẤT:
            {
                "title": "Lô gan ${loto} XSMB vắng đi ${days} ngày - Phân tích có nên nuôi khung?",
                "excerpt": "Hôm nay phân tích chuyên sâu lô gan ${loto} đã biệt tích ${days} ngày. Tra cứu nhịp lô cực đại của con ${loto} để vào tiền chuẩn xác.",
                "meta_description": "Thống kê xổ số lô gan ${loto} miền Bắc báo động đã ${days} ngày chưa ra. Chuyên gia tư vấn có nên chốt bạch thủ lô ${loto} khung 3 ngày không.",
                "content_html": "<div class='analysis-article'><h2>Lô ${loto} lì lợm vắng ${days} ngày</h2><p>...</p></div>"
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
            console.log('[LoGanBot] Đang vẽ ảnh bằng Imagen...');
            let thumbnail = '/images/ai-post-default.jpg';
            const imgPrompt = `A high quality cinematic digital art of the number ${loto} frozen in ice or looking old and dusty, lottery theme, mysterious, mystical, highly detailed`;
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
            console.log(`[LoGanBot] Đã đăng bài: ${articleJson.title}`);
        }
    } catch (err) { console.error('[LoGanBot] Error:', err); }
}
main();
