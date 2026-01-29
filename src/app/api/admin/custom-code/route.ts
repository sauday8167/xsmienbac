import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'src/data/custom-code.json');

export async function GET() {
    try {
        if (!fs.existsSync(configPath)) {
            return NextResponse.json({ header: '', footer: '' });
        }
        const data = fs.readFileSync(configPath, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json({ header: '', footer: '' });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { header, footer } = body;

        fs.writeFileSync(configPath, JSON.stringify({ header, footer }, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
    }
}
