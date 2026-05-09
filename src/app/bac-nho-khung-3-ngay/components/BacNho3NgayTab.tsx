'use client';

import React, { useEffect, useState, useMemo } from 'react';
import type { BacNho3NgayData, BacNho3NgayPattern } from '@/types/bac-nho-types';

export default function BacNho3NgayTab() {
    const [data, setData] = useState<BacNho3NgayData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [filterRate, setFilterRate] = useState<number>(60);
    const [minAppearances, setMinAppearances] = useState<number>(3);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDays, setSelectedDays] = useState<number>(100);
    const [viewMode, setViewMode] = useState<'percentage' | 'hitCount'>('percentage');

    const itemsPerPage = 20;

    useEffect(() => { fetchData(); }, [selectedDays]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/bac-nho-khung-3-ngay/3-ngay?days=${selectedDays}`);
            const result = await response.json();
            if (result.success && result.data) setData(result.data);
            else setData(null);
        } catch (error) {
            console.error('Error fetching Bạc Nhớ 3 Ngày Khung:', error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (tripleKey: string) => {
        const s = new Set(expandedRows);
        s.has(tripleKey) ? s.delete(tripleKey) : s.add(tripleKey);
        setExpandedRows(s);
    };

    const getCorrelationColor = (rate: number) => {
        if (rate >= 90) return 'bg-red-500';
        if (rate >= 80) return 'bg-orange-500';
        if (rate >= 60) return 'bg-green-500';
        if (rate >= 40) return 'bg-blue-500';
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

    const processedData = useMemo(() => {
        if (!data) return { patterns: [], predictions: [], overview: null };

        const patterns = data.patterns
            .map(p => ({ ...p, followNumbers: p.followNumbers.filter(fn => !filterRate || fn.correlationRate >= filterRate) }))
            .filter(p => p.totalAppearances >= minAppearances && p.followNumbers.length > 0);

        const predictions = data.todayPredictions
            .map(p => ({
                ...p,
                predictions: p.predictions
                    .filter(pred => (!filterRate || pred.correlationRate >= filterRate) && pred.totalAppearances >= minAppearances)
                    .sort((a, b) => viewMode === 'percentage' ? b.correlationRate - a.correlationRate : b.hitCount - a.hitCount)
            }))
            .filter(p => p.predictions.length > 0)
            .sort((a, b) => {
                const valA = viewMode === 'percentage' ? (a.predictions[0]?.correlationRate || 0) : (a.predictions[0]?.hitCount || 0);
                const valB = viewMode === 'percentage' ? (b.predictions[0]?.correlationRate || 0) : (b.predictions[0]?.hitCount || 0);
                return valB - valA;
            });

        return { patterns, predictions, overview: data.overview };
    }, [data, filterRate, viewMode, minAppearances]);

    const filteredPatterns = processedData.patterns;
    const displayedPredictions = processedData.predictions;
    const totalPages = Math.ceil(filteredPatterns.length / itemsPerPage);
    const paginatedPatterns = filteredPatterns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
            {loading && (
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="spinner"></div>
                </div>
            )}

            {!loading && !data && (
                <div className="text-center text-lottery-gray-600 py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="text-4xl mb-4">🔍</div>
                    <p>Không có dữ liệu cho khoảng thời gian này</p>
                </div>
            )}

            {!loading && data && (
                <>
                    {/* Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600 p-4 rounded-lg">
                            <div className="text-sm text-lottery-gray-600 mb-1">Ngày phân tích mới nhất</div>
                            <div className="text-2xl font-bold text-green-600">{new Date(data.overview.latestDate).toLocaleDateString('vi-VN')}</div>
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

                    {/* Baseline notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700 flex items-center gap-2">
                        <span>ℹ️</span>
                        <span>Baseline ngẫu nhiên XSMB ≈ <strong>27%</strong>. Khung 3 ngày: tỷ lệ cao hơn do nhiều cơ hội xuất hiện trong 3 ngày.</span>
                    </div>

                    {/* Consensus Numbers */}
                    {consensusNumbers.length > 0 && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 p-5 rounded-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">🏆</span>
                                <div>
                                    <h2 className="text-lg font-bold text-indigo-800">Top Số Đồng Thuận Khung 3 Ngày</h2>
                                    <p className="text-xs text-indigo-600">Số được nhiều bộ trigger 3 ngày độc lập cùng dự đoán — đáng tin cậy hơn từng bộ riêng lẻ</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {consensusNumbers.map((item, idx) => (
                                    <div key={item.number} className={`flex flex-col items-center p-3 rounded-xl border-2 min-w-[68px] ${
                                        idx === 0 ? 'bg-yellow-100 border-yellow-400 shadow-md' :
                                        idx === 1 ? 'bg-gray-100 border-gray-400' :
                                        idx === 2 ? 'bg-orange-100 border-orange-400' :
                                        'bg-white border-indigo-200'
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

                    {/* Today's Predictions */}
                    {displayedPredictions.length > 0 && (
                        <div className="bg-gradient-to-br from-pink-50 to-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-red-700">
                                    🔥 Dự Đoán Khung 3 Ngày (Phân tích ngày: {new Date(data.overview.latestDate).toLocaleDateString('vi-VN')})
                                </h2>
                                <div className="flex gap-2">
                                    <button onClick={() => setViewMode('percentage')} className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === 'percentage' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-red-600 border-2 border-red-200 hover:border-red-400'}`}>
                                        📊 Tỷ Lệ % Cao
                                    </button>
                                    <button onClick={() => setViewMode('hitCount')} className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === 'hitCount' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-400'}`}>
                                        ⭐ Số Lần Nhiều
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedPredictions.slice(0, 9).map(({ triggerTriple, predictions }) => {
                                    const sample = predictions[0]?.totalAppearances || 0;
                                    const badge = getSampleBadge(sample);
                                    return (
                                        <div key={tripleToKey(triggerTriple)} className={`bg-white rounded-xl p-5 shadow-sm border-2 transition-all hover:shadow-md ${viewMode === 'percentage' ? 'border-red-100 hover:border-red-300' : 'border-purple-100 hover:border-purple-300'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-xs font-bold text-gray-400 uppercase">Bộ 3 ngày trigger</div>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badge.cls}`}>{badge.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="stats-number w-10 h-10 bg-gray-100 flex items-center justify-center rounded-lg text-lg font-bold text-gray-700">{triggerTriple[0]}</span>
                                                <span className="text-gray-300">→</span>
                                                <span className="stats-number w-10 h-10 bg-gray-100 flex items-center justify-center rounded-lg text-lg font-bold text-gray-700">{triggerTriple[1]}</span>
                                                <span className="text-gray-300">→</span>
                                                <span className="stats-number w-10 h-10 bg-gray-100 flex items-center justify-center rounded-lg text-lg font-bold text-gray-700 border-2 border-red-500 text-red-600">{triggerTriple[2]}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 mb-3">Xuất hiện {sample} lần trong lịch sử</div>

                                            <div className="space-y-3">
                                                {predictions.slice(0, 3).map((pred) => (
                                                    <div key={pred.number}>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className={`font-bold text-lg ${viewMode === 'percentage' ? 'text-red-600' : 'text-purple-600'}`}>Số {pred.number}</span>
                                                            <div className="text-right">
                                                                <span className="text-sm font-bold text-gray-600">
                                                                    {viewMode === 'percentage' ? `${pred.correlationRate.toFixed(1)}%` : `${pred.hitCount} lần`}
                                                                </span>
                                                                {viewMode === 'percentage' && (
                                                                    <div className="text-xs text-gray-400">(+{(pred.correlationRate - 27).toFixed(0)}% vs random)</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                                                                <div className={`h-2 rounded-full transition-all duration-500 ${viewMode === 'percentage' ? getCorrelationColor(pred.correlationRate) : 'bg-purple-500'}`} style={{ width: `${Math.min(pred.correlationRate, 100)}%` }}></div>
                                                            </div>
                                                            <span className="text-[10px] text-gray-400 font-mono">{pred.hitCount}/{pred.totalAppearances}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Patterns Table */}
                    <div className="card p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-lottery-gray-800">Tất Cả Quy Luật (Trigger 3 Ngày)</h2>
                            <div className="flex flex-wrap items-center gap-3">
                                <select value={minAppearances} onChange={(e) => { setMinAppearances(Number(e.target.value)); setCurrentPage(1); }} className="input w-auto min-w-[140px] text-sm">
                                    <option value={1}>Mọi bộ 3</option>
                                    <option value={3}>≥ 3 lần xuất hiện</option>
                                    <option value={5}>≥ 5 lần</option>
                                    <option value={10}>≥ 10 lần</option>
                                </select>
                                <span className="text-sm text-gray-500">Lọc tỷ lệ:</span>
                                <select value={filterRate} onChange={(e) => { setFilterRate(Number(e.target.value)); setCurrentPage(1); }} className="input w-auto min-w-[120px]">
                                    <option value={0}>Tất cả</option>
                                    <option value={90}>≥ 90%</option>
                                    <option value={80}>≥ 80%</option>
                                    <option value={60}>≥ 60%</option>
                                    <option value={40}>≥ 40%</option>
                                </select>
                            </div>
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bộ 3 Ngày (D-2 → D-1 → D)</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Xuất hiện</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dự đoán Khung 3 Ngày</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedPatterns.map((pattern, index) => {
                                        const tripleKey = tripleToKey(pattern.triggerTriple);
                                        const badge = getSampleBadge(pattern.totalAppearances);
                                        return (
                                            <React.Fragment key={tripleKey}>
                                                <tr className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`} onClick={() => toggleRow(tripleKey)}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 font-mono font-bold text-gray-700">
                                                            <span className="px-2 py-1 bg-gray-100 rounded">{pattern.triggerTriple[0]}</span>
                                                            <span className="text-gray-300">→</span>
                                                            <span className="px-2 py-1 bg-gray-100 rounded">{pattern.triggerTriple[1]}</span>
                                                            <span className="text-gray-300">→</span>
                                                            <span className="px-2 py-1 bg-red-100 text-red-600 rounded border border-red-200">{pattern.triggerTriple[2]}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-semibold text-gray-600">{pattern.totalAppearances} lần</span>
                                                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badge.cls}`}>{badge.label}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {pattern.followNumbers.slice(0, 5).map((fn) => (
                                                                <div key={fn.number} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-gray-100 shadow-sm">
                                                                    <span className="font-bold text-blue-600 text-sm">{fn.number}</span>
                                                                    <span className="text-[10px] font-bold text-gray-400">{fn.correlationRate.toFixed(0)}%</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block transition-transform duration-200 ${expandedRows.has(tripleKey) ? 'rotate-90' : ''}`}>
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                        </span>
                                                    </td>
                                                </tr>
                                                {expandedRows.has(tripleKey) && (
                                                    <tr className="bg-blue-50/50">
                                                        <td colSpan={4} className="px-6 py-6 border-t border-blue-100">
                                                            <div className="text-sm">
                                                                <div className="flex items-center gap-2 mb-4">
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                    <strong className="text-blue-900 uppercase tracking-wide text-xs">Phân tích chi tiết số sẽ về trong khung:</strong>
                                                                </div>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                                    {pattern.followNumbers.map((fn) => (
                                                                        <div key={fn.number} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm hover:border-blue-300 transition-all">
                                                                            <div className="font-bold text-lg text-red-600 mb-1">{fn.number}</div>
                                                                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mb-2">
                                                                                <span>{fn.hitCount} lần</span>
                                                                                <span>{fn.correlationRate.toFixed(1)}%</span>
                                                                            </div>
                                                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                                                <div className={`h-1.5 rounded-full ${getCorrelationColor(fn.correlationRate)}`} style={{ width: `${Math.min(fn.correlationRate, 100)}%` }}></div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
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

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                            {paginatedPatterns.map((pattern) => {
                                const tripleKey = tripleToKey(pattern.triggerTriple);
                                const badge = getSampleBadge(pattern.totalAppearances);
                                return (
                                    <div key={tripleKey} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-4 bg-gray-50/50 cursor-pointer" onClick={() => toggleRow(tripleKey)}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Trigger {pattern.totalAppearances} lần</div>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badge.cls}`}>{badge.label}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 font-bold text-gray-700">
                                                    <span className="w-8 h-8 bg-white rounded shadow-sm flex items-center justify-center border border-gray-100">{pattern.triggerTriple[0]}</span>
                                                    <span className="text-gray-300">→</span>
                                                    <span className="w-8 h-8 bg-white rounded shadow-sm flex items-center justify-center border border-gray-100">{pattern.triggerTriple[1]}</span>
                                                    <span className="text-gray-300">→</span>
                                                    <span className="w-8 h-8 bg-red-50 text-red-600 rounded shadow-sm flex items-center justify-center border border-red-100 font-black">{pattern.triggerTriple[2]}</span>
                                                </div>
                                                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedRows.has(tripleKey) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="p-4 border-t border-gray-50">
                                            <div className="flex flex-wrap gap-2">
                                                {pattern.followNumbers.slice(0, 3).map(fn => (
                                                    <div key={fn.number} className="px-3 py-1.5 bg-blue-50 rounded-lg text-center border border-blue-100">
                                                        <div className="text-lg font-bold text-blue-700">{fn.number}</div>
                                                        <div className="text-[10px] font-bold text-blue-400">{fn.correlationRate.toFixed(0)}%</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {expandedRows.has(tripleKey) && (
                                            <div className="p-4 bg-gray-50 border-t border-gray-100 animate-fade-in">
                                                <div className="grid grid-cols-3 gap-2">
                                                    {pattern.followNumbers.map(fn => (
                                                        <div key={fn.number} className="bg-white p-2 rounded-lg text-center shadow-sm border border-gray-100">
                                                            <div className="text-base font-bold text-red-600">{fn.number}</div>
                                                            <div className="text-[10px] font-bold text-gray-400">{fn.correlationRate.toFixed(0)}%</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-gray-100 text-gray-500 disabled:opacity-50 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="w-10 h-10 bg-red-600 text-white flex items-center justify-center rounded-lg font-bold shadow-md">{currentPage}</span>
                                    <span className="text-gray-400 font-bold">/</span>
                                    <span className="text-gray-600 font-bold">{totalPages}</span>
                                </div>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-gray-100 text-gray-500 disabled:opacity-50 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
