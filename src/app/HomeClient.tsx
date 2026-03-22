'use client';

import { useEffect, useState, useRef } from 'react';
import ResultTable from '@/components/ResultTable';
import LiveResultTable from '@/components/LiveResultTable';
import StatisticsPanel from '@/components/StatisticsPanel';
import GoogleAd from '@/components/GoogleAd';
import FAQSection from '@/components/FAQSection';
import type { LotteryResult } from '@/types';

export default function HomeClient() {
    const [latestResult, setLatestResult] = useState<LotteryResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [phase, setPhase] = useState<string>('IDLE');
    const [revealedPrizes, setRevealedPrizes] = useState<Set<string>>(new Set());
    const prevResultRef = useRef<any>(null);

    const isDrawingTime = () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        return hour === 18 && minute >= 10 && minute <= 40;
    };

    const fetchLatestResult = async () => {
        try {
            if (!latestResult) setLoading(true);
            const url = isDrawingTime() ? '/api/results/live' : '/api/results?limit=1';
            const response = await fetch(url);
            const data = await response.json();

            if (data.success && data.data) {
                const resultObj = Array.isArray(data.data) ? data.data[0] : data.data;

                if (resultObj) {
                    if (prevResultRef.current) {
                        const newRevealed = new Set(revealedPrizes);
                        // Simplification for brevity, same logic as before
                        const checkAndAdd = (key: string) => {
                           if (resultObj[key] && (!prevResultRef.current[key] || (Array.isArray(resultObj[key]) && resultObj[key].length > prevResultRef.current[key].length))) {
                               newRevealed.add(key);
                           }
                        };
                        ['special_prize', 'prize_1', 'prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'].forEach(checkAndAdd);
                        setRevealedPrizes(newRevealed);
                    }

                    prevResultRef.current = resultObj;
                    setLatestResult(resultObj);
                    setIsLive(!!data.isLive);
                    setPhase(data.phase || 'IDLE');
                    setError(null);
                }
            } else {
                if (!latestResult) setError(data.message || 'Chưa có kết quả xổ số');
            }
        } catch (err) {
            if (!latestResult) setError('Lỗi khi tải kết quả');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestResult();
    }, []);

    useEffect(() => {
        const intervalTime = isDrawingTime() ? 3000 : 60000;
        const interval = setInterval(fetchLatestResult, intervalTime);
        return () => clearInterval(interval);
    }, [latestResult]);

    if (loading) return <div className="flex justify-center items-center min-h-[400px]"><div className="spinner"></div></div>;
    if (error || !latestResult) return <div className="text-center p-8"><p className="text-red-500 font-bold">{error || 'Không tìm thấy kết quả'}</p></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <h1 className="sr-only">Xổ Số Miền Bắc - KQXS Miền Bắc Hôm Nay - Kết Quả SXMB Chính Xác</h1>

            <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 md:p-8 overflow-hidden">
                {isLive ? (
                    <LiveResultTable result={latestResult} revealedPrizes={revealedPrizes} isLive={isLive} phase={phase} />
                ) : (
                    <ResultTable result={latestResult} />
                )}
            </section>

            <StatisticsPanel />

            {/* Google AdSense - Homepage Middle */}
            <div className="my-8">
                <GoogleAd slotId="0987654321" style={{ minHeight: '120px' }} />
            </div>

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

            <section className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                <div className="flex items-start space-x-4">
                    <div className="p-2 text-slate-500">ℹ️</div>
                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">Miễn trừ trách nhiệm</h4>
                        <p className="text-sm text-slate-600">Mọi thông tin trên website chỉ phục vụ mục đích tham khảo và nghiên cứu thống kê.</p>
                    </div>
                </div>
            </section>

            <FAQSection
                title="Câu Hỏi Thường Gặp Về Xổ Số Miền Bắc"
                items={[
                    { question: "Xổ số miền Bắc quay thưởng lúc mấy giờ?", answer: "Quay thưởng trực tiếp vào lúc 18:15 hàng ngày." },
                    { question: "Cơ cấu giải thưởng XSMB như thế nào?", answer: "Bao gồm 27 giải thưởng, đặc biệt nhất là 3 giải Đặc biệt." }
                ]}
            />

            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Giới thiệu về Trang Chủ Xổ Số Miền Bắc 24h</h2>
                <p>Xổ Số Miền Bắc 24h – Tốc độ cập nhật kết quả nhanh nhất, chính xác tuyệt đối.</p>
            </div>
        </div>
    );
}
