import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ success: false, error: 'Vui lòng cung cấp URL hình ảnh' }, { status: 400 });
        }

        // Fetch the image with User-Agent to avoid blocking
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, error: `Lỗi tải ảnh: ${response.status} ${response.statusText}` }, { status: 400 });
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            return NextResponse.json({ success: false, error: 'URL không phải là hình ảnh hợp lệ' }, { status: 400 });
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        // Determine extension
        let extension = 'jpg';
        if (contentType.includes('png')) extension = 'png';
        else if (contentType.includes('gif')) extension = 'gif';
        else if (contentType.includes('webp')) extension = 'webp';
        else if (contentType.includes('jpeg')) extension = 'jpg';

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public/uploads');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate filename
        const timestamp = Date.now();
        const filename = `${timestamp}-downloaded.${extension}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        return NextResponse.json({
            success: true,
            data: {
                url: `/uploads/${filename}`,
                filename,
                size: buffer.length,
                type: contentType
            }
        });

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ success: false, error: `Lỗi: ${String(error)}` }, { status: 500 });
    }
}
