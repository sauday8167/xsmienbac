import React from 'react';
import { format, parseISO } from 'date-fns';

interface AIHistoryProps {
    history: {
        date: string;
        results: Record<string, 'WIN' | 'LOSS'>;
    }[];
    stats: {
        name: string;
        winRate: number;
        maxGan: number;
        currentGan?: number;
        avgCycle: number;
    }[];
}

export default function AIHistoryTable({ history, stats }: AIHistoryProps) {
    if (!history || history.length === 0) return null;

    const methods = stats && stats.length > 0
        ? stats.map(s => s.name)
        : Object.keys(history[0].results);

    // Rainbow colors for columns
    const headerColors = [
        'bg-red-50 text-red-900 border-red-200',
        'bg-orange-50 text-orange-900 border-orange-200',
        'bg-yellow-50 text-yellow-900 border-yellow-200',
        'bg-green-50 text-green-900 border-green-200',
        'bg-teal-50 text-teal-900 border-teal-200',
        'bg-blue-50 text-blue-900 border-blue-200',
        'bg-indigo-50 text-indigo-900 border-indigo-200',
        'bg-purple-50 text-purple-900 border-purple-200',
    ];

    const getHeaderStyle = (index: number) => {
        return headerColors[index % headerColors.length];
    };

    return (
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-wide">
                    Lịch Sử & Thống Kê (10 Kỳ Gần Nhất)
                </h3>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100 ring-1 ring-gray-200">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="py-4 px-4 font-bold border-b border-r border-gray-200 text-center sticky left-0 bg-gray-50 z-20 min-w-[100px] text-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                NGÀY
                            </th>
                            {stats && stats.map((stat, idx) => (
                                <th key={stat.name} className={`py-2 px-2 border-b border-r border-gray-100 text-center min-w-[140px] align-top ${getHeaderStyle(idx)}`}>
                                    <div className="flex flex-col gap-1 items-center">
                                        {/* Method Name Shortened */}
                                        <div className="font-black text-base uppercase drop-shadow-sm p-1 rounded">
                                            PP #{idx + 1}
                                        </div>

                                        {/* Stats Block */}
                                        <div className="w-full bg-white/80 backdrop-blur-sm rounded border border-gray-200/50 p-2 text-xs shadow-sm mt-1 space-y-1.5">
                                            <div className="flex justify-between items-center text-gray-700">
                                                <span>Tỷ lệ:</span>
                                                <span className="font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">{stat.winRate}%</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-700">
                                                <span>Chu kỳ:</span>
                                                <span className="font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{stat.avgCycle}n</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-700">
                                                <span>Max Gan:</span>
                                                <span className="font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">{stat.maxGan}n</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-700">
                                                <span>Gan HT:</span>
                                                <span className={`font-bold px-1.5 py-0.5 rounded ${stat.currentGan && stat.currentGan > 5 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {stat.currentGan || 0}n
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {history.map((day, rowIdx) => (
                            <tr key={day.date} className="hover:bg-blue-50/30 transition-colors h-14 group">
                                <td className="px-4 text-center font-bold text-gray-700 bg-white group-hover:bg-blue-50/30 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs md:text-sm border-r border-gray-100 z-10">
                                    {format(parseISO(day.date), 'dd/MM/yyyy')}
                                </td>
                                {methods.map((method, colIdx) => {
                                    const status = day.results[method];
                                    const isWin = status === 'WIN';
                                    return (
                                        <td key={`${day.date}-${method}`} className="px-4 text-center border-r border-gray-50 last:border-r-0">
                                            {isWin ? (
                                                <div className="inline-flex items-center justify-center w-20 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xs shadow-md transform hover:scale-105 transition-transform">
                                                    TRÚNG
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-center w-20 py-1.5 rounded-full bg-gray-100 text-gray-400 font-bold text-xs border border-gray-200">
                                                    TRƯỢT
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500 italic px-2">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Dữ liệu thống kê được tính toán dựa trên 100 kỳ quay gần nhất.
                </div>
                <div className="md:text-right flex items-center justify-end gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Hệ thống tự động cập nhật & loại bỏ dữ liệu cũ.
                </div>
            </div>
        </div>
    );
}
