import { queryOne, query } from '../src/lib/db';
import { GeminiClient } from '../src/lib/ai/gemini-client';
import { ClaudeClient } from '../src/lib/ai/claude-client';
import { ArticleInputBuilder } from '../src/lib/services/article-input-builder';

async function getFollowDayPatterns(hotLoto: string): Promise<{ number: string; count: number; pct: number }[]> {
    // Khi lô hotLoto xuất hiện trong kỳ nào, ngày hôm sau hay ra số gì?
    const followRows = await query<any[]>(
        `SELECT r2.special_prize, r2.prize_1, r2.prize_2, r2.prize_3, r2.prize_4, r2.prize_5, r2.prize_6, r2.prize_7
         FROM xsmb_results r1
         JOIN xsmb_results r2 ON date(r2.draw_date) = date(r1.draw_date, '+1 day')
         WHERE (
             substr(r1.special_prize, -2) = ?
             OR substr(r1.prize_1, -2) = ?
             OR r1.prize_2 LIKE ?
             OR r1.prize_3 LIKE ?
             OR r1.prize_4 LIKE ?
             OR r1.prize_5 LIKE ?
             OR r1.prize_6 LIKE ?
             OR r1.prize_7 LIKE ?
         )
         ORDER BY r1.draw_date DESC LIMIT 40`,
        [hotLoto, hotLoto, `%"${hotLoto}"%`, `%"${hotLoto}"%`, `%"${hotLoto}"%`, `%"${hotLoto}"%`, `%"${hotLoto}"%`, `%"${hotLoto}"%`]
    );

    if (followRows.length < 5) return [];

    const counts: Record<string, number> = {};
    followRows.forEach(row => {
        const add = (val: string) => {
            if (!val || val.length < 2) return;
            const n = val.slice(-2);
            if (/^\d{2}$/.test(n)) counts[n] = (counts[n] || 0) + 1;
        };
        add(row.special_prize);
        add(row.prize_1);
        ['prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'].forEach(p => {
            if (row[p]) {
                try { (JSON.parse(row[p]) as string[]).forEach(n => add(n)); }
                catch { add(row[p]); }
            }
        });
    });

    return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([n, c]) => ({ number: n, count: c, pct: Math.round((c / followRows.length) * 100) }));
}

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

        const hotLoto = context.statistics.frequentLoto[0].number;
        const count = context.statistics.frequentLoto[0].count;
        const slug = `lo-${hotLoto}-ve-hom-sau-danh-con-gi-${date}`;

        const existing = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing) { console.log('[BacNhoBot] Bài đã tồn tại.'); return; }

        // Lấy dữ liệu follow-day thật từ DB
        const followPatterns = await getFollowDayPatterns(hotLoto);
        const followDataText = followPatterns.length > 0
            ? `Phân tích ${followPatterns.length > 5 ? '40' : 'ít'} kỳ lịch sử khi lô ${hotLoto} xuất hiện: ngày hôm sau hay ra: ${followPatterns.slice(0, 5).map(x => `${x.number} (${x.pct}%)`).join(', ')}.`
            : `Chưa đủ dữ liệu lịch sử cụ thể, phân tích dựa trên chu kỳ bạc nhớ tổng quát.`;

        const prompt = `
            ROLE: Đầu tàu soi cầu Bạc Nhớ miền Bắc.
            MISSION: Giải mã "Hôm qua lô ${hotLoto} nổ ${count} nháy, hôm sau đánh con gì theo bạc nhớ XSMB?". Ngữ cảnh từ KQXS ${formattedDate}.

            DỮ LIỆU THỐNG KÊ THẬT (dùng dữ liệu này, không bịa):
            ${followDataText}
            Top lô hay về hôm sau GĐB đuôi ${latestResult.special_prize?.slice(-2) || 'XX'}: ${context.statistics.dbTomorrow?.topFrequencies?.slice(0, 5).join(', ') || 'đang tính'}.

            YÊU CẦU DÀI ÍT NHẤT 800 TỪ:
            - H1: Mê thuật soi cầu: Lô ${hotLoto} về ${count} nháy báo hiệu điềm gì?
            - Cấu trúc: Phân tích thống kê quá khứ khi lô ${hotLoto} nổ rực rỡ thì cặp bài trùng nào hay ra theo.
            - Chốt số VIP đầu bài DỰA TRÊN DỮ LIỆU THẬT ở trên: 1 bạch thủ lô, 1 cặp song thủ lô.
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
        } catch {
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
                'soi-cau', 'published', now, now, now
            ]);
            console.log(`[BacNhoBot] Đã đăng bài: ${articleJson.title}`);
        }
    } catch (err) { console.error('[BacNhoBot] Error:', err); }
}
main();
