import { NextResponse } from 'next/server';
import { aggregatePredictionsV2 } from '@/lib/prediction-aggregator-v2';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const predictions = await aggregatePredictionsV2();

        return NextResponse.json({
            success: true,
            data: {
                predictions,
                generatedAt: new Date().toISOString(),
                targetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
        });
    } catch (error: any) {
        console.error('Prediction Aggregate API Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal Server Error',
                message: error.message,
            },
            { status: 500 }
        );
    }
}
