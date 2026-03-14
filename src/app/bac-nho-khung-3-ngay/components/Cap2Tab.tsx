'use client';

import React, { useEffect, useState, useMemo } from 'react';
import type { BacNhoCap2Data, BacNhoCap2Pattern } from '@/types/bac-nho-types';

interface Props {
}

export default function Cap2Tab({ }: Props) {
    const [data, setData] = useState<BacNhoCap2Data | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [filterRate, setFilterRate] = useState<number>(40);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const [selectedDays, setSelectedDays] = useState<number>(100);
    const [viewMode, setViewMode] = useState<'percentage' | 'hitCount'>('percentage');

    useEffect(() => {
        fetchData();
    }, [selectedDays]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/bac-nho-khung-3-ngay/cap-2?days=${selectedDays}`);
            const result = await response.json();

            if (result.success && result.data) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching Bạc Nhớ Cặp 2:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (pairKey: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(pairKey)) {
            newExpanded.delete(pairKey);
        } else {
            newExpanded.add(pairKey);
        }
        setExpandedRows(newExpanded);
    };

    const getCorrelationColor = (rate: number) => {
        if (rate >= 70) return 'bg-green-500';
        if (rate >= 50) return 'bg-blue-500';
        if (rate >= 30) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    const pairToKey = (pair: [string, string]) => `${pair[0]}-${pair[1]}`;

    // Optimized processing with useMemo - MUST BE AT TOP LEVEL
    const processedData = useMemo(() => {
        if (!data) return { patterns: [], predictions: [] };

        // Filter patterns
        const patterns = data.patterns
            .map(p => ({
                ...p,
                followNumbers: p.followNumbers.filter(fn => !filterRate || fn.correlationRate >= filterRate)
            }))
            .filter(p => p.totalTriggerAppearances > 0 && p.followNumbers.length > 0);

        // Filter Predictions
        const predictions = data.todayPredictions
            .map(p => ({
                ...p,
                predictions: p.predictions
                    .filter(pred => !filterRate || pred.correlationRate >= filterRate)
                    .sort((a, b) => viewMode === 'percentage' 
                        ? b.correlationRate - a.correlationRate 
                        : b.hitCount - a.hitCount
                    )
            }))
            .filter(p => p.predictions.length > 0)
            .sort((a, b) => {
                const valA = viewMode === 'percentage' ? (a.predictions[0]?.correlationRate || 0) : (a.predictions[0]?.hitCount || 0);
                const valB = viewMode === 'percentage' ? (b.predictions[0]?.correlationRate || 0) : (b.predictions[0]?.hitCount || 0);
                return valB - valA;
            });

        return { patterns, predictions };
    }, [data, filterRate, viewMode]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!data) {
        return <div className="text-center text-lottery-gray-600">Không có dữ liệu</div>;
    }

    const displayedPredictions = processedData.predictions;
    const filteredPatterns = processedData.patterns;

    // Pagination
    const totalPages = Math.ceil(filteredPatterns.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedPatterns = filteredPatterns.slice(startIdx, startIdx + itemsPerPage);

    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600 p-4 rounded-lg">
                    <div className="text-sm text-lottery-gray-600 mb-1">Ngày phân tích mới nhất</div>
                    <div className="text-2xl font-bold text-green-600">
                        {new Date(data.overview.latestDate).toLocaleDateString('vi-VN')}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-l-4 border-indigo-600 p-4 rounded-lg">
                    <label className="text-sm text-lottery-gray-600 mb-2 block">Phân tích dữ liệu</label>
                    <select
                        value={selectedDays}
                        onChange={(e) => setSelectedDays(Number(e.target.value))}
                        className="input w-full font-bold text-indigo-600"
                    >
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
                    <div className="text-sm text-lottery-gray-600 mb-1">Tổng cặp patterns</div>
                    <div className="text-2xl font-bold text-purple-600">{data.overview.totalPatterns}</div>
                </div>
            </div>

            {/* Today's Predictions with Toggle */}
            {processedData.predictions.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
                    {/* Toggle Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-orange-700">
                            🔥 Dự Đoán Hôm Nay (Dựa Vào Cặp Hôm Qua)
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('percentage')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === 'percentage'
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'bg-white text-orange-600 border-2 border-orange-300 hover:border-orange-500'
                                    }`}
                            >
                                📊 Tỷ Lệ % Cao Nhất
                            </button>
                            <button
                                onClick={() => setViewMode('hitCount')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === 'hitCount'
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white text-purple-600 border-2 border-purple-300 hover:border-purple-500'
                                    }`}
                            >
                                ⭐ Số Lần Nhiều Nhất
                            </button>
                        </div>
                    </div>

                    {/* Predictions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedPredictions.slice(0, 9).map(({ yesterdayPair, predictions }) => (
                            <div
                                key={pairToKey(yesterdayPair)}
                                className={`bg-white rounded-lg p-4 shadow-md border-2 transition-colors ${viewMode === 'percentage'
                                    ? 'border-orange-200 hover:border-orange-400'
                                    : 'border-purple-200 hover:border-purple-400'
                                    }`}
                            >
                                <div className="text-sm text-gray-600 mb-2">
                                    Hôm qua có cặp: <span className={`font-bold text-lg ${viewMode === 'percentage' ? 'text-orange-600' : 'text-purple-600'
                                        }`}>
                                        {yesterdayPair[0]} + {yesterdayPair[1]}
                                    </span>
                                </div>

                                {/* Conditional rendering based on viewMode */}
                                {viewMode === 'percentage' ? (
                                    // View mode: Tỷ lệ %
                                    predictions.slice(0, 3).map((pred, idx) => (
                                        <div key={pred.number} className="mb-2">
                                            <div className="text-base font-semibold text-green-700">
                                                {idx === 0 && '➊ '}
                                                {idx === 1 && '➋ '}
                                                {idx === 2 && '➌ '}
                                                Số {pred.number} - {pred.correlationRate.toFixed(1)}%
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${getCorrelationColor(pred.correlationRate)}`}
                                                        style={{ width: `${Math.min(pred.correlationRate, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500">{pred.hitCount}/{pred.totalAppearances}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // View mode: Số lần xuất hiện (CHỈ hiển thị hitCount, KHÔNG hiển thị %)
                                    predictions.slice(0, 3).map((pred, idx) => (
                                        <div key={pred.number} className="mb-2">
                                            <div className="text-base font-semibold text-blue-700">
                                                {idx === 0 && '🥇 '}
                                                {idx === 1 && '🥈 '}
                                                {idx === 2 && '🥉 '}
                                                Số {pred.number} - {pred.hitCount} lần
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-purple-500 h-2 rounded-full"
                                                        style={{
                                                            width: `${Math.min((pred.hitCount / pred.totalAppearances) * 100, 100)}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {pred.hitCount}/{pred.totalAppearances}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Patterns Table */}
            <div>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-lottery-gray-800">Tất Cả Patterns Cặp 2</h2>
                    <select
                        value={filterRate}
                        onChange={(e) => setFilterRate(Number(e.target.value))}
                        className="input w-auto"
                    >
                        <option value={0}>Tất cả tỷ lệ</option>
                        <option value={70}>≥ 70%</option>
                        <option value={50}>≥ 50%</option>
                        <option value={30}>≥ 30%</option>
                    </select>
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-lottery-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Cặp A+B (Trigger)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Lần xuất hiện</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Top số C dự đoán</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPatterns.map((pattern, index) => {
                                const pairKey = pairToKey(pattern.triggerPair);
                                return (
                                    <React.Fragment key={pairKey}>
                                        <tr
                                            className={`border-b border-lottery-gray-200 hover:bg-lottery-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-lottery-gray-50'
                                                }`}
                                            onClick={() => toggleRow(pairKey)}
                                        >
                                            <td className="px-4 py-3">
                                                <span className="stats-number text-lg font-bold">
                                                    {pattern.triggerPair[0]} + {pattern.triggerPair[1]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">{pattern.totalTriggerAppearances} lần</td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-1">
                                                    {pattern.followNumbers.slice(0, 3).map((fn, idx) => (
                                                        <div key={fn.number} className="flex items-center gap-2">
                                                            <span className="font-bold text-green-600 w-8">
                                                                {idx === 0 && '➊'}
                                                                {idx === 1 && '➋'}
                                                                {idx === 2 && '➌'}
                                                            </span>
                                                            <span className="font-semibold">{fn.number}</span>
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                                                                <div
                                                                    className={`h-2 rounded-full ${getCorrelationColor(fn.correlationRate)}`}
                                                                    style={{ width: `${Math.min(fn.correlationRate, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-semibold">{fn.correlationRate.toFixed(1)}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button className="text-green-600 hover:text-green-800">
                                                    {expandedRows.has(pairKey) ? '▼' : '▶'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRows.has(pairKey) && (
                                            <tr className="bg-green-50">
                                                <td colSpan={4} className="px-4 py-4">
                                                    <div className="text-sm">
                                                        <strong className="text-green-700">Tất cả số C theo tỷ lệ:</strong>
                                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                            {pattern.followNumbers.map((fn) => (
                                                                <div key={fn.number} className="bg-white p-2 rounded border border-green-200">
                                                                    <div className="font-bold text-lottery-red-600">{fn.number}</div>
                                                                    <div className="text-xs text-gray-600">
                                                                        {fn.hitCount} lần - {fn.correlationRate.toFixed(1)}%
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                                        <div
                                                                            className={`h-1.5 rounded-full ${getCorrelationColor(fn.correlationRate)}`}
                                                                            style={{ width: `${Math.min(fn.correlationRate, 100)}%` }}
                                                                        ></div>
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

                {/* Mobile View: Cards */}
                <div className="md:hidden space-y-4">
                    {paginatedPatterns.map((pattern) => {
                        const pairKey = pairToKey(pattern.triggerPair);
                        return (
                            <div
                                key={pairKey}
                                className="bg-white rounded-xl shadow-sm border border-lottery-gray-200 overflow-hidden"
                            >
                                <div
                                    className="p-4 flex items-center justify-between bg-lottery-gray-50/50 cursor-pointer"
                                    onClick={() => toggleRow(pairKey)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="min-w-[4rem] h-12 px-3 rounded-full bg-lottery-red-600 flex items-center justify-center text-white text-base font-bold shadow-sm whitespace-nowrap">
                                            {pattern.triggerPair[0]} & {pattern.triggerPair[1]}
                                        </div>
                                        <div>
                                            <div className="text-xs text-lottery-gray-500 font-semibold uppercase">Cặp trigger</div>
                                            <div className="font-bold text-lottery-gray-800">{pattern.totalTriggerAppearances} lần xuất hiện</div>
                                        </div>
                                    </div>
                                    <div className={`text-lottery-red-600 transition-transform ${expandedRows.has(pairKey) ? 'rotate-180' : ''}`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-lottery-gray-100">
                                    <div className="text-xs font-bold text-green-700 uppercase mb-3">Top số dự đoán (C):</div>
                                    <div className="space-y-3">
                                        {pattern.followNumbers.slice(0, 3).map((fn, idx) => (
                                            <div key={fn.number}>
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="font-bold text-lottery-gray-800">
                                                        {idx === 0 && '➊ '}
                                                        {idx === 1 && '➋ '}
                                                        {idx === 2 && '➌ '}
                                                        Số {fn.number}
                                                    </span>
                                                    <span className="text-sm font-bold text-green-600">{fn.correlationRate.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${getCorrelationColor(fn.correlationRate)}`}
                                                        style={{ width: `${Math.min(fn.correlationRate, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {expandedRows.has(pairKey) && (
                                    <div className="p-4 bg-green-50/50 border-t border-green-100 animate-fade-in">
                                        <div className="text-xs font-bold text-green-700 uppercase mb-3">Tất cả các số liên quan:</div>
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-lottery-red-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            ← Trước
                        </button>
                        <span className="text-sm text-lottery-gray-600">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-lottery-red-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Sau →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
