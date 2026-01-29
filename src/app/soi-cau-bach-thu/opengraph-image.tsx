import { OGTemplate } from '@/components/OGTemplate';

export const runtime = 'edge';

export default async function Image() {
    return OGTemplate({
        title: 'Soi Cầu Bạch Thủ',
        subtitle: 'Chốt số bạch thủ lô duy nhất, cầu chạy ổn định',
    });
}
