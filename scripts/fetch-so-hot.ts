import fs from 'fs';
import path from 'path';
import { YoutubeTranscript } from 'youtube-transcript';
import { getPerplexityCompletion } from '@/lib/ai/perplexity-client';

async function fetchSoHotTrongNgay() {
    console.log(`[${new Date().toISOString()}] Bắt đầu lấy dữ liệu Số Hot Trong Ngày...`);

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
        console.error("Missing YOUTUBE_API_KEY");
        process.exit(1);
    }

    try {
        console.log("1. Đang tìm kiếm YouTube...");
        const dateStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const searchQuery = encodeURIComponent(`soi cầu xsmb ${dateStr}`);
        const ytSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=id,snippet&q=${searchQuery}&type=video&order=date&maxResults=5&key=${YOUTUBE_API_KEY}`;

        const ytRes = await fetch(ytSearchUrl);
        const ytData = await ytRes.json();

        if (!ytData.items || ytData.items.length === 0) {
            console.warn("Không tìm thấy video nào.");
            process.exit(0);
        }

        console.log("2. Đang cào phụ đề YouTube...");
        let combinedTranscripts = "";

        for (const item of ytData.items) {
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            try {
                const transcriptBlocks = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'vi' });
                const fullText = transcriptBlocks.map(t => t.text).join(' ');
                combinedTranscripts += `\n--- Video: ${title} ---\n${fullText}\n`;
                console.log(`- Thành công: ${title}`);
            } catch (err) {
                console.warn(`- Thất bại lấy phụ đề video ${videoId}`);
            }
        }

        console.log("3. Đang gọi Perplexity API...");
        const prompt = `Dưới đây là nội dung giải mã từ các video soi cầu XSMB trên Youtube hôm nay (${dateStr}):

${combinedTranscripts.substring(0, 15000)}

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
            process.exit(1);
        }

        const finalData = {
            last_updated: new Date().toISOString(),
            date: dateStr,
            data: parsedResult
        };

        const outPath = path.join(process.cwd(), 'src', 'data', 'so-hot.json');
        fs.writeFileSync(outPath, JSON.stringify(finalData, null, 2), 'utf-8');
        console.log(`Đã lưu dữ liệu Số Hot thành công vào: ${outPath}`);

        process.exit(0);

    } catch (error: any) {
        console.error("Lỗi chung tại fetch so hot:", error);
        process.exit(1);
    }
}

fetchSoHotTrongNgay();
