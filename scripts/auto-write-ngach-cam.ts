import { queryOne, query } from '../src/lib/db';
import { GeminiClient } from '../src/lib/ai/gemini-client';
import { ClaudeClient } from '../src/lib/ai/claude-client';

async function main() {
    console.log('[NgachCamBot] Starting Đầu/Đuôi câm detection...');
    try {
        const latestResult = await queryOne('SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
        if (!latestResult) {
            console.log('[NgachCamBot] No results found.');
            return;
        }

        const date = latestResult.draw_date;
        const lotos: string[] = [];

        // Parse prizes
        if (latestResult.special_prize) lotos.push(latestResult.special_prize.slice(-2));
        if (latestResult.prize_1) lotos.push(latestResult.prize_1.slice(-2));
        for (let i = 2; i <= 7; i++) {
            const p = latestResult[`prize_${i}`];
            if (p) {
                const arr = JSON.parse(p);
                arr.forEach((num: string) => lotos.push(num.slice(-2)));
            }
        }

        // Analyze dau/duoi
        const heads = new Set<string>();
        const tails = new Set<string>();
        lotos.forEach(l => {
            if (l.length === 2) {
                heads.add(l[0]);
                tails.add(l[1]);
            }
        });

        const dauCam = ['0','1','2','3','4','5','6','7','8','9'].filter(x => !heads.has(x));
        const duoiCam = ['0','1','2','3','4','5','6','7','8','9'].filter(x => !tails.has(x));

        if (dauCam.length === 0 && duoiCam.length === 0) {
            console.log(`[NgachCamBot] Không có đầu/đuôi câm nào trong ngày ${date}. Skipping.`);
            return;
        }

        let topic = '';
        let keyword = '';
        let slug = '';
        if (dauCam.length > 0) {
            const dau = dauCam[0]; // Just take first one for article
            topic = `Đầu ${dau} câm`;
            keyword = `đầu ${dau} câm đánh con gì`;
            slug = `dau-${dau}-cam-danh-con-gi-xsmb-${date}`;
        } else {
            const duoi = duoiCam[0];
            topic = `Đuôi ${duoi} câm`;
            keyword = `đuôi ${duoi} câm đánh con gì`;
            slug = `duoi-${duoi}-cam-danh-con-gi-xsmb-${date}`;
        }

        const [y, m, d] = date.split('-');
        const formattedDate = `${d}-${m}-${y}`;

        console.log(`[NgachCamBot] Phát hiện ${topic}. Khởi tạo viết bài...`);

        // Check if article already exists
        const existing = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing) {
            console.log(`[NgachCamBot] Bài viết ngách ${slug} đã tồn tại. Skipping.`);
            return;
        }

        const prompt = `
            ROLE: Bạn là chuyên gia phân tích dữ liệu xổ số Miền Bắc chuẩn SEO.
            MISSION: Viết một bài viết chuẩn SEO giải đáp câu hỏi: "${keyword}" dựa trên kết quả xổ số ngày ${formattedDate}.
            
            YÊU CẦU SEO:
            - Độ dài: Ít nhất 800 từ.
            - H1: Phân tích ${topic} hôm nay đánh con gì trúng lớn? (H1 tự động tạo từ title)
            - Cấu trúc: Dùng các thẻ <h2>, <h3> logic để chia bài viết. 
            - Nội dung chuyên môn: Truyền tải thống kê bạc nhớ khi ${topic} thì ngày mai thường ra chạm nào, đuôi nào, tổng mấy.
            - Bắt buộc chốt số (đẩy lên trên): Chốt 1 bạch thủ lô, 1 cặp song thủ lô liên quan mật thiết đến ${topic}.
            - Lời khuyên & Cảnh báo (Disclaimer): Các dự đoán phía trên chỉ mang tính chất thống kê tham khảo, xổ số là trò chơi giải trí, không khuyến khích đánh bạc trái pháp luật.
            - Liên kết nội bộ (Internal Linking): Bắt buộc chèn lồng trong bài tự nhiên: <a href="/soi-cau-bac-nho" title="Soi cầu bạc nhớ">Soi cầu bạc nhớ</a>, <a href="/thong-ke" title="Thống kê xổ số">thống kê lô gan</a>, <a href="/so-mo" title="Sổ mơ">sổ mơ</a>.

            TRẢ VỀ ĐỊNH DẠNG JSON DUY NHẤT KHÔNG CÓ KÝ TỰ THỪA:
            {
                "title": "XSMB ${formattedDate}: ${topic} đánh con gì chuẩn nhất hôm nay?",
                "excerpt": "Trong kết quả XSMB ${formattedDate} xuất hiện ${topic}. Cùng chuyên gia soi cầu phân tích ${keyword}...",
                "meta_description": "${keyword}? Xem ngay thống kê soi cầu bạc nhớ khi có ${topic} xuất hiện trên bảng KQXSMB chính xác nhất.",
                "content_html": "<div class='analysis-article'><h2>XSMB ${formattedDate}: Xuất hiện ${topic}</h2><p>Trên bảng KQXSMB...</p><h2>${keyword}? Chốt số chuẩn</h2><h3>Bạch thủ lô: <b>XX</b></h3><h3>Song thủ lô: <b>XX - XX</b></h3><h2>Phân tích Bạc Nhớ</h2><p>Theo <a href='/soi-cau-bac-nho'>chuyên gia tính toán bạc nhớ</a>...</p><p><i>Disclaimer...</i></p></div>"
            }
        `;

        console.log('[NgachCamBot] Gọi AI...');
        let articleResponse = await ClaudeClient.generateContent(prompt);
        let articleJson;
        
        try {
            const match = articleResponse?.match(/\{[\s\S]*\}/);
            articleJson = JSON.parse(match![0]);
        } catch (e) {
            console.log('[NgachCamBot] Claude failed, trying Gemini...');
            articleResponse = await GeminiClient.generateContent(prompt);
            const match = articleResponse?.match(/\{[\s\S]*\}/);
            articleJson = JSON.parse(match![0]);
        }

        if (articleJson && articleJson.title && articleJson.content_html) {
            console.log('[NgachCamBot] Đang vẽ ảnh bằng Imagen...');
            let thumbnail = '/images/ai-post-default.jpg';
            const imgPrompt = `A high quality cinematic digital art of lottery balls falling with lucky aura, focus on numbers with no head or tail, mysterious, mystical, highly detailed, dramatic lighting`;
            const generatedLocation = await GeminiClient.generateImage(imgPrompt);
            if (generatedLocation) thumbnail = generatedLocation;

            const now = new Date().toISOString();
            await query(`
                INSERT INTO posts (title, slug, content, excerpt, meta_title, meta_description, thumbnail_url, category, status, published_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                articleJson.title,
                slug,
                articleJson.content_html,
                articleJson.excerpt,
                articleJson.title,
                articleJson.meta_description,
                thumbnail,
                'soi-cau',
                'published',
                now, now, now
            ]);
            console.log(`[NgachCamBot] Đã đăng bài: ${articleJson.title}`);
        } else {
            console.error('[NgachCamBot] AI trả về format không hợp lệ.');
        }

    } catch (err) {
        console.error('[NgachCamBot] Error:', err);
    }
}

main();
