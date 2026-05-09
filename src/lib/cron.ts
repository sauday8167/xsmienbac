import cron from 'node-cron';

// Main cron job handler
async function updateLotteryResults(): Promise<void> {
    console.log('Lottery result update job skipped (Live Crawler removed).');
}

import { exec } from 'child_process';
import path from 'path';

// Initialize cron jobs
export function initCronJobs(): void {
    const enableCron = process.env.ENABLE_CRON !== 'false';

    if (!enableCron) {
        console.log('Cron jobs disabled via environment variable');
        return;
    }

    console.log('🚀 Initializing Bạc Nhớ automated tasks...');

    // 1. Warm Cache at 18:45 (after 18:30 draw)
    cron.schedule('45 18 * * *', () => {
        console.log('[Cron] 🔄 Starting Scheduled Cache Warming...');
        exec('npx tsx scripts/warm-bac-nho-stats.ts', (error, stdout, stderr) => {
            if (error) console.error('[Cron] ❌ Cache warming failed:', error);
            else console.log('[Cron] ✅ Cache warming completed.');
        });
    }, { timezone: "Asia/Ho_Chi_Minh" });

    // 2. Trigger AI Predictions at 00:00
    cron.schedule('0 0 * * *', () => {
        console.log('[Cron] 🧠 Starting Scheduled AI Prediction (Midnight)...');
        exec('npx tsx scripts/fetch-bac-nho.ts', (error, stdout, stderr) => {
            if (error) console.error('[Cron] ❌ Prediction calculation failed:', error);
            else console.log('[Cron] ✅ Prediction calculation completed.');
        });
    }, { timezone: "Asia/Ho_Chi_Minh" });

    console.log('✅ Cron jobs scheduled: 18:45 (Warm) & 00:00 (Predict)');
}

// Manual trigger for testing
export async function manualUpdateLotteryResults(): Promise<void> {
    console.log('Manual update triggered (Crawler removed).');
}
