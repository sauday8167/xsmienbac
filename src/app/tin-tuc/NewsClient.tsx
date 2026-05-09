'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/types';

const getCategoryBadge = (cat: string) => {
    const badges: Record<string, string> = {
        'news': 'badge-news',
        'soi-cau': 'badge-soi-cau',
        'tips': 'badge-tips',
        'analysis': 'badge-analysis',
        'dream': 'badge-dream',
        'tin-tuc': 'badge-news',
        'phan-tich': 'badge-analysis',
    };
    return badges[cat] || 'badge-news';
};

const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
        'news': 'Tin tức',
        'soi-cau': 'Soi cầu',
        'tips': 'Mẹo hay',
        'analysis': 'Phân tích',
        'dream': 'Sổ Mơ',
        'tin-tuc': 'Tin tức',
        'phan-tich': 'Phân tích',
    };
    return labels[cat] || cat;
};

export function NewsClient() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState<string>('all');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        setPage(1); // Reset to page 1 when category changes
    }, [category]);

    useEffect(() => {
        fetchPosts();
        // Scroll to top of posts section
        const element = document.getElementById('news-content');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, [category, page]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const offset = (page - 1) * pageSize;
            const url = category === 'all'
                ? `/api/posts?limit=${pageSize}&offset=${offset}`
                : `/api/posts?category=${category}&limit=${pageSize}&offset=${offset}`;

            const response = await fetch(url, { cache: 'no-store' });
            const data = await response.json();

            if (data.success && data.data) {
                setPosts(data.data.posts);
                setTotal(data.data.total);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8" id="news-content">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-lottery-gray-800 mb-2">
                    Tin Tức &amp; Soi Cầu
                </h1>
                <p className="text-lottery-gray-600">Phân tích, dự đoán và tin tức xổ số mới nhất</p>
                <div className="w-24 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            {/* Category Filter */}
            <div className="card">
                <div className="flex flex-wrap gap-3">
                    {[
                        { val: 'all', label: `Tất cả (${total})` },
                        { val: 'soi-cau', label: 'Soi cầu' },
                        { val: 'news', label: 'Tin tức' },
                        { val: 'analysis', label: 'Phân tích' },
                        { val: 'tips', label: 'Mẹo hay' },
                        { val: 'dream', label: 'Sổ Mơ' },
                        { val: 'phan-tich', label: 'Phân tích thống kê' },
                    ].map(({ val, label }) => (
                        <button
                            key={val}
                            onClick={() => setCategory(val)}
                            className={`btn ${category === val ? 'btn-primary' : 'btn-outline'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="spinner"></div>
                </div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <article key={post.id} className="card hover:scale-105 transition-transform">
                            <Link href={`/tin-tuc/${post.slug}`} className="block mb-4 -mt-6 -mx-6 h-48 bg-lottery-gray-200 rounded-t-lg overflow-hidden group">
                                <Image
                                    src={post.thumbnail || '/uploads/1769190960458-du-doan-xo-so-mb24h.jpg'}
                                    alt={post.title}
                                    width={400}
                                    height={192}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                            </Link>

                            <div className="mb-3">
                                <span className={`badge ${getCategoryBadge(post.category)}`}>
                                    {getCategoryLabel(post.category)}
                                </span>
                            </div>

                            <Link href={`/tin-tuc/${post.slug}`} className="block group">
                                <h2 className="text-xl font-bold text-lottery-gray-800 mb-2 line-clamp-2 group-hover:text-lottery-red-600 transition-colors">
                                    {post.title}
                                </h2>
                            </Link>

                            {post.excerpt && (
                                <p className="text-lottery-gray-600 text-sm mb-4 line-clamp-3">
                                    {post.excerpt}
                                </p>
                            )}

                            <div className="flex items-center justify-between text-sm text-lottery-gray-500 mb-4">
                                <span>{new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')}</span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {post.views}
                                </span>
                            </div>

                            <Link
                                href={`/tin-tuc/${post.slug}`}
                                className="btn btn-primary text-sm w-full text-center"
                            >
                                Đọc thêm
                            </Link>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="card text-center">
                    <p className="text-lottery-gray-600">Chưa có bài viết nào</p>
                </div>
            )}

            {/* Pagination UI */}
            {total > pageSize && (
                <div className="flex justify-center items-center space-x-4 mt-8 pb-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`btn ${page === 1 ? 'btn-outline opacity-50 cursor-not-allowed' : 'btn-primary'}`}
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Trang trước
                    </button>
                    
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-lottery-gray-700">
                            Trang {page} / {Math.ceil(total / pageSize)}
                        </span>
                    </div>

                    <button
                        onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
                        disabled={page >= Math.ceil(total / pageSize)}
                        className={`btn ${page >= Math.ceil(total / pageSize) ? 'btn-outline opacity-50 cursor-not-allowed' : 'btn-primary'}`}
                    >
                        Trang sau
                        <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Disclaimer */}
            <div className="card bg-purple-50 border-l-4 border-purple-500">
                <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    <div>
                        <h4 className="font-bold text-purple-900 mb-2">Miễn trừ trách nhiệm:</h4>
                        <p className="text-sm text-purple-800">
                            Các bài viết phân tích, dự đoán và soi cầu chỉ dựa trên thuật toán thống kê và kinh nghiệm cá nhân, mang tính chất tham khảo giải trí.
                            Chúng tôi tuyệt đối không cam kết và không chịu trách nhiệm về kết quả thắng thua của người chơi.
                            Vui lòng tuân thủ quy định pháp luật về xổ số.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
