'use client';

import { useEffect, useState } from 'react';
import type { LotoStats } from '@/types';
import DbTomorrowStats from './components/DbTomorrowStats';
import Prize1TomorrowStats from './components/Prize1TomorrowStats';
import TrendChart from './components/TrendChart';
import { LayoutDashboard, BarChart3, TrendingUp, Info, Trophy } from 'lucide-react';

type MainTab = 'loto' | 'gdb-tomorrow' | 'prize1-tomorrow';

export default function StatisticsClient() {
    const [stats, setStats] = useState<LotoStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [activeTab, setActiveTab] = useState<'dau' | 'duoi'>('dau');
    const [mainTab, setMainTab] = useState<MainTab>('loto');

    useEffect(() => {
        if (mainTab === 'loto') {
            fetchStatistics();
        }
    }, [days, mainTab]);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/results/stats?days=${days}`);
            const data = await response.json();

            if (data.success && data.data) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderLotoStats = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="spinner"></div>
                </div>
            );
        }

        if (!stats) {
            return <div className="card text-center">Không có dữ liệu thống kê</div>;
        }

        const currentStats = activeTab === 'dau' ? stats.dau : stats.duoi;

        return (
            <div className="space-y-6">
                {/* Trend Chart (New Section) */}
                <TrendChart />

                {/* Loto Controls */}
                <div className="card bg-white border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-bold text-slate-700">Thống kê trong:</label>
                            <select
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                                className="input w-auto h-auto py-2 pl-3 pr-10 border-slate-200"
                            >
                                {[7, 15, 30, 60, 90, 180, 365, 1000].map(d => (
                                    <option key={d} value={d}>{d} ngày</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('dau')}
                                className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'dau' ? 'bg-white text-lottery-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Thống kê Đầu
                            </button>
                            <button
                                onClick={() => setActiveTab('duoi')}
                                className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'duoi' ? 'bg-white text-lottery-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Thống kê Đuôi
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Object.keys(currentStats).map((key) => {
                        const numbers = currentStats[key];
                        return (
                            <div key={key} className="card border-slate-200 hover:border-lottery-red-300 transition-colors">
                                <h3 className="font-black text-xl text-center pb-3 border-b border-slate-100 mb-4 text-slate-800">
                                    {activeTab === 'dau' ? 'Đầu' : 'Đuôi'} <span className="text-lottery-red-600">{key}</span>
                                </h3>

                                {numbers.length > 0 ? (
                                    <div className="space-y-2">
                                        {numbers.slice(0, 8).map((item, idx) => (
                                            <div
                                                key={item.number}
                                                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <span className="stats-number text-lg font-black text-slate-700 w-8">
                                                        {item.number}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-lottery-red-600 text-sm">
                                                        {item.count} L
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-400 text-xs py-10 italic">
                                        Trống
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="card bg-blue-50 border-none flex items-start gap-4 p-6">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Info className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 mb-1">Giải thích thống kê:</h4>
                        <p className="text-sm text-blue-800/80 leading-relaxed">
                            Bảng trên thống kê số lần xuất hiện của các cặp loto dựa theo đầu (số hàng chục) hoặc đuôi (số hàng đơn vị).
                            Giúp bạn nhận định được xu hướng các số đang "về" nhiều hay ít trong khoảng thời gian đã chọn.
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="relative py-10 px-4 rounded-3xl overflow-hidden mb-12">
                <div className="absolute inset-0 bg-gradient-to-br from-lottery-red-600 to-lottery-red-800"></div>
                <div className="relative text-center text-white z-10">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 flex items-center justify-center gap-3">
                        <BarChart3 className="w-10 h-10 text-white/50" />
                        PHÂN TÍCH THỐNG KÊ
                    </h1>
                    <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
                        Hệ thống phân tích dữ liệu xổ số chuyên sâu, giúp bạn tìm ra quy luật từ hàng ngàn kết quả lịch sử.
                    </p>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-10">
                <button
                    onClick={() => setMainTab('loto')}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black transition-all transform active:scale-95 ${mainTab === 'loto'
                        ? 'bg-lottery-red-600 text-white shadow-xl shadow-red-600/20 -translate-y-1'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-lottery-red-300 hover:text-lottery-red-600 shadow-sm'
                        }`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    THỐNG KÊ LOTO
                </button>
                <button
                    onClick={() => setMainTab('gdb-tomorrow')}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black transition-all transform active:scale-95 ${mainTab === 'gdb-tomorrow'
                        ? 'bg-lottery-red-600 text-white shadow-xl shadow-red-600/20 -translate-y-1'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-lottery-red-300 hover:text-lottery-red-600 shadow-sm'
                        }`}
                >
                    <TrendingUp className="w-5 h-5" />
                    GIẢI ĐB NGÀY MAI
                </button>
                <button
                    onClick={() => setMainTab('prize1-tomorrow')}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black transition-all transform active:scale-95 ${mainTab === 'prize1-tomorrow'
                        ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/20 -translate-y-1'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:text-amber-600 shadow-sm'
                        }`}
                >
                    <Trophy className="w-5 h-5" />
                    THỐNG KÊ GIẢI NHẤT
                </button>
            </div>

            {/* Sub-content */}
            {mainTab === 'loto' && renderLotoStats()}
            {mainTab === 'gdb-tomorrow' && <DbTomorrowStats />}
            {mainTab === 'prize1-tomorrow' && <Prize1TomorrowStats />}
        </div>
    );
}
