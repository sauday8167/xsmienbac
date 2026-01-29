import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'src/data');
const FILE_PATH = join(DATA_DIR, 'menu-config.json');

const DEFAULT_MENU_ITEMS = [
    { id: '1', href: '/', label: 'Trang chủ', description: 'Trang chủ' },
    { id: '2', href: '/ket-qua-theo-ngay', label: 'Kết quả theo ngày', description: 'Xem KQXS theo ngày' },
    { id: '3', href: '/thong-ke', label: 'Thống kê', description: 'Thống kê lô tô' },
    { id: '4', href: '/tin-tuc', label: 'Tin tức / Soi cầu', description: 'Tin tức xổ số' },
    { id: '5', href: '/quay-thu', label: 'Quay thử', description: 'Quay thử kết quả' },
    { id: '6', href: '/do-ve-so', label: 'Dò vé số', description: 'Dò vé số online' }
];

const DEFAULT_CONFIG = {
    desktop: DEFAULT_MENU_ITEMS,
    mobile: DEFAULT_MENU_ITEMS
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
        const fileContent = await readFile(FILE_PATH, 'utf8');
        let data = JSON.parse(fileContent);

        // Backward compatibility: If data is an array, wrap it
        if (Array.isArray(data)) {
            data = {
                desktop: data,
                mobile: [...data] // Clone for start
            };
            // Optionally save the migration immediately, but reading is enough for now
        }

        // Ensure both keys exist
        if (!data.desktop) data.desktop = [];
        if (!data.mobile) data.mobile = [];

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Lỗi khi tải menu' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await ensureFile();
    try {
        const body = await request.json();

        // Validate structure (minimal)
        if (!body.desktop || !Array.isArray(body.desktop)) {
            return NextResponse.json({ success: false, error: 'Dữ liệu không hợp lệ (thiếu desktop)' }, { status: 400 });
        }
        if (!body.mobile || !Array.isArray(body.mobile)) {
            // If mobile missing, init with empty or copy desktop? Let's just default to empty if missing to be safe
            body.mobile = body.mobile || [];
        }

        await writeFile(FILE_PATH, JSON.stringify(body, null, 2));
        return NextResponse.json({ success: true, message: 'Lưu menu thành công', data: body });
    } catch (error) {
        console.error('Save menu error:', error);
        return NextResponse.json({ success: false, error: 'Lỗi khi lưu menu' }, { status: 500 });
    }
}
