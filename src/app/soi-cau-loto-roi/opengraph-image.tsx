import { OGTemplate } from '@/components/OGTemplate';

export const runtime = 'edge';

export default async function Image() {
    return OGTemplate({
        title: 'Soi Cầu Loto Rơi',
        subtitle: 'Dự đoán Loto rơi từ Giải Đặc Biệt & Loto rơi từ Loto chính xác nhất',
    });
}
