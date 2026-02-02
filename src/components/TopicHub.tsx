import Link from 'next/link';
import { ArrowRight, Star, TrendingUp, BarChart2 } from 'lucide-react';

interface TopicLink {
    label: string;
    url: string;
    description?: string;
    icon?: React.ReactNode;
}

interface TopicHubProps {
    title?: string;
    description?: string;
    className?: string;
}

export default function TopicHub({
    title = "Khám Phá Hệ Sinh Thái Xổ Số",
    description = "Các công cụ phân tích và tra cứu chuyên sâu được các cao thủ tin dùng",
    className = ""
}: TopicHubProps) {

    // Define the semantic cluster
    const clusterLinks: TopicLink[] = [
        {
            label: "Soi Cầu Bạc Nhớ",
            url: "/soi-cau-bac-nho",
            description: "Dự đoán dựa trên chu kỳ lặp",
            icon: <Star className="w-5 h-5 text-yellow-500" />
        },
        {
            label: "Thống Kê Lô Gan",
            url: "/thong-ke?tab=lo-gan",
            description: "Các cặp số lâu chưa về",
            icon: <TrendingUp className="w-5 h-5 text-red-500" />
        },
        {
            label: "Quay Thử XSMB",
            url: "/quay-thu",
            description: "Giả lập quay thưởng may mắn",
            icon: <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        },
        {
            label: "Thống Kê Giải Đặc Biệt",
            url: "/thong-ke?tab=dac-biet",
            description: "Phân tích 2 số cuối ĐB",
            icon: <BarChart2 className="w-5 h-5 text-blue-500" />
        },
        {
            label: "Sổ Kết Quả",
            url: "/ket-qua-theo-ngay",
            description: "Tra cứu KQXS theo lịch",
            icon: <span className="text-lg">📅</span>
        },
        {
            label: "Tạo Dàn Xổ Số",
            url: "/tao-dan-xo-so",
            description: "Công cụ tạo dàn 2D, 3D, 4D",
            icon: <span className="text-lg">🔢</span>
        }
    ];

    return (
        <section className={`card bg-gradient-to-br from-slate-50 to-white border-slate-200 ${className}`}>
            <div className="text-center mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    {title}
                </h2>
                <p className="text-gray-500 text-sm">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clusterLinks.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url}
                        className="group flex items-start p-4 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-xl transition-all duration-200"
                    >
                        <div className="mr-4 mt-1 bg-slate-100 p-2 rounded-lg group-hover:bg-red-50 transition-colors">
                            {link.icon || <Star className="w-5 h-5 text-gray-400" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 group-hover:text-red-600 transition-colors flex items-center">
                                {link.label}
                                <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </h3>
                            {link.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {link.description}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
