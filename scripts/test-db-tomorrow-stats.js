// Test script to verify the updated db-tomorrow-stats logic
const path = require('path');

// Set up the environment
process.env.NODE_ENV = 'development';

async function testDbTomorrowStats() {
    console.log('Testing updated db-tomorrow-stats logic...\n');

    try {
        // Import the function
        const { getDbTomorrowStats } = require('../src/lib/db-tomorrow-stats');

        // Test with a sample number
        const testNumber = '82';
        console.log(`Testing with number: ${testNumber}`);
        console.log('=====================================\n');

        const result = await getDbTomorrowStats(testNumber);

        console.log(`Target Number: ${result.targetNumber}`);
        console.log(`Occurrence Count: ${result.occurrenceCount}\n`);

        console.log('Top 10 Most Frequent Numbers (from ALL loto numbers):');
        console.log('----------------------------------------------------');
        result.frequencies.slice(0, 10).forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.number} - ${item.count} lần`);
        });

        console.log('\nTop 5 Head Numbers:');
        console.log('--------------------');
        result.heads.slice(0, 5).forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.number} - ${item.count} lần`);
        });

        console.log('\nTop 5 Tail Numbers:');
        console.log('--------------------');
        result.tails.slice(0, 5).forEach((item, idx) => {
            console.log(`${idx + 1}. ${item.number} - ${item.count} lần`);
        });

        console.log('\nTop 5 Sum Values:');
        console.log('------------------');
        result.sums.slice(0, 5).forEach((item, idx) => {
            console.log(`${idx + 1}. Tổng ${item.number} - ${item.count} lần`);
        });

        console.log('\nFirst 3 Historical Occurrences:');
        console.log('--------------------------------');
        result.history.slice(0, 3).forEach((record, idx) => {
            console.log(`${idx + 1}. Date: ${record.date}`);
            console.log(`   Original Special: ${record.originalSpecial}`);
            console.log(`   Next Date: ${record.nextDate}`);
            console.log(`   Next Special: ${record.nextSpecial}`);
            console.log('');
        });

        console.log('\n✅ Test completed successfully!');
        console.log('\nNote: The frequency counts should now be MUCH HIGHER');
        console.log('because we are analyzing ALL loto numbers (~27 per draw)');
        console.log('instead of just 1 number (special prize last 2 digits).');

        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testDbTomorrowStats();
