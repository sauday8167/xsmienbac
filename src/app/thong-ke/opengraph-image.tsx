import { OGTemplate } from '@/components/OGTemplate';

export const runtime = 'edge';

export default async function Image() {
    return OGTemplate({
        title: 'Thống Kê Loto',
        subtitle: 'Phân tích tần suất, nhịp loto, lô gan và các bộ số đẹp',
    });
}
