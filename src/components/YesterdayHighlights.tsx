'use client';

import { useEffect, useState } from 'react';

interface HighlightsData {
    draw_date: string;
    special_prize: string;
    ba_cang: string;
    lo_kep: string[];
    top_dau: [string, number][];
    top_duoi: [string, number][];
    total_lo: number;
}

export default function YesterdayHighlights() {
    const [data, setData] = useState<HighlightsData | null>(null);

    useEffect(() => {
        fetch('/api/highlights/yesterday')
            .then(r => r.json())
            .then(d => { if (d.success) setData(d.data); })
            .catch(() => {});
    }, []);

    if (!data) return null;

    const dateLabel = new Date(data.draw_date).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between">
                <h3 className="text-white font-bold text-sm uppercase tracking-wide">
                    Điểm nhấn kỳ {dateLabel}
                </h3>
                <span className="text-amber-100 text-xs">Lô kép · Ba càng · Đầu/Đuôi</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-100">
                {/* Giải đặc biệt */}
                <div className="p-4 text-center">
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Đặc biệt</div>
                    <div className="text-3xl font-black text-lottery-red-600 tracking-widest">
                        {data.special_prize}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Ba càng: <span className="font-bold text-orange-600">{data.ba_cang}</span></div>
                </div>

                {/* Lô kép */}
                <div className="p-4 text-center">
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Lô kép về</div>
                    {data.lo_kep.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-1.5">
                            {data.lo_kep.map(n => (
                                <span key={n} className="w-8 h-8 bg-amber-100 border border-amber-300 text-amber-800 font-black text-sm rounded-full flex items-center justify-center">
                                    {n}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400 text-xs italic">Không có lô kép</div>
                    )}
                </div>

                {/* Top đầu */}
                <div className="p-4 text-center">
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Đầu hay về</div>
                    <div className="space-y-1">
                        {data.top_dau.map(([digit, count]) => (
                            <div key={digit} className="flex items-center justify-center gap-2 text-sm">
                                <span className="w-6 h-6 bg-blue-100 text-blue-700 font-black rounded-full flex items-center justify-center text-xs">{digit}</span>
                                <div className="flex-1 max-w-[60px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(count / data.total_lo * 100 * 5, 100)}%` }}></div>
                                </div>
                                <span className="text-[10px] text-gray-500 w-6">{count}×</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top đuôi */}
                <div className="p-4 text-center">
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Đuôi hay về</div>
                    <div className="space-y-1">
                        {data.top_duoi.map(([digit, count]) => (
                            <div key={digit} className="flex items-center justify-center gap-2 text-sm">
                                <span className="w-6 h-6 bg-green-100 text-green-700 font-black rounded-full flex items-center justify-center text-xs">{digit}</span>
                                <div className="flex-1 max-w-[60px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${Math.min(count / data.total_lo * 100 * 5, 100)}%` }}></div>
                                </div>
                                <span className="text-[10px] text-gray-500 w-6">{count}×</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
