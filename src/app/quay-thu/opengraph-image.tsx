import { OGTemplate } from '@/components/OGTemplate';

export const runtime = 'edge';

export default async function Image() {
    return OGTemplate({
        title: 'Quay Thử Xổ Số',
        subtitle: 'Quay thử XSMB giờ hoàng đạo, lấy hên trúng lớn mỗi ngày',
    });
}
