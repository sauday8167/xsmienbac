import { OGTemplate } from '@/components/OGTemplate';

export const runtime = 'edge';

export default async function Image() {
    return OGTemplate({
        title: 'Tạo Dàn Xổ Số',
        subtitle: 'Công cụ tạo dàn đề, dàn lô, ghép xiên tự động chuyên nghiệp',
    });
}
