import { queryOne, query } from '../src/lib/db';
import { GeminiClient } from '../src/lib/ai/gemini-client';
import { ClaudeClient } from '../src/lib/ai/claude-client';

const HOT_DREAMS = [
    // Động vật - phổ biến nhất
    "rắn cắn", "rắn trăn quấn người", "rắn hổ mang bành", "chó cắn", "chó đẻ", "chó trắng",
    "mèo đen", "mèo trắng cào", "hổ vồ", "gấu tấn công", "khỉ leo trèo", "bò húc",
    "lợn to", "gà trống gáy", "cá chép vàng", "cá sấu há mồm", "ếch nhảy", "cua kẹp",
    "tôm hùm", "bướm bay", "ong đốt", "kiến đỏ bò", "nhện to", "chuột chạy",
    "rồng phun lửa", "voi to", "ngựa phi", "chim hạc", "chim phượng hoàng", "đại bàng",
    // Người thân / xã hội
    "người chết sống lại", "gặp ông bà tổ tiên", "người thân mất", "gặp bố mẹ đã mất",
    "thấy bạn bè lâu năm", "gặp người yêu cũ", "đám cưới linh đình", "sinh em bé",
    "bế em bé", "đứa trẻ khóc", "gặp người lạ mặt", "gặp thần linh phật bà",
    "cãi nhau với vợ", "cãi nhau to tiếng", "gặp sếp công ty", "gặp người nổi tiếng",
    "thấy đám tang", "khóc trong mơ", "cười vui vẻ",
    // Thiên nhiên / thảm họa
    "mưa bão lớn", "lũ lụt nước dâng", "cháy nhà to", "động đất nứt đất", "sấm sét đánh",
    "bầu trời đỏ rực", "trăng tròn sáng", "mặt trời mọc", "sao băng rơi", "cầu vồng",
    "tuyết rơi trắng", "núi lửa phun", "biển sóng to", "lốc xoáy", "hạn hán",
    // Tình huống / sự cố
    "rụng răng cửa", "rụng tóc nhiều", "đứt tay chảy máu", "bị ngã xuống hố sâu",
    "bị đuổi bắt chạy", "leo núi cao", "bay trên không trung", "rơi xuống vực thẳm",
    "bị lội nước sâu", "bơi lội giỏi", "thi trượt", "lạc đường",
    "bị công an bắt", "bị cướp", "thấy dao kiếm", "nhà sập đổ",
    // Tài lộc / vật phẩm
    "nhặt được vàng", "tìm thấy tiền nhiều", "mất tiền ví", "thấy đá quý kim cương",
    "thấy vàng bạc châu báu", "trúng số đặc biệt", "nhặt được đồ quý",
    "thấy gạo đầy kho", "thấy trái cây chín", "thấy bữa tiệc linh đình",
    // Địa điểm
    "thấy nghĩa địa tối", "thấy chùa miếu linh thiêng", "thấy nhà to đẹp",
    "thấy trường học", "thấy bệnh viện", "thấy biển xanh", "thấy rừng cây xanh",
    "thấy núi cao", "thấy ao hồ trong", "thấy vườn hoa nở",
    // Phương tiện
    "thấy xe ô tô đẹp", "thấy máy bay", "thấy tàu thuyền", "thấy xe máy mới",
    // Thân thể / sức khỏe
    "thấy mình chết", "thấy mình bệnh nặng", "bị sét đánh", "thấy mình có thai",
    "thấy máu nhiều", "thấy mình trẻ lại"
];

function slugify(text: string) {
    return text.toString().toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function main() {
    console.log('[SoMoBot] Khởi động AI Sổ Mơ Giải Mộng...');
    try {
        const now = new Date();
        const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const dateStr = vnTime.toLocaleDateString('sv-SE');

        const start = new Date(vnTime.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((vnTime.getTime() - start.getTime()) / 86400000);

        const dream = HOT_DREAMS[dayOfYear % HOT_DREAMS.length];
        const slug = `giai-ma-giac-mo-thay-${slugify(dream)}-${dateStr}`;

        const existing = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing) { console.log('[SoMoBot] Bài Sổ mơ hôm nay đã tồn tại.'); return; }

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
        } catch {
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

            const nowIso = vnTime.toISOString();
            await query(`
                INSERT INTO posts (title, slug, content, excerpt, meta_title, meta_description, thumbnail_url, category, status, published_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                articleJson.title, slug, articleJson.content_html, articleJson.excerpt,
                articleJson.title, articleJson.meta_description, imageUrl,
                'dream', 'published', nowIso, nowIso, nowIso
            ]);
            console.log(`[SoMoBot] Đã đăng bài: ${articleJson.title}`);
        }
    } catch (err) { console.error('[SoMoBot] Error:', err); }
}
main();
