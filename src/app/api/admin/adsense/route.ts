import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const CONFIG_FILE = join(process.cwd(), 'src/data/adsense.json');

// Helper to ensure file exists
async function ensureConfigFile() {
    if (!existsSync(CONFIG_FILE)) {
        const initialConfig = {
            publisherId: 'ca-pub-0000000000000000',
            slots: {
                header_top: '',
                sidebar_top: '',
                sidebar_sticky: '',
                article_below_title: '',
                article_middle: '',
                article_bottom_multiplex: '',
                mobile_anchor: ''
            },
            showTestPlaceholders: false
        };
        await writeFile(CONFIG_FILE, JSON.stringify(initialConfig, null, 4));
    }
}

export async function GET() {
    try {
        await ensureConfigFile();
        const data = await readFile(CONFIG_FILE, 'utf8');
        return NextResponse.json({ success: true, data: JSON.parse(data) });
    } catch (error) {
        console.error('Error reading adsense config:', error);
        return NextResponse.json({ success: false, error: 'Failed to load configuration' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.publisherId || !body.slots) {
            return NextResponse.json({ success: false, error: 'Invalid configuration data' }, { status: 400 });
        }

        await writeFile(CONFIG_FILE, JSON.stringify(body, null, 4));
        return NextResponse.json({ success: true, message: 'Configuration saved successfully' });
    } catch (error) {
        console.error('Error saving adsense config:', error);
        return NextResponse.json({ success: false, error: 'Failed to save configuration' }, { status: 500 });
    }
}
