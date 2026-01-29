
import { AIAnalyst } from '@/lib/ai/analyst';

async function main() {
    console.log('Starting AI Daily Analysis...');
    try {
        await AIAnalyst.runDailyAnalysis();
        console.log('AI Analysis finished successfully.');
        process.exit(0);
    } catch (error) {
        console.error('AI Analysis crashed:', error);
        process.exit(1);
    }
}

main();
