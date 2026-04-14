import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Target, Hash, Info, ChevronRight, Zap } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Cẩm Nang Soi Cầu XSMB - Bí Quyết Chơi Xổ Số Miền Bắc Hiệu Quả 2026',
    description: 'Tổng hợp các phương pháp soi cầu XSMB chính xác nhất 2026: Bạc nhớ, cầu Pascal, thống kê lô gan... Hướng dẫn chi tiết từ các chuyên gia xổ số 24h.',
    alternates: {
        canonical: `${siteUrl}/cam-nang-soi-cau`,
    },
    openGraph: {
        title: 'Cẩm Nang Soi Cầu XSMB 2026 - Bí Quyết Bắt Số Chuẩn Xác',
        description: 'Tổng hợp mẹo hay và phương pháp kinh điển trong giới xổ số miền Bắc năm 2026. Cập nhật kỹ thuật soi cầu hiện đại nhất.',
        url: `${siteUrl}/cam-nang-soi-cau`,
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
    }
};

const guides = [
    {
        title: 'Bạc Nhớ Toàn Tập',
        slug: 'bac-nho',
        description: 'Phương pháp thống kê lịch sử "số này ra kéo theo số kia về". Quy luật kinh điển mọi cao thủ đều dùng.',
        icon: <BookOpen className="w-8 h-8 text-blue-500" />,
        color: 'bg-blue-50 border-blue-200'
    },
    {
        title: 'Cầu Pascal Thần Thánh',
        slug: 'cau-pascal',
        description: 'Thuật toán tam giác cộng dồn giữa giải Đặc biệt và giải Nhất. Tìm ngay cặp song thủ lô VIP nhất ngày.',
        icon: <Zap className="w-8 h-8 text-amber-500" />,
        color: 'bg-amber-50 border-amber-200'
    },
    {
        title: 'Bí Quyết Soi Lô Gan',
        slug: 'lo-gan',
        description: 'Hiểu về lô khan, cực đại lô gan và cách vào tiền thông minh khi bắt loto lâu không về.',
        icon: <Target className="w-8 h-8 text-emerald-500" />,
        color: 'bg-emerald-50 border-emerald-200'
    },
    {
        title: 'Nuôi Lô Khung 3 Ngày',
        slug: 'nuoi-lo-khung',
        description: 'Chiến thuật quản lý vốn an toàn nhất. Cách chọn số và chia tiền để luôn có lãi mỗi chu kỳ.',
        icon: <Hash className="w-8 h-8 text-purple-500" />,
        color: 'bg-purple-50 border-purple-200'
    }
];

export default function HandbookHub() {
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': siteUrl },
            { '@type': 'ListItem', 'position': 2, 'name': 'Cẩm nang soi cầu', 'item': `${siteUrl}/cam-nang-soi-cau` }
        ]
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <JsonLd data={breadcrumbSchema} />
            
            <header className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lottery-red-50 text-lottery-red-700 text-sm font-bold uppercase tracking-wider mb-4 border border-lottery-red-100 italic">
                    <Info className="w-4 h-4" /> Kiến thức là sức mạnh
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight uppercase">
                    Cẩm Nang Soi Cầu 
                    <span className="text-lottery-red-600 block md:inline md:ml-3 leading-tight underline decoration-amber-400 decoration-4 underline-offset-4">Toàn Tập 2026</span>
                </h1>
                <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                    Tổng hợp các phương pháp soi cầu kinh điển được đúc kết từ dữ liệu lịch sử và kinh nghiệm của các chuyên gia xổ số 24h.
                </p>
                <div className="w-32 h-1.5 bg-gradient-to-r from-lottery-red-600 to-amber-400 mx-auto rounded-full mt-6"></div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {guides.map((guide) => (
                    <Link 
                        key={guide.slug} 
                        href={`/cam-nang-soi-cau/${guide.slug}`}
                        className={`group p-6 rounded-2xl border-2 transition-all hover:shadow-2xl hover:-translate-y-1 block ${guide.color}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                {guide.icon}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                                    {guide.title}
                                    <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </h2>
                                <p className="text-slate-600 leading-relaxed">
                                    {guide.description}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BookOpen className="w-48 h-48 -rotate-12" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-amber-400" /> Tại sao bạn nên đọc Cẩm nang này?
                    </h3>
                    <div className="space-y-4 text-slate-300">
                        <p>Xổ số không chỉ là may rủi, đó là sự kết hợp giữa xác suất thống kê và các quy luật lặp lại. Việc nắm vững kiến thức giúp bạn:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>Quản lý vốn thông minh (tránh "tất tay").</li>
                            <li>Tăng tỷ lệ chiến thắng dựa trên dữ liệu thật.</li>
                            <li>Bình tĩnh hơn khi gặp các chu kỳ loto gan.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
