'use client';

import { useState, useEffect } from 'react';

interface Banner {
    id: string;
    title: string;
    image: string;
    link: string;
    position: 'header' | 'sidebar' | 'footer' | 'popup';
    status: 'active' | 'inactive';
}

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Delete state
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        image: '',
        link: '',
        position: 'sidebar' as 'header' | 'sidebar' | 'footer' | 'popup',
        status: 'active' as 'active' | 'inactive'
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/banners');
            const data = await res.json();
            if (data.success) {
                setBanners(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch banners:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                if (editingId) {
                    setBanners(banners.map(b => b.id === editingId ? { ...b, ...formData } : b));
                } else {
                    setBanners([data.data, ...banners]);
                }
                setIsCreating(false);
                setEditingId(null);
                setFormData({
                    title: '',
                    image: '',
                    link: '',
                    position: 'sidebar',
                    status: 'active'
                });
                // Optional: Show success toast here
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Lỗi kết nối');
        }
    };

    const handleEdit = (banner: Banner) => {
        setFormData({
            title: banner.title,
            image: banner.image,
            link: banner.link,
            position: banner.position,
            status: banner.status
        });
        setEditingId(banner.id);
        setIsCreating(true);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            setIsDeleting(true);
            const res = await fetch(`/api/admin/banners/${deleteId}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                setBanners(banners.filter(b => b.id !== deleteId));
                setDeleteId(null);
            } else {
                alert(data.error || 'Lỗi khi xóa');
            }
        } catch (error) {
            alert('Lỗi kết nối khi xóa');
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleStatus = async (banner: Banner) => {
        const newStatus = banner.status === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch(`/api/admin/banners/${banner.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...banner, status: newStatus })
            });
            if ((await res.json()).success) {
                setBanners(banners.map(b => b.id === banner.id ? { ...b, status: newStatus } : b));
            }
        } catch (error) {
            alert('Lỗi cập nhật trạng thái');
        }
    };

    const resetForm = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormData({
            title: '',
            image: '',
            link: '',
            position: 'sidebar',
            status: 'active'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Banner</h1>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-lottery-red-600 to-lottery-red-700 text-white rounded-lg hover:shadow-lg transition-all"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCreating ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                    </svg>
                    {isCreating ? 'Đóng form' : 'Thêm Banner mới'}
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in-down">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {editingId ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Banner</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                                    placeholder="Ví dụ: Banner sidebar chính"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn ảnh (URL)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                                    placeholder="/uploads/banner.jpg hoặc https://..."
                                />
                                {formData.image && (
                                    <div className="mt-2 h-20 w-auto border border-gray-200 rounded p-1 inline-block">
                                        <img src={formData.image} alt="Preview" className="h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link đích (Khi click vào)</label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                                    placeholder="#"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                                    <select
                                        value={formData.position}
                                        onChange={e => setFormData({ ...formData, position: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                                    >
                                        <option value="sidebar">Sidebar (Cột phải)</option>
                                        <option value="header">Header (Trên cùng)</option>
                                        <option value="footer">Footer (Cuối trang)</option>
                                        <option value="popup">Popup (Giữa màn hình)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                                    >
                                        <option value="active">Hiển thị</option>
                                        <option value="inactive">Ẩn</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-lottery-red-600 hover:bg-lottery-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                                >
                                    {editingId ? 'Cập nhật Banner' : 'Lưu Banner'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Banner List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Hình ảnh</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Tên & Link</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Vị trí</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="spinner border-2 border-lottery-red-600 border-t-transparent w-6 h-6 rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : banners.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Chưa có banner nào</td>
                                </tr>
                            ) : (
                                banners.map((banner) => (
                                    <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden border border-gray-200">
                                                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{banner.title}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{banner.link || '#'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm font-medium">
                                                {banner.position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(banner)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${banner.status === 'active'
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {banner.status === 'active' ? 'Hiển thị' : 'Đang ẩn'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(banner)}
                                                className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Sửa"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(banner.id)}
                                                className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
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
                            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn tác.</p>

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
