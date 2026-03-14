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

export default function HoiDongBacNhoPage() {
    const [latest, setLatest] = useState<any>(null);
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [hotNumbers, setHotNumbers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [latestRes, historyRes, hotRes] = await Promise.all([
                    fetch('/api/bac-nho-hoi-dong/latest', { cache: 'no-store' }),
                    fetch('/api/bac-nho-hoi-dong/history', { cache: 'no-store' }),
                    fetch('/api/so-hot-trong-ngay', { cache: 'no-store' }).catch(() => null),
                ]);

                const latestData = await latestRes.json();
                if (latestData.success) setLatest(latestData.data);

                const historyData = await historyRes.json();
                if (historyData.success) setHistory(historyData.data);

                // Try to get hot numbers for DOUBLE CONFIRM
                if (hotRes) {
                    try {
                        const hotData = await hotRes.json();
                        const hn = (hotData?.hot_numbers || [])
                            .filter((n: any) => n.number?.toString().length === 2)
                            .map((n: any) => n.number.toString());
                        setHotNumbers(hn);
                    } catch { }
                }
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
            return typeof latest.predicted_numbers === 'string'
                ? JSON.parse(latest.predicted_numbers)
                : latest.predicted_numbers;
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

            {/* HERO HEADER */}
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
                        Self-Learning AI Engine v1.0
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
                        Hội Đồng <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Bạc Nhớ</span>
                    </h1>
                    <p className="text-slate-400 max-w-xl text-sm md:text-base">
                        AI tự học từ 4 nguồn phân tích Bạc Nhớ, tích lũy quy tắc qua từng ngày để dự đoán <strong className="text-white">10 số</strong> có khả năng xuất hiện cao nhất.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-6 text-sm">
                        <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-300">
                            📅 Ngày: <strong>{latest?.draw_date || '---'}</strong>
                        </span>
                        <span className="flex items-center gap-1.5 bg-green-900/30 px-3 py-1.5 rounded-lg border border-green-600/30 text-green-400 font-bold">
                            🎯 KPI: ≥ 5/10 NHÁY = THÀNH CÔNG
                        </span>
                        {weeklyStats.length > 0 && (
                            <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-300">
                                📈 TB: <strong>{avgHits} nháy/ngày</strong>
                            </span>
                        )}
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
                            {copied ? (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                            )}
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
                        <p className="text-slate-400 text-sm">Dữ liệu sẽ được cập nhật lúc 16:30 hàng ngày.</p>
                    </div>
                ) : (
                    <>
                        {/* TIER GRID */}
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
                                            <span className="text-slate-500 text-xs">
                                                {tierKey === 'main' ? '3 số điểm cao nhất' : tierKey === 'potential' ? '4 số tiềm năng' : '3 số bổ sung'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 md:gap-6">
                                            {nums.map(item => {
                                                const isDoubleConfirm = hotNumbers.includes(item.number);
                                                return (
                                                    <div key={item.number} className="relative flex flex-col items-center group">
                                                        {isDoubleConfirm && (
                                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg z-10">
                                                                🔥 DOUBLE CONFIRM
                                                            </div>
                                                        )}
                                                        <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black text-3xl md:text-4xl text-white bg-gradient-to-br ${cfg.color} shadow-xl ${cfg.glow} group-hover:scale-110 transition duration-300 border-2 ${cfg.border}`}>
                                                            {item.number}
                                                        </div>
                                                        <span className="mt-2 text-[10px] text-slate-500 font-bold uppercase">
                                                            {item.score.toFixed(1)} pt
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ANALYSIS CARD */}
                        {latest.analysis_content && (
                            <div className="bg-slate-900/70 rounded-3xl border border-cyan-500/20 p-6 md:p-8 backdrop-blur-sm">
                                <h2 className="text-cyan-400 text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                    Phân tích của AI Hội Đồng
                                </h2>
                                <p className="text-slate-300 leading-relaxed text-sm md:text-base italic">
                                    "{latest.analysis_content}"
                                </p>
                            </div>
                        )}

                        {/* LEARNING PROGRESS */}
                        {weeklyStats.length > 0 && (
                            <div className="bg-slate-900/70 rounded-3xl border border-slate-700/40 p-6 md:p-8 backdrop-blur-sm">
                                <h2 className="text-white font-black text-lg flex items-center gap-2 mb-6 uppercase tracking-tight">
                                    📈 Tiến trình học của AI
                                </h2>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-slate-800/60 rounded-2xl p-4 text-center border border-slate-700/50">
                                        <div className="text-2xl font-black text-green-400">{avgHits}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">TB Nháy/Ngày</div>
                                    </div>
                                    <div className="bg-slate-800/60 rounded-2xl p-4 text-center border border-slate-700/50">
                                        <div className="text-2xl font-black text-cyan-400">{successDays}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Ngày ≥5 Nháy</div>
                                    </div>
                                    <div className="bg-slate-800/60 rounded-2xl p-4 text-center border border-slate-700/50">
                                        <div className="text-2xl font-black text-purple-400">{weeklyStats.length}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Ngày Học</div>
                                    </div>
                                </div>
                                {/* Bar chart */}
                                <div className="flex items-end justify-start gap-2 h-20">
                                    {[...weeklyStats].reverse().map((s, i) => {
                                        const pct = Math.max((s.hits / 10) * 100, 5);
                                        const color = s.hits >= 5 ? 'bg-green-500' : s.hits >= 3 ? 'bg-amber-500' : 'bg-slate-600';
                                        return (
                                            <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                                <div className={`w-full ${color} rounded-t-sm transition-all duration-500`} style={{ height: `${pct}%` }} />
                                                <span className="text-[8px] text-slate-600">{s.hits}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-slate-600 mt-2 text-center">← Lịch sử {weeklyStats.length} ngày gần nhất</p>
                            </div>
                        )}
                    </>
                )}

                {/* 10-DAY HISTORY LOG */}
                <div className="bg-slate-900/70 rounded-3xl border border-slate-700/40 overflow-hidden backdrop-blur-sm">
                    <div className="p-6 md:p-8 border-b border-slate-700/50">
                        <h2 className="text-white font-black text-xl uppercase tracking-tight flex items-center gap-2">
                            📋 Nhật Ký Dự Đoán 10 Ngày
                        </h2>
                        <p className="text-slate-500 text-xs mt-1">🟢 Xanh = trúng · ≥ 5 nháy = Thành công</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="py-3 px-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Ngày</th>
                                    <th className="py-3 px-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">10 Số Dự Đoán</th>
                                    <th className="py-3 px-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Kết Quả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h, i) => {
                                    const predicted: PredictedNumber[] = (() => {
                                        try { return JSON.parse(h.predicted_numbers || '[]'); } catch { return []; }
                                    })();
                                    const hits: string[] = (() => {
                                        try { return h.hit_numbers ? JSON.parse(h.hit_numbers) : []; } catch { return []; }
                                    })();

                                    return (
                                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                                            <td className="py-4 px-4 font-bold text-slate-300 text-sm whitespace-nowrap">{h.draw_date}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {predicted.map(n => {
                                                        const isHit = hits.includes(n.number);
                                                        const tierBg = isHit
                                                            ? 'bg-green-500 text-white shadow-lg shadow-green-900/50 ring-1 ring-green-400'
                                                            : n.tier === 'main'
                                                                ? 'bg-slate-700 text-red-300 border border-red-900/40'
                                                                : n.tier === 'potential'
                                                                    ? 'bg-slate-700 text-amber-300 border border-amber-900/40'
                                                                    : 'bg-slate-800 text-slate-400 border border-slate-700';
                                                        return (
                                                            <span key={n.number} className={`text-xs font-black px-2 py-1 rounded-lg ${tierBg}`}>
                                                                {n.number}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {h.is_verified === 1 ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${h.hit_count >= 5 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-700/60 text-slate-400'}`}>
                                                            {h.hit_count >= 5 ? `🎯 TRÚNG ${h.hit_count} NHÁY` : `${h.hit_count} NHÁY`}
                                                        </span>
                                                        <span className="text-[9px] text-slate-600">auto-verified</span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-900/30 text-cyan-400 text-[10px] font-bold border border-cyan-500/20 animate-pulse">
                                                        🕒 Đang chờ kết quả...
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-12 text-center text-slate-600 italic text-sm">
                                            Hệ thống đang tích lũy dữ liệu. Nhật ký sẽ hiển thị sau ngày đầu tiên vận hành.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SEO CONTENT */}
                <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 text-sm text-slate-500 leading-relaxed">
                    <h2 className="text-slate-300 font-bold text-base mb-3">Hội Đồng Bạc Nhớ là gì?</h2>
                    <p>
                        <strong className="text-slate-400">Hội Đồng Bạc Nhớ</strong> là hệ thống AI tự học độc đáo, phân tích dữ liệu từ 4 nguồn thống kê Bạc Nhớ XSMB gồm: Số Đơn, Cặp 2, Cặp 3 và Khung 3 Ngày. Mỗi ngày, AI tổng hợp điểm từ các nguồn này với trọng số khác nhau, xếp loại 10 số thành <strong className="text-slate-400">Chủ lực, Tiềm năng và Cổ đông</strong>. Sau mỗi kỳ xổ số, hệ thống tự so sánh kết quả và rút ra quy tắc để cải thiện dự đoán hôm sau. Ngưỡng thành công được định nghĩa là <strong className="text-slate-400">5 số trúng trở lên</strong> trong 10 số dự đoán.
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
