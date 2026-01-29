import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'src/data');
const FILE_PATH = join(DATA_DIR, 'sidebar-config.json');

const DEFAULT_SIDEBAR = [
    { id: 's1', href: '/ket-qua-theo-ngay', label: 'Kết quả theo ngày', icon: 'calendar' },
    { id: 's2', href: '/thong-ke', label: 'Thống kê lô tô', icon: 'chart' },
    { id: 's3', href: '/do-ve-so', label: 'Dò vé số', icon: 'check' },
    { id: 's4', href: '/quay-thu', label: 'Quay thử số', icon: 'refresh' },
    { id: 's5', href: '/du-doan', label: 'Tần Suất Lô Tô', icon: 'bulb' }
];

async function ensureFile() {
    if (!existsSync(DATA_DIR)) {
        await mkdir(DATA_DIR, { recursive: true });
    }
    if (!existsSync(FILE_PATH)) {
        await writeFile(FILE_PATH, JSON.stringify(DEFAULT_SIDEBAR, null, 2));
    }
}

export async function GET() {
    await ensureFile();
    try {
        const data = await readFile(FILE_PATH, 'utf8');
        return NextResponse.json({ success: true, data: JSON.parse(data) });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Lỗi khi tải sidebar' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await ensureFile();
    try {
        const body = await request.json();
        await writeFile(FILE_PATH, JSON.stringify(body, null, 2));
        return NextResponse.json({ success: true, message: 'Lưu sidebar thành công', data: body });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Lỗi khi lưu sidebar' }, { status: 500 });
    }
}
