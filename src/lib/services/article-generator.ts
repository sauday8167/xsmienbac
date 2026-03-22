import { query, queryOne } from '../db';
import { GeminiClient } from '../ai/gemini-client';
import { ClaudeClient } from '../ai/claude-client';
import { ArticleInputBuilder } from './article-input-builder';
import { pingGoogleIndexing } from './google-indexing';


export class AutoArticleGenerator {
   static async generateDailyPost(targetDate: string) {
      try {
         console.log(`Starting article generation for ${targetDate}...`);

         // ... (Data gathering remains same) ...

         // 1. Gather Data & 2. Prepare Context (Existing code flow...)
         // We need to keep the logic but just jump to the AI call part.
         // Since replace_file_content works on chunks, we target the imports and the specific AI call block.

         // Wait, I can't "jump" in replacement content. I must match exact target. 
         // I will do 2 chunks.


         // 1. Gather Data
         const previousDate = new Date(targetDate);
         previousDate.setDate(previousDate.getDate() - 1);
         const previousDateStr = previousDate.toISOString().split('T')[0];

         // Get Yesterday's Result - with fallback to most recent if not available
         let yesterdayResult = await queryOne(
            `SELECT * FROM xsmb_results WHERE draw_date = ?`,
            [previousDateStr]
         );

         // If yesterday's result not found, use the most recent available result
         if (!yesterdayResult) {
            console.warn(`No result found for ${previousDateStr}, using most recent result instead`);
            yesterdayResult = await queryOne(
               `SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1`
            );

            if (!yesterdayResult) {
               throw new Error('No lottery results available in database - cannot generate article');
            }

            console.log(`Using result from ${yesterdayResult.draw_date} as reference`);
         }

         // 2. Prepare Context (Using new InputBuilder)
         const context = await ArticleInputBuilder.buildContext(targetDate, yesterdayResult);
         console.log('Context built with rich stats:', Object.keys(context.statistics));

         // 3. Construct Prompt with RICH DATA
         // Format date to DD-MM-YYYY for title
         const [y, m, d] = targetDate.split('-');
         const formattedDate = `${d}-${m}-${y}`;

         const prompt = `
            ROLE: Bạn là người phân tích dữ liệu xổ số, chia sẻ thống kê và nhận định một cách tự nhiên, dễ hiểu.
            
            TONE: 
            - Thân thiện, tự nhiên, như đang chia sẻ với bạn bè
            - TUYỆT ĐỐI TRÁNH các từ: "chuyên gia", "kinh nghiệm lâu năm", "bề dày kinh nghiệm", "20 năm"
            - Viết như một người đam mê thống kê đang chia sẻ phân tích
            - Sử dụng ngôn ngữ đơn giản, dễ hiểu
            
            MISSION: Phân tích dữ liệu và đưa ra nhận định cho kỳ quay ngày ${formattedDate}.
            
            QUAN TRỌNG: 
            - TUYỆT ĐỐI KHÔNG dùng các từ: "lô đề", "đánh", "chơi", "về bờ", "lộc lá", "ăn", "thắng lớn". 
            - Thay thế bằng: "xổ số", "tham khảo", "dự thưởng", "kết quả", "cơ hội", "trúng thưởng", "may mắn".
            - Hãy viết như một người đang chia sẻ góc nhìn thống kê một cách tự nhiên.
            
            DỮ LIỆU PHÂN TÍCH CHUYÊN SÂU (INPUT):
            
            1. KẾT QUẢ HÔM QUA (${previousDateStr}):
               - Đặc biệt: ${yesterdayResult?.special_prize} -> Tâm điểm phân tích.
               - Giải Nhất: ${yesterdayResult?.prize_1}.
            
            2. THỐNG KÊ LOTO CƠ BẢN:
               - Lô Gan (Lì lợm): ${context.statistics.loGan.map(i => `${i.number} (${i.daysSince} ngày)`).join(', ')}.
               - Lô Về Nhiều (30 ngày): ${context.statistics.frequentLoto.map(i => `${i.number} (${i.count} lần)`).join(', ')}.
               - Đầu/Đuôi Xuất Hiện Nhiều: Đầu [${context.statistics.headTail.topHeads.join(', ')}], Đuôi [${context.statistics.headTail.topTails.join(', ')}].

            3. PHÂN TÍCH SO SÁNH "NGÀY MAI" (Dữ liệu quá khứ khi ĐB về ${context.statistics.dbTomorrow?.target} và G1 về ${context.statistics.prize1Tomorrow?.target}):
               - Khi ĐB về ${context.statistics.dbTomorrow?.target}, hôm sau thường ra: ${context.statistics.dbTomorrow?.topFrequencies.join(', ')}.
               - Khi G1 về ${context.statistics.prize1Tomorrow?.target}, hôm sau thường ra: ${context.statistics.prize1Tomorrow?.topFrequencies.join(', ')}.

            4. HỆ THỐNG BẠC NHỚ (Systematic Pattern matching):
               - Bạc nhớ Số Đơn (Top): ${JSON.stringify(context.bacNho.soDon.map((x: any) => `${x.yesterdayNumber}->${x.predictions[0]?.number}`))}.
               - Bạc nhớ Cặp (Top): ${JSON.stringify(context.bacNho.cap2.map((x: any) => `${x.yesterdayPair}->${x.predictions[0]?.pair}`))}.
               - Bạc nhớ Khung 3 Ngày: 
                 + Số Đơn: ${JSON.stringify(context.bacNho.khung3Ngay.soDon.map((x: any) => `${x.yesterdayNumber}->${x.predictions[0]?.number}`))}.
                 + Cặp: ${JSON.stringify(context.bacNho.khung3Ngay.cap2.map((x: any) => `${x.yesterdayPair}->${x.predictions[0]?.pair}`))}.

            5. CẦU LOTO RƠI:
               - Cặp rơi từ giải ĐB/Nhất: ${context.statistics.lotoRoi ? JSON.stringify(context.statistics.lotoRoi) : 'Không có cầu'}.

            YÊU CẦU BÀI VIẾT (ARTICLE STRUCTURE HTML):
            
            1. Title (JSON field): "${formattedDate} - Phân Tích & Dự Đoán Kết Quả Xổ Số Miền Bắc"
            
            2. Introduction: 
               - Chào bạn đọc một cách tự nhiên, thân thiện.
               - Nhận định ngắn gọn về xu hướng quay thưởng hôm qua.

            3. Phân Tích Thống Kê (Use Bullet Points & Bold Numbers):
               - <h3>📉 Thống Kê Số Vắng (Lô Gan)</h3>: ...
               
               - <h3>🔥 Thống Kê Nhịp Số (Về Nhiều)</h3>: ...
               
               - <h3>📌 Thống Kê Đầu Đuôi (Mới)</h3>: Phân tích các đầu/đuôi đang về nhiều nhất để định hướng dàn đề.

            4. Góc Nhìn Kỹ Thuật & Bạc Nhớ:
               - Phân tích xu hướng số rơi.
               - Tổng hợp các cặp số tín hiệu tốt từ Bạc nhớ và thống kê "Ngày Mai".

            5. 🎯 DỰ ĐOÁN KẾT QUẢ NGÀY ${formattedDate}:
               - Trình bày trong khung (card) HTML đẹp mắt (Màu Đỏ chủ đạo).
               - Chốt: Bạch Thủ, Song Thủ, Nuôi Khung 3 Ngày.
               
               - ✨ Dàn Đặc Biệt Tiềm Năng (Tham khảo):
                 + Hãy chọn ra khoảng 36 con số có khả năng về cao nhất cho giải Đặc Biệt (dựa trên Thống kê Đầu/Đuôi và Bạc Nhớ).
                 + Liệt kê các số cách nhau bởi dấu phẩy, in đậm màu đỏ.
                 + Ghi chú nhỏ bên dưới: "(Kết hợp từ các tín hiệu bạc nhớ, thống kê đầu đuôi, và con số thường ra sau các giải đặc biệt/nhất)".

            6. Lời kết: Chúc bạn đọc may mắn. Nhắc nhở: Các con số chỉ mang tính chất tham khảo, hãy tham gia dự thưởng Xổ Số Kiến Thiết ích nước lợi nhà.
            
            OUTPUT FORMAT (MANDATORY):
            TUYỆT ĐỐI KHÔNG viết lời chào, lời dẫn hay bất kỳ nội dung nào ngoài hai phần dưới đây.
            
            Hãy cung cấp phản hồi chính xác theo hai phần, cách nhau bởi chuỗi "---HTML_START---":
            
            Phần 1: JSON Metadata (Dùng để SEO)
            {
                "title": "${formattedDate} - Phân Tích & Dự Đoán Kết Quả XSMB",
                "excerpt": "Phân tích thống kê và dự đoán kết quả XSMB ${formattedDate}... (100-150 ký tự)",
                "meta_title": "Dự Đoán Xổ Số Miền Bắc ${formattedDate} - Soi Cầu XSMB Hôm Nay",
                "meta_description": "Dự Đoán Xổ Số Miền Bắc ${formattedDate}, Phân tích thống kê chi tiết và dự đoán XSMB hôm nay. (150-160 ký tự)"
            }
            
            ---HTML_START---
            
            Phần 2: HTML Content (Mã HTML cho bài viết)
            <div class="analysis-article">
                ... nội dung bài viết ...
            </div>
            <div class="analysis-article">
                ... content here ...
            </div>
            `;

         // 4. Call AI (Switch to Claude)
         console.log('Asking Claude AI to write article...');

         // Try Claude first, fallback to Gemini if Claude fails or no key?
         // User requested "Use Claude API". We will prioritize Claude.
         let aiResponse = null;
         try {
            aiResponse = await ClaudeClient.generateContent(prompt);
         } catch (e) {
            console.error('Claude failed, falling back to Gemini...', e);
            aiResponse = await GeminiClient.generateContent(prompt);
         }

         if (!aiResponse) throw new Error('No response from AI (Claude & Gemini failed)');

         // 5. Robust Parsing
         let article: any = {};

         // Extract JSON metadata (non-greedy match for the first JSON object)
         const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/);
         if (jsonMatch) {
            try {
               article = JSON.parse(jsonMatch[0]);
            } catch (e) {
               console.error('Metadata JSON Parse Error, using fallbacks:', e);
            }
         }

         // Fill basic fallbacks just in case
         if (!article.title) article.title = `${formattedDate} - Phân Tích & Dự Đoán Kết Quả Xổ Số Miền Bắc`;
         if (!article.excerpt) article.excerpt = `Phân tích thống kê chi tiết và nhận định cơ hội may mắn cho kỳ quay XSMB ngày ${formattedDate}.`;
         if (!article.meta_title) article.meta_title = `Dự Đoán XSMB ${formattedDate} - Soi Cầu Miền Bắc Hôm Nay`;
         if (!article.meta_description) article.meta_description = article.excerpt;

         // Extract HTML Content
         let htmlContent = '';
         if (aiResponse.includes('---HTML_START---')) {
             const parts = aiResponse.split('---HTML_START---');
             htmlContent = parts.pop() || ''; // Take the last part which should be HTML
         } else {
             htmlContent = aiResponse;
         }

         // Clean up the HTML part: it might still contain the JSON block if AI placed the splitter at the very beginning
         // We look for the first actual HTML tag and discard anything before it.
         const firstTagIndex = htmlContent.indexOf('<');
         if (firstTagIndex !== -1) {
             htmlContent = htmlContent.substring(firstTagIndex);
         }

         // Clean up any remaining markdown backticks
         htmlContent = htmlContent.replace(/^```html/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

         article.content = htmlContent;

         // Validate required fields
         if (!article.title || !article.content) {
            throw new Error('AI response missing required fields (title or content)');
         }

         // 5. Save/Update to DB with Clean Slug
         // New Slug Format: du-doan-xsmb-YYYY-MM-DD
         const slug = `du-doan-xsmb-${targetDate}`;
         const thumbnail = '/images/ai-post-default.jpg';
         const status = 'published';
         const now = new Date().toISOString();

         // Check if post exists
         const existingPost = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);

         if (existingPost) {
            console.log(`Post with slug ${slug} already exists. Updating...`);
            await query(
               `UPDATE posts SET 
                    title = ?, 
                    content = ?, 
                    excerpt = ?, 
                    meta_title = ?,
                    meta_description = ?,
                    thumbnail_url = ?, 
                    category = ?, 
                    status = ?, 
                    updated_at = ?
                  WHERE id = ?`,
               [
                  article.title,
                  article.content,
                  article.excerpt,
                  article.meta_title || article.title,
                  article.meta_description || article.excerpt,
                  thumbnail,
                  'soi-cau',
                  status,
                  now,
                  existingPost.id
               ]
            );
         } else {
            console.log(`Creating new post with slug ${slug}...`);
            await query(
               `INSERT INTO posts (title, slug, content, excerpt, meta_title, meta_description, thumbnail_url, category, status, published_at, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
               [
                  article.title,
                  slug,
                  article.content,
                  article.excerpt,
                  article.meta_title || article.title,
                  article.meta_description || article.excerpt,
                  thumbnail,
                  'soi-cau',
                  status,
                  now,
                  now,
                  now
               ]
            );
         }

         console.log(`Article "${article.title}" processed successfully!`);

         // 6. Auto-ping Google Indexing API (async, no-throw)
         const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';
         const articleUrl = `${siteUrl}/tin-tuc/${slug}`;
         pingGoogleIndexing(articleUrl).catch((e) =>
            console.warn('[GoogleIndexing] Ping error:', e)
         );

         return article;

      } catch (error) {
         console.error('Error in AutoArticleGenerator:', error);
         throw error;
      }
   }
}

