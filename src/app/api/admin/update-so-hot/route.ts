import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { getPerplexityCompletion } from '@/lib/ai/perplexity-client';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * API Update So Hot
 * POST /api/admin/update-so-hot
 * 
 * Tự động:
 * 1. Tìm video YouTube soi cầu XSMB hôm nay
 * 2. Cào transcript video
 * 3. Gọi Perplexity AI tổng hợp
 * 4. Ghi kết quả vào src/data/so-hot.json
 * 
 * Bảo mật: CRON_SECRET header hoặc admin API key
 */
export async function POST(request: Request) {
    // 1. Xác thực
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const cronSecret = process.env.CRON_SECRET;
    const adminKey = process.env.ADMIN_API_KEY;

    const isAuthorized =
        (cronSecret && token === cronSecret) ||
        (adminKey && token === adminKey);

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
        return NextResponse.json({ error: 'Missing YOUTUBE_API_KEY' }, { status: 500 });
    }

    const vnDateObj = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const dateStr = vnDateObj.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    try {
        // --- BƯỚC 1: LẤY TOP VIDEO TỪ YOUTUBE ---
        console.log('[update-so-hot] Bước 1: Tìm kiếm YouTube...');
        const searchQuery = encodeURIComponent(`soi cầu xsmb ${dateStr}`);
        // Tăng maxResults lên 50 (mức tối đa của YouTube Data API v3 cho 1 request) để quét "không giới hạn" cho 1 ngày
        const ytSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=id,snippet&q=${searchQuery}&type=video&order=date&maxResults=50&key=${YOUTUBE_API_KEY}`;

        const ytRes = await fetch(ytSearchUrl);
        const ytData = await ytRes.json();

        let combinedTranscripts = '';
        const videoResults: { videoId: string; title: string; success: boolean }[] = [];

        if (ytData.items && ytData.items.length > 0) {
            // --- BƯỚC 2: CÀO PHỤ ĐỀ ---
            console.log(`[update-so-hot] Bước 2: Cào phụ đề ${ytData.items.length} video...`);
            for (const item of ytData.items) {
                const videoId = item.id.videoId;
                const title = item.snippet.title;
                try {
                    const transcriptBlocks = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'vi' });
                    const fullText = transcriptBlocks.map((t: any) => t.text).join(' ');
                    combinedTranscripts += `\n--- Video: ${title} ---\n${fullText}\n`;
                    videoResults.push({ videoId, title, success: true });
                } catch (err) {
                    console.warn(`[update-so-hot] Không lấy được phụ đề video ${videoId}`);
                    videoResults.push({ videoId, title, success: false });
                }
            }
        } else {
            console.warn('[update-so-hot] Không tìm thấy video YouTube nào.');
        }

        // --- BƯỚC 3: ĐẨY SANG PERPLEXITY TỔNG HỢP & SEARCH WEB ---
        console.log('[update-so-hot] Bước 3: Gọi Perplexity AI...');

        const transcriptSection = combinedTranscripts.trim().length > 0
            // Tăng giới hạn text lên 400.000 ký tự (chiếm khoảng 80-100k token) để model sonar-pro nuốt trọn toàn bộ nội dung của 50 video
            ? `Nội dung CHI TIẾT từ ${videoResults.filter(v => v.success).length} video YouTube phân tích hôm nay:\n${combinedTranscripts.substring(0, 400000)}`
            : 'Không lấy được transcript video. Hãy dựa vào khả năng search web của bạn.';

        const prompt = `Hôm nay là ngày ${dateStr}. Đây là toàn bộ dữ liệu nội dung của TẤT CẢ các video soi cầu XSMB mới nhất từ Youtube:

${transcriptSection}

YÊU CẦU ĐẶC BIỆT MỚI: 
Nhiệm vụ của bạn không chỉ là đọc nội dung Youtube trên, mà phải thực hiện Web Search MỘT CÁCH TOÀN DIỆN VÀ KHÔNG GIỚI HẠN đối với ngày hôm nay (${dateStr}). 
Bất kể có 30, 40 hay 100 bài viết phân tích, dự đoán kết quả XSMB của ngày ${dateStr} trên Google, BẠN PHẢI QUÉT, ĐỌC, VÀ TỔNG HỢP TẤT CẢ. Đừng bỏ sót bất kỳ thông tin nào từ các trang web (ví dụ: xsmb.me, atrungroi, xoso.me, rồng bạch kim, ketqua.net...).

Nhiệm vụ của bạn:
1. Đọc và phân tích CHUYÊN SÂU dữ liệu từ hàng chục video Youtube ở trên.
2. Search Google/Web cực rộng để săn lùng TẤT CẢ các bài viết dự đoán XSMB đăng trong ngày ${dateStr}.
3. Tổng hợp số liệu từ ĐÁM ĐÔNG (từ Web + Youtube), thống kê lại xem những con số nào đang được CỘNG ĐỒNG BÁO ĐÀI phím nhiều nhất, tỷ lệ chốt cao nhất hôm nay.
4. Tạo ra nội dung SEO hấp dẫn, tự nhiên về phân tích XSMB hôm nay.
5. Trả về JSON CHÍNH XÁC với cấu trúc sau (chỉ JSON, không có text khác):
{
    "bach_thu_lo": ["số 1", "số 2"],
    "song_thu_lo": ["cặp 1", "cặp 2", "cặp 3"],
    "dan_de": ["số 1", "số 2", "số 3", "số 4", "số 5"],
    "hot_nhat": ["số nổi bật nhất"],
    "tom_tat": "2-3 câu tóm tắt xu hướng số hôm nay",
    "seo_title": "Tiêu đề SEO hấp dẫn về số hot XSMB ngày ${dateStr}",
    "seo_desc": "Mô tả SEO ngắn gọn 155 ký tự về phân tích XSMB hôm nay",
    "seo_content": "3-5 đoạn nội dung SEO đầy đủ, tự nhiên, phân tích chi tiết"
}`;

        const aiResultContent = await getPerplexityCompletion(prompt);

        // --- BƯỚC 4: PARSE JSON ---
        let parsedResult: any = null;
        try {
            // Tìm JSON trong response (có thể có text wrapper)
            const jsonMatch = aiResultContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResult = JSON.parse(jsonMatch[0]);
            } else {
                parsedResult = JSON.parse(aiResultContent);
            }
        } catch (e) {
            console.error('[update-so-hot] Lỗi parse JSON từ Perplexity:', e);
            console.error('[update-so-hot] Raw AI response:', aiResultContent.substring(0, 500));
            return NextResponse.json({
                success: false,
                error: 'AI trả về JSON không hợp lệ',
                raw_ai_text: aiResultContent.substring(0, 1000)
            }, { status: 500 });
        }

        // --- BƯỚC 5: GHI FILE so-hot.json ---
        console.log('[update-so-hot] Bước 5: Ghi vào so-hot.json...');
        const soHotData = {
            last_updated: new Date().toISOString(),
            date: dateStr,
            data: parsedResult
        };

        const filePath = path.join(process.cwd(), 'src', 'data', 'so-hot.json');
        fs.writeFileSync(filePath, JSON.stringify(soHotData, null, 2), 'utf8');

        console.log(`[update-so-hot] ✅ Ghi thành công vào ${filePath}`);

        return NextResponse.json({
            success: true,
            message: 'so-hot.json đã được cập nhật thành công',
            date: dateStr,
            last_updated: soHotData.last_updated,
            bach_thu_lo: parsedResult.bach_thu_lo,
            hot_nhat: parsedResult.hot_nhat,
            videos_processed: videoResults.length,
            videos_success: videoResults.filter(v => v.success).length,
        });

    } catch (error: any) {
        console.error('[update-so-hot] Lỗi:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
