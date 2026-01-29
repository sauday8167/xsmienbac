import { OGTemplate } from '@/components/OGTemplate';

export const runtime = 'edge';

export default async function Image() {
    return OGTemplate({
        title: 'Bạc Nhớ Nuôi Khung 3 Ngày',
        subtitle: 'Phương pháp nuôi lô khung 3 ngày bất bại, tỷ lệ trúng cao',
    });
}
