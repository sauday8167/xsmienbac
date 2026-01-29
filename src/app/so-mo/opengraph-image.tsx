import { OGTemplate } from '@/components/OGTemplate';

export const runtime = 'edge';

export default async function Image() {
    return OGTemplate({
        title: 'Sổ Mơ Lô Đề',
        subtitle: 'Tra cứu ý nghĩa giấc mơ, giải mã điềm báo và con số may mắn',
    });
}
