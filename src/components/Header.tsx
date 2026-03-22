'use client';

import { useUI } from '@/context/UIContext';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import GoogleAd from './GoogleAd';

interface Banner {
    id: string;
    title: string;
    image: string;
    link: string;
    position: string;
    status: string;
}

interface Ad {
    id: string;
    name: string;
    code: string;
    position: string;
    status: string;
}

export default function Header() {
    const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUI();
    const [navItems, setNavItems] = useState<{ id?: string; href: string; label: string }[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [ads, setAds] = useState<Ad[]>([]);
    const [branding, setBranding] = useState<{ logo: string; siteName: string }>({ logo: '', siteName: '' });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchMenu = async () => {
            try {
                const res = await fetch('/api/admin/menu');
                const data = await res.json();
                if (data.success && data.data) {
                    if (Array.isArray(data.data)) {
                        setNavItems(data.data);
                    } else if (data.data.desktop) {
                        setNavItems(data.data.desktop);
                    }
                } else {
                    setNavItems([
                        { href: '/', label: 'Trang chủ' },
                        { href: '/ket-qua-theo-ngay', label: 'Kết quả theo ngày' },
                        { href: '/thong-ke', label: 'Thống kê' },
                        { href: '/soi-cau-bac-nho', label: 'Soi Cầu Bạc Nhớ' },
                        { href: '/hoi-dong-bac-nho', label: 'Hội Đồng Bạc Nhớ' },
                        { href: '/bac-nho-khung-3-ngay', label: 'Bạc Nhớ Khung 3 Ngày' },
                        { href: '/tin-tuc', label: 'Tin tức' },
                        { href: '/quay-thu', label: 'Quay thử' },
                        { href: '/do-ve-so', label: 'Dò vé số' },
                        { href: '/soi-cau-loto-roi', label: 'Soi Cầu Lô Rơi' },
                        { href: '/du-doan-ai', label: 'Dự đoán AI' },
                    ]);
                }
            } catch (error) {
                setNavItems([
                    { href: '/', label: 'Trang chủ' },
                    { href: '/ket-qua-theo-ngay', label: 'Kết quả theo ngày' },
                    { href: '/thong-ke', label: 'Thống kê' },
                    { href: '/soi-cau-bac-nho', label: 'Soi Cầu Bạc Nhớ' },
                    { href: '/hoi-dong-bac-nho', label: 'Hội Đồng Bạc Nhớ' },
                    { href: '/bac-nho-khung-3-ngay', label: 'Bạc Nhớ Khung 3 Ngày' },
                    { href: '/tin-tuc', label: 'Tin tức' },
                    { href: '/quay-thu', label: 'Quay thử' },
                    { href: '/do-ve-so', label: 'Dò vé số' },
                    { href: '/soi-cau-loto-roi', label: 'Soi Cầu Lô Rơi' },
                    { href: '/du-doan-ai', label: 'Dự đoán AI' },
                ]);
            }
        };
        fetchMenu();

        // Fetch Branding
        fetch('/api/admin/branding')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setBranding(data.data);
                }
            })
            .catch(err => console.error('Error fetching branding:', err));

        // Fetch banners for header
        fetch('/api/admin/banners')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBanners(data.data.filter((b: Banner) => b.position === 'header' && b.status === 'active'));
                }
            })
            .catch(err => console.error('Error fetching banners:', err));

        // Fetch ads for header_top
        fetch('/api/admin/ads')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAds(data.data.filter((a: Ad) => a.position === 'header_top' && a.status === 'active'));
                }
            })
            .catch(err => console.error('Error fetching ads:', err));
    }, []);

    return (
        <>
            {/* AdSense (Top of Header) */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-1">
                    <GoogleAd position="header_top" style={{ maxHeight: '100px', minHeight: '50px' }} />
                </div>
            </div>

            {/* Header Ads (Top) */}
            {ads.length > 0 && (
                <div className="bg-gray-100 py-2 border-b border-gray-200">
                    <div className="container mx-auto px-4 flex justify-center">
                        {ads.map(ad => (
                            <div key={ad.id} dangerouslySetInnerHTML={{ __html: ad.code }} />
                        ))}
                    </div>
                </div>
            )}

            <header className="bg-lottery-red-600 shadow-lg">
                <div className="container mx-auto px-4">
                    {/* Top Bar */}
                    <div className="py-4 md:py-6 border-b border-lottery-red-500">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center space-x-4 group">
                                {branding.logo && (
                                    <div className="relative">
                                        <div className="absolute -inset-1 bg-white/20 rounded-full blur group-hover:bg-white/30 transition-all duration-300"></div>
                                        <Image
                                            src={branding.logo}
                                            alt={`${branding.siteName || 'XSMB'} - Xổ Số Miền Bắc 24h`}
                                            width={80}
                                            height={80}
                                            className="relative w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="text-white flex flex-col justify-center">
                                    <div className="text-2xl md:text-3xl font-black leading-none tracking-tighter drop-shadow-sm uppercase" aria-label="Trang chủ XSMB">
                                        {branding.siteName || 'XSMB'}
                                    </div>
                                    <div className="h-0.5 w-12 bg-white/40 my-1 rounded-full"></div>
                                    <p className="text-[10px] md:text-xs font-bold text-lottery-red-100 uppercase tracking-widest opacity-90">
                                        Hệ Thống Xổ Số Miền Bắc 24h
                                    </p>
                                </div>
                            </Link>

                            <div className="hidden lg:flex flex-col items-end text-white/90 text-right">
                                <div className="flex items-center space-x-2 bg-black/10 px-3 py-1.5 rounded-full border border-white/10">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <p className="font-bold text-sm tracking-tight">Kết quả trực tiếp - Siêu nhanh</p>
                                </div>
                                <p className="text-[10px] mt-1 font-medium text-lottery-red-100 uppercase tracking-tighter min-h-[16px]">
                                    {mounted ? new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                </p>
                            </div>

                            {/* Mobile Menu Button */}
                            {/* Mobile Menu Button */}
                            <button
                                id="mobile-menu-btn"
                                onClick={toggleMobileMenu}
                                className="md:hidden text-white p-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Navigation - Desktop Only */}
                    <nav className="hidden md:block py-3">
                        <ul className="flex flex-col md:flex-row md:space-x-1 space-y-2 md:space-y-0 text-center md:text-left">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="nav-link block px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Header Banners (Below Nav) */}
            {banners.length > 0 && (
                <div className="container mx-auto px-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {banners.map(banner => (
                            <a
                                key={banner.id}
                                href={banner.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <Image
                                    src={banner.image}
                                    alt={banner.title}
                                    width={400}
                                    height={200}
                                    className="w-full h-auto object-cover"
                                />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
