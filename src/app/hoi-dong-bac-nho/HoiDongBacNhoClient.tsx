'use client';

import { useState, useEffect } from 'react';

interface PredictedNumber {
    number: string;
    score: number;
    tier: 'main' | 'potential' | 'support';
    rank: number;
}

interface HistoryRecord {
    id: number;
    draw_date: string;
    predicted_numbers: string;
    hit_numbers: string | null;
    hit_count: number;
    is_verified: number;
    analysis_content: string | null;
}

const TIER_CONFIG = {
    main: { label: 'CHỦ LỰC', color: 'from-red-500 to-rose-600', badge: 'bg-red-600 text-white', border: 'border-red-400', glow: 'shadow-red-500/40' },
    potential: { label: 'TIỀM NĂNG', color: 'from-amber-500 to-orange-500', badge: 'bg-amber-500 text-white', border: 'border-amber-400', glow: 'shadow-amber-500/40' },
    support: { label: 'CỔ ĐÔNG', color: 'from-blue-500 to-cyan-500', badge: 'bg-blue-600 text-white', border: 'border-blue-400', glow: 'shadow-blue-500/40' },
};

export default function HoiDongBacNhoClient() {
    const [latest, setLatest] = useState<any>(null);
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [latestRes, historyRes] = await Promise.all([
                    fetch('/api/bac-nho-hoi-dong/latest', { cache: 'no-store' }),
                    fetch('/api/bac-nho-hoi-dong/history', { cache: 'no-store' }),
                ]);

                const latestData = await latestRes.json();
                if (latestData.success) setLatest(latestData.data);

                const historyData = await historyRes.json();
                if (historyData.success) setHistory(historyData.data);
            } catch (e) {
                console.error('Lỗi tải dữ liệu:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const parsedNumbers: PredictedNumber[] = (() => {
        if (!latest?.predicted_numbers) return [];
        try {
            const raw = typeof latest.predicted_numbers === 'string'
                ? JSON.parse(latest.predicted_numbers)
                : latest.predicted_numbers;
            
            if (Array.isArray(raw) && typeof raw[0] === 'string') {
                return (raw as string[]).map((num, idx) => ({
                    number: num,
                    score: 90 - idx,
                    tier: idx < 3 ? 'main' : idx < 7 ? 'potential' : 'support',
                    rank: idx + 1
                }));
            }
            return raw;
        } catch { return []; }
    })();

    const groupedNumbers = {
        main: parsedNumbers.filter(n => n.tier === 'main'),
        potential: parsedNumbers.filter(n => n.tier === 'potential'),
        support: parsedNumbers.filter(n => n.tier === 'support'),
    };

    const weeklyStats = (() => {
        const verified = history.filter(h => h.is_verified === 1);
        return verified.map(h => ({ date: h.draw_date, hits: h.hit_count }));
    })();

    const avgHits = weeklyStats.length > 0
        ? (weeklyStats.reduce((sum, s) => sum + s.hits, 0) / weeklyStats.length).toFixed(1)
        : '0';

    const successDays = weeklyStats.filter(s => s.hits >= 5).length;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Đang tải dữ liệu Hội Đồng Bạc Nhớ...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            <div className="relative pt-14 pb-28 overflow-hidden border-b border-cyan-900/40">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/30 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />

                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-bold uppercase tracking-wider border border-cyan-500/30 backdrop-blur-md mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                        </span>
                        Claude AI Engine v2.5
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
                        Hội Đồng <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Bạc Nhớ</span>
                    </h1>
                    <p className="text-slate-400 max-w-xl text-sm md:text-base">
                        Hệ thống Claude AI tự học từ 3 nguồn Bạc Nhớ chuyên sâu (Cặp 3, 2 Ngày, 3 Ngày), tích lũy quy tắc qua từng ngày để đạt mục tiêu <strong className="text-white">KPI 5+ nháy</strong>.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-6 text-sm">
                        <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-300">
                            📅 Ngày: <strong>{latest?.draw_date || '---'}</strong>
                        </span>
                        <span className="flex items-center gap-1.5 bg-green-900/30 px-3 py-1.5 rounded-lg border border-green-600/30 text-green-400 font-bold">
                            🎯 KPI: ≥ 5/10 NHÁY = THÀNH CÔNG
                        </span>
                        <button
                            onClick={() => {
                                const numbers = parsedNumbers.map(n => n.number).join(', ');
                                navigator.clipboard.writeText(numbers);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all duration-300 ${copied
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
                                }`}
                        >
                            {copied ? 'Đã Sao Chép!' : 'Sao Chép 10 Số'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl -mt-16 space-y-8 relative z-10">
                {!latest ? (
                    <div className="bg-slate-900/80 rounded-3xl border border-slate-700/50 p-12 text-center">
                        <div className="text-4xl mb-4">🧠</div>
                        <h2 className="text-white text-xl font-bold mb-2">Hệ thống đang khởi động</h2>
                        <p className="text-slate-400 text-sm">Dữ liệu sẽ được cập nhật hàng ngày.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Hiệu suất trung bình</div>
                                <div className="text-2xl font-black text-cyan-400">{avgHits} <span className="text-xs font-normal text-slate-500">nháy/ngày</span></div>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Số ngày đạt KPI</div>
                                <div className="text-2xl font-black text-green-400">{successDays} <span className="text-xs font-normal text-slate-500">ngày gần đây</span></div>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Độ tin cậy AI</div>
                                <div className="text-2xl font-black text-blue-400">{latest.confidence_score}%</div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {(['main', 'potential', 'support'] as const).map(tierKey => {
                                const cfg = TIER_CONFIG[tierKey];
                                const nums = groupedNumbers[tierKey];
                                if (nums.length === 0) return null;
                                return (
                                    <div key={tierKey} className="bg-slate-900/70 rounded-3xl border border-slate-700/40 p-6 md:p-8 backdrop-blur-sm">
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-widest ${cfg.badge}`}>
                                                {cfg.label}
                                            </span>
                                            <span className="text-slate-500 text-xs text-uppercase">
                                                {tierKey === 'main' ? '3 số điểm cao nhất' : tierKey === 'potential' ? '4 số tiềm năng' : '3 số bổ sung'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 md:gap-6">
                                            {nums.map(item => (
                                                <div key={item.number} className="relative flex flex-col items-center group">
                                                    <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black text-3xl md:text-4xl text-white bg-gradient-to-br ${cfg.color} shadow-xl ${cfg.glow} group-hover:scale-110 transition duration-300 border-2 ${cfg.border}`}>
                                                        {item.number}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {latest.analysis_content && (() => {
                            let analysisData: any = null;
                            try {
                                if (latest.analysis_content.startsWith('{')) {
                                    analysisData = JSON.parse(latest.analysis_content);
                                }
                            } catch (e) { }

                            return (
                                <div className="bg-slate-900/70 rounded-3xl border border-cyan-500/20 p-6 md:p-8 backdrop-blur-sm">
                                    <h2 className="text-cyan-400 text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                        Phân tích Chiến thuật Claude AI
                                    </h2>
                                    {analysisData ? (
                                        <div className="space-y-4">
                                            <p className="text-slate-300 leading-relaxed text-sm md:text-base italic">
                                                "{analysisData.analysis?.summary || analysisData.analysis}"
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-300 leading-relaxed text-sm md:text-base italic">
                                            "{latest.analysis_content}"
                                        </p>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Nhật ký 10 ngày gần nhất */}
                        <div className="bg-slate-900/70 rounded-3xl border border-slate-700/40 overflow-hidden backdrop-blur-sm">
                            <div className="p-6 border-b border-slate-800">
                                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Nhật Ký Dự Đoán 10 Ngày Gần Nhất
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Ngày quay</th>
                                            <th className="px-6 py-4 text-center">Dàn số dự đoán</th>
                                            <th className="px-6 py-4 text-center">Kết quả</th>
                                            <th className="px-6 py-4 text-right">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {history.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Đang khởi tạo dữ liệu nhật ký...</td>
                                            </tr>
                                        ) : history.map((record) => {
                                            const predicted = JSON.parse(record.predicted_numbers || '[]');
                                            const hits = record.hit_numbers ? JSON.parse(record.hit_numbers) : [];
                                            const isSuccess = record.hit_count >= 5;

                                            return (
                                                <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-300">
                                                        {new Date(record.draw_date).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-wrap justify-center gap-1">
                                                            {predicted.map((num: string) => (
                                                                <span key={num} className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold ${hits.includes(num) ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                                                                    {num}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="text-cyan-400 font-black text-lg">{record.hit_count} <span className="text-[10px] font-normal opacity-50">nháy</span></div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {record.is_verified ? (
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${isSuccess ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                                {isSuccess ? 'THÀNH CÔNG' : 'CHƯA ĐẠT'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-500 text-[10px]">Đang chờ...</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 text-sm text-slate-500 leading-relaxed">
                    <h2 className="text-slate-300 font-bold text-base mb-3">Hội Đồng Bạc Nhớ là gì?</h2>
                    <p>
                        <strong className="text-slate-400">Hội Đồng Bạc Nhớ</strong> là hệ thống AI Siêu cấp sử dụng trí tuệ nhân tạo Claude AI, phân tích dữ liệu chuyên sâu từ nhiều nguồn (Bạc nhớ, Tần suất, Lô rơi) để đưa ra dàn 10 số có xác suất nổ cao nhất trong ngày.
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-grid-white {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='white' stroke-opacity='0.05'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
                }
            `}} />
        </div>
    );
}
