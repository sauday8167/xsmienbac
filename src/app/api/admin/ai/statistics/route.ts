import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const admin = verifyAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { success: false, error: "Unauthorized - Admin access required" },
                { status: 401 }
            );
        }

        const modelInfo = {
            name: "Claude AI Engine",
            provider: "Anthropic / Claude 3 Haiku",
            version: "v2.5 (Automated)",
            description: "Hệ thống AI phân tích Bạc Nhớ chuyên sâu, tự động tổng hợp dữ liệu và viết bài dự đoán XSMB hàng ngày lúc 21:00."
        };

        const totalStats = await queryOne("SELECT COUNT(*) as total FROM ai_predictions");
        const totalPredictions = totalStats?.total || 0;

        const checkedStats = await queryOne("SELECT COUNT(*) as checked FROM ai_predictions WHERE actual_result IS NOT NULL");
        const checkedPredictions = checkedStats?.checked || 0;

        const correctStats = await queryOne("SELECT COUNT(*) as correct FROM ai_predictions WHERE is_correct = 1");
        const correctPredictions = correctStats?.correct || 0;

        const accuracyRate = checkedPredictions > 0 ? (correctPredictions / checkedPredictions) * 100 : 0;

        const recentPredictions = await query("SELECT id, draw_date, predicted_pairs, actual_result, is_correct, confidence_score, accuracy_notes, model_used, created_at FROM ai_predictions ORDER BY draw_date DESC, id DESC LIMIT 20");

        const formattedPredictions = recentPredictions.map((pred: any) => {
            let predictedPairs = [];
            let actualResult = [];

            try { predictedPairs = pred.predicted_pairs ? JSON.parse(pred.predicted_pairs) : []; } catch (e) { }
            try { actualResult = pred.actual_result ? pred.actual_result.split(",") : []; } catch (e) { }

            return {
                id: pred.id,
                date: pred.draw_date,
                predicted: predictedPairs,
                actual: actualResult,
                isCorrect: pred.is_correct === 1,
                confidence: pred.confidence_score || 0,
                notes: pred.accuracy_notes || "",
                model: pred.model_used || "claude-3-haiku-3-so",
                createdAt: pred.created_at
            };
        });

        const lastPrediction = await queryOne("SELECT created_at FROM ai_predictions ORDER BY created_at DESC LIMIT 1");
        const lastArticle = await queryOne("SELECT created_at FROM posts WHERE category = 'soi-cau' ORDER BY created_at DESC LIMIT 1");

        return NextResponse.json({
            success: true,
            data: {
                modelInfo,
                accuracy: {
                    totalPredictions,
                    checkedPredictions,
                    correctPredictions,
                    accuracyRate: Math.round(accuracyRate * 100) / 100,
                    lastUpdated: new Date().toISOString()
                },
                recentPredictions: formattedPredictions,
                lastRun: {
                    prediction: lastPrediction?.created_at || null,
                    article: lastArticle?.created_at || null
                }
            }
        });

    } catch (error: any) {
        console.error("[ADMIN AI] Statistics error:", error);
        return NextResponse.json({ success: false, error: error.message || "Failed to fetch AI statistics" }, { status: 500 });
    }
}
