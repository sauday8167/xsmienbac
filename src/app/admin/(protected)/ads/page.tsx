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

interface AdSenseConfig {
    publisherId: string;
    slots: {
        header_top: string;
        sidebar_top: string;
        sidebar_sticky: string;
        article_below_title: string;
        article_middle: string;
        article_bottom_multiplex: string;
        mobile_anchor: string;
    };
    showTestPlaceholders: boolean;
}

export default function AdsPage() {
    const [activeTab, setActiveTab] = useState<'manual' | 'adsense'>('adsense');

    // Manual Ads State
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        position: 'sidebar',
        status: 'active'
    });

    // AdSense State
    const [adSenseConfig, setAdSenseConfig] = useState<AdSenseConfig>({
        publisherId: '',
        slots: {
            header_top: '',
            sidebar_top: '',
            sidebar_sticky: '',
            article_below_title: '',
            article_middle: '',
            article_bottom_multiplex: '',
            mobile_anchor: ''
        },
        showTestPlaceholders: false
    });
    const [adsenseLoading, setAdsenseLoading] = useState(true);
    const [isSavingAdSense, setIsSavingAdSense] = useState(false);

    // Fetch Manual Ads
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

    // Fetch AdSense Config
    const fetchAdSenseConfig = async () => {
        try {
            setAdsenseLoading(true);
            const res = await fetch('/api/admin/adsense');
            const data = await res.json();
            if (data.success) {
                setAdSenseConfig(data.data);
            }
        } catch (error) {
            console.error('Fetch AdSense error:', error);
        } finally {
            setAdsenseLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'manual') fetchAds();
        if (activeTab === 'adsense') fetchAdSenseConfig();
    }, [activeTab]);

    // Manual Ads Handlers
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
                fetchAds();
                setIsCreating(false);
                setEditingId(null);
                setFormData({ name: '', code: '', position: 'sidebar', status: 'active' });
                alert(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
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

    // AdSense Handlers
    const handleAdSenseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSavingAdSense(true);
            const res = await fetch('/api/admin/adsense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adSenseConfig)
            });
            const data = await res.json();
            if (data.success) {
                alert('Lưu cấu hình AdSense thành công!');
            } else {
                alert('Lỗi: ' + data.error);
            }
        } catch (error) {
            alert('Lỗi kết nối khi lưu AdSense');
        } finally {
            setIsSavingAdSense(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Quảng cáo</h1>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                    <button
                        onClick={() => setActiveTab('adsense')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'adsense'
                                ? 'bg-white text-lottery-red-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Cấu hình Google AdSense
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'manual'
                                ? 'bg-white text-lottery-red-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Mã HTML / Banner
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'adsense' ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                            Cài Đặt Google AdSense
                        </h2>
                        {adsenseLoading && <div className="spinner border-2 border-blue-500 w-5 h-5 rounded-full animate-spin"></div>}
                    </div>

                    <form onSubmit={handleAdSenseSubmit} className="space-y-6">
                        {/* Publisher ID Section */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label className="block text-sm font-bold text-blue-900 mb-2">Publisher ID (Ca-Pub ID)</label>
                            <input
                                type="text"
                                value={adSenseConfig.publisherId}
                                onChange={e => setAdSenseConfig({ ...adSenseConfig, publisherId: e.target.value })}
                                className="w-full px-4 py-2 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-blue-800"
                                placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                                required
                            />
                            <p className="text-xs text-blue-600 mt-2">
                                * ID lấy từ tài khoản Google AdSense của bạn. Ví dụ: ca-pub-1234567890123456
                            </p>
                        </div>

                        {/* Slots Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-700 border-b pb-2">Vị trí Header & Sidebar</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Header Top (Trên cùng)</label>
                                    <input
                                        type="text"
                                        value={adSenseConfig.slots.header_top}
                                        onChange={e => setAdSenseConfig({ ...adSenseConfig, slots: { ...adSenseConfig.slots, header_top: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        placeholder="Slot ID (e.g., 1234567890)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sidebar Top (Đầu cột phải)</label>
                                    <input
                                        type="text"
                                        value={adSenseConfig.slots.sidebar_top}
                                        onChange={e => setAdSenseConfig({ ...adSenseConfig, slots: { ...adSenseConfig.slots, sidebar_top: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        placeholder="Slot ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sidebar Sticky (Dính cuối cột phải)</label>
                                    <input
                                        type="text"
                                        value={adSenseConfig.slots.sidebar_sticky}
                                        onChange={e => setAdSenseConfig({ ...adSenseConfig, slots: { ...adSenseConfig.slots, sidebar_sticky: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        placeholder="Slot ID"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-700 border-b pb-2">Vị trí Bài Viết & Mobile</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dưới Tiêu Đề Bài Viết</label>
                                    <input
                                        type="text"
                                        value={adSenseConfig.slots.article_below_title}
                                        onChange={e => setAdSenseConfig({ ...adSenseConfig, slots: { ...adSenseConfig.slots, article_below_title: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        placeholder="Slot ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giữa Bài Viết</label>
                                    <input
                                        type="text"
                                        value={adSenseConfig.slots.article_middle}
                                        onChange={e => setAdSenseConfig({ ...adSenseConfig, slots: { ...adSenseConfig.slots, article_middle: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        placeholder="Slot ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuối Bài Viết (Multiplex)</label>
                                    <input
                                        type="text"
                                        value={adSenseConfig.slots.article_bottom_multiplex}
                                        onChange={e => setAdSenseConfig({ ...adSenseConfig, slots: { ...adSenseConfig.slots, article_bottom_multiplex: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        placeholder="Slot ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Sticky Footer (Chân trang Mobile)</label>
                                    <input
                                        type="text"
                                        value={adSenseConfig.slots.mobile_anchor}
                                        onChange={e => setAdSenseConfig({ ...adSenseConfig, slots: { ...adSenseConfig.slots, mobile_anchor: e.target.value } })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        placeholder="Slot ID"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="showTestPlaceholders"
                                checked={adSenseConfig.showTestPlaceholders}
                                onChange={e => setAdSenseConfig({ ...adSenseConfig, showTestPlaceholders: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="showTestPlaceholders" className="text-sm text-gray-700">Hiển thị khung quảng cáo thử nghiệm khi chưa có ID (Dev mode)</label>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSavingAdSense}
                                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-200 flex items-center disabled:opacity-70"
                            >
                                {isSavingAdSense ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Đang lưu...
                                    </>
                                ) : 'Lưu Cấu Hình AdSense'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    {/* Manual Ads Content - Existing UI */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-0">
                        <h2 className="text-lg font-semibold text-gray-700">Danh sách Mã HTML / Banner tùy chỉnh</h2>
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
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* ... Existing Creation Form ... */}
                            {/* NOTE: Inline form content from previous step to keep it concise in this multi-replace context if preferred, 
                                  but typically I'd duplicate the form code here. For brevity, I'm pasting the FULL code structure. 
                               */ }
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
                </>
            )}

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
