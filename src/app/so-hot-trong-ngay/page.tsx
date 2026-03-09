import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { Calendar, Star, TrendingUp, Target, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: 'Số Hot Trong Ngày - Dự Đoán Xổ Số Miền Bắc Từ Website & Youtube',
    description: 'Xổ Số Miền Bắc hôm nay: Tổng hợp phân tích tự động, tìm ra các con số hot nhất dựa trên Big Data từ Youtube và Website.',
    alternates: {
        canonical: 'https://xosomienbac24h.com/so-hot-trong-ngay'
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

async function getSoHotData() {
    const filePath = path.join(process.cwd(), 'src', 'data', 'so-hot.json');
    if (!fs.existsSync(filePath)) {
        return null;
    }
    const fileContents = fs.readFileSync(filePath, 'utf8');
    try {
        return JSON.parse(fileContents);
    } catch (e) {
        return null;
    }
}

export default async function SoHotTrongNgayPage() {
    const rawData = await getSoHotData();

    if (!rawData || !rawData.data) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Số Hot Trong Ngày</h1>
                <p className="text-gray-600">Dữ liệu tóm tắt chưa được phân tích cho ngày hôm nay. Thuật toán AI sẽ chạy tổng hợp lúc 17:00 hằng ngày.</p>
            </div>
        );
    }

    const { date, last_updated, data } = rawData;

    return (
        <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
            {/* Header */}
            <div className="bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl shadow-xl p-6 md:p-8 text-white mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm shadow flex items-center gap-1">
                            <Calendar size={14} /> Hôm nay: {date}
                        </span>
                        <span className="bg-green-500/80 px-3 py-1 rounded-full text-sm font-medium shadow">
                            Bởi Trí Tuệ Nhân Tạo
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight tracking-tight">Số Hot Trong Ngày</h1>
                    <p className="text-red-50 text-sm md:text-base opacity-90 leading-relaxed max-w-2xl">
                        Hệ thống tự động sử dụng AI (Trí Tuệ Nhân Tạo) đọc và tổng hợp từ hàng trăm video phân tích Youtube và các website lớn để tìm ra các con số sáng giá nhất XSMB hôm nay.
                    </p>
                    <div className="mt-4 mb-2">
                        <span className="bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-lg text-sm md:text-base font-bold shadow-sm inline-block animate-pulse">
                            ⏰ Thời gian chốt số: 17:00 Hằng Ngày
                        </span>
                    </div>
                    <div className="mt-4 text-xs text-red-100 flex items-center gap-1">
                        <ShieldCheck size={14} /> Cập nhật lần cuối: {new Date(last_updated).toLocaleTimeString('vi-VN')}
                    </div>
                </div>
            </div>


            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Bạch Thủ Lô */}
                <div className="bg-white rounded-xl shadow-md border hover:border-red-500 transition-colors overflow-hidden">
                    <div className="bg-red-50 px-5 py-4 border-b">
                        <h2 className="font-bold text-red-700 flex items-center gap-2 text-lg">
                            <Target size={20} /> Bạch Thủ Lô (Rất Sáng)
                        </h2>
                    </div>
                    <div className="p-5 flex flex-wrap gap-3 items-center justify-center min-h-[100px]">
                        {data.bach_thu_lo?.map((so: string, idx: number) => (
                            <span key={idx} className="bg-red-500 text-white font-bold text-2xl w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 border-red-200">
                                {so}
                            </span>
                        )) || <span className="text-gray-400">Không có dữ liệu</span>}
                    </div>
                </div>

                {/* Song Thủ Lô */}
                <div className="bg-white rounded-xl shadow-md border hover:border-green-500 transition-colors overflow-hidden">
                    <div className="bg-green-50 px-5 py-4 border-b">
                        <h2 className="font-bold text-green-700 flex items-center gap-2 text-lg">
                            <TrendingUp size={20} /> Song Thủ Lô (Cặp an toàn)
                        </h2>
                    </div>
                    <div className="p-5 flex flex-wrap gap-3 items-center justify-center min-h-[100px]">
                        {data.song_thu_lo?.map((so: string, idx: number) => (
                            <span key={idx} className="bg-green-600 text-white font-bold text-xl px-5 py-2 hover:bg-green-700 rounded-lg shadow border border-green-400">
                                {so}
                            </span>
                        )) || <span className="text-gray-400">Không có dữ liệu</span>}
                    </div>
                </div>

                {/* Top Hot */}
                <div className="bg-white rounded-xl shadow-md border hover:border-purple-500 transition-colors overflow-hidden md:col-span-2">
                    <div className="bg-purple-50 px-5 py-4 border-b flex justify-between items-center">
                        <h2 className="font-bold text-purple-700 flex items-center gap-2 text-lg">
                            <Star size={20} className="text-yellow-500 fill-yellow-500" /> Số Được Nhắc Nhiều Nhất (Top Nóng)
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap gap-4 items-center justify-center">
                            {data.hot_nhat?.map((so: string, idx: number) => (
                                <div key={idx} className="relative group">
                                    <div className="absolute inset-0 bg-yellow-400 blur-md opacity-30 group-hover:opacity-60 transition rounded-full"></div>
                                    <span className="relative bg-gradient-to-r from-orange-400 to-red-500 text-white font-black text-4xl w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 border-white/40">
                                        {so}
                                    </span>
                                </div>
                            )) || <span className="text-gray-400">Không phân tích được tần suất vượt trội</span>}
                        </div>
                    </div>
                </div>

                {/* Dàn Đề */}
                {data.dan_de && data.dan_de.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md border hover:border-blue-500 transition-colors overflow-hidden md:col-span-2">
                        <div className="bg-blue-50 px-5 py-4 border-b">
                            <h2 className="font-bold text-blue-700 flex items-center gap-2 text-lg">
                                <Target size={20} /> Dàn Đề / Chạm Khuyên Đánh
                            </h2>
                        </div>
                        <div className="p-5 flex flex-wrap gap-2 items-center">
                            {data.dan_de.map((so: string, idx: number) => (
                                <span key={idx} className="bg-gray-100 text-gray-800 font-semibold px-4 py-2 rounded-md border shadow-sm text-sm">
                                    {so}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center shadow-inner">
                <p className="text-gray-500 text-xs md:text-sm">
                    <strong>Cảnh báo:</strong> Kết quả trên được máy tính dựa vào công nghệ trí tuệ nhân tạo (AI) tổng hợp tự động từ vô số luồng thông tin trên Youtube và Webiste khác. Dữ liệu chỉ mang tính chất tham khảo giải trí hoàn toàn miễn phí. Chúng tôi không đảm bảo tính chính xác tuyệt đối. Chọn con số nào là quyết định của người chơi. Vui lòng mua xổ số kiến thiết hoặc Vietlott ích nước lợi nhà do nhà nước phát hành!
                </p>
            </div>
        </div>
    );
}
