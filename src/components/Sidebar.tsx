'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import GoogleAd from './GoogleAd';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
}

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

export default function Sidebar() {
    const [latestPosts, setLatestPosts] = useState<Post[]>([]);
    const [hotNumbers, setHotNumbers] = useState<string[]>([]);
    const [sidebarItems, setSidebarItems] = useState<{ id: string; label: string; href: string; icon: string }[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [ads, setAds] = useState<Ad[]>([]);
    const [aiPredictions, setAiPredictions] = useState<{ number: string; confidence: number; sources: string[] }[]>([]);

    useEffect(() => {
        // Fetch latest posts
        fetch('/api/posts?limit=3')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data.posts) {
                    setLatestPosts(data.data.posts);
                }
            })
            .catch(err => console.error('Error fetching posts:', err));

        // Fetch sidebar items
        fetch('/api/admin/sidebar')
            .then(res => res.json())
            .then(data => {
                if (data.success) setSidebarItems(data.data);
            })
            .catch(err => console.error('Error fetching sidebar:', err));

        // Fetch latest result for hot numbers
        fetch('/api/results?limit=1')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data && data.data.length > 0) {
                    const result = data.data[0];
                    const allNumbers = [
                        result.special_prize,
                        result.prize_1,
                        ...result.prize_2,
                        ...result.prize_3,
                    ];
                    const lotos = allNumbers.map((num: string) => num.slice(-2).padStart(2, '0'));
                    const unique = [...new Set(lotos)].slice(0, 6);
                    setHotNumbers(unique);
                }
            })
            .catch(err => console.error('Error fetching hot numbers:', err));

        // Fetch banners
        fetch('/api/admin/banners')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBanners(data.data.filter((b: Banner) => b.position === 'sidebar' && b.status === 'active'));
                }
            })
            .catch(err => console.error('Error fetching banners:', err));

        // Fetch ads
        fetch('/api/admin/ads')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAds(data.data.filter((a: Ad) => a.position === 'sidebar' && a.status === 'active'));
                }
            })
            .catch(err => console.error('Error fetching ads:', err));

        // Fetch AI predictions
        fetch('/api/ai-prediction/latest')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    // Adapt the new data format to the old widget if necessary
                    // Or ideally, update the widget to match the new schema.
                    // The new schema returns a single object { predicted_pairs: ['01','02'], ... }
                    // The widget expects an array of objects.
                    // Let's create a visual adaptation
                    const preds = data.data.predicted_pairs.slice(0, 3).map((num: string) => ({
                        number: num,
                        confidence: data.data.confidence_score,
                        sources: ['AI', 'Gemini']
                    }));
                    setAiPredictions(preds);
                }
            })
            .catch(err => console.error('Error fetching AI predictions:', err));
    }, []);

    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case 'calendar':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />;
            case 'chart':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
            case 'check':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;
            case 'refresh':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />;
            case 'bulb':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />;
            case 'link':
            default:
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />;
        }
    };

    return (
        <aside className="space-y-4 md:space-y-6">
            {/* AdSense Unit - Sidebar Top */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <GoogleAd position="sidebar_top" style={{ minHeight: '250px' }} />
            </div>

            {/* Quick Links Widget */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-t-4 border-lottery-red-600">
                <h3 className="text-lg font-bold text-lottery-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-lottery-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Truy Cập Nhanh
                </h3>
                <div className="space-y-2">
                    {sidebarItems.map((item) => (
                        <Link key={item.id} href={item.href} className="flex items-center p-3 rounded-lg hover:bg-lottery-red-50 transition-colors group">
                            <svg className="w-5 h-5 mr-3 text-lottery-red-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {renderIcon(item.icon)}
                            </svg>
                            <span className="text-sm font-medium text-lottery-gray-700 group-hover:text-lottery-red-600">{item.label}</span>
                        </Link>
                    ))}
                    {sidebarItems.length === 0 && [
                        { href: '/ket-qua-theo-ngay', label: 'Kết quả theo ngày', icon: 'calendar' },
                        { href: '/thong-ke', label: 'Thống kê lô tô', icon: 'chart' },
                        { href: '/do-ve-so', label: 'Dò vé số', icon: 'check' },
                        { href: '/quay-thu', label: 'Quay thử số', icon: 'refresh' },
                        { href: '/du-doan', label: 'Tần Suất Lô Tô', icon: 'bulb' },
                        { href: '/soi-cau-loto-roi', label: 'Soi Cầu Lô Rơi', icon: 'bulb' },
                        { href: '/du-doan-ai', label: 'Dự đoán AI', icon: 'bulb' },
                        { href: '/bac-nho-dac-biet', label: 'Bạc Nhớ Đặc Biệt', icon: 'bulb' }
                    ].map((item, idx) => (
                        <Link key={idx} href={item.href} className="flex items-center p-3 rounded-lg hover:bg-lottery-red-50 transition-colors group">
                            <svg className="w-5 h-5 mr-3 text-lottery-red-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {renderIcon(item.icon)}
                            </svg>
                            <span className="text-sm font-medium text-lottery-gray-700 group-hover:text-lottery-red-600">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Banners Widget */}
            {banners.length > 0 && (
                <div className="space-y-4">
                    {banners.map((banner) => (
                        <a
                            key={banner.id}
                            href={banner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                        >
                            <Image
                                src={banner.image}
                                alt={banner.title}
                                width={300}
                                height={150}
                                className="w-full h-auto object-cover"
                            />
                        </a>
                    ))}
                </div>
            )}

            {/* Ads Widget */}
            {ads.length > 0 && (
                <div className="space-y-4">
                    {ads.map((ad) => (
                        <div
                            key={ad.id}
                            className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex justify-center"
                            dangerouslySetInnerHTML={{ __html: ad.code }}
                        />
                    ))}
                </div>
            )}

            {/* AI Prediction Widget */}
            {aiPredictions.length > 0 && (
                <div className="bg-gradient-to-br from-lottery-red-600 via-lottery-red-700 to-lottery-red-800 rounded-lg shadow-lg p-6 text-white relative overflow-hidden border-t-4 border-lottery-gold-500">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lottery-gold-300 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold flex items-center">
                                <svg className="w-5 h-5 mr-2 text-lottery-gold-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Dự Đoán Ngày Mai
                            </h3>
                            <span className="text-xs bg-lottery-gold-400 text-lottery-red-900 px-2 py-1 rounded-full font-bold shadow-sm">
                                AI
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {aiPredictions.map((pred, idx) => (
                                <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center border border-lottery-gold-400/40 hover:bg-white/30 hover:border-lottery-gold-300/60 transition-all shadow-md">
                                    <div className="text-2xl font-bold mb-1">{pred.number}</div>
                                    <div className="text-xs opacity-90 font-semibold">{pred.confidence}%</div>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs opacity-90 text-center font-medium">
                            Phân tích từ {aiPredictions[0]?.sources?.length || 0}+ phương pháp dự đoán
                        </p>
                    </div>
                </div>
            )}

            {/* Latest News Widget */}
            {latestPosts.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
                    <h3 className="text-lg font-bold text-lottery-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        Tin Tức Mới
                    </h3>
                    <div className="space-y-3">
                        {latestPosts.map((post) => (
                            <Link key={post.id} href={`/tin-tuc/${post.slug}`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                <h4 className="text-sm font-semibold text-lottery-gray-800 group-hover:text-blue-600 line-clamp-2 mb-1">
                                    {post.title}
                                </h4>
                                <p className="text-xs text-lottery-gray-600 line-clamp-2">
                                    {post.excerpt}
                                </p>
                            </Link>
                        ))}
                    </div>
                    <Link href="/tin-tuc" className="block mt-4 text-center text-sm font-medium text-blue-600 hover:text-blue-700">
                        Xem tất cả →
                    </Link>
                </div>
            )}

            {/* Quick Stats Widget */}
            <div className="bg-gradient-to-br from-lottery-red-600 to-lottery-red-700 rounded-lg shadow-md p-6 text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Thống Kê Nhanh
                </h3>
                <div className="space-y-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-sm opacity-90">Giờ quay số</div>
                        <div className="text-2xl font-bold">18:15</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-sm opacity-90">Tần suất</div>
                        <div className="text-2xl font-bold">7 ngày/tuần</div>
                    </div>
                </div>
            </div>

            {/* Sticky Ad - Sidebar Bottom */}
            <div className="sticky top-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="text-[10px] text-center text-gray-400 py-1 uppercase tracking-wider">Quảng cáo</div>
                    <GoogleAd position="sidebar_sticky" style={{ minHeight: '600px', display: 'block' }} />
                </div>
            </div>
        </aside>
    );
}
