'use client';

import { useEffect, useState, useRef } from 'react';
import ResultTable from '@/components/ResultTable';
import LiveResultTable from '@/components/LiveResultTable';
import StatisticsPanel from '@/components/StatisticsPanel';
import type { LotteryResult } from '@/types';

export default function HomePage() {
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

            // Always try live endpoint first during drawing time
            const url = isDrawingTime() ? '/api/results/live' : '/api/results?limit=1';
            const response = await fetch(url);
            const data = await response.json();

            if (data.success && data.data) {
                const resultObj = Array.isArray(data.data) ? data.data[0] : data.data;

                if (resultObj) {
                    // Detect newly revealed prizes
                    if (prevResultRef.current) {
                        const newRevealed = new Set(revealedPrizes);

                        if (resultObj.special_prize && !prevResultRef.current.special_prize) {
                            newRevealed.add('special_prize');
                        }
                        if (resultObj.prize_1 && !prevResultRef.current.prize_1) {
                            newRevealed.add('prize_1');
                        }
                        if (resultObj.prize_2 && (!prevResultRef.current.prize_2 || prevResultRef.current.prize_2.length === 0)) {
                            newRevealed.add('prize_2');
                        }
                        if (resultObj.prize_3 && (!prevResultRef.current.prize_3 || prevResultRef.current.prize_3.length === 0)) {
                            newRevealed.add('prize_3');
                        }
                        if (resultObj.prize_4 && (!prevResultRef.current.prize_4 || prevResultRef.current.prize_4.length === 0)) {
                            newRevealed.add('prize_4');
                        }
                        if (resultObj.prize_5 && (!prevResultRef.current.prize_5 || prevResultRef.current.prize_5.length === 0)) {
                            newRevealed.add('prize_5');
                        }
                        if (resultObj.prize_6 && (!prevResultRef.current.prize_6 || prevResultRef.current.prize_6.length === 0)) {
                            newRevealed.add('prize_6');
                        }
                        if (resultObj.prize_7 && (!prevResultRef.current.prize_7 || prevResultRef.current.prize_7.length === 0)) {
                            newRevealed.add('prize_7');
                        }

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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestResult();
    }, []);

    useEffect(() => {
        // Dynamic polling interval based on time
        const intervalTime = isDrawingTime() ? 8000 : 60000; // 8s during draw, 1min otherwise
        const interval = setInterval(fetchLatestResult, intervalTime);
        return () => clearInterval(interval);
    }, [latestResult]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error || !latestResult) {
        return (
            <div className="card text-center">
                <div className="text-lottery-red-600 text-xl font-semibold mb-2">
                    {error || 'Không tìm thấy kết quả'}
                </div>
                <p className="text-lottery-gray-600">Vui lòng thử lại sau</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Latest Result Table */}
            <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 md:p-8 overflow-hidden">
                {isLive ? (
                    <LiveResultTable
                        result={latestResult}
                        revealedPrizes={revealedPrizes}
                        isLive={isLive}
                        phase={phase}
                    />
                ) : (
                    <ResultTable result={latestResult} />
                )}
            </section>

            {/* Statistics */}
            <StatisticsPanel />

            {/* Quick Actions */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="/ket-qua-theo-ngay" className="card group hover:shadow-xl transition-all border-slate-200">
                    <div className="flex items-center space-x-4">
                        <div className="bg-lottery-red-100 p-4 rounded-xl group-hover:bg-lottery-red-600 group-hover:text-white transition-colors">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Xem theo ngày</h3>
                            <p className="text-sm text-slate-500">Tra cứu lịch sử kết quả</p>
                        </div>
                    </div>
                </a>

                <a href="/do-ve-so" className="card group hover:shadow-xl transition-all border-slate-200">
                    <div className="flex items-center space-x-4">
                        <div className="bg-amber-100 p-4 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Dò vé số</h3>
                            <p className="text-sm text-slate-500">Kiểm tra vé trúng thưởng</p>
                        </div>
                    </div>
                </a>

                <a href="/thong-ke" className="card group hover:shadow-xl transition-all border-slate-200">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-4 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Thống kê</h3>
                            <p className="text-sm text-slate-500">Phân tích đầu/đuôi loto</p>
                        </div>
                    </div>
                </a>
            </section>

            {/* Disclaimer */}
            <section className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                <div className="flex items-start space-x-4">
                    <div className="bg-slate-200 p-2 rounded-lg text-slate-500">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">Miễn trừ trách nhiệm</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Mọi thông tin trên website chỉ phục vụ mục đích tham khảo và nghiên cứu thống kê.
                            Chúng tôi không cam kết tính chính xác tuyệt đối và không chịu trách nhiệm cho bất kỳ tổn thất nào phát sinh.
                            Vui lòng chơi xổ số kiến thiết theo quy định của Nhà nước.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
