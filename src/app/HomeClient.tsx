'use client';

import { useEffect, useState } from 'react';
import LiveResultTable from '@/components/LiveResultTable';
import StatisticsPanel from '@/components/StatisticsPanel';
import GoogleAd from '@/components/GoogleAd';
import type { LotteryResult } from '@/types';

interface HomeClientProps {
    initialResult: LotteryResult | null;
}

/**
 * HomeClient — Chỉ xử lý live-update trong giờ quay thưởng (18h10-18h40).
 * Kết quả tĩnh đã được Server Component render trong page.tsx.
 * Google Bot KHÔNG chạy file này.
 */
export default function HomeClient({ initialResult }: HomeClientProps) {
    const [liveResult, setLiveResult] = useState<LotteryResult | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [phase, setPhase] = useState<string>('IDLE');

    const isDrawingTime = () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        return hour === 18 && minute >= 10 && minute <= 40;
    };

    const fetchLiveResult = async () => {
        try {
            const response = await fetch('/api/results/live');
            const data = await response.json();
            if (data.success && data.data) {
                setLiveResult(data.data);
                setIsLive(!!data.isLive);
                setPhase(data.phase || 'IDLE');
            }
        } catch { /* silent */ }
    };

    useEffect(() => {
        if (isDrawingTime()) {
            fetchLiveResult();
            const interval = setInterval(fetchLiveResult, 3000);
            return () => clearInterval(interval);
        }
    }, []);

    return (
        <div className="space-y-8">
            {/* Live result override banner — chỉ hiển thị trong giờ quay thưởng */}
            {isLive && liveResult && (
                <section className="bg-white rounded-2xl shadow-lg p-4 md:p-8 overflow-hidden border-2 border-red-500">
                    <div className="text-center mb-3">
                        <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                            🔴 ĐANG QUAY TRỰC TIẾP
                        </span>
                    </div>
                    <LiveResultTable result={liveResult} revealedPrizes={new Set()} isLive={isLive} phase={phase} />
                </section>
            )}

            {/* Thống kê đầu/đuôi */}
            <StatisticsPanel />

            {/* Google AdSense */}
            <div className="my-8">
                <GoogleAd slotId="0987654321" style={{ minHeight: '120px' }} />
            </div>

            {/* Quick access cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="/ket-qua-theo-ngay" className="card group hover:shadow-xl transition-all border-slate-200">
                    <div className="flex items-center space-x-4">
                        <div className="bg-lottery-red-100 p-4 rounded-xl group-hover:bg-lottery-red-600 group-hover:text-white transition-colors">
                            <span className="text-2xl">📅</span>
                        </div>
                        <div><h3 className="font-bold text-lg text-slate-800">Xem theo ngày</h3><p className="text-sm text-slate-500">Tra cứu lịch sử kết quả</p></div>
                    </div>
                </a>

                <a href="/do-ve-so" className="card group hover:shadow-xl transition-all border-slate-200">
                    <div className="flex items-center space-x-4">
                        <div className="bg-amber-100 p-4 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <span className="text-2xl">🎟️</span>
                        </div>
                        <div><h3 className="font-bold text-lg text-slate-800">Dò vé số</h3><p className="text-sm text-slate-500">Kiểm tra vé trúng thưởng</p></div>
                    </div>
                </a>

                <a href="/thong-ke" className="card group hover:shadow-xl transition-all border-slate-200">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-4 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div><h3 className="font-bold text-lg text-slate-800">Thống kê</h3><p className="text-sm text-slate-500">Phân tích đầu/đuôi loto</p></div>
                    </div>
                </a>
            </section>
        </div>
    );
}
