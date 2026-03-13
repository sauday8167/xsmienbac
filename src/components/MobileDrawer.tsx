'use client';

import { useUI } from '@/context/UIContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileDrawer() {
    const { isMobileMenuOpen, closeMobileMenu } = useUI();
    const pathname = usePathname();
    const [navItems, setNavItems] = useState<{ id?: string; href: string; label: string }[]>([]);

    // Branding state for Logo in Drawer
    const [branding, setBranding] = useState<{ logo: string; siteName: string }>({ logo: '', siteName: '' });

    // Fetch Menu Items (Same logic as Header)
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await fetch('/api/admin/menu');
                const data = await res.json();
                if (data.success && data.data) {
                    if (Array.isArray(data.data)) {
                        setNavItems(data.data);
                    } else if (data.data.mobile) {
                        setNavItems(data.data.mobile);
                    }
                } else {
                    // Fallback
                    setNavItems([
                        { href: '/', label: 'Trang chủ' },
                        { href: '/ket-qua-theo-ngay', label: 'Kết quả theo ngày' },
                        { href: '/thong-ke', label: 'Thống kê' },
                        { href: '/tin-tuc', label: 'Tin tức' },
                        { href: '/bac-nho-dac-biet', label: 'Bạc Nhớ Đặc Biệt' },
                    ]);
                }
            } catch (error) {
                console.error('Error fetching menu for drawer:', error);
            }
        };
        fetchMenu();

        fetch('/api/admin/branding')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) setBranding(data.data);
            })
            .catch(e => console.error(e));

    }, []);

    // Close menu on route change
    useEffect(() => {
        closeMobileMenu();
    }, [pathname, closeMobileMenu]);

    return (
        <>
            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-gray-50 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Drawer Header */}
                <div className="bg-lottery-red-600 p-4 text-white flex items-center justify-between sticky top-0 z-10 shadow-md">
                    <div className="flex items-center space-x-2">
                        {branding.logo ? (
                            <img src={branding.logo} alt="Logo" className="w-8 h-8 bg-white rounded-full p-0.5" />
                        ) : null}
                        <span className="font-bold text-lg">{branding.siteName || 'Menu'}</span>
                    </div>
                    <button onClick={closeMobileMenu} className="p-1 hover:bg-white/20 rounded">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Main Menu Links */}
                    <nav className="space-y-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Danh mục chính</h3>
                        {navItems.map((item, idx) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-lottery-red-50 text-lottery-red-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );
}
