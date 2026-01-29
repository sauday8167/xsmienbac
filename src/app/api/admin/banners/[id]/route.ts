import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'src/data');
const FILE_PATH = join(DATA_DIR, 'banners.json');

interface Banner {
    id: string;
    title: string;
    image: string;
    link: string;
    position: 'header' | 'sidebar' | 'footer' | 'popup';
    status: 'active' | 'inactive';
    createdAt: string;
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const currentData: Banner[] = JSON.parse(await readFile(FILE_PATH, 'utf8'));

        const index = currentData.findIndex(b => b.id === id);
        if (index === -1) {
            return NextResponse.json({ success: false, error: 'Banner không tồn tại' }, { status: 404 });
        }

        currentData[index] = { ...currentData[index], ...body };

        await writeFile(FILE_PATH, JSON.stringify(currentData, null, 2));

        return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Lỗi khi cập nhật banner' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const currentData: Banner[] = JSON.parse(await readFile(FILE_PATH, 'utf8'));

        const newData = currentData.filter(b => b.id !== id);

        await writeFile(FILE_PATH, JSON.stringify(newData, null, 2));

        return NextResponse.json({ success: true, message: 'Xóa banner thành công' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Lỗi khi xóa banner' }, { status: 500 });
    }
}
