'use client';

interface StatItem {
    number: string;
    count: number;
}

interface SynthesisItem {
    number: string;
    repCount: number;
    totalCount: number;
}

interface StatisticsPanelProps {
    data: {
        stats?: StatItem[];
        synthesis?: SynthesisItem[];
        totalAppearances?: number;
        daysAnalyzed?: number;
        dateRange?: {
            from: string;
            to: string;
        };
    };
    title: string;
}

export default function StatisticsPanel({ data, title }: StatisticsPanelProps) {
    if (!data) return null;

    const { stats = [], synthesis = [], totalAppearances = 0, daysAnalyzed = 0, dateRange } = data;

    return (
        <div className="space-y-8 my-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                {dateRange && (
                    <p className="text-sm text-gray-500">
                        Phân tích dựa trên {daysAnalyzed} kỳ quay từ {new Date(dateRange.from).toLocaleDateString('vi-VN')} đến {new Date(dateRange.to).toLocaleDateString('vi-VN')}
                    </p>
                )}
                <div className="mt-4 inline-flex px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-semibold">
                    Tổng số lượt xuất hiện: {totalAppearances} lượt
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bảng Tần Suất */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-lottery-red-600 text-white p-4 text-center font-bold uppercase">
                        Tần Suất Xuất Hiện Cao Nhất
                    </div>
                    <div className="p-0">
                        <table className="w-full text-center">
                            <thead className="bg-gray-50 text-gray-600 text-sm">
                                <tr>
                                    <th className="py-3 px-4 font-semibold">Bộ Số</th>
                                    <th className="py-3 px-4 font-semibold">Số Lần Xuất Hiện</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.slice(0, 10).map((item, idx) => (
                                    <tr key={item.number} className="hover:bg-red-50/50 transition-colors">
                                        <td className="py-3 font-bold text-xl text-lottery-red-600">
                                            {item.number}
                                        </td>
                                        <td className="py-3 text-gray-700 font-medium">
                                            {item.count} lần
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bảng Tổng Hợp Tiềm Năng */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-lottery-gold-600 text-white p-4 text-center font-bold uppercase">
                        Top Số Tiềm Năng (Tổng Hợp)
                    </div>
                    <div className="p-0">
                        <table className="w-full text-center">
                            <thead className="bg-gray-50 text-gray-600 text-sm">
                                <tr>
                                    <th className="py-3 px-4 font-semibold">Bộ Số</th>
                                    <th className="py-3 px-4 font-semibold">Độ Hội Tụ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {synthesis.slice(0, 10).map((item, idx) => (
                                    <tr key={item.number} className="hover:bg-yellow-50/50 transition-colors">
                                        <td className="py-3 font-bold text-xl text-lottery-gold-700">
                                            {item.number}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex flex-col items-center">
                                                <span className="text-gray-900 font-bold">{item.repCount}/4 chu kỳ</span>
                                                <span className="text-xs text-gray-500">Tần suất năm: {item.totalCount} lần</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
