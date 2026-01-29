'use client';

import { useState, useEffect } from 'react';

interface Ad {
    id: string;
    name: string;
    code: string;
    position: string;
    status: string;
    created_at: string;
}

export default function AdsPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Delete state
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        position: 'sidebar',
        status: 'active'
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/ads');
            const data = await res.json();
            if (data.success) {
                setAds(data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? `/api/admin/ads/${editingId}` : '/api/admin/ads';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                // Optimistic update or refetch
                fetchAds();
                setIsCreating(false);
                setEditingId(null);
                setFormData({ name: '', code: '', position: 'sidebar', status: 'active' });
                // Optional: success toast
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Lỗi kết nối');
        }
    };

    const handleEdit = (ad: Ad) => {
        setFormData({
            name: ad.name,
            code: ad.code,
            position: ad.position,
            status: ad.status
        });
        setEditingId(ad.id);
        setIsCreating(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            setIsDeleting(true);
            const res = await fetch(`/api/admin/ads/${deleteId}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                setAds(ads.filter(a => a.id !== deleteId));
                setDeleteId(null);
            } else {
                alert('Có lỗi xảy ra khi xóa');
            }
        } catch (error) {
            alert('Lỗi kết nối');
        } finally {
            setIsDeleting(false);
        }
    };

    const resetForm = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormData({ name: '', code: '', position: 'sidebar', status: 'active' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Mã Quảng cáo</h1>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-lottery-red-600 to-lottery-red-700 text-white rounded-lg hover:shadow-lg transition-all"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCreating ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                    </svg>
                    {isCreating ? 'Đóng Form' : 'Thêm Mã QC'}
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in-down">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {editingId ? 'Sửa Mã Quảng cáo' : 'Thêm Mã Quảng cáo Mới'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên gợi nhớ</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                                <select
                                    value={formData.position}
                                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                                >
                                    <option value="sidebar">Sidebar (Phải/Trái)</option>
                                    <option value="header_top">Trên Header</option>
                                    <option value="post_end">Cuối Bài Viết</option>
                                    <option value="footer">Footer</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã Nhúng (HTML/Script)</label>
                            <textarea
                                required
                                rows={5}
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500 font-mono text-sm"
                                placeholder={`<script async src="..."></script>`}
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            >
                                <option value="active">Đang chạy</option>
                                <option value="inactive">Tạm dừng</option>
                            </select>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-2 bg-lottery-red-600 hover:bg-lottery-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                            >
                                {editingId ? 'Cập nhật' : 'Lưu lại'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Tên</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Vị trí</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="spinner border-2 border-lottery-red-600 border-t-transparent w-6 h-6 rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : ads.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chưa có mã quảng cáo nào</td></tr>
                            ) : ads.map(ad => (
                                <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{ad.name}</td>
                                    <td className="px-6 py-4 text-gray-600 capitalize">{ad.position.replace('_', ' ')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ad.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {ad.status === 'active' ? 'Active' : 'Stopped'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(ad)}
                                            className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Sửa"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(ad.id)}
                                            className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
                            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa mã quảng cáo này? Hành động này không thể hoàn tác.</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isDeleting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Xóa ngay'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
