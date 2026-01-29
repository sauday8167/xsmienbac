'use client';

import React, { useEffect, useState } from 'react';
import type { BacNhoSoDonData, BacNhoSoDonPattern } from '@/types/bac-nho-types';

interface Props {
}

export default function SoDonTab({ }: Props) {
    const [data, setData] = useState<BacNhoSoDonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [filterRate, setFilterRate] = useState<number>(0); // Default to 0 to show all patterns initially
    const [selectedDays, setSelectedDays] = useState<number>(1000);

    useEffect(() => {
        fetchData();
    }, [selectedDays]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/soi-cau-bac-nho/so-don?days=${selectedDays}`);
            const result = await response.json();

            if (result.success && result.data) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching Bạc Nhớ Số Đơn:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (number: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(number)) {
            newExpanded.delete(number);
        } else {
            newExpanded.add(number);
        }
        setExpandedRows(newExpanded);
    };

    const getCorrelationColor = (rate: number) => {
        if (rate >= 70) return 'bg-green-500';
        if (rate >= 50) return 'bg-blue-500';
        if (rate >= 30) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

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

    // Filter patterns with at least some appearances and meeting rate threshold
    const filteredPatterns = data.patterns
        .map(p => ({
            ...p,
            followNumbers: p.followNumbers.filter(fn => !filterRate || fn.correlationRate >= filterRate)
        }))
        .filter(p => p.totalTriggerAppearances > 0 && p.followNumbers.length > 0)
        .sort((a, b) => b.totalTriggerAppearances - a.totalTriggerAppearances);

    const filteredTodayPredictions = data.todayPredictions
        .map(p => ({
            ...p,
            predictions: p.predictions.filter(pred => !filterRate || pred.correlationRate >= filterRate)
        }))
        .filter(p => p.predictions.length > 0)
        .sort((a, b) => {
            const maxA = a.predictions[0]?.correlationRate || 0;
            const maxB = b.predictions[0]?.correlationRate || 0;
            return maxB - maxA;
        });

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
                    <div className="text-sm text-lottery-gray-600 mb-1">Tổng patterns</div>
                    <div className="text-2xl font-bold text-purple-600">{data.overview.totalPatterns}</div>
                </div>
            </div>

            {/* Today's Predictions */}
            {filteredTodayPredictions.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-orange-700 mb-4">
                        🔥 Dự Đoán Hôm Nay (Dựa Vào Kết Quả Hôm Qua)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTodayPredictions.slice(0, 9).map(({ yesterdayNumber, predictions }) => (
                            <div
                                key={yesterdayNumber}
                                className="bg-white rounded-lg p-4 shadow-md border-2 border-orange-200 hover:border-orange-400 transition-colors"
                            >
                                <div className="text-sm text-gray-600 mb-2">
                                    Hôm qua có: <span className="font-bold text-orange-600 text-lg">{yesterdayNumber}</span>
                                </div>
                                {predictions.slice(0, 3).map((pred, idx) => (
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
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Patterns Table */}
            <div>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-lottery-gray-800">Tất Cả Patterns</h2>
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
                                <th className="px-4 py-3 text-left text-sm font-semibold">Số A (Trigger)</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Lần xuất hiện</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Top số B dự đoán</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatterns.map((pattern, index) => (
                                <React.Fragment key={pattern.triggerNumber}>
                                    <tr
                                        className={`border-b border-lottery-gray-200 hover:bg-lottery-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-lottery-gray-50'
                                            }`}
                                        onClick={() => toggleRow(pattern.triggerNumber)}
                                    >
                                        <td className="px-4 py-3">
                                            <span className="stats-number text-xl font-bold">{pattern.triggerNumber}</span>
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
                                                {expandedRows.has(pattern.triggerNumber) ? '▼' : '▶'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRows.has(pattern.triggerNumber) && (
                                        <tr className="bg-green-50">
                                            <td colSpan={4} className="px-4 py-4">
                                                <div className="text-sm">
                                                    <strong className="text-green-700">Tất cả số B theo tỷ lệ:</strong>
                                                    <div className="mt-2 grid grid-cols-2 lg:grid-cols-6 gap-3">
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
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden space-y-4">
                    {filteredPatterns.map((pattern) => (
                        <div
                            key={pattern.triggerNumber}
                            className="bg-white rounded-xl shadow-sm border border-lottery-gray-200 overflow-hidden"
                        >
                            <div
                                className="p-4 flex items-center justify-between bg-lottery-gray-50/50 cursor-pointer"
                                onClick={() => toggleRow(pattern.triggerNumber)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-lottery-red-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                                        {pattern.triggerNumber}
                                    </div>
                                    <div>
                                        <div className="text-xs text-lottery-gray-500 font-semibold uppercase">Số trigger</div>
                                        <div className="font-bold text-lottery-gray-800">{pattern.totalTriggerAppearances} lần xuất hiện</div>
                                    </div>
                                </div>
                                <div className={`text-lottery-red-600 transition-transform ${expandedRows.has(pattern.triggerNumber) ? 'rotate-180' : ''}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="p-4 border-t border-lottery-gray-100">
                                <div className="text-xs font-bold text-green-700 uppercase mb-3">Top số dự đoán:</div>
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

                            {expandedRows.has(pattern.triggerNumber) && (
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
                    ))}
                </div>
            </div>
        </div>
    );
}
