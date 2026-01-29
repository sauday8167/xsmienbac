import cron from 'node-cron';

// Main cron job handler
async function updateLotteryResults(): Promise<void> {
    console.log('Lottery result update job skipped (Live Crawler removed).');
}

// Initialize cron jobs
export function initCronJobs(): void {
    const enableCron = process.env.ENABLE_CRON !== 'false';

    if (!enableCron) {
        console.log('Cron jobs disabled via environment variable');
        return;
    }

    console.log('Cron initialized but no active jobs are configured.');
}

// Manual trigger for testing
export async function manualUpdateLotteryResults(): Promise<void> {
    console.log('Manual update triggered (Crawler removed).');
}
