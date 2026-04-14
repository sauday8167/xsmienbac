import { queryOne, query } from '../src/lib/db';
import { GeminiClient } from '../src/lib/ai/gemini-client';
import { ClaudeClient } from '../src/lib/ai/claude-client';

const HOT_DREAMS = [
    "rắn cắn", "chó đẻ", "người chết sống lại", "rụng răng cửa", 
    "trúng số đặc biệt", "đám cưới", "ma đuổi", "cá chép", 
    "cãi nhau với vợ", "mất tiền", "cháy nhà", "mèo đen", 
    "bị công an bắt", "nhặt được vàng", "đứt tay chảy máu", 
    "rụng tóc", "bị lội nước", "sinh em bé", "người thân mất", "mưa bão"
];

async function main() {
    console.log('[SoMoBot] Khởi động AI Sổ Mơ Giải Mộng...');
    try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        // Day of year
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = today.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        function slugify(text: string) {
            return text.toString().toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        }

        const dream = HOT_DREAMS[dayOfYear % HOT_DREAMS.length];
        const slug = `giai-ma-giac-mo-thay-${slugify(dream)}-${dateStr}`;

        const existing = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing) { console.log(`[SoMoBot] Bài Sổ mơ hôm nay đã tồn tại.`); return; }

        const prompt = `
            ROLE: Thần tài giải mộng lô đề dân gian.
            MISSION: Viết một bài viết chuẩn SEO giải mã bí ẩn tâm linh và toán học khi "Nằm mơ thấy ${dream}".
            
            YÊU CẦU SEO DÀI ÍT NHẤT 1000 TỪ:
            - H1: Nằm mơ thấy ${dream} đánh con gì trúng số độc đắc?
            - Cấu trúc: Luận giải điềm hung/cát của giấc mơ. Lên danh sách chi tiết (ví dụ: mộng thấy ${dream} màu đen, mộng thấy ${dream} đuổi thì đánh con gì).
            - Bắt buộc chốt 1 cặp Bạch thủ lô và 1 cặp song thủ lô cuối bài.
            - Liên kết nội bộ tự nhiên: <a href="/so-mo" title="Sổ mơ toàn tập">sổ mơ</a>, <a href="/soi-cau-bac-nho" title="Soi cầu lô đề">bạc nhớ</a>.

            TRẢ VỀ JSON:
            {
                "title": "Giải mã nằm mơ thấy ${dream} là điềm gì? Đánh đề số mấy",
                "excerpt": "Cùng sổ mơ dân gian giải đáp ý nghĩa chiêm bao thấy ${dream} mang điềm lành hay dữ. Xem ngay con số tài lộc để chốt lô đề bạch thủ.",
                "meta_description": "Nằm mơ thấy ${dream} đánh loto gì XSMB dễ trúng? Nhấn khám phá giải nghĩa sổ mơ tâm linh siêu chuẩn từ chuyên gia lô đề.",
                "content_html": "<div class='analysis-article'><h2>Ý nghĩa tâm linh khi thấy ${dream}</h2><p>...</p></div>"
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
            console.log('[SoMoBot] Đang vẽ ảnh bằng AI...');
            let imageUrl = '/images/ai-post-default.jpg';
            const imgPrompt = `A high quality cinematic digital art of ${dream}, mysterious, mystical, highly detailed, dramatic lighting, fantasy style`;
            const generatedLocation = await GeminiClient.generateImage(imgPrompt);
            if (generatedLocation) imageUrl = generatedLocation;

            const now = today.toISOString();
            await query(`
                INSERT INTO posts (title, slug, content, excerpt, meta_title, meta_description, thumbnail_url, category, status, published_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                articleJson.title, slug, articleJson.content_html, articleJson.excerpt,
                articleJson.title, articleJson.meta_description, imageUrl,
                'tin-tuc', 'published', now, now, now
            ]);
            console.log(`[SoMoBot] Đã đăng bài: ${articleJson.title}`);
        }
    } catch (err) { console.error('[SoMoBot] Error:', err); }
}
main();
