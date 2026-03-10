import fs from 'fs';
import path from 'path';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function getPerplexityCompletion(prompt: string, model: string = 'sonar-pro') {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error("Missing PERPLEXITY_API_KEY in environment variables.");
    }

    const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: 'Bạn là chuyên gia phân tích dữ liệu xổ số miền Bắc (XSMB) khách quan. Bạn luôn trả về kết quả dưới định dạng JSON hợp lệ, không có thêm bất kỳ đoạn văn bản nào khác.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Perplexity API Error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    let content = data.choices[0].message.content;
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return content;
}

async function getGeminiVisionAnalysis(thumbnailUrl: string, description: string) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        return `[Bỏ qua Vision] Không có API Key hợp lệ. Chỉ sử dụng mô tả: ${description.substring(0, 500)}`;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const imgRes = await fetch(thumbnailUrl);
        const arrayBuffer = await imgRes.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');

        const prompt = `Bạn là chuyên gia soi cầu XSMB. Hãy phân tích ẢNH BÌA (Thumbnail) và MÔ TẢ video này để trích xuất các con số dự đoán.
Mô tả: ${description}

Yêu cầu: Liệt kê rõ các số Bạch thủ, Song thủ, Lô xiên hoặc Dàn đề bạn thấy. Trả về văn bản ngắn gọn.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                }
            }
        ]);
        return result.response.text();
    } catch (e: any) {
        return `[Lỗi Vision] ${e.message}. Mô tả thay thế: ${description.substring(0, 500)}`;
    }
}

async function fetchSoHotTrongNgay() {
    console.log(`[${new Date().toISOString()}] Bắt đầu lấy dữ liệu Số Hot Trong Ngày (Multimodal Mode)...`);

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
        console.error("Missing YOUTUBE_API_KEY");
        process.exit(1);
    }

    try {
        console.log("1. Đang tìm kiếm YouTube...");
        const dateStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const searchQuery = encodeURIComponent(`soi cầu xsmb ${dateStr}`);
        const ytSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=id,snippet&q=${searchQuery}&type=video&order=date&maxResults=50&key=${YOUTUBE_API_KEY}`;

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

        console.log(`2. Đang cào phụ đề từ ${ytData.items?.length || 0} video YouTube...`);
        let combinedTranscripts = "";
        const sources: { title: string, url: string }[] = [];

        if (ytData.items && ytData.items.length > 0) {
            for (const item of ytData.items) {
                const videoId = item.id.videoId;
                if (!videoId) continue;
                const title = item.snippet.title;
                const description = item.snippet.description;
                const thumbnailUrl = item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url;
                const url = `https://www.youtube.com/watch?v=${videoId}`;

                sources.push({ title, url });

                try {
                    const transcriptBlocks = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'vi' });
                    const fullText = transcriptBlocks.map(t => t.text).join(' ');
                    combinedTranscripts += `\n--- Nguon (Video - Transcript): ${title} ---\nLink: ${url}\n${fullText}\n`;
                    console.log(`- Thành công (Transcript): ${title}`);
                } catch (err) {
                    console.log(`- Không có phụ đề: ${title}. Đang gọi Gemini Vision phân tích...`);
                    const visionResult = await getGeminiVisionAnalysis(thumbnailUrl, description);
                    combinedTranscripts += `\n--- Nguon (Video - Vision Analysis): ${title} ---\nLink: ${url}\nKết quả phân tích hình ảnh & mô tả: ${visionResult}\n`;
                }
            }
        } else {
            console.warn("Không tìm thấy video nào hoặc lỗi API. Sẽ dựa hoàn toàn vào Web Search của AI.");
        }

        console.log("3. Đang gọi Perplexity API để khai thác TOÀN BỘ nguồn web...");
        const transcriptSection = combinedTranscripts.trim().length > 0
            ? `Nội dung từ ${sources.length} nguồn YouTube phân tích hôm nay:\n${combinedTranscripts.substring(0, 30000)}`
            : 'Không lấy được transcript video YouTube. Hãy dựa hoàn toàn vào khả năng search web của bạn.';

        const prompt = `Hôm nay là ngày ${dateStr}. 
${transcriptSection}

Nhiệm vụ của bạn là thực hiện "Phân tích Thống kê Cộng đồng" (Community Consensus Analysis) cho dữ liệu XSMB ngày ${dateStr} với yêu cầu KHÔNG GIỚI HẠN nguồn:

1. THU THẬP DỮ LIỆU ĐẠI CHÚNG (Public Data Collection): 
   - Tổng hợp TOÀN BỘ thông tin từ các kênh truyền thông YouTube cung cấp ở trên (bao gồm cả các đoạn trích xuất kỹ thuật).
   - Thực hiện Web Search TOÀN DIỆN để tìm TẤT CẢ các bảng phân tích thống kê XSMB phổ biến trong ngày hôm nay ngày ${dateStr}. Hãy nỗ lực thu thập càng nhiều nguồn thông tin công khai càng tốt từ các trang tin tức, diễn đàn và blog phân tích dữ liệu.
   - YÊU CẦU: Không được bỏ sót bất kỳ nguồn tin đại chúng nào bạn tìm thấy.

2. XÁC ĐỊNH CHỈ SỐ ĐỒNG THUẬN (CONSENSUS INDEX):
   - Tổng hợp TẤT CẢ các bộ số xuất hiện trong các bài phân tích. 
   - Với mỗi số, hãy tính toán chính xác "Tần suất phổ biến" (Số lượng nguồn tin nhắc đến số đó).

3. TRẢ VỀ JSON CHÍNH XÁC (Sử dụng các khóa kỹ thuật):
- YÊU CẦU QUAN TRỌNG: Mọi con số trong "hot_numbers", "bach_thu_lo", "song_thu_lo" PHẢI là số có 2 chữ số (Lô). Nếu bạn thấy một giải trúng 5 chữ số (ví dụ: 94158), hãy chỉ lấy 2 số cuối (58) để thống kê.
- Sắp xếp "hot_numbers" theo "count" giảm dần (phổ biến nhất lên đầu).

{
    "sources": [
        {"title": "Tên nguồn tin", "url": "Link tham chiếu"}
    ],
    "hot_numbers": [
        {"number": "Số (2 chữ số)", "count": Tần_suất_xuất_hiện, "rank": Thứ_hạng_phổ_biến}
    ],
    "bach_thu_lo": ["Danh sách các số 2 chữ số có tần suất cao nhất"],
    "song_thu_lo": ["Các cặp số 2 chữ số thường đi cùng nhau, định dạng XX-YY"],
    "dan_de": ["Dàn đề hoặc các bộ số tiềm năng khác, chỉ lấy 2 số cuối"],
    "hot_nhat": ["Số 2 chữ số có chỉ số đồng thuận cao nhất"],
    "tom_tat": "Tổng kết ngắn gọn xu hướng thống kê hôm nay.",
    "seo_title": "...",
    "seo_desc": "...",
    "seo_content": "..."
}

LƯU Ý QUÂN TRỌNG:
- Bạn PHẢI liệt kê TOÀN BỘ các nguồn tin bạn đã tham chiếu vào mảng "sources". Tuyệt đối không giới hạn số lượng.
- Đây là một bài toán "Dữ liệu lớn" (Big Data Analysis) về hành vi cộng đồng. 
- Chỉ trả về JSON, không kèm văn bản giải thích.`;

        const aiResultContent = await getPerplexityCompletion(prompt);
        let parsedResult = null;
        try {
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
            sources: parsedResult.sources || sources,
            data: parsedResult
        };

        const outPath = path.join(process.cwd(), 'src', 'data', 'so-hot.json');
        fs.writeFileSync(outPath, JSON.stringify(finalData, null, 2), 'utf-8');
        console.log(`Đã lưu dữ liệu Số Hot thành công vào: ${outPath} với ${finalData.sources.length} nguồn.`);

        // --- Sync with SQL History ---
        try {
            const { query } = require('../src/lib/db');
            await query(`
                INSERT INTO so_hot_history (draw_date, prediction_data, created_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(draw_date) DO UPDATE SET
                prediction_data = excluded.prediction_data
            `, [dateStr, JSON.stringify(parsedResult)]);
            console.log("Đã đồng bộ dữ liệu vào so_hot_history SQL.");
        } catch (dbErr) {
            console.warn("Không thể đồng bộ vào SQL:", dbErr);
        }

        process.exit(0);

    } catch (error: any) {
        console.error("Lỗi chung tại fetch so hot:", error);
        process.exit(1);
    }
}

fetchSoHotTrongNgay();
