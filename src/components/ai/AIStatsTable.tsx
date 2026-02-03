import React from 'react';

interface AIStatsProps {
    stats: {
        name: string;
        winRate: number;
        streak: number;
        streakType: string; // 'WIN' | 'LOSS'
    }[];
}

export default function AIStatsTable({ stats }: AIStatsProps) {
    // Sort logic: High win rate first, then Winning Streak
    const sortedStats = [...stats].sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        if (a.streakType === 'WIN' && b.streakType === 'LOSS') return -1;
        if (a.streakType === 'LOSS' && b.streakType === 'WIN') return 1;
        return b.streak - a.streak;
    });

    return (
        <div className="overflow-hidden bg-white rounded-xl shadow-md border border-gray-200">
            <div className="bg-lottery-blue-800 text-white p-4 font-bold uppercase text-center tracking-wide">
                Bảng Phong Thần AI (8 ngày gần nhất)
            </div>
            <table className="w-full text-sm md:text-base text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <th className="py-3 px-4 font-bold border-b">Phương pháp</th>
                        <th className="py-3 px-4 font-bold border-b text-center">Tỷ lệ trúng</th>
                        <th className="py-3 px-4 font-bold border-b text-center">Chu kỳ hiện tại</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {sortedStats.map((stat, idx) => {
                        const isHot = stat.winRate >= 40;
                        const isWinStreak = stat.streakType === 'WIN';

                        return (
                            <tr key={stat.name} className="hover:bg-blue-50/50 transition-colors">
                                <td className="py-3 px-4 font-bold text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <span className={`
                                            w-6 h-6 flex items-center justify-center rounded-full text-xs text-white
                                            ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-gray-200 text-gray-500'}
                                        `}>
                                            {idx + 1}
                                        </span>
                                        {stat.name}
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`font-black text-lg ${isHot ? 'text-red-600' : 'text-gray-700'}`}>
                                            {stat.winRate}%
                                        </span>
                                        <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className={`h-full ${isHot ? 'bg-red-500' : 'bg-blue-500'}`}
                                                style={{ width: `${stat.winRate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    {isWinStreak ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            Thông {stat.streak} ngày
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            Trượt {stat.streak} ngày
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
