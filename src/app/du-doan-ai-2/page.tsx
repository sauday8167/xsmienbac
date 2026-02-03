'use client';

import { useEffect, useState } from 'react';

interface FunnelNumber {
    number: string;
    score: number;
    reasons: string[];
    badges: string[];
}

interface FunnelStage {
    level: 1 | 2 | 3 | 4;
    name: string;
    description: string;
    count: number;
    numbers: FunnelNumber[];
}

interface AIFunnelData {
    date: string;
    reflectionLog: string[];
    funnel: FunnelStage[];
    finalPrediction: string[];
}

export default function DuDoanAI2Page() {
    const [data, setData] = useState<AIFunnelData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/ai-funnel')
            .then(res => res.json())
            .then(res => {
                if (res.success) setData(res.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-purple-700 font-bold animate-pulse">AI Đang Suy Luận...</div>
            </div>
        </div>
    );

    if (!data) return <div className="p-8 text-center text-red-500">Lỗi kết nối AI. Vui lòng thử lại.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Intro */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-12 px-4 shadow-xl">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        Dự Đoán AI 2.0 <span className="text-pink-400">Gen-Next</span>
                    </h1>
                    <p className="text-indigo-200 text-lg max-w-2xl mx-auto mb-4">
                        Hệ thống tự học (Self-Learning) & Phễu lọc 4 lớp thông minh.
                        Tự động điều chỉnh thuật toán dựa trên sai số của kỳ trước.
                    </p>
                    {data && (
                        <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-sm font-mono text-purple-200">
                            📅 Kỳ phân tích: <span className="text-white font-bold">{new Date(data.date).toLocaleDateString('vi-VN')}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-[-40px]">

                {/* 1. AI Reflection Log (The "Thinking" Box) */}
                <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden mb-10 transform hover:scale-[1.01] transition-transform duration-300">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-wider">Nhật Ký Suy Luận (AI Reflection)</h2>
                    </div>
                    <div className="p-6 bg-slate-50 font-mono text-sm md:text-base space-y-3">
                        {data.reflectionLog.map((log, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border-l-4 ${log.includes('Tăng trọng số') ? 'bg-green-50 border-green-500 text-green-900' :
                                    log.includes('Giai đoạn') ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold' :
                                        'bg-white border-gray-300 text-gray-700'
                                } shadow-sm`}>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. The Funnel Visualization */}
                <div className="space-y-6">
                    {data.funnel.map((stage) => (
                        <div key={stage.level} className="relative group">
                            {/* Connector Line */}
                            {stage.level > 1 && (
                                <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-300 group-hover:bg-purple-400 transition-colors"></div>
                            )}

                            <div className={`
                                mx-auto transition-all duration-500 ease-out border rounded-2xl overflow-hidden shadow-md
                                ${stage.level === 1 ? 'max-w-5xl bg-white border-gray-200' : ''}
                                ${stage.level === 2 ? 'max-w-4xl bg-blue-50/50 border-blue-100 ring-1 ring-blue-200' : ''}
                                ${stage.level === 3 ? 'max-w-3xl bg-indigo-50/50 border-indigo-100 ring-2 ring-indigo-200 shadow-lg' : ''}
                                ${stage.level === 4 ? 'max-w-2xl bg-gradient-to-b from-purple-50 to-pink-50 border-purple-200 ring-4 ring-purple-300 shadow-2xl' : ''}
                            `}>
                                {/* Stage Header */}
                                <div className={`
                                    py-3 px-6 flex justify-between items-center
                                    ${stage.level === 4 ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-100/50 text-gray-600'}
                                `}>
                                    <div>
                                        <h3 className={`font-bold uppercase ${stage.level === 4 ? 'text-xl' : 'text-sm'}`}>
                                            Giai đoạn {stage.level}: {stage.name}
                                        </h3>
                                        <p className={`text-xs ${stage.level === 4 ? 'text-purple-100' : 'text-gray-500'}`}>{stage.description}</p>
                                    </div>
                                    <div className="font-mono text-xl font-black bg-white/20 px-3 py-1 rounded">
                                        {stage.count} số
                                    </div>
                                </div>

                                {/* Numbers Grid */}
                                <div className="p-4 md:p-6">
                                    <div className={`grid gap-3 ${stage.level === 1 ? 'grid-cols-5 md:grid-cols-10' :
                                            stage.level === 2 ? 'grid-cols-4 md:grid-cols-5' :
                                                stage.level === 3 ? 'grid-cols-3 md:grid-cols-5' :
                                                    'grid-cols-3 md:grid-cols-5'
                                        }`}>
                                        {stage.numbers.map((num) => (
                                            <div key={num.number} className={`
                                                relative p-2 rounded-lg text-center border transition-all cursor-default
                                                ${stage.level === 4
                                                    ? 'bg-white border-purple-200 shadow-[0_4px_14px_rgba(168,85,247,0.4)] scale-110 z-10'
                                                    : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-md'}
                                            `}>
                                                <div className={`font-black ${stage.level === 4 ? 'text-2xl text-purple-700' : 'text-lg text-gray-700'}`}>
                                                    {num.number}
                                                </div>

                                                {/* Score */}
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    {num.score.toFixed(1)}đ
                                                </div>

                                                {/* Tooltip on Hover */}
                                                <div className="absolute opacity-0 hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs p-2 rounded z-20 pointer-events-none transition-opacity">
                                                    <div className="font-bold mb-1">Chi tiết số {num.number}:</div>
                                                    <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-gray-300">
                                                        {num.reasons.map((r, i) => <li key={i}>{r}</li>)}
                                                    </ul>
                                                </div>

                                                {/* Badges */}
                                                <div className="absolute top-[-6px] right-[-6px] flex gap-0.5">
                                                    {num.badges.map(b => (
                                                        <span key={b} className="bg-red-500 text-white text-[8px] px-1 rounded-full font-bold shadow-sm">
                                                            {b}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Final CTA */}
                <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                    <h3 className="text-yellow-800 font-bold mb-2">💡 Khuyến nghị đầu tư</h3>
                    <p className="text-sm text-yellow-700">
                        Nên tập trung vốn vào 5 số ở <strong>Giai đoạn 4 (Vùng VIP)</strong>.
                        Các số ở Giai đoạn 3 có thể dùng để đánh Lô Dàn hoặc ghép Xiên.
                    </p>
                </div>
            </div>
        </div>
    );
}
