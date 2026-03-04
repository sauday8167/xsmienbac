import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { getPerplexityCompletion } from '@/lib/ai/perplexity-client';

export async function GET(request: Request) {
    // 1. Check API Keys
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
        return NextResponse.json({ error: "Missing YOUTUBE_API_KEY" }, { status: 500 });
    }

    try {
        // --- BƯỚC 1: LẤY TOP VIDEO TỪ YOUTUBE ---
        console.log("1. Đang tìm kiếm YouTube...");
        const dateStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const searchQuery = encodeURIComponent(`soi cầu xsmb ${dateStr}`);
        const ytSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=id,snippet&q=${searchQuery}&type=video&order=date&maxResults=3&key=${YOUTUBE_API_KEY}`;

        const ytRes = await fetch(ytSearchUrl);
        const ytData = await ytRes.json();

        if (!ytData.items || ytData.items.length === 0) {
            return NextResponse.json({ error: "Không tìm thấy video nào." }, { status: 404 });
        }

        // --- BƯỚC 2: CÀO PHỤ ĐỀ XUỐNG ---
        console.log("2. Đang cào phụ đề YouTube...");
        let combinedTranscripts = "";
        const videoResults = [];

        for (const item of ytData.items) {
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            try {
                const transcriptBlocks = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'vi' });
                // Limit block text to avoid huge payloads
                const fullText = transcriptBlocks.map(t => t.text).join(' ');

                combinedTranscripts += `\n--- Video: ${title} ---\n${fullText}\n`;
                videoResults.push({ videoId, title, success: true });
            } catch (err) {
                console.error(`Không thể lấy phụ đề video ${videoId}:`, err);
                videoResults.push({ videoId, title, success: false });
            }
        }

        // --- BƯỚC 3: ĐẨY SANG PERPLEXITY TỔNG HỢP & SEARCH WEB ---
        console.log("3. Đang gọi Perplexity API...");
        const prompt = `Dưới đây là nội dung giải mã từ các video soi cầu XSMB trên Youtube hôm nay (${dateStr}):

${combinedTranscripts.substring(0, 15000)} // Giới hạn số ký tự để tránh token limit nếu quá dài

Nhiệm vụ của bạn:
1. Đọc nội dung Youtube ở trên.
2. Tự động thực hiện SEARCH Google các bài viết dự đoán XSMB đăng trong ngày hôm nay.
3. Tổng hợp dữ liệu từ cả Youtube và Web, tìm ra những con số được khuyên đánh nhiều nhất, có độ tín nhiệm cao nhất trong hôm nay.
4. Trích xuất thành định dạng JSON CHÍNH XÁC với cấu trúc sau:
{
    "bach_thu_lo": ["số 1", "số 2"],
    "song_thu_lo": ["cặp 1", "cặp 2"],
    "dan_de": ["số 1", "số 2", "số 3"],
    "hot_nhat": ["số được nhắc đến nhiều nhất toàn mạng"],
    "tom_tat": "Vài dòng tóm tắt chung về xu hướng số hôm nay"
}

Chỉ trả về JSON, tuyệt đối không có văn bản nào khác.`;

        const aiResultContent = await getPerplexityCompletion(prompt);
        let parsedResult = null;
        try {
            parsedResult = JSON.parse(aiResultContent);
        } catch (e) {
            console.error("Lỗi parse JSON từ Perplexity:", e);
        }

        return NextResponse.json({
            success: true,
            data: parsedResult,
            raw_ai_text: aiResultContent,
            videos_processed: videoResults
        });

    } catch (error: any) {
        console.error("Lỗi chung tại API test-so-hot:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
