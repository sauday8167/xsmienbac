'use client';

import { useState, useEffect } from 'react';

interface FooterConfig {
    about: {
        title: string;
        content: string;
    };
    socials: {
        facebook: string;
        youtube: string;
        telegram: string;
        zalo: string;
    };
    contact: {
        email: string;
        phone: string;
        address: string;
    };
    quickLinks: {
        title: string;
        links: { label: string; href: string }[];
    };
    disclaimer: {
        title: string;
        content: string;
        highlight: string;
    };
    copyright: string;
}

export default function FooterSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<FooterConfig | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/admin/footer');
                const data = await res.json();
                if (data.success) {
                    setConfig(data.data);
                }
            } catch (error) {
                console.error('Failed to load footer config:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;

        setSaving(true);
        try {
            const res = await fetch('/api/admin/footer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const result = await res.json();
            if (result.success) {
                alert('Lưu cấu hình footer thành công!');
            } else {
                alert('Lỗi: ' + result.error);
            }
        } catch (error) {
            alert('Lỗi kết nối');
        } finally {
            setSaving(false);
        }
    };

    const handleLinkChange = (index: number, field: 'label' | 'href', value: string) => {
        if (!config) return;
        const newLinks = [...config.quickLinks.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setConfig({
            ...config,
            quickLinks: { ...config.quickLinks, links: newLinks }
        });
    };

    const addLink = () => {
        if (!config) return;
        setConfig({
            ...config,
            quickLinks: {
                ...config.quickLinks,
                links: [...config.quickLinks.links, { label: '', href: '' }]
            }
        });
    };

    const removeLink = (index: number) => {
        if (!config) return;
        const newLinks = config.quickLinks.links.filter((_, i) => i !== index);
        setConfig({
            ...config,
            quickLinks: { ...config.quickLinks, links: newLinks }
        });
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;
    if (!config) return <div className="p-8 text-center text-red-500">Lỗi tải dữ liệu</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Footer</h1>

            <form onSubmit={handleSave} className="space-y-8">
                {/* About Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">1. Giới thiệu (About)</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                            <input
                                type="text"
                                value={config.about.title}
                                onChange={(e) => setConfig({ ...config, about: { ...config.about, title: e.target.value } })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                            <textarea
                                value={config.about.content}
                                onChange={(e) => setConfig({ ...config, about: { ...config.about, content: e.target.value } })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact & Socials */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">2. Thông tin liên hệ & Mạng xã hội</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Liên hệ</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={config.contact.email}
                                    onChange={(e) => setConfig({ ...config, contact: { ...config.contact, email: e.target.value } })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={config.contact.phone}
                                    onChange={(e) => setConfig({ ...config, contact: { ...config.contact, phone: e.target.value } })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                <input
                                    type="text"
                                    value={config.contact.address}
                                    onChange={(e) => setConfig({ ...config, contact: { ...config.contact, address: e.target.value } })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Mạng xã hội (Link)</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                                <input
                                    type="text"
                                    value={config.socials.facebook}
                                    onChange={(e) => setConfig({ ...config, socials: { ...config.socials, facebook: e.target.value } })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Youtube</label>
                                <input
                                    type="text"
                                    value={config.socials.youtube}
                                    onChange={(e) => setConfig({ ...config, socials: { ...config.socials, youtube: e.target.value } })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
                                <input
                                    type="text"
                                    value={config.socials.telegram}
                                    onChange={(e) => setConfig({ ...config, socials: { ...config.socials, telegram: e.target.value } })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zalo</label>
                                <input
                                    type="text"
                                    value={config.socials.zalo}
                                    onChange={(e) => setConfig({ ...config, socials: { ...config.socials, zalo: e.target.value } })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">3. Liên kết nhanh</h2>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề cột</label>
                        <input
                            type="text"
                            value={config.quickLinks.title}
                            onChange={(e) => setConfig({ ...config, quickLinks: { ...config.quickLinks, title: e.target.value } })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                        />
                    </div>
                    <div className="space-y-3">
                        {config.quickLinks.links.map((link, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Tên link"
                                    value={link.label}
                                    onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Đường dẫn (/url)"
                                    value={link.href}
                                    onChange={(e) => handleLinkChange(index, 'href', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeLink(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addLink}
                            className="text-sm text-lottery-red-600 font-medium hover:underline flex items-center gap-1"
                        >
                            + Thêm liên kết
                        </button>
                    </div>
                </div>

                {/* Disclaimer & Copyright */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">4. Lưu ý & Bản quyền</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề Lưu ý</label>
                            <input
                                type="text"
                                value={config.disclaimer.title}
                                onChange={(e) => setConfig({ ...config, disclaimer: { ...config.disclaimer, title: e.target.value } })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung Lưu ý</label>
                            <textarea
                                value={config.disclaimer.content}
                                onChange={(e) => setConfig({ ...config, disclaimer: { ...config.disclaimer, content: e.target.value } })}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dòng cảnh báo (Màu đỏ)</label>
                            <input
                                type="text"
                                value={config.disclaimer.highlight}
                                onChange={(e) => setConfig({ ...config, disclaimer: { ...config.disclaimer, highlight: e.target.value } })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                            />
                        </div>
                        <div className="pt-4 border-t border-gray-100 mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bản quyền (Copyright)</label>
                            <input
                                type="text"
                                value={config.copyright}
                                onChange={(e) => setConfig({ ...config, copyright: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 pb-20">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-lottery-red-600 text-white font-bold rounded-lg hover:bg-lottery-red-700 transition-colors shadow-lg disabled:opacity-70"
                    >
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
