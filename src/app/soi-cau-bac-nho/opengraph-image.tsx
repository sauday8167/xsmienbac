import { OGTemplate } from '@/components/OGTemplate';

export const runtime = 'edge';

export default async function Image() {
    return OGTemplate({
        title: 'Soi Cầu Bạc Nhớ',
        subtitle: 'Thống kê bạc nhớ lô tô, lô kép, đầu đuôi câm chính xác',
    });
}
