import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Get current time in Vietnam
        // Get current time in Vietnam using Intl to avoid Invalid Date issues
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        const parts = formatter.formatToParts(now);
        const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

        const currentHour = parseInt(getPart('hour'));
        const currentMinute = parseInt(getPart('minute'));
        const today = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;

        // Query potentially 2 latest predictions to decide which one to show
        const predictions = await query(
            `SELECT * FROM ai_predictions ORDER BY draw_date DESC LIMIT 2`
        ) as any[];

        if (!predictions.length) {
            return NextResponse.json({
                success: false,
                error: 'Chưa có dữ liệu phân tích'
            }, { status: 404 });
        }

        let predictionToShow = predictions[0];

        // Logic: 
        // If the latest prediction is for a future date (compared to today in VN)
        // We only show it if the current time is after 20:30
        // Otherwise, we show the previous prediction (if exists) or keep strictly to the logic

        const predictionDate = new Date(predictionToShow.draw_date).toISOString().split('T')[0];

        // Check if prediction is for a future date
        if (predictionDate > today) {
            // Check if it's before 20:30
            if (currentHour < 20 || (currentHour === 20 && currentMinute < 30)) {
                // Before 20:30, do not show tomorrow's prediction yet. 
                // Fallback to today's prediction if available
                if (predictions.length > 1) {
                    predictionToShow = predictions[1];
                } else {
                    // If no previous prediction, maybe return null or the future one? 
                    // Based on "khi sang ngay moi thi moi du doan duoc" -> implies we assume currently it waits.
                    // If we strictly follow "after 20:30 it functions", it implies before that it shows old data.
                    predictionToShow = predictions[1] || predictions[0];
                    // NOTE: Safest to show the one for Today (predictions[1]) if available.
                    // If [1] is undefined, we are forced to show [0] or error.
                    if (!predictions[1]) {
                        // No fallback, but user strictly wants activation after 20:30.
                        // However, better to show something than nothing if it's the ONLY data.
                        // But if user insists on "activation", hiding might be better.
                        // Let's assume fallback to previous is the goal.
                    }
                }
            }
        }

        const prediction = predictionToShow;

        // Parse JSON fields
        try {
            prediction.predicted_pairs = JSON.parse(prediction.predicted_pairs);
        } catch (e) {
            prediction.predicted_pairs = [];
        }

        return NextResponse.json({
            success: true,
            data: prediction
        });

    } catch (error: any) {
        console.error('Error fetching AI prediction:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi hệ thống: ' + error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
