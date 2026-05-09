/**
 * Tuyến 6: Post-draw Analysis — Phân tích kết quả XSMB ngay sau khi có KQ (19:05)
 * Keyword target: "KQXSMB DD/MM/YYYY phân tích", "kết quả xổ số miền Bắc hôm nay DD/MM"
 * Category: tin-tuc (thông tin thực tế, không phải dự đoán)
 */
import { queryOne, query } from '../src/lib/db';
import { GeminiClient } from '../src/lib/ai/gemini-client';
import { ClaudeClient } from '../src/lib/ai/claude-client';

interface LoFreq { number: string; count: number }

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

function countFrequency(lotos: string[]): LoFreq[] {
    const counts: Record<string, number> = {};
    lotos.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
    return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .map(([number, count]) => ({ number, count }));
}

async function getLongGanNumbers(date: string): Promise<{ number: string; days: number }[]> {
    // Tìm các số không xuất hiện đã lâu (lô gan từ 15+ ngày)
    const rows = await query<any[]>(
        `SELECT draw_date, special_prize, prize_1, prize_2, prize_3, prize_4, prize_5, prize_6, prize_7
         FROM xsmb_results WHERE draw_date <= ? ORDER BY draw_date DESC LIMIT 30`,
        [date]
    );
    const lastSeen: Record<string, string> = {};
    rows.forEach((row, idx) => {
        const lotos = parseAllLotos(row);
        lotos.forEach(n => { if (!lastSeen[n]) lastSeen[n] = row.draw_date; });
    });
    const today = new Date(date);
    const ganNumbers: { number: string; days: number }[] = [];
    for (let i = 0; i <= 99; i++) {
        const n = String(i).padStart(2, '0');
        if (!lastSeen[n]) {
            ganNumbers.push({ number: n, days: 30 });
        } else {
            const diff = Math.floor((today.getTime() - new Date(lastSeen[n]).getTime()) / 86400000);
            if (diff >= 15) ganNumbers.push({ number: n, days: diff });
        }
    }
    return ganNumbers.sort((a, b) => b.days - a.days).slice(0, 5);
}

