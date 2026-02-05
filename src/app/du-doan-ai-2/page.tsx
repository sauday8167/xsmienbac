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

interface AIPersonality {
    id: string;
    name: string;
    description: string;
    motto: string;
}

interface AIFunnelData {
    date: string;
    personality: AIPersonality;
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
                <div className="text-purple-700 font-bold animate-pulse">AI Đang Suy Luận Độc Lập...</div>
            </div>
        </div>
    );

    if (!data) return <div className="p-8 text-center text-red-500">Lỗi kết nối AI. Vui lòng thử lại.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Intro */}
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white py-16 px-4 shadow-xl">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest animate-bounce">
                        Gen-Next 2.0
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                        Dự Đoán AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">Tư Duy Độc Lập</span>
                    </h1>
                    <p className="text-indigo-200 text-lg max-w-2xl mx-auto mb-8 italic">
                        "Hệ thống không đi theo lối mòn. Mỗi kỳ là một sự sáng tạo mới."
                    </p>

                    {/* AI Personality Card */}
                    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                        <div className="text-pink-400 text-sm font-bold uppercase mb-2 tracking-tighter">Nhân cách AI hiện tại</div>
                        <div className="text-2xl font-black text-white mb-2">{data.personality.name}</div>
                        <p className="text-indigo-100 text-sm mb-4 leading-relaxed">{data.personality.description}</p>
                        <div className="bg-black/20 rounded-lg p-3 italic text-gray-300 text-xs border-l-4 border-pink-500">
                            "{data.personality.motto}"
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-[-30px]">

                {/* 1. AI Reflection Log (The "Thinking" Box) */}
                <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden mb-12">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Nhật Ký Tư Duy (AI Reflection)</h2>
                        </div>
                        <div className="text-xs text-indigo-100 font-mono">Status: Independent Thinking</div>
                    </div>
                    <div className="p-8 bg-slate-900 text-green-400 font-mono text-sm space-y-4 overflow-y-auto max-h-[400px]">
                        {data.reflectionLog.map((log, idx) => (
                            <div key={idx} className="flex gap-3 items-start border-b border-white/5 pb-2">
                                <span className="opacity-30">[{idx + 1}]</span>
                                <span className={log.includes('🚀') || log.includes('👑') ? 'text-yellow-300 font-bold' : ''}>
                                    {log}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. The Funnel Visualization */}
                <div className="space-y-10">
                    {data.funnel.map((stage) => (
                        <div key={stage.level} className="relative group">
                            {/* Connector Line */}
                            {stage.level > 1 && (
                                <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-1 h-10 bg-gradient-to-b from-transparent via-purple-300 to-purple-500 opacity-50"></div>
                            )}

                            <div className={`
                                mx-auto transition-all duration-500 ease-out border rounded-3xl overflow-hidden shadow-2xl
                                ${stage.level === 1 ? 'max-w-5xl bg-white border-gray-100' : ''}
                                ${stage.level === 2 ? 'max-w-4xl bg-blue-50/30 border-blue-100 ring-1 ring-blue-200' : ''}
                                ${stage.level === 3 ? 'max-w-3xl bg-indigo-50/30 border-indigo-100 ring-2 ring-indigo-200' : ''}
                                ${stage.level === 4 ? 'max-w-2xl bg-gradient-to-br from-purple-50 via-white to-pink-50 border-purple-200 ring-4 ring-purple-300' : ''}
                            `}>
                                {/* Stage Header */}
                                <div className={`
                                    py-4 px-8 flex justify-between items-center
                                    ${stage.level === 4 ? 'bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 text-white' : 'bg-gray-100/80 text-gray-700'}
                                `}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.level === 4 ? 'bg-white text-purple-700' : 'bg-gray-700 text-white'}`}>
                                                STG {stage.level}
                                            </span>
                                            <h3 className={`font-black uppercase tracking-tight ${stage.level === 4 ? 'text-2xl' : 'text-lg'}`}>
                                                {stage.name}
                                            </h3>
                                        </div>
                                        <p className={`text-xs mt-0.5 ${stage.level === 4 ? 'text-purple-100' : 'text-gray-500'}`}>{stage.description}</p>
                                    </div>
                                    <div className={`font-mono text-2xl font-black ${stage.level === 4 ? 'text-white' : 'text-purple-700'}`}>
                                        {stage.count} <span className="text-xs opacity-60">SỐ</span>
                                    </div>
                                </div>

                                {/* Numbers Grid */}
                                <div className="p-6 md:p-10">
                                    <div className={`grid gap-4 ${stage.level === 1 ? 'grid-cols-5 md:grid-cols-10' :
                                        stage.level === 2 ? 'grid-cols-4 md:grid-cols-5' :
                                            stage.level === 3 ? 'grid-cols-3 md:grid-cols-5' :
                                                'grid-cols-3 md:grid-cols-5'
                                        }`}>
                                        {stage.numbers.map((num) => (
                                            <div key={num.number} className={`
                                                relative p-4 rounded-2xl text-center border transition-all duration-300
                                                ${stage.level === 4
                                                    ? 'bg-white border-purple-300 shadow-[0_10px_30px_rgba(168,85,247,0.3)] scale-110 ring-2 ring-purple-100'
                                                    : 'bg-white border-gray-100 hover:border-purple-300 hover:shadow-xl hover:scale-105'}
                                            `}>
                                                <div className={`font-black tracking-tighter ${stage.level === 4 ? 'text-3xl text-transparent bg-clip-text bg-gradient-to-br from-purple-700 to-pink-600' : 'text-xl text-gray-800'}`}>
                                                    {num.number}
                                                </div>

                                                {/* Score */}
                                                <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                                    {num.score.toFixed(1)} AI
                                                </div>

                                                {/* Badges */}
                                                {num.badges && num.badges.length > 0 && (
                                                    <div className="absolute top-[-10px] right-[-10px] flex gap-1 flex-wrap justify-end">
                                                        {num.badges.map(b => (
                                                            <span key={b} className={`
                                                                text-[8px] px-1.5 py-0.5 rounded-md font-black shadow-sm uppercase
                                                                ${b.includes('VIP') ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-indigo-600 text-white'}
                                                            `}>
                                                                {b}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Reason Tooltip (Simple display for now) */}
                                                <div className="mt-2 text-[9px] text-gray-400 line-clamp-1 opacity-60 hover:opacity-100 transition-opacity">
                                                    {num.reasons[0]}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Final Recommendation */}
                <div className="mt-20 p-10 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl text-center text-white shadow-3xl relative overflow-hidden">
                    <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

                    <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-3">
                        <span className="text-yellow-400">💡</span> Khuyến Nghị Đầu Tư Tối Ưu
                    </h3>
                    <p className="text-indigo-100 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Dựa trên nhân cách <strong>{data.personality.name}</strong>, AI đề xuất bạn nên tập trung vào cụm 5 số tại <strong>Giai đoạn Hội tụ (GĐ 4)</strong>. Đây là những con số đạt điểm hội tụ cao nhất giữa xác suất, nhịp điệu và sự sáng tạo.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {data.finalPrediction.map(n => (
                            <div key={n} className="bg-white text-indigo-900 text-3xl font-black w-16 h-16 flex items-center justify-center rounded-2xl shadow-xl ring-4 ring-white/20">
                                {n}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
