'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


interface ResultFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ResultForm({ initialData, isEditing = false }: ResultFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        draw_date: '',
        special_prize: '',
        prize_1: '',
        prize_2: ['', ''],
        prize_3: ['', '', '', '', '', ''],
        prize_4: ['', '', '', ''],
        prize_5: ['', '', '', '', '', ''],
        prize_6: ['', '', ''],
        prize_7: ['', '', '', ''],
    });

    useEffect(() => {
        if (initialData) {
            // Helper to safe parse or use existing array
            const parsePrize = (data: any, count: number) => {
                if (Array.isArray(data)) return data;
                try {
                    const parsed = JSON.parse(data);
                    return Array.isArray(parsed) ? parsed : Array(count).fill('');
                } catch (e) {
                    return Array(count).fill('');
                }
            };

            setFormData({
                draw_date: initialData.draw_date ? new Date(initialData.draw_date).toISOString().split('T')[0] : '',
                special_prize: initialData.special_prize || '',
                prize_1: initialData.prize_1 || '',
                prize_2: parsePrize(initialData.prize_2, 2),
                prize_3: parsePrize(initialData.prize_3, 6),
                prize_4: parsePrize(initialData.prize_4, 4),
                prize_5: parsePrize(initialData.prize_5, 6),
                prize_6: parsePrize(initialData.prize_6, 3),
                prize_7: parsePrize(initialData.prize_7, 4),
            });
        } else {
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, draw_date: today }));
        }
    }, [initialData]);

    const handleArrayChange = (field: keyof typeof formData, index: number, value: string) => {
        setFormData(prev => {
            const currentArray = [...(prev[field] as string[])];
            currentArray[index] = value;
            return { ...prev, [field]: currentArray };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEditing
                ? `/api/admin/results/${initialData.id}`
                : '/api/admin/results';

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                alert(isEditing ? 'Cập nhật thành công' : 'Thêm mới thành công');
                router.refresh();
                router.push('/admin/results');
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Lỗi kết nối');
        } finally {
            setLoading(false);
        }
    };

    const renderPrizeInputs = (label: string, field: keyof typeof formData, count: number, colSpan = 1) => (
        <div className={`col-span-${colSpan}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(formData[field] as string[]).map((val, idx) => (
                    <input
                        key={idx}
                        type="text"
                        value={val}
                        onChange={(e) => handleArrayChange(field, idx, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-lottery-red-500 outline-none text-center font-mono"
                        placeholder={`Số ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-6">
            <div className="flex justify-between items-end border-b pb-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Thông tin Kết quả</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Quay</label>
                    <input
                        type="date"
                        required
                        value={formData.draw_date}
                        onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                    />
                </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-lottery-red-600 mb-4">Giải Đặc Biệt & Giải Nhất</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-bold text-red-600">ĐẶC BIỆT</label>
                        <input
                            type="text"
                            value={formData.special_prize}
                            onChange={(e) => setFormData({ ...formData, special_prize: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-red-100 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none text-xl font-bold text-center text-red-600"
                            placeholder="Chưa có kết quả"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-bold">Giải Nhất</label>
                        <input
                            type="text"
                            value={formData.prize_1}
                            onChange={(e) => setFormData({ ...formData, prize_1: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none text-xl font-bold text-center"
                            placeholder="Chưa có kết quả"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Các Giải Còn Lại</h3>
                <div className="space-y-6">
                    {renderPrizeInputs('Giải Nhì (2 số)', 'prize_2', 2)}
                    {renderPrizeInputs('Giải Ba (6 số)', 'prize_3', 6)}
                    {renderPrizeInputs('Giải Tư (4 số)', 'prize_4', 4)}
                    {renderPrizeInputs('Giải Năm (6 số)', 'prize_5', 6)}
                    {renderPrizeInputs('Giải Sáu (3 số)', 'prize_6', 3)}
                    {renderPrizeInputs('Giải Bảy (4 số)', 'prize_7', 4)}
                </div>
            </div>


            <div className="flex justify-end pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 mr-4 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-lottery-red-600 to-lottery-red-700 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-70"
                >
                    {loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật Kết quả' : 'Thêm Kết quả Mới')}
                </button>
            </div>
        </form>
    );
}