async function main() {
    console.log('[KetQuaBot] Khởi động Post-draw Analysis...');
    try {
        const now = new Date();
        const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const todayStr = vnTime.toLocaleDateString('sv-SE');
        const [y, m, d] = todayStr.split('-');
        const formattedDate = `${d}/${m}/${y}`;

        // Lấy kết quả hôm nay từ DB
        const result = await queryOne('SELECT * FROM xsmb_results WHERE draw_date = ?', [todayStr]);
        if (!result) {
            console.log('[KetQuaBot] Chưa có kết quả hôm nay, bỏ qua.');
            return;
        }
        if (!result.special_prize) {
            console.log('[KetQuaBot] Kết quả chưa hoàn chỉnh (chưa có GĐB), bỏ qua.');
            return;
        }

        const slug = `ket-qua-xsmb-${todayStr}-phan-tich`;
        const existing = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing) { console.log('[KetQuaBot] Bài phân tích hôm nay đã tồn tại.'); return; }

        // Phân tích dữ liệu thật
        const allLotos = parseAllLotos(result);
        const freqList = countFrequency(allLotos);
        const hotNumbers = freqList.filter(x => x.count >= 2); // số về ≥2 lần
        const heads = new Set(allLotos.map(l => l[0]));
        const tails = new Set(allLotos.map(l => l[1]));
        const missingHeads = ['0','1','2','3','4','5','6','7','8','9'].filter(x => !heads.has(x));
        const missingTails = ['0','1','2','3','4','5','6','7','8','9'].filter(x => !tails.has(x));
        const ganNumbers = await getLongGanNumbers(todayStr);

        const gdb = result.special_prize;
        const g1 = result.prize_1;
        const gdbLo = gdb.slice(-2);
        const g1Lo = g1?.slice(-2) || '';

        const statsText = [
            `Giải Đặc Biệt: ${gdb} (lô ${gdbLo})`,
            `Giải Nhất: ${g1} (lô ${g1Lo})`,
            hotNumbers.length > 0 ? `Số về nhiều lần: ${hotNumbers.map(x => `${x.number} (${x.count} nháy)`).join(', ')}` : 'Không có số về 2+ lần',
            missingHeads.length > 0 ? `Đầu câm hôm nay: ${missingHeads.join(', ')}` : 'Đầu đầy đủ 0-9',
            missingTails.length > 0 ? `Đuôi câm hôm nay: ${missingTails.join(', ')}` : 'Đuôi đầy đủ 0-9',
            ganNumbers.length > 0 ? `Lô gan đang chờ nổ: ${ganNumbers.map(x => `${x.number} (${x.days} ngày)`).join(', ')}` : '',
        ].filter(Boolean).join('\n');

        const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const weekdayName = weekdays[vnTime.getDay()];

        const prompt = `
            ROLE: Chuyên gia phân tích kết quả xổ số miền Bắc khách quan.
            MISSION: Viết bài phân tích kết quả XSMB ngày ${formattedDate} (${weekdayName}) dựa trên số liệu thật sau đây.

            DỮ LIỆU THẬT (BẮT BUỘC dùng, không được thay đổi):
            ${statsText}

            YÊU CẦU BÀI VIẾT (ÍT NHẤT 800 TỪ):
            - H1: Kết quả XSMB ${formattedDate} (${weekdayName}): Giải Đặc Biệt ${gdb}, phân tích chi tiết
            - Phần 1: Tổng quan kết quả — GĐB, Giải Nhất, điểm đặc biệt của ngày
            - Phần 2: Phân tích số học — số về nhiều nháy, đầu câm, đuôi câm, nhận xét
            - Phần 3: Lô gan đang chờ — liệt kê và phân tích (nếu có)
            - Phần 4: Nhận định cho ngày mai — dựa trên lô rơi GĐB (${gdbLo}), xu hướng
            - Liên kết nội bộ: <a href="/thong-ke" title="Thống kê xổ số">thống kê lô</a>, <a href="/soi-cau-bac-nho" title="Soi cầu bạc nhớ">soi cầu bạc nhớ</a>
            - Disclaimer ngắn cuối bài

            TRẢ VỀ JSON DUY NHẤT:
            {
                "title": "Kết quả XSMB ${formattedDate}: GĐB ${gdb}, phân tích đầu câm và lô nổi bật",
                "excerpt": "KQXSMB ${formattedDate}: Giải Đặc Biệt ${gdb}. Phân tích chi tiết đầu câm, số về nhiều nháy và nhận định xu hướng ngày mai.",
                "meta_description": "Kết quả xổ số miền Bắc ${formattedDate}: GĐB ${gdb}. Xem phân tích chuyên sâu KQXSMB hôm nay - đầu câm, lô nổi bật, nhận định cho ngày tiếp theo.",
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
            console.log('[KetQuaBot] Đang tạo ảnh thumbnail...');
            let thumbnail = '/images/ai-post-default.jpg';
            const imgPrompt = `Vietnamese lottery results analysis banner, numbers ${gdb} highlighted in gold, dark professional background, data visualization theme, 4k quality`;
            const generatedLocation = await GeminiClient.generateImage(imgPrompt);
            if (generatedLocation) thumbnail = generatedLocation;

            const nowIso = new Date().toISOString();
            await query(`
                INSERT INTO posts (title, slug, content, excerpt, meta_title, meta_description, thumbnail_url, category, status, published_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                articleJson.title, slug, articleJson.content_html, articleJson.excerpt,
                articleJson.title, articleJson.meta_description, thumbnail,
                'tin-tuc', 'published', nowIso, nowIso, nowIso
            ]);
            console.log(`[KetQuaBot] Đã đăng bài: ${articleJson.title}`);
        } else {
            console.error('[KetQuaBot] AI trả về format không hợp lệ.');
        }
    } catch (err) { console.error('[KetQuaBot] Error:', err); }
}
main();
