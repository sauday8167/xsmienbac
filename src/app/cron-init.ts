import { initCronJobs } from '../lib/cron';

// Initialize cron jobs when server starts
if (process.env.NODE_ENV !== 'test') {
    console.log('Initializing cron jobs...');
    initCronJobs();
}

export { };
