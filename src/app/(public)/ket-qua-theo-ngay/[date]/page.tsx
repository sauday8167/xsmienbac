import { notFound } from 'next/navigation';
import ResultTable from '@/components/ResultTable';
import ResultShareBar from '@/components/ResultShareBar';
import PredictionCompare from '@/components/PredictionCompare';
import JsonLd from '@/components/seo/JsonLd';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

interface Props {
    params: {
        date: string;
    };
}

async function getResultByDate(date: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/results?date=${date}`, {
            next: { revalidate: 3600 }
        });
        const data = await res.json();
        return data.success ? data.data : null;
    } catch {
        return null;
    }
}

function extractAllLoto(result: any): string[] {
    const parseSafe = (val: any): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val.map(String);
        try { const p = JSON.parse(val); return Array.isArray(p) ? p.map(String) : [String(val)]; }
        catch { return [String(val)]; }
    };
    const all = [
        result.special_prize,
        result.prize_1,
        ...parseSafe(result.prize_2),
        ...parseSafe(result.prize_3),
        ...parseSafe(result.prize_4),
        ...parseSafe(result.prize_5),
        ...parseSafe(result.prize_6),
        ...parseSafe(result.prize_7),
    ].filter(Boolean);
    return all.map(n => String(n).slice(-2));
}

export async function generateMetadata({ params }: Props) {
    const { date } = params;
    const displayDate = date.replace(/-/g, '/');

    return {
        title: `Kết quả xổ số Miền Bắc ngày ${displayDate} - Xổ Số Miền Bắc 24h`,
        description: `Xổ Số Miền Bắc ngày ${displayDate}: Xem kết quả xổ số (XSMB) nhanh nhất, chính xác 100% trực tiếp từ trường quay hôm nay.`,
        alternates: {
            canonical: `${siteUrl}/ket-qua-theo-ngay/${date}`,
        },
        openGraph: {
            title: `Kết quả xổ số Miền Bắc ngày ${displayDate}`,
            description: `Kết quả XSMB ngày ${displayDate} chính xác 100%.`,
            url: `${siteUrl}/ket-qua-theo-ngay/${date}`,
        },
        twitter: {
            card: 'summary_large_image' as const,
            title: `Kết quả xổ số Miền Bắc ngày ${displayDate}`,
            description: `Kết quả XSMB ngày ${displayDate} chính xác 100%. Xem trực tiếp ngay.`,
        },
    };
}

export default async function DailyResultPage({ params }: Props) {
    const { date } = params;
    if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        notFound();
    }

    const parts = date.split('-');
    const apiDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // yyyy-mm-dd

    const result = await getResultByDate(apiDate);

    if (!result) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Không tìm thấy kết quả ngày {date}</h1>
                <Link href="/ket-qua-theo-ngay" className="text-blue-600 hover:underline">
                    Quay lại xem theo ngày
                </Link>
            </div>
        );
    }

    const allLoto = extractAllLoto(result);
    const displayDate = date.replace(/-/g, '/');
    const pageUrl = `${siteUrl}/ket-qua-theo-ngay/${date}`;

    const lotterySchema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": `Kết quả xổ số Miền Bắc ngày ${displayDate}`,
        "description": `Kết quả xổ số kiến thiết Miền Bắc mở thưởng ngày ${displayDate}. Giải đặc biệt: ${result.special_prize}`,
        "startDate": result.draw_date,
        "location": { "@type": "Place", "name": "Hà Nội, Việt Nam" },
        "organizer": { "@type": "Organization", "name": "Xổ Số Kiến Thiết Thủ Đô", "url": "https://xosomienbac24h.com" },
        "url": pageUrl,
        "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <JsonLd data={lotterySchema} />

            <div className="flex flex-col items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-lottery-red-700 text-center mb-2">
                    KẾT QUẢ XỔ SỐ MIỀN BẮC NGÀY {displayDate}
                </h1>
                <div className="w-24 h-1 bg-gray-200 rounded-full"></div>
            </div>

            {/* Share bar */}
            <ResultShareBar drawDate={displayDate} specialPrize={result.special_prize} shareUrl={pageUrl} />

            <ResultTable result={result} />

            {/* Prediction comparison */}
            <PredictionCompare apiDate={apiDate} specialPrize={result.special_prize} allLoto={allLoto} />

            <div className="mt-8 text-center">
                <Link
                    href="/ket-qua-theo-ngay"
                    className="inline-block px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors"
                >
                    ← Xem ngày khác
                </Link>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed text-justify">
                <p>
                    Kết quả xổ số Miền Bắc ngày <strong>{displayDate}</strong> được cập nhật trực tiếp từ trường quay số.
                    Để xem lại kết quả của các ngày trước, vui lòng chọn ngày mong muốn tại trang tra cứu theo ngày.
                    Kết quả được lưu trữ vĩnh viễn giúp bạn dễ dàng tra cứu và soi cầu bạc nhớ cho các kỳ quay tiếp theo.
                </p>
            </div>
        </div>
    );
}
