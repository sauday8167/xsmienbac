import { query, queryOne } from '../db';
import { GeminiClient } from '../ai/gemini-client';
import { ClaudeClient } from '../ai/claude-client';
import { ArticleInputBuilder } from './article-input-builder';
import { pingGoogleIndexing } from './google-indexing';

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
            MISSION: Viết bài phân tích chuyên sâu cho ngày ${formattedDate} dựa trên dữ liệu thật.
            
            QUY TẮC NỘI DUNG:
            - Văn phong: Thân thiện, khách quan, không dùng từ ngữ "lô đề", "về bờ", "lộc lá".
            - Tuyệt đối không dùng cụm từ: "chuyên gia", "20 năm kinh nghiệm".
            - Sử dụng các thẻ HTML (h3, p, ul, li, b) để định dạng bài viết chuyên nghiệp.
            
            DỮ LIỆU INPUT:
            ${JSON.stringify({
                date: targetDate,
                yesterday: yesterdayResult?.special_prize,
                loGan: context.statistics.loGan,
                topFreq: context.statistics.frequentLoto,
                bacNho: context.bacNho.soDon.slice(0, 5)
            })}

            ĐỊNH DẠNG PHẢN HỒI (CHỈ TRẢ VỀ JSON):
            Bạn phải trả về DUY NHẤT một đối tượng JSON có cấu trúc như sau:
            {
                "title": "Tiêu đề bài viết",
                "excerpt": "Tóm tắt ngắn gọn cho SEO (100-150 ký tự)",
                "meta_description": "Mô tả SEO chuẩn",
                "content_html": "<div class='analysis-article'>... Nội dung chi tiết bài viết (ít nhất 1000 từ) ...</div>"
            }

            VÍ DỤ MẪU:
            {
                "title": "Phân Tích Soi Cầu XSMB ${formattedDate}",
                "excerpt": "Nhận định chi tiết nhịp loto rơi và cầu bạc nhớ ngày ${formattedDate}.",
                "meta_description": "Dự đoán XSMB ${formattedDate} chính xác nhất.",
                "content_html": "<div class='analysis-article'><h3>Nhận định chung</h3><p>Hôm nay chúng ta thấy nhịp...</p></div>"
            }
         `;

         let article: any = {};
         let attempts = 0;
         const MAX_ATTEMPTS = 2;

         while (attempts < MAX_ATTEMPTS) {
            attempts++;
            try {
               console.log(`[AI-GENERATOR] Attempt ${attempts}/${MAX_ATTEMPTS}...`);
               let aiResponse = await ClaudeClient.generateContent(refinedPrompt);
               
               if (!aiResponse) throw new Error('Empty AI response');

               const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
               if (!jsonMatch) throw new Error('No JSON object found in response');

               article = JSON.parse(jsonMatch[0]);
               
               // Quality validation
               if (article.title && article.content_html && article.content_html.length > 500) {
                  console.log(`[AI-GENERATOR] Quality content received on attempt ${attempts}`);
                  break; 
               } else {
                  throw new Error('Content too short or missing fields');
               }
            } catch (e) {
               console.warn(`[AI-GENERATOR] Attempt ${attempts} failed: ${e.message}`);
               if (attempts === MAX_ATTEMPTS) {
                  console.log('[AI-GENERATOR] Final fallback to Gemini...');
                  const geminiResponse = await GeminiClient.generateContent(refinedPrompt);
                  const jsonMatch = geminiResponse?.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                      article = JSON.parse(jsonMatch[0]);
                  } else {
                      throw new Error('All models failed to provide valid JSON');
                  }
               }
            }
         }

         // Final mapping and fallbacks
         if (!article.title) article.title = `${formattedDate} - Phân Tích & Dự Đoán Kết Quả Xổ Số Miền Bắc`;
         if (!article.content_html) throw new Error('Could not generate article content');
         
         const slug = `du-doan-xsmb-${targetDate}`;
         const thumbnail = '/images/ai-post-default.jpg';
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
