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
        const ytSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=id,snippet&q=${searchQuery}&type=video&order=date&maxResults=10&key=${YOUTUBE_API_KEY}`;

        let ytData: any = { items: [] };
        try {
            const ytRes = await fetch(ytSearchUrl);
            ytData = await ytRes.json();
            if (ytData.error) {
                console.warn("YouTube API Error:", ytData.error.message);
                ytData.items = [];
            }
        } catch (e) {
            console.warn("Không thể kết nối YouTube API.");
        }

        console.log("2. Đang cào phụ đề YouTube...");
        let combinedTranscripts = "";

        if (ytData.items && ytData.items.length > 0) {
            for (const item of ytData.items) {
                const videoId = item.id.videoId;
                if (!videoId) continue;
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
        } else {
            console.warn("Không tìm thấy video nào hoặc lỗi API. Sẽ dựa hoàn toàn vào Web Search của AI.");
        }

        console.log("3. Đang gọi Perplexity API...");
        const transcriptSection = combinedTranscripts.trim().length > 0
            ? `Nội dung từ các video YouTube phân tích hôm nay:\n${combinedTranscripts.substring(0, 20000)}`
            : 'Không lấy được transcript video. Hãy dựa vào khả năng search web của bạn để tìm thông tin soi cầu XSMB ngày hôm nay.';

        const prompt = `Hôm nay là ngày ${dateStr}. 
${transcriptSection}

Nhiệm vụ của bạn là tổng hợp dữ liệu "Số Hot Trong Ngày" cho XSMB ngày ${dateStr}:
1. Phân tích nội dung Youtube (nếu có ở trên).
2. Thực hiện Web Search toàn diện để tìm các bài viết dự đoán XSMB ngày ${dateStr} từ các nguồn uy tín (xsmb.me, atrungroi, xoso.me, rồng bạch kim, ketqua.net...).
3. Tổng hợp những con số được nhắc đến nhiều nhất (Đám đông/Top nóng).
4. Trả về JSON chính xác với cấu trúc:
{
    "bach_thu_lo": ["số 1", "số 2"],
    "song_thu_lo": ["cặp 1", "cặp 2", "cặp 3"],
    "dan_de": ["số 1", "số 2", "số 3", "số 4", "số 5"],
    "hot_nhat": ["số nổi bật nhất"],
    "tom_tat": "2-3 câu tóm tắt xu hướng số hôm nay",
    "seo_title": "Tiêu đề SEO hấp dẫn ngày ${dateStr}",
    "seo_desc": "Mô tả SEO ngắn gọn 155 ký tự",
    "seo_content": "3-5 đoạn nội dung SEO phân tích chi tiết"
}

Chỉ trả về JSON, không kèm văn bản giải thích.`;

        const aiResultContent = await getPerplexityCompletion(prompt);
        let parsedResult = null;
        try {
            // Robust JSON parsing
            const jsonMatch = aiResultContent.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : aiResultContent;
            parsedResult = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Lỗi parse JSON từ Perplexity:", e);
            console.error("Raw AI Content:", aiResultContent);
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
