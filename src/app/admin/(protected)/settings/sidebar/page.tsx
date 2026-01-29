'use client';

import { useState, useEffect } from 'react';

interface SidebarItem {
    id: string;
    label: string;
    href: string;
    icon: string;
    seoTitle?: string;
    seoDescription?: string;
}

export default function SidebarSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
    const [newItem, setNewItem] = useState({ label: '', href: '', icon: 'link', seoTitle: '', seoDescription: '' });
    const [editingItem, setEditingItem] = useState<SidebarItem | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchSidebar = async () => {
            try {
                const res = await fetch('/api/admin/sidebar');
                const data = await res.json();
                if (data.success) {
                    setSidebarItems(data.data);
                }
            } catch (error) {
                console.error('Failed to load sidebar:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSidebar();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.label || !newItem.href) return;

        const updatedSidebar = [
            ...sidebarItems,
            { ...newItem, id: Date.now().toString() }
        ];

        await saveSidebar(updatedSidebar);
        setNewItem({ label: '', href: '', icon: 'link', seoTitle: '', seoDescription: '' });
    };

    const handleEdit = (item: SidebarItem) => {
        console.log('Edit clicked for item:', item);
        setEditingItem(item);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        const updatedSidebar = sidebarItems.map(item =>
            item.id === editingItem.id ? editingItem : item
        );

        await saveSidebar(updatedSidebar);
        setEditingItem(null);
    };

    const handleDelete = (id: string) => {
        console.log('Delete clicked for ID:', id, 'Type:', typeof id);
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        console.log('Confirming delete for ID:', deleteId);
        console.log('Current sidebar items:', sidebarItems.map(i => ({ id: i.id, type: typeof i.id })));

        setIsDeleting(true);
        try {
            const updatedSidebar = sidebarItems.filter(item => String(item.id) !== String(deleteId));

            if (updatedSidebar.length === sidebarItems.length) {
                const errorMsg = `Không tìm thấy mục cần xóa! ID: ${deleteId}`;
                alert(errorMsg);
                console.error('Delete failed - ID not found:', deleteId);
                console.log('Available IDs:', sidebarItems.map(i => i.id));
                setDeleteId(null);
                return;
            }

            console.log('Deleting sidebar item:', deleteId);
            console.log('Items before:', sidebarItems.length, 'Items after:', updatedSidebar.length);

            await saveSidebar(updatedSidebar);
            setDeleteId(null);
        } catch (error) {
            console.error('Delete error:', error);
            alert('Lỗi khi xóa: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        const newItems = [...sidebarItems];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newItems.length) return;

        // Swap items
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];

        setSidebarItems(newItems); // Optimistic UI update
        await saveSidebar(newItems);
    };

    const saveSidebar = async (data: SidebarItem[]) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/sidebar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const result = await res.json();
            if (result.success) {
                // Reload fresh data from server to ensure sync
                const reloadRes = await fetch('/api/admin/sidebar');
                const reloadData = await reloadRes.json();

                if (reloadData.success) {
                    setSidebarItems(reloadData.data);
                    alert('Lưu sidebar thành công!');
                } else {
                    // Fallback to local data if reload fails
                    setSidebarItems(data);
                    alert('Lưu thành công nhưng không tải lại được dữ liệu!');
                }
            } else {
                alert('Lỗi: ' + (result.error || 'Không xác định'));
            }
        } catch (error) {
            console.error('Save sidebar error:', error);
            alert('Lỗi kết nối: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;

    const icons = [
        { id: 'calendar', label: 'Lịch' },
        { id: 'chart', label: 'Biểu đồ' },
        { id: 'check', label: 'Dấu tích' },
        { id: 'refresh', label: 'Làm mới' },
        { id: 'bulb', label: 'Bóng đèn' },
        { id: 'link', label: 'Liên kết' },
        { id: 'star', label: 'Ngôi sao' },
        { id: 'news', label: 'Tin tức' }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Sidebar (Truy cập nhanh)</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Add/Edit */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {editingItem ? 'Sửa mục Sidebar' : 'Thêm mục mới'}
                        </h3>
                        <form onSubmit={editingItem ? handleUpdate : handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                <input
                                    type="text"
                                    value={editingItem ? editingItem.label : newItem.label}
                                    onChange={(e) => editingItem
                                        ? setEditingItem({ ...editingItem, label: e.target.value })
                                        : setNewItem({ ...newItem, label: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn (Link)</label>
                                <input
                                    type="text"
                                    value={editingItem ? editingItem.href : newItem.href}
                                    onChange={(e) => editingItem
                                        ? setEditingItem({ ...editingItem, href: e.target.value })
                                        : setNewItem({ ...newItem, href: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                <select
                                    value={editingItem ? editingItem.icon : newItem.icon}
                                    onChange={(e) => editingItem
                                        ? setEditingItem({ ...editingItem, icon: e.target.value })
                                        : setNewItem({ ...newItem, icon: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                >
                                    {icons.map(icon => (
                                        <option key={icon.id} value={icon.id}>{icon.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-2 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-700 mb-2">Cài đặt SEO</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">SEO Title</label>
                                        <input
                                            type="text"
                                            value={editingItem ? (editingItem.seoTitle || '') : newItem.seoTitle}
                                            onChange={(e) => editingItem
                                                ? setEditingItem({ ...editingItem, seoTitle: e.target.value })
                                                : setNewItem({ ...newItem, seoTitle: e.target.value })
                                            }
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-lottery-red-500 outline-none"
                                            placeholder="Tiêu đề SEO riêng"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">SEO Description</label>
                                        <textarea
                                            value={editingItem ? (editingItem.seoDescription || '') : newItem.seoDescription}
                                            onChange={(e) => editingItem
                                                ? setEditingItem({ ...editingItem, seoDescription: e.target.value })
                                                : setNewItem({ ...newItem, seoDescription: e.target.value })
                                            }
                                            rows={2}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-lottery-red-500 outline-none"
                                            placeholder="Mô tả SEO riêng"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-lottery-red-600 text-white font-medium rounded-lg hover:bg-lottery-red-700 transition-colors disabled:opacity-70"
                                >
                                    {saving ? 'Đang lưu...' : (editingItem ? 'Cập nhật' : 'Thêm mới')}
                                </button>
                                {editingItem && (
                                    <button
                                        type="button"
                                        onClick={() => setEditingItem(null)}
                                        className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Sidebar Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm font-medium">
                                <tr>
                                    <th className="px-6 py-4">Tiêu đề</th>
                                    <th className="px-6 py-4">Icon/Link</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sidebarItems.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{item.label}</div>
                                            {item.seoTitle && <div className="text-xs text-blue-500">SEO: {item.seoTitle}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">{item.href}</div>
                                            <div className="text-xs text-gray-400">Icon: {item.icon}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <div className="flex mr-2 bg-gray-100 rounded-lg p-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMove(index, 'up');
                                                        }}
                                                        disabled={index === 0 || saving}
                                                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                                        title="Lên"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMove(index, 'down');
                                                        }}
                                                        disabled={index === sidebarItems.length - 1 || saving}
                                                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                                        title="Xuống"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('Edit button clicked, item:', item);
                                                        handleEdit(item);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('Delete button clicked, ID:', item.id);
                                                        handleDelete(item.id);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa mục sidebar này? Hành động này không thể hoàn tác.</p>

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
