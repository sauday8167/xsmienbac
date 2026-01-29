import { AIAnalyst } from '../src/lib/ai/analyst';

async function runCheck() {
    console.log('Starting accuracy check for recent days...');

    // Check for last 7 days
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        console.log(`Checking ${dateStr}...`);
        await AIAnalyst.checkAccuracy(dateStr);
    }

    console.log('Done.');
    process.exit(0);
}

runCheck();
