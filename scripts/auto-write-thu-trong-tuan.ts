/**
 * Tuyến 7: Thống kê theo thứ trong tuần — chạy thứ 2 hằng tuần 08:30
 * Keyword target: "thứ X XSMB hay về con gì", "thống kê XSMB thứ X"
 * Mỗi tuần viết 1 bài về thứ ngày hôm nay (Mon=Thứ 2, Tue=Thứ 3, ...)
 * Category: phan-tich
 */
import { queryOne, query } from '../src/lib/db';
import { GeminiClient } from '../src/lib/ai/gemini-client';
import { ClaudeClient } from '../src/lib/ai/claude-client';

const WEEKDAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const WEEKDAY_SLUGS = ['chu-nhat', 'thu-hai', 'thu-ba', 'thu-tu', 'thu-nam', 'thu-sau', 'thu-bay'];

interface NumberFreq { number: string; count: number; pct: number }

function parseAllLotos(result: any): string[] {
    const lotos: string[] = [];
    const add = (val: string) => {
        if (!val || val.length < 2) return;
        const n = val.slice(-2);
        if (/^\d{2}$/.test(n)) lotos.push(n);
    };
    add(result.special_prize);
    add(result.prize_1);
    ['prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'].forEach(p => {
        if (result[p]) {
            try { (JSON.parse(result[p]) as string[]).forEach(n => add(n)); }
            catch { add(result[p]); }
        }
    });
    return lotos;
}

async function getWeekdayStats(weekday: number, limit = 52): Promise<{
    topNumbers: NumberFreq[];
    topHeads: { digit: string; count: number }[];
    topTails: { digit: string; count: number }[];
    totalDraws: number;
    gdbFreq: NumberFreq[];
}> {
    const rows = await query<any[]>(
        `SELECT * FROM xsmb_results
         WHERE strftime('%w', draw_date) = ?
         ORDER BY draw_date DESC LIMIT ?`,
        [String(weekday), limit]
    );

    const counts: Record<string, number> = {};
    const headCounts: Record<string, number> = {};
    const tailCounts: Record<string, number> = {};
    const gdbCounts: Record<string, number> = {};

    rows.forEach(row => {
        const lotos = parseAllLotos(row);
        lotos.forEach(n => {
            counts[n] = (counts[n] || 0) + 1;
            headCounts[n[0]] = (headCounts[n[0]] || 0) + 1;
            tailCounts[n[1]] = (tailCounts[n[1]] || 0) + 1;
        });
        if (row.special_prize?.length >= 2) {
            const gdbLo = row.special_prize.slice(-2);
            gdbCounts[gdbLo] = (gdbCounts[gdbLo] || 0) + 1;
        }
    });

    const totalDraws = rows.length;
    // Mỗi kỳ có ~27 lô → tổng appearances / totalDraws = avg per draw
    const totalAppearances = Object.values(counts).reduce((a, b) => a + b, 0);
    const avgPerNumber = totalAppearances / 100;

    const topNumbers = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([number, count]) => ({
            number,
            count,
            pct: Math.round((count / totalDraws) * 100)
        }));

    const topHeads = Object.entries(headCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([digit, count]) => ({ digit, count }));

    const topTails = Object.entries(tailCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([digit, count]) => ({ digit, count }));

    const gdbFreq = Object.entries(gdbCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([number, count]) => ({
            number,
            count,
            pct: Math.round((count / totalDraws) * 100)
        }));

    return { topNumbers, topHeads, topTails, totalDraws, gdbFreq };
}

function getWeekOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

