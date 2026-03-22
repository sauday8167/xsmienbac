'use client';

import { useEffect, useState } from 'react';
import type { NumberPrediction } from '@/lib/prediction';

interface PredictionData {
    overview: {
        latestDate: string;
        analyzedDays: number;
        dataRange: { from: string; to: string; };
    };
    allNumbers: NumberPrediction[];
    topPredictions: NumberPrediction[];
    longAbsence: NumberPrediction[];
    regularNumbers: NumberPrediction[];
    consecutiveNumbers: NumberPrediction[];
}

export default function PredictionClient() {
    const [data, setData] = useState<PredictionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'top' | 'long' | 'regular' | 'consecutive' | 'all'>('top');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/prediction?days=100');
                const result = await response.json();
                if (result.success && result.data) {
                    setData(result.data);
                }
            } catch (error) {
                console.error('Error fetching predictions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPredictions();
    }, []);

    const toggleRow = (number: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(number)) {
            newExpanded.delete(number);
        } else {
            newExpanded.add(number);
        }
        setExpandedRows(newExpanded);
    };

    const getLikelihoodBadge = (likelihood: string) => {
        const colors = {
            'RẤT CAO': 'bg-red-500 text-white',
            'CAO': 'bg-orange-500 text-white',
            'TRUNG BÌNH': 'bg-blue-500 text-white',
            'THẤP': 'bg-gray-400 text-white'
        };
        return colors[likelihood as keyof typeof colors] || colors['TRUNG BÌNH'];
    };

    if (loading) return <div className="flex justify-center items-center min-h-[400px]"><div className="spinner"></div></div>;
    if (!data) return <div className="card text-center">Không có dữ liệu dự đoán</div>;

    const currentData =
        activeTab === 'top' ? data.topPredictions :
            activeTab === 'long' ? data.longAbsence :
                activeTab === 'regular' ? data.regularNumbers :
                    activeTab === 'consecutive' ? data.consecutiveNumbers :
                        data.allNumbers;

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-lottery-gray-800 mb-2">Dự Đoán Xổ Số Miền Bắc</h1>
                <p className="text-lottery-gray-600">Phân tích thống kê từ Big Data</p>
                <div className="w-24 h-1 bg-purple-600 mx-auto rounded-full mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-purple-50 border-l-4 border-purple-600">
                    <div className="text-sm text-lottery-gray-600 mb-1">Cập nhật: {new Date(data.overview.latestDate).toLocaleDateString('vi-VN')}</div>
                </div>
                <div className="card bg-blue-50 border-l-4 border-blue-600">
                    <div className="text-sm text-lottery-gray-600">Phân tích: {data.overview.analyzedDays} ngày</div>
                </div>
            </div>

            <div className="card">
                <div className="flex flex-wrap gap-2 mb-4">
                    {['top', 'long', 'regular', 'consecutive', 'all'].map((tab: any) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}>
                            {tab === 'top' ? 'Top 10' : tab === 'long' ? 'Loto Gan' : tab === 'regular' ? 'Đều' : tab === 'consecutive' ? 'Liên Tiếp' : 'Tất Cả'}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-lottery-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left">Số</th>
                                <th className="px-4 py-3 text-left">Gan</th>
                                <th className="px-4 py-3 text-left">Điểm</th>
                                <th className="px-4 py-3 text-left">Khả năng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((prediction) => (
                                <tr key={prediction.number} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow(prediction.number)}>
                                    <td className="px-4 py-3 font-bold">{prediction.number}</td>
                                    <td className="px-4 py-3 text-red-600 font-bold">{prediction.daysSinceLastAppearance}n</td>
                                    <td className="px-4 py-3 text-purple-600 font-bold">{prediction.score.toFixed(2)}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${getLikelihoodBadge(prediction.likelihood)}`}>{prediction.likelihood}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
