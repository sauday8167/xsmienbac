import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET() {
    try {
        // parallel fetches
        const stats = {
            views: 0,
            posts: 0,
            results: 0,
            users: 0,
            banners: 0
        };

        // 1. Get Views & Posts Count
        const postStats = await query<RowDataPacket[]>(
            'SELECT COUNT(*) as total, SUM(views) as total_views FROM posts'
        );
        stats.posts = postStats[0].total || 0;
        stats.views = postStats[0].total_views || 0;

        // 2. Get Results Count
        const resultStats = await query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM xsmb_results'
        );
        stats.results = resultStats[0].total || 0;

        // 3. Get Users Count
        const userStats = await query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM admins'
        );
        stats.users = userStats[0].total || 0;

        // 5. Get Recent Activity (Mixed Posts & Predictions)
        const recentPosts = await query(
            `SELECT id, title, created_at, 'post' as type FROM posts ORDER BY created_at DESC LIMIT 5`
        );

        const recentPredictions = await query(
            `SELECT id, draw_date, created_at, 'prediction' as type FROM ai_predictions ORDER BY created_at DESC LIMIT 5`
        );

        // Combine and Sort
        const recentActivity = [...recentPosts, ...recentPredictions]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);

        // 6. System Health Checks
        // API Keys Status
        const keyStats = await query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(error_count) as total_errors
             FROM api_keys`
        );

        const systemHealth = {
            database: 'Connected',
            apiKeys: {
                total: keyStats[0].total || 0,
                active: keyStats[0].active || 0,
                errors: keyStats[0].total_errors || 0
            },
            storage: 'Normal' // Placeholder, hard to get real disk usage in node w/o exec
        };

        return NextResponse.json({
            success: true,
            data: {
                ...stats,
                recentActivity,
                systemHealth
            }
        });
    } catch (error) {
        console.error('Stats Error:', error);
        // Fallback or error
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch stats',
            data: { views: 0, posts: 0, results: 0, users: 0, banners: 0 } // Fallback
        });
    }
}
