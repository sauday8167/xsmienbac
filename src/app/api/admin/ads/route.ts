import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const ADS_FILE = join(process.cwd(), 'src/data/ads.json');

// Helper to read ads
async function getAds() {
    if (!existsSync(ADS_FILE)) {
        return [];
    }
    const data = await readFile(ADS_FILE, 'utf8');
    return JSON.parse(data);
}

// Helper to save ads
async function saveAds(ads: any[]) {
    await writeFile(ADS_FILE, JSON.stringify(ads, null, 2));
}

export async function GET() {
    try {
        const ads = await getAds();
        return NextResponse.json({ success: true, data: ads });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Database Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, code, position, status } = body;

        if (!name || !code) {
            return NextResponse.json(
                { success: false, error: 'Name and Code are required' },
                { status: 400 }
            );
        }

        const ads = await getAds();
        const newAd = {
            id: Date.now().toString(),
            name,
            code,
            position: position || 'sidebar',
            status: status || 'active',
            created_at: new Date().toISOString()
        };

        ads.unshift(newAd);
        await saveAds(ads);

        return NextResponse.json({
            success: true,
            message: 'Tạo quảng cáo thành công',
            data: newAd
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
