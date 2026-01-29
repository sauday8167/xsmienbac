import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const ADS_FILE = join(process.cwd(), 'src/data/ads.json');

async function getAds() {
    if (!existsSync(ADS_FILE)) return [];
    const data = await readFile(ADS_FILE, 'utf8');
    return JSON.parse(data);
}

async function saveAds(ads: any[]) {
    await writeFile(ADS_FILE, JSON.stringify(ads, null, 2));
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { name, code, position, status } = body;

        const ads = await getAds();
        const index = ads.findIndex((a: any) => a.id === id);

        if (index === -1) {
            return NextResponse.json(
                { success: false, error: 'Ad not found' },
                { status: 404 }
            );
        }

        ads[index] = { ...ads[index], name, code, position, status };
        await saveAds(ads);

        return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const ads = await getAds();
        const filtered = ads.filter((a: any) => a.id !== id);

        await saveAds(filtered);

        return NextResponse.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
