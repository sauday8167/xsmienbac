
import { getDbTomorrowStats } from '../src/lib/db-tomorrow-stats';

async function verify() {
    console.log('Starting verification for split stats logic...');

    const testNumber = '00';
    console.log(`Testing with number: ${testNumber}`);

    const stats = await getDbTomorrowStats(testNumber);
    console.log(`Found ${stats.occurrenceCount} occurrences.`);

    if (stats.occurrenceCount === 0) {
        console.log('No occurrences found.');
        return;
    }

    // Verify Head/Tail/Sum counts
    // Since these are now based ONLY on Special Prize, the sum of counts across all heads should equal exactly the number of occurrences (1 special prize per day).

    const sumCounts = (obj: any[]) => obj.reduce((a, b) => a + b.count, 0);

    const totalHeads = sumCounts(stats.heads);
    const totalTails = sumCounts(stats.tails);
    const totalSums = sumCounts(stats.sums);

    console.log('--- Verification for Head/Tail/Sum (Should equal occurrence count) ---');
    console.log(`Total Heads Count: ${totalHeads} / ${stats.occurrenceCount}`);
    console.log(`Total Tails Count: ${totalTails} / ${stats.occurrenceCount}`);
    console.log(`Total Sums Count: ${totalSums} / ${stats.occurrenceCount}`);

    if (totalHeads === stats.occurrenceCount && totalTails === stats.occurrenceCount && totalSums === stats.occurrenceCount) {
        console.log('SUCCESS: Head/Tail/Sum statistics are correctly based on single Special Prize per occurrence.');
    } else {
        console.error('FAILURE: Head/Tail/Sum statistics counts do not match occurrence count.');
    }

    // Verify Frequencies
    // Should be based on ALL prizes (~27 per day)
    const totalFreq = sumCounts(stats.frequencies);
    const expectedFreq = stats.occurrenceCount * 27;

    console.log('--- Verification for Frequencies (Should be approx 27x occurrence count) ---');
    console.log(`Total Frequency Count: ${totalFreq}`);
    console.log(`Expected Frequency Count: ${expectedFreq}`);

    if (totalFreq === expectedFreq) {
        console.log('SUCCESS: Frequency statistics are based on all prizes.');
    } else {
        console.warn(`WARNING: Frequency count ${totalFreq} differs from expected ${expectedFreq}. (Might be due to missing prizes in some historical data, checking exact match isn't strictly necessary but should be close).`);
    }
}

verify().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
