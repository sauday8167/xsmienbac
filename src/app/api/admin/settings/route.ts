import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const SETTINGS_FILE = join(process.cwd(), 'src/data/settings.json');

// Default settings
const DEFAULT_SETTINGS = {
    site_name: 'XSMB Trực Tuyến',
    site_description: 'Kết quả xổ số miền Bắc nhanh nhất, chính xác nhất',
    contact_email: 'contact@example.com',
    contact_phone: '0912345678',
    maintenance_mode: false,
    theme_color: '#EF4444',
    social_facebook: '',
    social_zalo: '',
    social_telegram: '',
    proxies: [] as string[]
};

async function getSettings() {
    if (!existsSync(SETTINGS_FILE)) {
        await writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
        return DEFAULT_SETTINGS;
    }
    const data = await readFile(SETTINGS_FILE, 'utf8');
    const parsed = JSON.parse(data);

    // Migration: proxy_url -> proxies
    if (parsed.proxy_url && (!parsed.proxies || parsed.proxies.length === 0)) {
        parsed.proxies = [parsed.proxy_url];
        delete parsed.proxy_url;
    }

    return { ...DEFAULT_SETTINGS, ...parsed };
}

export async function GET() {
    try {
        const settings = await getSettings();
        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const current = await getSettings();
        const updated = { ...current, ...body };

        await writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2));

        return NextResponse.json({
            success: true,
            message: 'Lưu cài đặt thành công',
            data: updated
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
