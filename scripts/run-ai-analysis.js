// Run AI Daily Analysis to generate predictions
const { AIAnalyst } = require('../src/lib/ai/analyst');

async function main() {
    console.log('🤖 Running AI Daily Analysis...\n');

    try {
        await AIAnalyst.runDailyAnalysis();
        console.log('\n✅ AI Analysis completed successfully!');
        console.log('🌐 Check http://localhost:3000/du-doan-ai now\n');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main();