async function main() {
    console.log('[ThuTrongTuanBot] Khởi động thống kê theo thứ...');
    try {
        const now = new Date();
        const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const weekday = vnTime.getDay(); // 0=CN, 1=T2,...
        const weekNum = getWeekOfYear(vnTime);
        const year = vnTime.getFullYear();

        const weekdayName = WEEKDAY_NAMES[weekday];
        const weekdaySlug = WEEKDAY_SLUGS[weekday];
        const slug = `thong-ke-xsmb-${weekdaySlug}-tuan-${weekNum}-${year}`;

        const existing = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing) {
            console.log(`[ThuTrongTuanBot] Bài tuần ${weekNum} đã tồn tại.`);
            return;
        }

        const stats = await getWeekdayStats(weekday);
        if (stats.totalDraws < 10) {
            console.log('[ThuTrongTuanBot] Chưa đủ dữ liệu lịch sử.');
            return;
        }

        const top10Text = stats.topNumbers.slice(0, 10)
            .map((x, i) => `${i + 1}. Lô ${x.number}: về ${x.count}/${stats.totalDraws} kỳ (${x.pct}%)`)
            .join('\n');

        const gdbText = stats.gdbFreq.slice(0, 5)
            .map(x => `GĐB đuôi ${x.number}: ${x.count} lần (${x.pct}%)`)
            .join(', ');

        const headText = stats.topHeads.map(x => `Đầu ${x.digit} (${x.count})`).join(', ');
        const tailText = stats.topTails.map(x => `Đuôi ${x.digit} (${x.count})`).join(', ');

        const prompt = `
            ROLE: Chuyên gia thống kê xổ số miền Bắc theo chu kỳ tuần.
            MISSION: Viết bài thống kê chuyên sâu "${weekdayName} XSMB hay về con gì?" dựa trên ${stats.totalDraws} kỳ lịch sử thật.

            DỮ LIỆU THẬT TỪ ${stats.totalDraws} KỲ ${weekdayName.toUpperCase()} GẦN NHẤT (KHÔNG ĐƯỢC THAY ĐỔI):
            Top 10 lô hay về nhất:
            ${top10Text}
            Đầu hay ra nhất: ${headText}
            Đuôi hay ra nhất: ${tailText}
            GĐB hay ra nhất: ${gdbText}
            Top 3 lô nên chơi tuần này: ${stats.topNumbers.slice(0, 3).map(x => x.number).join(', ')}

            YÊU CẦU BÀI VIẾT (ÍT NHẤT 1000 TỪ):
            - H1: ${weekdayName} XSMB hay về con gì? Thống kê ${stats.totalDraws} kỳ chính xác nhất
            - Phần 1: Tổng quan xu hướng ${weekdayName} — phân tích đặc điểm riêng của ngày này
            - Phần 2: Bảng top 10 số hay về nhất — giải thích ý nghĩa từng con số (dùng số thật ở trên)
            - Phần 3: Phân tích đầu/đuôi thống trị — đầu hay về, đuôi hay về
            - Phần 4: GĐB theo chu kỳ — con số hay xuất hiện ở giải đặc biệt
            - Phần 5: Kết luận & Gợi ý — 3 số nên theo dõi tuần này (dựa trên dữ liệu thật)
            - Liên kết nội bộ: <a href="/thong-ke" title="Thống kê xổ số">thống kê XSMB</a>, <a href="/soi-cau-bac-nho" title="Soi cầu bạc nhớ">soi cầu bạc nhớ</a>
            - Disclaimer cuối bài

            TRẢ VỀ JSON DUY NHẤT:
            {
                "title": "${weekdayName} XSMB hay về con gì? Top ${stats.topNumbers[0]?.number || 'XX'}-${stats.topNumbers[1]?.number || 'XX'}-${stats.topNumbers[2]?.number || 'XX'} thống kê ${stats.totalDraws} kỳ",
                "excerpt": "Thống kê ${stats.totalDraws} kỳ ${weekdayName} XSMB: top ${stats.topNumbers.slice(0, 5).map(x => x.number).join(', ')} hay về nhất. Phân tích đầu đuôi và GĐB đặc trưng của ngày ${weekdayName}.",
                "meta_description": "${weekdayName} xổ số miền Bắc hay về con gì? Dữ liệu ${stats.totalDraws} kỳ lịch sử: lô ${stats.topNumbers[0]?.number || 'XX'} đứng đầu, đầu ${stats.topHeads[0]?.digit || 'X'} nổi trội. Xem thống kê chi tiết ngay.",
                "content_html": "<div class='analysis-article'>...</div>"
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
            console.log('[ThuTrongTuanBot] Đang tạo ảnh thumbnail...');
            let thumbnail = '/images/ai-post-default.jpg';
            const imgPrompt = `Vietnamese lottery weekly statistics infographic, ${weekdayName} analysis, top numbers ${stats.topNumbers.slice(0, 3).map(x => x.number).join(' ')}, professional dark blue data visualization, charts and graphs`;
            const generatedLocation = await GeminiClient.generateImage(imgPrompt);
            if (generatedLocation) thumbnail = generatedLocation;

            const nowIso = new Date().toISOString();
            await query(`
                INSERT INTO posts (title, slug, content, excerpt, meta_title, meta_description, thumbnail_url, category, status, published_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                articleJson.title, slug, articleJson.content_html, articleJson.excerpt,
                articleJson.title, articleJson.meta_description, thumbnail,
                'phan-tich', 'published', nowIso, nowIso, nowIso
            ]);
            console.log(`[ThuTrongTuanBot] Đã đăng bài: ${articleJson.title}`);
        } else {
            console.error('[ThuTrongTuanBot] AI trả về format không hợp lệ.');
        }
    } catch (err) { console.error('[ThuTrongTuanBot] Error:', err); }
}
main();
