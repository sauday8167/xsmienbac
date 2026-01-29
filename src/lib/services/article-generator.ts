import { query, queryOne } from '../db';
import { GeminiClient } from '../ai/gemini-client';
import { ClaudeClient } from '../ai/claude-client';
import { ArticleInputBuilder } from './article-input-builder';

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
            ROLE: Bạn là một chuyên gia phân tích Xổ Số Miền Bắc (XSMB) với 20 năm kinh nghiệm nghiên cứu xác suất thống kê.
            MISSION: Phân tích dữ liệu và đưa ra nhận định cho kỳ quay ngày ${formattedDate}.
            TONE: Trưởng thành, điềm đạm, sâu sắc, sử dụng ngôn ngữ phân tích kỹ thuật (nhịp số, tần suất, biến động, kỳ vọng).
            
            QUAN TRỌNG: 
            - TUYỆT ĐỐI KHÔNG dùng các từ: "lô đề", "đánh", "chơi", "về bờ", "lộc lá", "ăn", "thắng lớn". 
            - Thay thế bằng: "xổ số", "tham khảo", "dự thưởng", "kết quả", "cơ hội", "trúng thưởng", "may mắn".
            - Hãy viết như một nhà phân tích đang chia sẻ góc nhìn thống kê.
            
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
               - Chào quý bạn đọc.
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
            
            INPUT FORMATS:
            
            OUTPUT FORMAT:
            Please provide the response in TWO parts separated by "---HTML_START---":
            
            Part 1: JSON Metadata
            {
                "title": "${formattedDate} - ...",
                "excerpt": "Phân tích thống kê và dự đoán kết quả XSMB ${formattedDate}..."
            }
            
            ---HTML_START---
            
            Part 2: HTML Content (Just the HTML code, no JSON escaping needed)
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

         const parts = aiResponse.split('---HTML_START---');

         if (parts.length < 2) {
            console.warn("AI didn't use the splitter, attempting fallback JSON parse...");
            // Fallback to old regex method if AI ignored instructions
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
               article = JSON.parse(jsonMatch[0]);
            } else {
               throw new Error('Failed to parse AI response: No separation and no valid JSON');
            }
         } else {
            // Parse Metadata
            const jsonStr = parts[0].replace(/```json/g, '').replace(/```/g, '').trim();
            try {
               // Find the first '{' and last '}'
               const firstBrace = jsonStr.indexOf('{');
               const lastBrace = jsonStr.lastIndexOf('}');
               if (firstBrace !== -1 && lastBrace !== -1) {
                  const cleanJson = jsonStr.substring(firstBrace, lastBrace + 1);
                  article = JSON.parse(cleanJson);
               } else {
                  article = JSON.parse(jsonStr);
               }
            } catch (e) {
               console.error('Metadata JSON Parse Error:', e);
               throw new Error('Failed to parse article metadata');
            }

            // Get Content
            let htmlContent = parts[1].trim();
            // Remove markdown code blocks if AI wrapped the HTML
            htmlContent = htmlContent.replace(/^```html/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

            article.content = htmlContent;
         }

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
                    thumbnail_url = ?, 
                    category = ?, 
                    status = ?, 
                    updated_at = ?
                  WHERE id = ?`,
               [
                  article.title,
                  article.content,
                  article.excerpt,
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
               `INSERT INTO posts (title, slug, content, excerpt, thumbnail_url, category, status, published_at, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
               [
                  article.title,
                  slug,
                  article.content,
                  article.excerpt,
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
         return article;

      } catch (error) {
         console.error('Error in AutoArticleGenerator:', error);
         throw error;
      }
   }
}

