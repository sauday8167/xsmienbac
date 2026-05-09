'use client';

import React, { useEffect, useState, useMemo } from 'react';
import type { BacNho3NgayData, BacNho3NgayPattern } from '@/types/bac-nho-types';

export default function BacNho3NgayTab() {
    const [data, setData] = useState<BacNho3NgayData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [filterRate, setFilterRate] = useState<number>(40);
    const [minAppearances, setMinAppearances] = useState<number>(3);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const [selectedDays, setSelectedDays] = useState<number>(1000);
    const [viewMode, setViewMode] = useState<'percentage' | 'hitCount'>('percentage');

    useEffect(() => { fetchData(); }, [selectedDays]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/soi-cau-bac-nho/3-ngay?days=${selectedDays}`);
            const result = await response.json();
            if (result.success && result.data) setData(result.data);
        } catch (error) {
            console.error('Error fetching Bạc Nhớ 3 Ngày:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (key: string) => {
        const s = new Set(expandedRows);
        s.has(key) ? s.delete(key) : s.add(key);
        setExpandedRows(s);
    };

    const getCorrelationColor = (rate: number) => {
        if (rate >= 70) return 'bg-green-500';
        if (rate >= 50) return 'bg-blue-500';
        if (rate >= 30) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    const getSampleBadge = (appearances: number) => {
        if (appearances < 3) return { cls: 'text-red-600 bg-red-50 border-red-200', label: '⚠️ Ít mẫu' };
        if (appearances < 8) return { cls: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: '⚡ Vừa đủ' };
        return { cls: 'text-green-600 bg-green-50 border-green-200', label: '✅ Tin cậy' };
    };

    const tripleToKey = (triple: [string, string, string]) => `${triple[0]}-${triple[1]}-${triple[2]}`;

    const consensusNumbers = useMemo(() => {
        if (!data) return [];
        const voteMap = new Map<string, { voteCount: number; totalRate: number }>();
        data.todayPredictions.forEach(({ predictions }) => {
            const sample = predictions[0]?.totalAppearances || 0;
            if (sample < minAppearances) return;
            predictions
                .filter(p => p.correlationRate >= Math.max(filterRate, 1))
                .slice(0, 5)
                .forEach(pred => {
                    const cur = voteMap.get(pred.number) || { voteCount: 0, totalRate: 0 };
                    voteMap.set(pred.number, { voteCount: cur.voteCount + 1, totalRate: cur.totalRate + pred.correlationRate });
                });
        });
        return Array.from(voteMap.entries())
            .map(([number, s]) => ({ number, voteCount: s.voteCount, avgRate: Math.round(s.totalRate / s.voteCount * 10) / 10 }))
            .filter(x => x.voteCount >= 2)
            .sort((a, b) => b.voteCount - a.voteCount || b.avgRate - a.avgRate)
            .slice(0, 10);
    }, [data, filterRate, minAppearances]);

    if (loading) return <div className="flex justify-center items-center min-h-[400px]"><div className="spinner"></div></div>;
    if (!data) return <div className="text-center text-lottery-gray-600">Không có dữ liệu</div>;

    const filteredPatterns = data.patterns
        .map(p => ({ ...p, followNumbers: p.followNumbers.filter(fn => fn.correlationRate >= Math.max(filterRate, 1)) }))
        .filter(p => p.totalAppearances >= minAppearances && p.followNumbers.length > 0);

    const buildPredictions = (sortKey: 'correlationRate' | 'hitCount') =>
        data.todayPredictions
            .map(p => ({
                ...p,
                predictions: p.predictions
                    .filter(pred => pred.correlationRate >= Math.max(filterRate, 1) && pred.totalAppearances >= minAppearances)
                    .sort((a, b) => b[sortKey] - a[sortKey])
            }))
            .filter(p => p.predictions.length > 0)
            .sort((a, b) => (b.predictions[0]?.[sortKey] || 0) - (a.predictions[0]?.[sortKey] || 0));

    const filteredTodayPredictions = buildPredictions('correlationRate');
    const sortedByHitCount = buildPredictions('hitCount');
    const displayedPredictions = viewMode === 'percentage' ? filteredTodayPredictions : sortedByHitCount;

    const totalPages = Math.ceil(filteredPatterns.length / itemsPerPage);
    const paginatedPatterns = filteredPatterns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600 p-4 rounded-lg">
                    <div className="text-sm text-lottery-gray-600 mb-1">Ngày mới nhất</div>
                    <div className="text-xl font-bold text-green-600">{new Date(data.overview.latestDate).toLocaleDateString('vi-VN')}</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-l-4 border-indigo-600 p-4 rounded-lg">
                    <label className="text-sm text-lottery-gray-600 mb-2 block">Phân tích dữ liệu</label>
                    <select value={selectedDays} onChange={(e) => setSelectedDays(Number(e.target.value))} className="input w-full font-bold text-indigo-600">
                        <option value={100}>100 Ngày</option>
                        <option value={180}>180 Ngày</option>
                        <option value={365}>365 Ngày</option>
                        <option value={730}>730 Ngày</option>
                        <option value={1000}>1000 Ngày</option>
                    </select>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600 p-4 rounded-lg">
                    <div className="text-sm text-lottery-gray-600 mb-1">Số ngày phân tích</div>
                    <div className="text-2xl font-bold text-blue-600">{data.overview.analyzedDays} ngày</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600 p-4 rounded-lg">
                    <div className="text-sm text-lottery-gray-600 mb-1">Tổng patterns</div>
                    <div className="text-2xl font-bold text-purple-600">{data.overview.totalPatterns}</div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700 flex items-center gap-2">
                <span>ℹ️</span>
                <span>Baseline ngẫu nhiên ≈ <strong>27%</strong>. Tab 3 Ngày: A hôm kia, B hôm qua trước, C hôm qua → dự đoán D hôm nay.</span>
            </div>

            {consensusNumbers.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">🏆</span>
                        <div>
                            <h2 className="text-lg font-bold text-indigo-800">Top Số Đồng Thuận Hôm Nay</h2>
                            <p className="text-xs text-indigo-600">Số được nhiều bộ 3-ngày trigger độc lập cùng dự đoán</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {consensusNumbers.map((item, idx) => (
                            <div key={item.number} className={`flex flex-col items-center p-3 rounded-xl border-2 min-w-[68px] ${
                                idx === 0 ? 'bg-yellow-100 border-yellow-400 shadow-md' :
                                idx === 1 ? 'bg-gray-100 border-gray-400' :
                                idx === 2 ? 'bg-orange-100 border-orange-400' : 'bg-white border-indigo-200'
                            }`}>
                                <div className="text-xs mb-0.5">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</div>
                                <div className={`text-2xl font-black ${idx === 0 ? 'text-yellow-700' : idx === 1 ? 'text-gray-600' : idx === 2 ? 'text-orange-700' : 'text-indigo-700'}`}>{item.number}</div>
                                <div className="text-xs font-bold text-indigo-600 mt-1">{item.voteCount} bộ</div>
                                <div className="text-xs text-gray-500">avg {item.avgRate}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {displayedPredictions.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-bold text-orange-700">🔥 Dự Đoán Hôm Nay (Dựa Vào 3 Ngày)</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setViewMode('percentage')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === 'percentage' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-orange-600 border-2 border-orange-300 hover:border-orange-500'}`}>
                                📊 Tỷ Lệ %
                            </button>
                            <button onClick={() => setViewMode('hitCount')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === 'hitCount' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-purple-600 border-2 border-purple-300 hover:border-purple-500'}`}>
                                ⭐ Số Lần
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedPredictions.slice(0, 9).map(({ triggerTriple, predictions }) => {
                            const sample = predictions[0]?.totalAppearances || 0;
                            const badge = getSampleBadge(sample);
                            return (
                                <div key={tripleToKey(triggerTriple)} className={`bg-white rounded-lg p-4 shadow-md border-2 ${viewMode === 'percentage' ? 'border-orange-200 hover:border-orange-400' : 'border-purple-200 hover:border-purple-400'}`}>
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                        <div className="text-xs text-gray-600 leading-relaxed">
                                            D-2: <span className={`font-bold ${viewMode === 'percentage' ? 'text-orange-600' : 'text-purple-600'}`}>{triggerTriple[0]}</span>
                                            {' '}D-1: <span className={`font-bold ${viewMode === 'percentage' ? 'text-orange-600' : 'text-purple-600'}`}>{triggerTriple[1]}</span>
                                            {' '}Hôm qua: <span className={`font-bold ${viewMode === 'percentage' ? 'text-orange-600' : 'text-purple-600'}`}>{triggerTriple[2]}</span>
                                        </div>
                                        <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badge.cls}`}>{badge.label}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mb-3">Xuất hiện {sample} lần</div>
                                    {viewMode === 'percentage' ? (
                                        predictions.slice(0, 3).map((pred, idx) => (
                                            <div key={pred.number} className="mb-2">
                                                <div className="text-base font-semibold text-green-700">
                                                    {idx === 0 ? '➊ ' : idx === 1 ? '➋ ' : '➌ '}Số {pred.number} — {pred.correlationRate.toFixed(1)}%
                                                    <span className="text-xs text-gray-400 ml-1">(+{(pred.correlationRate - 27).toFixed(0)}%)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div className={`h-2 rounded-full ${getCorrelationColor(pred.correlationRate)}`} style={{ width: `${Math.min(pred.correlationRate, 100)}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{pred.hitCount}/{pred.totalAppearances}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        predictions.slice(0, 3).map((pred, idx) => (
                                            <div key={pred.number} className="mb-2">
                                                <div className="text-base font-semibold text-blue-700">
                                                    {idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : '🥉 '}Số {pred.number} — {pred.hitCount} lần
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min((pred.hitCount / pred.totalAppearances) * 100, 100)}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{pred.hitCount}/{pred.totalAppearances}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl font-bold text-lottery-gray-800">Tất Cả Patterns 3 Ngày</h2>
                    <div className="flex flex-wrap gap-2">
                        <select value={minAppearances} onChange={(e) => { setMinAppearances(Number(e.target.value)); setCurrentPage(1); }} className="input w-auto text-sm">
                            <option value={1}>Mọi bộ</option>
                            <option value={3}>≥ 3 lần</option>
                            <option value={5}>≥ 5 lần</option>
                            <option value={10}>≥ 10 lần</option>
                        </select>
                        <select value={filterRate} onChange={(e) => { setFilterRate(Number(e.target.value)); setCurrentPage(1); }} className="input w-auto text-sm">
                            <option value={0}>Tất cả tỷ lệ</option>
                            <option value={70}>≥ 70%</option>
                            <option value={50}>≥ 50%</option>
                            <option value={40}>≥ 40%</option>
                            <option value={30}>≥ 30%</option>
                        </select>
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-lottery-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Bộ ABC (D-2 → D-1 → D)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Lần xuất hiện</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Top số dự đoán</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPatterns.map((pattern, index) => {
                                const key = tripleToKey(pattern.triggerTriple);
                                const badge = getSampleBadge(pattern.totalAppearances);
                                return (
                                    <React.Fragment key={key}>
                                        <tr className={`border-b border-lottery-gray-200 hover:bg-lottery-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-lottery-gray-50'}`} onClick={() => toggleRow(key)}>
                                            <td className="px-4 py-3"><span className="stats-number text-base font-bold">{pattern.triggerTriple[0]}+{pattern.triggerTriple[1]}+{pattern.triggerTriple[2]}</span></td>
                                            <td className="px-4 py-3">
                                                <span className="font-semibold">{pattern.totalAppearances} lần</span>
                                                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badge.cls}`}>{badge.label}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-1">
                                                    {pattern.followNumbers.slice(0, 3).map((fn, idx) => (
                                                        <div key={fn.number} className="flex items-center gap-2">
                                                            <span className="font-bold text-green-600 w-5 text-sm">{idx === 0 ? '➊' : idx === 1 ? '➋' : '➌'}</span>
                                                            <span className="font-semibold w-6">{fn.number}</span>
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                                                                <div className={`h-2 rounded-full ${getCorrelationColor(fn.correlationRate)}`} style={{ width: `${Math.min(fn.correlationRate, 100)}%` }}></div>
                                                            </div>
                                                            <span className="text-sm font-semibold w-12 text-right">{fn.correlationRate.toFixed(1)}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button className="text-green-600 hover:text-green-800">{expandedRows.has(key) ? '▼' : '▶'}</button>
                                            </td>
                                        </tr>
                                        {expandedRows.has(key) && (
                                            <tr className="bg-green-50">
                                                <td colSpan={4} className="px-4 py-4">
                                                    <strong className="text-green-700 text-sm">Tất cả số theo tỷ lệ:</strong>
                                                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                        {pattern.followNumbers.map((fn) => (
                                                            <div key={fn.number} className="bg-white p-2 rounded border border-green-200">
                                                                <div className="font-bold text-lottery-red-600">{fn.number}</div>
                                                                <div className="text-xs text-gray-600">{fn.hitCount} lần — {fn.correlationRate.toFixed(1)}%</div>
                                                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                                    <div className={`h-1.5 rounded-full ${getCorrelationColor(fn.correlationRate)}`} style={{ width: `${Math.min(fn.correlationRate, 100)}%` }}></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden space-y-4">
                    {paginatedPatterns.map((pattern) => {
                        const key = tripleToKey(pattern.triggerTriple);
                        const badge = getSampleBadge(pattern.totalAppearances);
                        return (
                            <div key={key} className="bg-white rounded-xl shadow-sm border border-lottery-gray-200 overflow-hidden">
                                <div className="p-4 flex items-center justify-between bg-lottery-gray-50/50 cursor-pointer" onClick={() => toggleRow(key)}>
                                    <div className="flex items-center gap-3">
                                        <div className="min-w-[5rem] h-12 px-2 rounded-full bg-lottery-red-600 flex items-center justify-center text-white text-xs font-bold shadow-sm whitespace-nowrap">
                                            {pattern.triggerTriple[0]}-{pattern.triggerTriple[1]}-{pattern.triggerTriple[2]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lottery-gray-800">{pattern.totalAppearances} lần</div>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badge.cls}`}>{badge.label}</span>
                                        </div>
                                    </div>
                                    <div className={`text-lottery-red-600 transition-transform ${expandedRows.has(key) ? 'rotate-180' : ''}`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-lottery-gray-100 space-y-3">
                                    {pattern.followNumbers.slice(0, 3).map((fn, idx) => (
                                        <div key={fn.number}>
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="font-bold text-lottery-gray-800">{idx === 0 ? '➊ ' : idx === 1 ? '➋ ' : '➌ '}Số {fn.number}</span>
                                                <span className="text-sm font-bold text-green-600">{fn.correlationRate.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className={`h-2 rounded-full ${getCorrelationColor(fn.correlationRate)}`} style={{ width: `${Math.min(fn.correlationRate, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {expandedRows.has(key) && (
                                    <div className="p-4 bg-green-50/50 border-t border-green-100">
                                        <div className="grid grid-cols-3 gap-2">
                                            {pattern.followNumbers.map((fn) => (
                                                <div key={fn.number} className="bg-white p-2 rounded-lg border border-green-200 text-center shadow-sm">
                                                    <div className="text-lg font-bold text-lottery-red-600">{fn.number}</div>
                                                    <div className="text-[10px] text-gray-500 font-semibold">{fn.correlationRate.toFixed(0)}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-lottery-red-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed">← Trước</button>
                        <span className="text-sm text-lottery-gray-600">Trang {currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-lottery-red-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed">Sau →</button>
                    </div>
                )}
            </div>
        </div>
    );
}
