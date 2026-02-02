import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    url?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    if (!items || items.length === 0) return null;

    return (
        <nav className={`flex items-center text-sm text-gray-500 mb-4 ${className}`} aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-2">
                {/* Home Icon always first if not explicitly in items (or we trust items[0] is home) */}
                {/* We will rely on passed items for flexibility */}

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                            )}

                            {isLast ? (
                                <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-xs" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.url || '#'}
                                    className="hover:text-lottery-red-600 transition-colors flex items-center"
                                >
                                    {index === 0 && item.label === 'Trang chủ' ? (
                                        <Home className="w-4 h-4" />
                                    ) : (
                                        item.label
                                    )}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
