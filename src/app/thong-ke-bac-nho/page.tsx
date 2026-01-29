'use client';

import { useState, useEffect } from 'react';

interface StatItem {
    number: string;
    totalCount: number;
    details: Record<number, number>;
}

interface StatsSection {
    highestRate: StatItem[];
}

interface StatsResponse {
    date?: string;
    cap3: StatsSection;
    haiNgay: StatsSection;
    nuoi: StatsSection;
}

type TabType = 'cap-3' | '2-ngay' | 'bac-nho-nuoi';

export default function BacNhoStatisticsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('cap-3');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/bac-nho-statistics');
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Get current data based on active tab
    const getActiveData = () => {
        if (!stats) return [];
        switch (activeTab) {
            case 'cap-3': return stats.cap3.highestRate;
            case '2-ngay': return stats.haiNgay.highestRate;
            case 'bac-nho-nuoi': return stats.nuoi.highestRate;
            default: return [];
        }
    };

    // Dynamic titles
    const getTitles = () => {
        switch (activeTab) {
            case 'cap-3':
                return {
                    title: 'Thống Kê Cặp 3',
                    sub: 'Tổng hợp các số top 1 dự đoán từ Bạc Nhớ Cặp 3 qua 5 mốc thời gian'
                };
            case '2-ngay':
                return {
                    title: 'Thống Kê 2 Ngày',
                    sub: 'Tổng hợp các số top 1 dự đoán từ Bạc Nhớ 2 Ngày (theo cặp ngày liên tiếp)'
                };
            case 'bac-nho-nuoi':
                return {
                    title: 'Thống Kê Bạc Nhớ Nuôi',
                    sub: 'Tổng hợp các số top 1 dự đoán từ Bạc Nhớ Nuôi Khung 3 Ngày'
                };
        }
    };

    const { title: tableTitle, sub: subTitle } = getTitles();

    // Render single improved table
    const renderTable = (data: StatItem[]) => (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-white to-gray-50">
                <div>
                    <h3 className="font-bold text-2xl text-gray-800 flex items-center gap-3">
                        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </span>
                        {tableTitle}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 ml-13">{subTitle}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                        Dữ liệu 4 năm qua (2023-2026)
                    </span>
                    {stats?.date && (
                        <span className="text-xs font-bold text-gray-500">
                            Ngày thống kê: <span className="text-gray-800">{stats.date}</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 text-gray-600 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="px-8 py-5 font-bold w-32 border-b border-gray-100">Bộ Số</th>
                            <th className="px-8 py-5 font-bold text-center w-40 border-b border-gray-100">Tổng Xuất Hiện</th>
                            <th className="px-8 py-5 font-bold border-b border-gray-100">Chi tiết theo mốc thời gian</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((item, idx) => {
                            // Top 3 distinct styling
                            const isTop3 = idx < 3;
                            return (
                                <tr key={item.number} className="hover:bg-blue-50/30 transition-all duration-200 group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-400 text-sm font-mono w-4">{idx + 1}</span>
                                            <span className={`
                                                flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl shadow-sm ring-4 ring-opacity-20
                                                ${isTop3
                                                    ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white ring-red-500'
                                                    : 'bg-white border md:border-2 border-gray-200 text-gray-700 ring-gray-200'
                                                }
                                                group-hover:scale-110 transition-transform duration-200
                                            `}>
                                                {item.number}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className={`text-xl font-bold ${isTop3 ? 'text-blue-600' : 'text-gray-800'}`}>
                                                {item.totalCount}
                                            </span>
                                            <span className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">Lượt</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {[100, 180, 365, 730, 1000].map(days => {
                                                const count = item.details[days] || 0;
                                                const hasData = count > 0;
                                                return (
                                                    <div key={days} className={`
                                                        flex flex-col items-center justify-center px-3 py-1.5 rounded-lg border min-w-[60px] cursor-default
                                                        ${hasData
                                                            ? 'bg-white border-blue-100 shadow-sm'
                                                            : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
                                                        }
                                                    `}>
                                                        <span className={`text-[10px] font-bold mb-0.5 ${hasData ? 'text-gray-500' : 'text-gray-400'}`}>{days}N</span>
                                                        <span className={`text-sm font-bold ${hasData ? 'text-blue-600' : 'text-gray-300'}`}>
                                                            {count}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-8 py-16 text-center text-gray-400 font-medium">
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        Chưa có dữ liệu thống kê
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-gray-50 pb-12 font-sans">
            <div className="bg-white border-b sticky top-0 z-20 shadow-sm bg-opacity-95 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center h-16 gap-8 overflow-x-auto">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                            <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">Thống Kê Bạc Nhớ</h1>
                        </div>
                        <nav className="flex space-x-2">
                            <button
                                onClick={() => setActiveTab('cap-3')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'cap-3'
                                    ? 'bg-gray-900 text-white shadow-md transform scale-105'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                Thống Kê Cặp 3
                            </button>
                            <button
                                onClick={() => setActiveTab('2-ngay')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === '2-ngay'
                                    ? 'bg-gray-900 text-white shadow-md transform scale-105'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                Thống Kê 2 Ngày
                            </button>
                            <button
                                onClick={() => setActiveTab('bac-nho-nuoi')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'bac-nho-nuoi'
                                    ? 'bg-gray-900 text-white shadow-md transform scale-105'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                Bạc Nhớ Nuôi
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-red-600 mb-4"></div>
                            <span className="text-gray-400 text-sm font-medium">Đang tải dữ liệu ...</span>
                        </div>
                    ) : stats ? (
                        <div>
                            {renderTable(getActiveData())}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-red-500 font-medium">Không thể tải dữ liệu.</p>
                            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-colors">
                                Thử lại
                            </button>
                        </div>
                    )}

                    <div className="text-center text-xs text-gray-400 mt-12 pb-8">
                        <p>© 2026 XSMB 24h - Phân tích & Thống kê xổ số chuyên sâu.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
