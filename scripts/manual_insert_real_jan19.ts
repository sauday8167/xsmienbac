
import { ContextProvider } from '@/lib/ai/context-provider';
import { GeminiClient } from '@/lib/ai/gemini-client';
import { getDb } from '@/lib/db';

async function main() {
    try {
        console.log("🚀 Starting Manual Generation (V2 - Bypass Formatters)...");

        // 1. Context
        console.log("1. Fetching Context...");
        const targetDate = '2026-01-19';
        const context = await ContextProvider.getDailyContext(targetDate);
        console.log("   Context Keys:", Object.keys(context));

        // 2. Manual Prompt Construction (Fail-safe)
        console.log("2. Preparing Prompt...");

        // Helper to safe stringify
        const safeStr = (obj: any) => JSON.stringify(obj, null, 2);

        const prompt = `
VAI TRÒ: Bạn là CHUYÊN GIA phân tích Xổ số Miền Bắc (XSMB).
MỤC TIÊU: Dự đoán ngày ${targetDate}.

DỮ LIỆU PHÂN TÍCH (JSON RAW):
================================
RECENT RESULTS (Latest first):
${safeStr(context.recent_results?.slice(0, 5) || [])}

FREQUENCY (Hot/Cold):
${safeStr(context.frequency || {})}

BAC NHO (Silver Memory):
${safeStr(context.bac_nho || {})}

LOTO ROI:
${safeStr(context.loto_roi || [])}

AGGREGATED SCORE:
${safeStr(context.aggregated_predictions || [])}
================================

NHIỆM VỤ:
1. Phân tích các dữ liệu trên để tìm ra cầu đẹp nhất.
2. Tiếng Việt 100%. CHUYÊN NGHIỆP.
3. Giải thích tại sao chọn (dựa trên dữ liệu nào).

ĐỊNH DẠNG JSON:
\`\`\`json
{
    "reasoning": "Dựa trên kết quả ngày ... và bạc nhớ ...",
    "key_insights": ["Điểm nhấn 1...", "Điểm nhấn 2..."],
    "dan_loto": ["10", "20", "30", "40", "50"],
    "confidence": 85
}
\`\`\`
        `;

        // 3. Gemini
        console.log("3. Calling Gemini...");
        const aiResponse = await GeminiClient.generateContent(prompt);
        console.log("   Response Received. Length:", aiResponse.length);

        // 4. Parse
        let predictedPairs = [];
        let confidence = 0;
        try {
            const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                const data = JSON.parse(jsonMatch[1]);
                predictedPairs = data.dan_loto || [];
                confidence = data.confidence || 80;
            }
        } catch (e) {
            console.warn("   JSON Parse Warning:", e);
        }

        // 5. Insert
        console.log("5. Inserting to DB...");
        const db = await getDb();
        await db.run(
            `INSERT OR REPLACE INTO ai_predictions 
             (draw_date, analysis_content, predicted_pairs, confidence_score, model_used, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                targetDate,
                aiResponse,
                JSON.stringify(predictedPairs),
                confidence,
                'gemini-2.5-flash-manual-v2',
                new Date().toISOString()
            ]
        );

        // 6. Checkpoint
        console.log("6. Forcing Checkpoint...");
        await db.run('PRAGMA wal_checkpoint(TRUNCATE)');

        // 7. Verify
        const row = await db.get("SELECT id FROM ai_predictions WHERE draw_date = ?", [targetDate]);
        if (row) {
            console.log(`✅ SUCCESS: Inserted Record ID ${row.id}`);
        } else {
            console.log("❌ FAILED: Record missing after insert.");
        }

    } catch (e) {
        console.error("❌ FATAL ERROR:", e);
    }
}

main();
