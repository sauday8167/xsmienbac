import { OGTemplate } from '@/components/OGTemplate';

export const runtime = 'edge';

export default async function Image() {
    return OGTemplate({
        title: 'Soi Cầu Giải Đặc Biệt',
        subtitle: 'Dự đoán giải đặc biệt, dàn đề bất bại hôm nay',
    });
}
