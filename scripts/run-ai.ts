
import { AIAnalyst } from '@/lib/ai/analyst';

async function main() {
    const targetDate = process.argv[2]; // Lấy ngày từ command line nếu có
    console.log(`Starting AI Daily Analysis for ${targetDate || 'Today'}...`);
    try {
        await AIAnalyst.runDailyAnalysis(targetDate, 'du-doan-3-số');
        console.log('AI Analysis finished successfully.');
        process.exit(0);
    } catch (error) {
        console.error('AI Analysis crashed:', error);
        process.exit(1);
    }
}

main();
