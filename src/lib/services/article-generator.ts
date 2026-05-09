import { query, queryOne } from '../db';
import { ClaudeClient } from '../ai/claude-client';
import { OpenRouterClient } from '../ai/openrouter-client';
import { ArticleInputBuilder } from './article-input-builder';
import { pingGoogleIndexing } from './google-indexing';
import { ImageGenerator } from './image-generator';

export class AutoArticleGenerator {
   static async generateDailyPost(targetDate: string) {
      try {
         console.log(`Starting article generation for ${targetDate}...`);

         // 1. Gather Data
         const previousDate = new Date(targetDate);
         previousDate.setDate(previousDate.getDate() - 1);
         const previousDateStr = previousDate.toISOString().split('T')[0];

         // Get Yesterday's Result
         let yesterdayResult = await queryOne(
            `SELECT * FROM xsmb_results WHERE draw_date = ?`,
            [previousDateStr]
         );

         if (!yesterdayResult) {
            console.warn(`No result found for ${previousDateStr}, using most recent result instead`);
            yesterdayResult = await queryOne(
               `SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1`
            );

            if (!yesterdayResult) {
               throw new Error('No lottery results available in database');
            }
         }

         // 2. Prepare Context
         const context = await ArticleInputBuilder.buildContext(targetDate, yesterdayResult);
         const [y, m, d] = targetDate.split('-');
         const formattedDate = `${d}-${m}-${y}`;

         // 3. Call AI with Retry Loop (Max 2 Attempts for quality)
         const refinedPrompt = `
            ROLE: Bạn là chuyên gia phân tích dữ liệu xổ số Miền Bắc.
            MISSION: Viết bài phân tích soi cầu chuyên sâu chuẩn SEO cho ngày ${formattedDate}. Bạn phải viết bài RẤT DÀI, ÍT NHẤT 1500 TỪ dựa trên dữ liệu thật. Hãy đi sâu phân tích chi tiết từng con số, từng thống kê để đảm bảo bài viết đủ dài và chất lượng.

            QUY TẮC NỘI DUNG VÀ SEO:
            1. Văn phong: Khách quan, chuyên nghiệp. Không dùng từ ngữ xúi giục đánh bạc, "về bờ", "lộc lá". Bắt buộc có phần cảnh báo (Disclaimer) từ chối trách nhiệm ở cuối bài.
            2. Cấu trúc bài viết: Phải sử dụng các thẻ <h2>, <h3> để chia bài viết (đẩy chốt số lên đầu). Phần phân tích bên dưới phải mở rộng, viết dài và phân tích kỹ lưỡng về chu kỳ loto, nhịp loto, loto gan để đạt đủ độ dài 1500 từ.
            3. Chốt Số VIP (BẮT BUỘC CÓ): Bắt buộc liệt kê ở H2 hoặc H3 phần chốt số đầu bài:
               - Bạch thủ lô: (1 số xuất sắc nhất)
               - Song thủ lô: (1 cặp số đẹp)
               - Lô kép / Cầu kẹp VIP: (1 cặp kép)
               - Dàn đặc biệt 36 số: (LIỆT KÊ ĐẦY ĐỦ RÕ RÀNG 36 CON SỐ, TUYỆT ĐỐI KHÔNG ĐƯỢC VIẾT TẮT BẰNG DẤU BA CHẤM "...").
            4. Phân tích Thuật toán: Thêm 1 thẻ H2 "Soi cầu Bạc Nhớ / Pascal" và đi sâu phân tích logic của 1-2 số tiềm năng từ thuật toán máy học.
            5. Liên kết nội bộ (Internal Linking): BẮT BUỘC chèn tự nhiên các thẻ <a> lồng trong bài. Ví dụ:
               - <a href="/" title="Kết quả XSMB">xổ số miền Bắc</a>
               - <a href="/so-mo" title="Giải mã giấc mơ">Sổ mơ lô đề</a>
               - <a href="/soi-cau-bac-nho" title="Soi cầu Bạc Nhớ">Soi cầu bạc nhớ</a>
               - <a href="/thong-ke" title="Thống kê xổ số">Thống kê lô gan</a>
            
            DỮ LIỆU INPUT:
            ${JSON.stringify({
                date: targetDate,
                yesterday: yesterdayResult?.special_prize,
                loGan: context.statistics.loGan,
                topFreq: context.statistics.frequentLoto,
                bacNho: context.bacNho.soDon.slice(0, 5)
            })}

            ĐỊNH DẠNG PHẢN HỒI (CHỈ TRẢ VỀ JSON DUY NHẤT KHÔNG KÈM TEXT NÀO KHÁC):
            {
                "title": "Dự đoán XSMB ${formattedDate} - Soi cầu chốt Bạch thủ, Song thủ VIP",
                "excerpt": "Dự đoán KQXSMB ${formattedDate}. Chốt số Bạch thủ lô, Song thủ, Lô kép và Dàn đề đầy đủ 36 số. Phân tích chuẩn xác qua lô gan và bạc nhớ.",
                "meta_description": "Xem trực tiếp dự đoán XSMB ngày ${formattedDate}. Soi cầu bạch thủ, song thủ lô, kép VIP. Cung cấp đầy đủ dàn đặc biệt 36 số chuẩn xác nhất hôm nay.",
                "image_prompt": "A professional digital banner for a Vietnamese lottery prediction website. Dark gold and red theme, high-tech AI analysis graphs, symbols of luck like golden coins or high-speed data flow. Clean, sharp, 4k resolution.",
                "content_html": "<div class='analysis-article'><h2>Chốt số Dự đoán XSMB ${formattedDate} chính xác nhất</h2><h3>Bạch thủ lô VIP: <b>XX</b></h3><h3>Song thủ lô: <b>XX - XX</b></h3><h3>Lô kép VIP: <b>XX - XX</b></h3><h3>Dàn đề đặc biệt 36 số: <b>XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX, XX</b></h3><h2>Phân tích dữ liệu & Thống kê loto chi tiết</h2><p>Khảo sát sâu vào bảng <a href='/thong-ke'>thống kê xổ số</a>...</p><h2>Soi cầu Bạc Nhớ & Cầu Kẹp</h2><p>Theo thuật toán <a href='/soi-cau-bac-nho'>soi cầu bạc nhớ</a>...</p><h2>Lời khuyên & Cảnh báo (Disclaimer)</h2><p><i>Tất cả các bộ số dự đoán phía trên chỉ mang tính chất thống kê, tham khảo. Xổ số là trò chơi giải trí, nghiêm cấm mọi hình thức đánh bạc trái pháp luật. Hãy mua vé số kiến thiết do nhà nước ban hành.</i></p></div>"
            }
         `;

         let article: any = {};

         // Chain: 1. Claude (primary) → 2. OpenRouter paid (Gemini 2.5 Flash, Grok-4)
         const providers = [
            {
               name: 'Claude (claude-sonnet-4-6)',
               call: () => ClaudeClient.generateContent(refinedPrompt, 'claude-sonnet-4-6', 0.8, 8000)
            },
            {
               name: 'OpenRouter Paid (Gemini/Grok)',
               call: () => OpenRouterClient.generateContent(refinedPrompt)
            }
         ];

         let lastError = '';
         for (const provider of providers) {
            try {
               console.log(`[AI-GENERATOR] Trying ${provider.name}...`);
               const aiResponse = await provider.call();

               if (!aiResponse) throw new Error('Empty AI response');

               const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
               if (!jsonMatch) throw new Error('No JSON object found in response');

               const parsed = JSON.parse(jsonMatch[0]);
               if (!parsed.title || !parsed.content_html || parsed.content_html.length < 500) {
                  throw new Error('Content too short or missing required fields');
               }

               article = parsed;
               console.log(`[AI-GENERATOR] Success with ${provider.name}`);
               break;
            } catch (e: any) {
               lastError = e.message;
               console.warn(`[AI-GENERATOR] ${provider.name} failed: ${e.message}`);
            }
         }

         if (!article.title) {
            throw new Error(`All AI providers failed. Last error: ${lastError}`);
         }

         // Final mapping and fallbacks
         if (!article.title) article.title = `${formattedDate} - Phân Tích & Dự Đoán Kết Quả Xổ Số Miền Bắc`;
         if (!article.content_html) throw new Error('Could not generate article content');
         
         const slug = `du-doan-xsmb-${targetDate}`;
         
         // 4. Generate Thumbnail Image
         let thumbnail = '/images/ai-post-default.jpg';
         if (article.image_prompt) {
            const generatedImage = await ImageGenerator.generateAndSaveImage(article.image_prompt, slug);
            if (generatedImage) {
               thumbnail = generatedImage;
            }
         }
         const status = 'published';
         const now = new Date().toISOString();

         // Check if post exists
         const existingPost = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);

         if (existingPost) {
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
                  article.content_html,
                  article.excerpt || article.title,
                  article.title,
                  article.meta_description || article.excerpt || article.title,
                  thumbnail,
                  'soi-cau',
                  status,
                  now,
                  existingPost.id
               ]
            );
         } else {
            await query(
               `INSERT INTO posts (title, slug, content, excerpt, meta_title, meta_description, thumbnail_url, category, status, published_at, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
               [
                  article.title,
                  slug,
                  article.content_html,
                  article.excerpt || article.title,
                  article.title,
                  article.meta_description || article.excerpt || article.title,
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

         // 6. Auto-ping Google Indexing API
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
