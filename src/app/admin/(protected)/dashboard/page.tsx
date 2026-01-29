'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
    todayViews: number;
    totalPosts: number;
    totalResults: number;
    newUsers: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<any>({
        views: 0,
        posts: 0,
        results: 0,
        users: 0,
        recentActivity: [],
        systemHealth: { database: 'Unknown', apiKeys: { total: 0, active: 0, errors: 0 } }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/dashboard/stats');
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Failed to load stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in-up">
            {/* Header welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600">
                        Xin chào, Admin! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Hôm nay hệ thống hoạt động thế nào?</p>
                </div>
                <div className="flex gap-3">
                    <a href="/" target="_blank" className="btn btn-outline hover:bg-gray-100 border-gray-300 text-gray-700 normal-case rounded-xl shadow-sm">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        Xem Website
                    </a>
                </div>
            </div>

            {/* Quick Actions - Modern Gradient Cards */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                    Truy cập nhanh
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <QuickActionCard
                        href="/admin/posts/new"
                        title="Viết Tin Tức"
                        icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                        color="from-blue-500 to-blue-600"
                        desc="Tạo bài viết soi cầu mới"
                    />
                    <QuickActionCard
                        href="/admin/ai-management"
                        title="Dự Đoán AI"
                        icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                        color="from-purple-500 to-pink-600"
                        desc="Chốt số tự động"
                    />
                    <QuickActionCard
                        href="/admin/settings/api-keys"
                        title="Cấu Hình Key"
                        icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
                        color="from-indigo-500 to-purple-600"
                        desc="Quản lý Gemini/Claude"
                    />
                    <QuickActionCard
                        href="/admin/results/new"
                        title="Nhập Kết Quả"
                        icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                        color="from-red-500 to-orange-500"
                        desc="Cập nhật KQXS thủ công"
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                    Tổng quan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Lượt xem trang"
                        value={stats.views.toLocaleString()}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>}
                        color="text-blue-600"
                        bg="bg-blue-50"
                        trend="+12%"
                    />
                    <StatCard
                        title="Tổng bài viết"
                        value={stats.posts}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>}
                        color="text-purple-600"
                        bg="bg-purple-50"
                        trend="New"
                    />
                    <StatCard
                        title="Kết quả đã lưu"
                        value={stats.results}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>}
                        color="text-red-500"
                        bg="bg-red-50"
                        trend="Daily"
                    />
                    <StatCard
                        title="API Keys Available"
                        value={`${stats.systemHealth.apiKeys.active}/${stats.systemHealth.apiKeys.total}`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                        trend="Stable"
                    />
                </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-800">Hoạt động gần đây</h3>
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Xem tất cả</button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {stats.recentActivity && stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((item: any) => (
                                    <div key={item.id + item.type} className="p-4 flex items-center hover:bg-gray-50 transition-colors cursor-default group">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-sm group-hover:scale-105 transition-transform ${item.type === 'post' ? 'bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600' : 'bg-gradient-to-br from-purple-100 to-pink-50 text-purple-600'}`}>
                                            {item.type === 'post' ? (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {item.title || `Dự đoán KQXS ngày ${item.draw_date}`}
                                            </p>
                                            <div className="flex items-center mt-1 space-x-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.type === 'post' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {item.type === 'post' ? 'POST' : 'AI BOT'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(item.created_at).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-gray-300">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">Chưa có hoạt động nào</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* System Health Column */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-6">Trạng thái hệ thống</h3>
                        <div className="space-y-5">
                            <StatusItem
                                label="Database"
                                status={stats.systemHealth.database}
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
                            />
                            <StatusItem
                                label="API Keys"
                                status={stats.systemHealth.apiKeys.active > 0 ? 'Operational' : 'Critical'}
                                detail={`${stats.systemHealth.apiKeys.active} Active / ${stats.systemHealth.apiKeys.errors} Errors`}
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
                            />
                            <StatusItem
                                label="Crawler (18:15)"
                                status="Running"
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Mẹo Admin</h3>
                            <p className="text-indigo-100 text-sm mb-4">
                                Nên kiểm tra key định kỳ và đảm bảo Crawler chạy đúng giờ để số liệu luôn chính xác.
                            </p>
                            <button className="btn btn-sm btn-white text-indigo-700 border-none hover:bg-indigo-50">
                                Xem Hướng Dẫn
                            </button>
                        </div>
                        {/* Decor */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-5 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components for cleaner code
function QuickActionCard({ href, title, icon, color, desc }: any) {
    return (
        <a href={href} className={`group relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br ${color}`}>
            <div className="relative z-10 flex flex-col items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                    {icon}
                </div>
                <div>
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="text-white/80 text-xs mt-1 font-medium">{desc}</p>
                </div>
            </div>
            {/* Decor Circle */}
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-xl group-hover:scale-150 transition-transform duration-500"></div>
        </a>
    );
}

function StatCard({ title, value, icon, color, bg, trend }: any) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-gray-500 text-sm font-medium">{title}</h4>
                    <span className="text-2xl font-extrabold text-gray-800 mt-1 block">{value}</span>
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color}`}>
                    {icon}
                </div>
            </div>
            {trend && (
                <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    {trend}
                </div>
            )}
        </div>
    );
}

function StatusItem({ label, status, icon, detail }: any) {
    const isOk = status === 'Connected' || status === 'Operational' || status === 'Running';
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isOk ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {icon}
                </div>
                <div>
                    <p className="font-semibold text-gray-800 text-sm">{label}</p>
                    {detail && <p className="text-xs text-gray-500">{detail}</p>}
                </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isOk ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {status}
            </span>
        </div>
    );
}
