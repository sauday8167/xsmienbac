import { NextResponse } from 'next/server';
import { analyzeAntigravityGdb } from '@/lib/gdb-analysis';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;

    try {
        const data = await analyzeAntigravityGdb(date);

        if (!data) {
            return NextResponse.json({
                success: false,
                error: 'Không tìm thấy dữ liệu kết quả cho ngày này'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Lỗi hệ thống khi phân tích dữ liệu'
        }, { status: 500 });
    }
}
