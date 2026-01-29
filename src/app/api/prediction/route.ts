import { NextResponse } from 'next/server';
import { getPredictionData } from '@/lib/prediction';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '100');

        // Validate days parameter
        if (days < 10 || days > 365) {
            return NextResponse.json({
                success: false,
                error: 'Số ngày phân tích phải từ 10 đến 365'
            }, { status: 400 });
        }

        const predictionData = await getPredictionData(days);

        return NextResponse.json({
            success: true,
            data: predictionData
        });

    } catch (error: any) {
        console.error('Prediction API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Lỗi khi tính toán dự đoán'
        }, { status: 500 });
    }
}
