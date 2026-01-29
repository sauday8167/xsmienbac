import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'src/data');
const FILE_PATH = join(DATA_DIR, 'seo-config.json');

const DEFAULT_CONFIG = {
    siteName: 'Xổ Số Miền Bắc',
    homeTitle: 'XSMB - Kết quả xổ số miền Bắc hôm nay - SXMB',
    homeDescription: 'Trực tiếp kết quả xổ số miền Bắc (XSMB) hôm nay nhanh và chính xác nhất. Xem lại KQXS miền Bắc các ngày trước đó, thống kê, soi cầu miễn phí.',
    keywords: 'xsmb, xổ số miền bắc, sxmb, kqxs miền bắc, kết quả xổ số',
    ogImage: '/logo-v5.png',
    siteUrl: 'https://xosomienbac24h.com',
    googleAnalyticsId: '',
    social: {
        facebook: '',
        youtube: '',
        zalo: ''
    }
};

async function ensureFile() {
    if (!existsSync(DATA_DIR)) {
        await mkdir(DATA_DIR, { recursive: true });
    }
    if (!existsSync(FILE_PATH)) {
        await writeFile(FILE_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    }
}

export async function GET() {
    await ensureFile();
    try {
        const data = await readFile(FILE_PATH, 'utf8');
        return NextResponse.json({ success: true, data: JSON.parse(data) });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Lỗi khi tải cấu hình' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await ensureFile();
    try {
        const body = await request.json();
        const currentData = JSON.parse(await readFile(FILE_PATH, 'utf8'));
        const newData = { ...currentData, ...body };

        await writeFile(FILE_PATH, JSON.stringify(newData, null, 2));
        return NextResponse.json({ success: true, message: 'Lưu cấu hình thành công', data: newData });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Lỗi khi lưu cấu hình' }, { status: 500 });
    }
}
