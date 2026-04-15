import { initCronJobs } from '../lib/cron';

// Initialize cron jobs when server starts - Skip during build phase
if (process.env.NODE_ENV !== 'test' && process.env.NEXT_PHASE !== 'phase-production-build') {
    // Only initialize if we are NOT in the Next.js build phase
    if (typeof window === 'undefined') {
        console.log('Initializing cron jobs (Server Side)...');
        initCronJobs();
    }
}

export { };
