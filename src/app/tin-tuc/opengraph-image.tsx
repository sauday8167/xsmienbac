import { OGTemplate } from '@/components/OGTemplate';

export const runtime = 'edge';

export default async function Image() {
    return OGTemplate({
        title: 'Tin Tức & Soi Cầu',
        subtitle: 'Tổng hợp nhận định, dự đoán và kinh nghiệm soi cầu Xổ số Miền Bắc',
    });
}
