import { NextResponse } from 'next/server';
import { readdir, stat, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET() {
    try {
        const uploadDir = join(process.cwd(), 'public/uploads');

        if (!existsSync(uploadDir)) {
            return NextResponse.json({ success: true, data: [] });
        }

        const files = await readdir(uploadDir);

        const mediaFiles = await Promise.all(
            files.map(async (file) => {
                const filePath = join(uploadDir, file);
                try {
                    const stats = await stat(filePath);
                    return {
                        name: file,
                        url: `/uploads/${file}`,
                        size: stats.size,
                        created_at: stats.birthtime
                    };
                } catch (e) {
                    return null;
                }
            })
        );

        // Filter images only and sort by date desc
        const images = mediaFiles
            .filter((f): f is NonNullable<typeof f> => f !== null && /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name))
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

        return NextResponse.json({ success: true, data: images });
    } catch (error) {
        console.error('List media error:', error);
        return NextResponse.json({ success: false, error: 'Lỗi khi lấy danh sách ảnh' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 });
        }

        console.log(`[Media Delete] Request to delete: ${filename}`);

        const safeFilename = require('path').basename(filename);
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        const filepath = join(uploadDir, safeFilename);

        console.log(`[Media Delete] Attempting to delete: ${filepath}`);

        if (existsSync(filepath)) {
            await unlink(filepath);
            console.log(`[Media Delete] Deleted successfully: ${filepath}`);
            return NextResponse.json({ success: true, message: 'Xóa ảnh thành công' });
        } else {
            // Check if file has a timestamp prefix and try to match it
            console.warn(`[Media Delete] File not found: ${filepath}`);
            return NextResponse.json({ success: false, error: `File không tồn tại: ${safeFilename}` }, { status: 404 });
        }
    } catch (error: any) {
        console.error('[Media Delete] Error:', error);
        return NextResponse.json({ success: false, error: 'Lỗi khi xóa ảnh: ' + error.message }, { status: 500 });
    }
}
