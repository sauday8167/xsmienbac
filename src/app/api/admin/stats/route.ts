import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Get Posts Stats
        const postsStats = await queryOne<{ total: number; total_views: number }>(
            'SELECT COUNT(*) as total, SUM(views) as total_views FROM posts WHERE status != ?',
            ['deleted']
        );

        // 2. Get Users Stats if table exists, otherwise mock or count admins
        let usersCount = 0;
        try {
            const userStats = await queryOne<{ total: number }>('SELECT COUNT(*) as total FROM users');
            usersCount = userStats?.total || 0;
        } catch (e) {
            // Table might not exist or auth is handled differently
            usersCount = 1; // At least one admin
        }

        // 3. Get Ads Stats from JSON
        let adsCount = 0;
        try {
            const adsPath = join(process.cwd(), 'src/data/adsense.json');
            const adsContent = await readFile(adsPath, 'utf8');
            const adsConfig = JSON.parse(adsContent);
            // Count keys in placeholders or slots object
            adsCount = Object.keys(adsConfig.slots || {}).length;
        } catch (e) {
            // file not found
        }

        return NextResponse.json({
            success: true,
            data: {
                posts: postsStats?.total || 0,
                views: postsStats?.total_views || 0,
                users: usersCount,
                ads: adsCount
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
