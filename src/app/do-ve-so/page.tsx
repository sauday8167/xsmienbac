import { Metadata } from 'next';
import CheckTicketClient from './CheckTicketClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Dò Vé Số Online - Kiểm Tra Kết Quả Xổ Số Nhanh Nhất',
    description: 'Công cụ dò vé số trực tuyến giúp bạn kiểm tra kết quả xổ số kiến thiết nhanh chóng, chính xác. Chỉ cần nhập số vé để biết ngay kết quả trúng thưởng.',
    alternates: {
        canonical: `${siteUrl}/do-ve-so`,
    },
    openGraph: {
        title: 'Dò Vé Số Trực Tuyến - Tra Cứu Trúng Thưởng XSMB',
        description: 'Kiểm tra vé số của bạn có trúng giải hay không một cách dễ dàng và nhanh chóng.',
        url: `${siteUrl}/do-ve-so`,
        type: 'website',
    }
};

export default function CheckTicketPage() {
    return <CheckTicketClient />;
}
