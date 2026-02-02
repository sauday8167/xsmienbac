'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        posts: 0,
        ads: 0,
        users: 0, // Placeholder
        views: 0 // Placeholder
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch stats (we likely need a new API for this, but for now we'll fetch separate endpoints or mock)
        // Let's assume we fetch posts count
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const json = await res.json();

                if (json.success) {
                    setStats({
                        posts: json.data.posts,
                        views: json.data.views,
                        users: json.data.users,
                        ads: json.data.ads
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { title: 'Bài viết', value: stats.posts, icon: '📝', color: 'bg-blue-500', href: '/admin/posts' },
        { title: 'Quảng cáo', value: stats.ads, icon: '📢', color: 'bg-green-500', href: '/admin/ads' },
        { title: 'Thành viên', value: stats.users, icon: '👥', color: 'bg-purple-500', href: '/admin/users' },
        { title: 'Lượt xem (Tuần)', value: stats.views.toLocaleString(), icon: '👁️', color: 'bg-orange-500', href: '#' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Tổng Quan Hệ Thống</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <Link href={card.href} key={index} className="block group">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between transition-all group-hover:shadow-lg group-hover:-translate-y-1">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                                <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : card.value}</h3>
                            </div>
                            <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl text-white`}>
                                {card.icon}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions & System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Workflow Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Trạng Thái Hệ Thống</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-medium text-green-700">Crawler Xổ Số</span>
                            </div>
                            <span className="text-sm text-green-600">Đang chạy (18:15)</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="font-medium text-blue-700">AI Dự Đoán</span>
                            </div>
                            <span className="text-sm text-blue-600">Sẵn sàng</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span className="font-medium text-purple-700">Cache Warming</span>
                            </div>
                            <span className="text-sm text-purple-600">Tự động (00:00)</span>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Phím Tắt</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/posts/create" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-lottery-red-50 hover:text-lottery-red-600 transition-colors">
                            <span className="block text-xl mb-2">✍️</span>
                            <span className="font-medium">Viết Bài Mới</span>
                        </Link>
                        <Link href="/admin/ads" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-lottery-red-50 hover:text-lottery-red-600 transition-colors">
                            <span className="block text-xl mb-2">💰</span>
                            <span className="font-medium">Cấu hình Ads</span>
                        </Link>
                        <Link href="/" target="_blank" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-lottery-red-50 hover:text-lottery-red-600 transition-colors">
                            <span className="block text-xl mb-2">🏠</span>
                            <span className="font-medium">Xem Trang Chủ</span>
                        </Link>
                        <Link href="/admin/crawlers" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-lottery-red-50 hover:text-lottery-red-600 transition-colors">
                            <span className="block text-xl mb-2">🕷️</span>
                            <span className="font-medium">Cấu hình Crawler</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
