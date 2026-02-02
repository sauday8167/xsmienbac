'use client';

import { useEffect, useState } from 'react';

export default function TableOfContents() {
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        // Find the article content container
        const article = document.querySelector('.article-content'); // Changed from .prose
        if (!article) return;

        // Find all H2 and H3 tags
        const elements = Array.from(article.querySelectorAll('h2, h3'));

        const headingData = elements.map((elem, index) => {
            // Generate ID if missing
            if (!elem.id) {
                elem.id = `heading-${index}`;
            }
            return {
                id: elem.id,
                text: elem.textContent || '',
                level: Number(elem.tagName.substring(1))
            };
        });

        setHeadings(headingData);

        // Scroll spy
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -60% 0px' }
        );

        elements.forEach((elem) => observer.observe(elem));

        return () => observer.disconnect();
    }, []);

    if (headings.length === 0) return null;

    return (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 sticky top-24">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">📑</span> Mục lục bài viết
            </h4>
            <nav className="space-y-1 max-h-[70vh] overflow-y-auto scrollbar-thin">
                {headings.map((heading) => (
                    <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                            setActiveId(heading.id);
                        }}
                        className={`
                            block text-sm py-1.5 px-2 rounded transition-colors
                            ${heading.level === 3 ? 'ml-4' : ''}
                            ${activeId === heading.id
                                ? 'bg-lottery-red-50 text-lottery-red-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }
                        `}
                    >
                        {heading.text}
                    </a>
                ))}
            </nav>
        </div>
    );
}
