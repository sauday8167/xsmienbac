'use client';

import { useState, useEffect, useMemo } from 'react';

interface SimulationData {
    id: number;
    simulation_date: string;
    simulation_hour: number;
    simulation_time: string;
    special_prize: string;
    prize_1: string;
    prize_2: string[];
    prize_3: string[];
    prize_4: string[];
    prize_5: string[];
    prize_6: string[];
    prize_7: string[];
    created_at: string;
}

interface NumberFrequency {
    number: string;
    count: number;
}

export default function SimulationPage() {
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [simulations, setSimulations] = useState<SimulationData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSimulations();
    }, [selectedDate]);

    async function fetchSimulations() {
        setLoading(true);
        try {
            const res = await fetch(`/api/simulations?date=${selectedDate}`);
            const data = await res.json();
            setSimulations(data.simulations || []);
        } catch (error) {
            console.error('Failed to fetch simulations:', error);
            setSimulations([]);
        } finally {
            setLoading(false);
        }
    }

    function handleToday() {
        setSelectedDate(new Date().toISOString().split('T')[0]);
    }

    // Calculate statistics
    const statistics = useMemo(() => {
        const frequency: { [key: string]: number } = {};

        simulations.forEach(sim => {
            // Extract all 2-digit numbers from all prizes
            const allNumbers: string[] = [];

            // From special prize (last 2 digits)
            if (sim.special_prize) {
                allNumbers.push(sim.special_prize.slice(-2));
            }

            // From prize 1 (last 2 digits)
            if (sim.prize_1) {
                allNumbers.push(sim.prize_1.slice(-2));
            }

            // From prize 2-7 (last 2 digits of each)
            [sim.prize_2, sim.prize_3, sim.prize_4, sim.prize_5, sim.prize_6, sim.prize_7].forEach(prize => {
                if (Array.isArray(prize)) {
                    prize.forEach(num => {
                        if (num) {
                            allNumbers.push(num.slice(-2));
                        }
                    });
                }
            });

            // Count frequency
            allNumbers.forEach(num => {
                frequency[num] = (frequency[num] || 0) + 1;
            });
        });

        // Convert to array and sort by frequency (descending)
        const sorted: NumberFrequency[] = Object.entries(frequency)
            .map(([number, count]) => ({ number, count }))
            .sort((a, b) => b.count - a.count);

        return sorted;
    }, [simulations]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">🎲 Mô Phỏng Xổ Số</h1>
                <p className="text-gray-600">
                    Hệ thống tự động quay thử 18 lần mỗi ngày (00:15 - 17:15)
                </p>
            </div>

            {/* Date Picker */}
            <div className="mb-8 flex gap-4 items-center">
                <div>
                    <label className="block mb-2 font-medium">Chọn ngày:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={handleToday}
                    className="mt-7 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
                >
                    Hôm nay
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && simulations.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg">
                        📭 Chưa có dữ liệu mô phỏng cho ngày này
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Dữ liệu mô phỏng sẽ tự động bị xóa sau 19:00 mỗi ngày
                    </p>
                </div>
            )}

            {/* Statistics Panel */}
            {!loading && simulations.length > 0 && (
                <>
                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            📊 Thống Kê Tần Suất
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Số lần xuất hiện của mỗi số (2 chữ số cuối) trong {simulations.length} lần quay thử
                        </p>

                        <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-2">
                            {statistics.slice(0, 30).map(({ number, count }) => (
                                <div
                                    key={number}
                                    className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition"
                                >
                                    <div className="text-2xl font-bold text-blue-600">
                                        {number}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {count} lần
                                    </div>
                                </div>
                            ))}
                        </div>

                        {statistics.length > 30 && (
                            <details className="mt-4">
                                <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                                    Xem thêm {statistics.length - 30} số khác...
                                </summary>
                                <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-2 mt-4">
                                    {statistics.slice(30).map(({ number, count }) => (
                                        <div
                                            key={number}
                                            className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition"
                                        >
                                            <div className="text-2xl font-bold text-gray-600">
                                                {number}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {count} lần
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )}
                    </div>

                    {/* Simulations Count */}
                    <div className="mb-4 text-sm text-gray-600">
                        Tìm thấy <strong>{simulations.length}</strong> lần quay thử
                    </div>

                    {/* Simulations Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {simulations.map((sim) => (
                            <div
                                key={sim.id}
                                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
                            >
                                {/* Card Header */}
                                <div className="mb-4 pb-3 border-b border-gray-200">
                                    <h3 className="font-bold text-lg">
                                        Lần {sim.simulation_hour + 1}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        ⏰ {sim.simulation_time}
                                    </p>
                                </div>

                                {/* Result Table */}
                                <div className="text-sm">
                                    <div className="mb-2">
                                        <span className="font-semibold">ĐB:</span>{' '}
                                        <span className="text-red-600 font-bold text-lg">
                                            {sim.special_prize || '--'}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">G1:</span>{' '}
                                        <span className="font-mono">{sim.prize_1 || '--'}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">G2:</span>{' '}
                                        <span className="font-mono">
                                            {sim.prize_2?.join(', ') || '--'}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">G3:</span>{' '}
                                        <span className="font-mono text-xs">
                                            {sim.prize_3?.join(', ') || '--'}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">G4:</span>{' '}
                                        <span className="font-mono text-xs">
                                            {sim.prize_4?.join(', ') || '--'}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">G5:</span>{' '}
                                        <span className="font-mono text-xs">
                                            {sim.prize_5?.join(', ') || '--'}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold">G6:</span>{' '}
                                        <span className="font-mono text-xs">
                                            {sim.prize_6?.join(', ') || '--'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">G7:</span>{' '}
                                        <span className="font-mono text-xs">
                                            {sim.prize_7?.join(', ') || '--'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Info Box */}
            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-3">ℹ️ Thông Tin</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Hệ thống tự động quay thử <strong>18 lần/ngày</strong> (00:15, 01:15, ..., 17:15)</li>
                    <li>• Kết quả được tạo ngẫu nhiên bằng thuật toán an toàn</li>
                    <li>• Dữ liệu sẽ <strong>tự động xóa</strong> sau 19:00 mỗi ngày (sau khi có kết quả thực)</li>
                    <li>• Mục đích: Phân tích pattern và thống kê nội bộ</li>
                    <li>• Thống kê hiển thị số lần xuất hiện của mỗi số (2 chữ số cuối)</li>
                </ul>
            </div>
        </div>
    );
}
