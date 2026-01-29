import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const FILE_PATH = join(process.cwd(), 'src/data/branding.json');

async function getBranding() {
    if (!existsSync(FILE_PATH)) {
        return { logo: '', favicon: '', siteName: '' };
    }
    const data = await readFile(FILE_PATH, 'utf8');
    return JSON.parse(data);
}

export async function GET() {
    try {
        const data = await getBranding();
        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await writeFile(FILE_PATH, JSON.stringify(body, null, 2));
        return NextResponse.json({ success: true, data: body });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
