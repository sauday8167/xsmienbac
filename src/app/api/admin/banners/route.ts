import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'src/data');
const FILE_PATH = join(DATA_DIR, 'banners.json');

// Interface for Banner
export interface Banner {
    id: string;
    title: string;
    image: string;
    link: string;
    position: 'header' | 'sidebar' | 'footer' | 'popup';
    status: 'active' | 'inactive';
    createdAt: string;
}

// Ensure file exists
async function ensureFile() {
    if (!existsSync(DATA_DIR)) {
        await mkdir(DATA_DIR, { recursive: true });
    }
    if (!existsSync(FILE_PATH)) {
        await writeFile(FILE_PATH, JSON.stringify([], null, 2));
    }
}

// GET: List all banners
export async function GET() {
    await ensureFile();
    try {
        const data = await readFile(FILE_PATH, 'utf8');
        return NextResponse.json({ success: true, data: JSON.parse(data) });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Lỗi khi tải danh sách banner' }, { status: 500 });
    }
}

// POST: Create new banner
export async function POST(request: Request) {
    await ensureFile();
    try {
        const body = await request.json();
        const { title, image, link, position, status } = body;

        if (!title || !image) {
            return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        const currentData: Banner[] = JSON.parse(await readFile(FILE_PATH, 'utf8'));

        const newBanner: Banner = {
            id: Date.now().toString(),
            title,
            image,
            link: link || '#',
            position: position || 'sidebar',
            status: status || 'active',
            createdAt: new Date().toISOString()
        };

        const newData = [newBanner, ...currentData];
        await writeFile(FILE_PATH, JSON.stringify(newData, null, 2));

        return NextResponse.json({ success: true, message: 'Tạo banner thành công', data: newBanner });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Lỗi khi tạo banner' }, { status: 500 });
    }
}

// PUT: Update banner status or info (Not yet full CRUD, just basic implementation needed?)
// Actually lets implement Delete for managing.
