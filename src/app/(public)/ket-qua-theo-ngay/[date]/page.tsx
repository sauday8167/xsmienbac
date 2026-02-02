import { notFound } from 'next/navigation';
import ResultTable from '@/components/ResultTable';
import JsonLd from '@/components/seo/JsonLd';
import Link from 'next/link';

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
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params }: Props) {
    const { date } = params;
    // Format date from dd-mm-yyyy to dd/mm/yyyy
    const displayDate = date.replace(/-/g, '/');

    return {
        title: `Kết quả xổ số Miền Bắc ngày ${displayDate} - Xổ Số Miền Bắc`,
        description: `Xem kết quả xổ số Miền Bắc (XSMB) ngày ${displayDate}. Tường thuật trực tiếp KQXS Miền Bắc chính xác, nhanh nhất từ trường quay.`,
        openGraph: {
            title: `Kết quả xổ số Miền Bắc ngày ${displayDate}`,
            description: `Kết quả XSMB ngày ${displayDate} chính xác 100%.`,
        }
    };
}

export default async function DailyResultPage({ params }: Props) {
    const { date } = params;
    // Validate date format dd-mm-yyyy
    if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        notFound();
    }

    // Convert dd-mm-yyyy to yyyy-mm-dd for API call if needed, 
    // but our API seems to handle both or we should standardize.
    // Based on previous code, let's assume API handles yyyy-mm-dd.
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

    // Lottery Schema
    const lotterySchema = {
        "@context": "https://schema.org",
        "@type": "Lottery",
        "name": `Kết quả xổ số Miền Bắc ngày ${date.replace(/-/g, '/')}`,
        "offeredBy": {
            "@type": "Organization",
            "name": "Xổ Số Kiến Thiết Miền Bắc"
        },
        "description": `Kết quả xổ số kiến thiết Miền Bắc mở thưởng ngày ${date.replace(/-/g, '/')}`,
        "significantLink": `${process.env.NEXT_PUBLIC_SITE_URL}/ket-qua-theo-ngay/${date}`,
        "datePublished": result.draw_date,
        "price": "10000 VND"
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <JsonLd data={lotterySchema} />

            <div className="flex flex-col items-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-lottery-red-700 text-center mb-2">
                    KẾT QUẢ XỔ SỐ MIỀN BẮC NGÀY {date.replace(/-/g, '/')}
                </h1>
                <div className="w-24 h-1 bg-gray-200 rounded-full"></div>
            </div>

            <ResultTable result={result} />

            <div className="mt-8 text-center">
                <Link
                    href="/ket-qua-theo-ngay"
                    className="inline-block px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors"
                >
                    ← Xem ngày khác
                </Link>
            </div>

            {/* SEO Content */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed text-justify">
                <p>
                    Kết quả xổ số Miền Bắc ngày <strong>{date.replace(/-/g, '/')}</strong> được cập nhật trực tiếp từ trường quay số.
                    Để xem lại kết quả của các ngày trước, vui lòng chọn ngày mong muốn tại trang tra cứu theo ngày.
                    Kết quả được lưu trữ vĩnh viễn giúp bạn dễ dàng tra cứu và soi cầu bạc nhớ cho các kỳ quay tiếp theo.
                </p>
            </div>
        </div>
    );
}
