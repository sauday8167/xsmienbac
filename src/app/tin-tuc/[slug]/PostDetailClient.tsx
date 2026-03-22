'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Post } from '@/types';
import { generateSmartAltText } from '@/lib/image-seo';
import TableOfContents from '@/components/TableOfContents';
import GoogleAd from '@/components/GoogleAd';
import Breadcrumbs from '@/components/Breadcrumbs';

// Helper to calculate reading time
const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
};

interface PostDetailClientProps {
    post: Post;
    relatedPosts: Post[];
}

export default function PostDetailClient({ post, relatedPosts }: PostDetailClientProps) {
    if (!post) {
        return (
            <div className="card text-center py-12">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Bài viết không tồn tại</h1>
                <Link href="/tin-tuc" className="btn btn-primary">
                    Quay lại tin tức
                </Link>
            </div>
        );
    }

    // Fix hydration: Do not split raw HTML string blindly as it breaks tags (like <ul> or <table>).
    // Render the whole content and place the ad safely after.
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Construct breadcrumbs
    const breadcrumbItems = [
        { label: 'Trang chủ', url: '/' },
        { label: 'Tin tức', url: '/tin-tuc' },
        { label: post.title, url: `/tin-tuc/${post.slug}` }
    ];

    return (
        <div className="space-y-8">
            {/* Visual Breadcrumbs */}
            <Breadcrumbs items={breadcrumbItems} />

            {/* Main Content - Full Width */}
            <article className="card overflow-hidden">
                {post.thumbnail && (
                    <div className="-mx-6 -mt-6 mb-6 h-64 md:h-96 bg-gray-200">
                        <img
                            src={post.thumbnail}
                            alt={generateSmartAltText(post.title, 0, post.created_at)}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                    <span className="badge badge-news uppercase text-xs">
                        {post.category}
                    </span>
                    <span className="text-gray-500 text-sm">
                        {mounted ? new Date(post.created_at).toLocaleDateString('vi-VN') : ''}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 text-sm">
                        {calculateReadingTime(post.content)} phút đọc
                    </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {post.title}
                </h1>

                {/* Enhanced Article Content with Custom Typography */}
                <div className="article-content relative">
                    <div className="mb-8 lg:float-right lg:ml-6 lg:w-72 lg:mb-6 z-10">
                        <TableOfContents />
                    </div>

                    <style jsx>{`
                        .article-content :global(h1) { font-size: 2rem; font-weight: 700; color: #1a202c; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.3; }
                        .article-content :global(h2) { font-size: 1.75rem; font-weight: 700; color: #2d3748; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; scroll-margin-top: 100px; }
                        .article-content :global(h3) { font-size: 1.5rem; font-weight: 600; color: #dc2626; margin-top: 1.5rem; margin-bottom: 0.75rem; scroll-margin-top: 100px; }
                        .article-content :global(p) { font-size: 1.125rem; line-height: 1.8; color: #374151; margin-bottom: 1.25rem; }
                        .article-content :global(strong) { font-weight: 700; color: #dc2626; }
                        .article-content :global(em) { font-style: italic; color: #4b5563; }
                        .article-content :global(ul), .article-content :global(ol) { margin-left: 1.5rem; margin-bottom: 1.5rem; }
                        .article-content :global(li) { font-size: 1.125rem; line-height: 1.8; color: #374151; margin-bottom: 0.75rem; padding-left: 0.5rem; }
                        .article-content :global(ul li) { list-style-type: disc; }
                        .article-content :global(ol li) { list-style-type: decimal; }
                        .article-content :global(blockquote) { border-left: 4px solid #dc2626; background-color: #fef2f2; padding: 1rem 1.5rem; margin: 1.5rem 0; font-style: italic; color: #4b5563; }
                        .article-content :global(code) { background-color: #f3f4f6; padding: 0.2rem 0.5rem; border-radius: 0.25rem; font-family: 'Courier New', monospace; font-size: 0.95rem; color: #dc2626; }
                        .article-content :global(pre) { background-color: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1.5rem 0; }
                        .article-content :global(pre code) { background-color: transparent; padding: 0; color: #f9fafb; }
                        .article-content :global(a) { color: #2563eb; text-decoration: underline; font-weight: 500; }
                        .article-content :global(a:hover) { color: #1d4ed8; }
                        .article-content :global(img) { border-radius: 0.75rem; margin: 1.5rem 0; max-width: 100%; height: auto; }
                        .article-content :global(table) { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
                        .article-content :global(th), .article-content :global(td) { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
                        .article-content :global(th) { background-color: #f9fafb; font-weight: 600; color: #1f2937; }
                    `}</style>

                    {/* Full Content rendering safely */}
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />

                    {/* Bottom Article Ad instead of splitting content */}
                    <div className="my-6">
                        <GoogleAd position="article_middle" style={{ minHeight: '150px' }} />
                    </div>
                </div>
            </article>

            {/* Bottom Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card overflow-hidden p-0 h-full">
                    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-center text-white h-full flex flex-col justify-center items-center">
                        <h3 className="text-xl font-bold mb-3">
                            Theo Dõi Fanpage XSMB 24H
                        </h3>
                        <a
                            href="https://www.facebook.com/xsmb24h"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-md mt-2"
                        >
                            Theo Dõi Ngay
                        </a>
                    </div>
                </div>

                <div className="card bg-gray-50 h-full">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                        Bài viết liên quan
                    </h3>
                    <div className="space-y-4">
                        {relatedPosts.length > 0 ? (
                            relatedPosts.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/tin-tuc/${related.slug}`}
                                    className="block group"
                                >
                                    <h4 className="text-sm font-semibold text-gray-800 group-hover:text-lottery-red-600 line-clamp-2 mb-1">
                                        • {related.title}
                                    </h4>
                                </Link>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                                Chưa có bài viết liên quan
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
