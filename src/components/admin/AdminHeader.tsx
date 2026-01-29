'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminHeader() {
    const pathname = usePathname();

    // Get page title based on pathname
    const getPageTitle = () => {
        const routes: { [key: string]: string } = {
            '/admin/dashboard': 'Dashboard',
            '/admin/posts': 'Quản lý bài viết',
            '/admin/media': 'Thư viện Media',
            '/admin/results': 'Quản lý kết quả',
            '/admin/seo': 'Cài đặt SEO',
            '/admin/banners': 'Quản lý Banner',
            '/admin/ads': 'Quản lý quảng cáo',
            '/admin/users': 'Quản lý người dùng',
            '/admin/settings': 'Cài đặt hệ thống',
        };
        return routes[pathname] || 'Admin Panel';
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Quản trị website XSMB
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/"
                            target="_blank"
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Xem website
                        </Link>
                        <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
