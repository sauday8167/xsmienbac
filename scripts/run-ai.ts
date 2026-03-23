
import { AIAnalyst } from '@/lib/ai/analyst';

async function main() {
    const targetDate = process.argv[2] === 'null' ? undefined : process.argv[2];
    const mode = process.argv[3] as any; // 'hoi-dong' | 'du-doan-3-số'

    try {
        if (mode) {
            console.log(`Starting AI Analysis (${mode}) for ${targetDate || 'Upcoming'}...`);
            await AIAnalyst.runDailyAnalysis(targetDate, mode);
        } else {
            console.log(`Starting Full AI Analysis (Both Models) for ${targetDate || 'Upcoming'}...`);
            await AIAnalyst.runDailyAnalysis(targetDate, 'hoi-dong');
            await AIAnalyst.runDailyAnalysis(targetDate, 'du-doan-3-số');
        }
        console.log('AI Analysis finished successfully.');
        process.exit(0);
    } catch (error) {
        console.error('AI Analysis failed:', error);
        process.exit(1);
    }
}

main();
