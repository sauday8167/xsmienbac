
import { getPrize1TomorrowStats } from '../src/lib/prize1-tomorrow-stats';

async function verify() {
    console.log('Starting verification for Prize 1 split stats logic...');

    // Pick a number that likely has history (e.g. 00, 15, 99)
    const testNumber = '15';
    console.log(`Testing with number: ${testNumber}`);

    const stats = await getPrize1TomorrowStats(testNumber);
    console.log(`Found ${stats.occurrenceCount} occurrences.`);

    if (stats.occurrenceCount === 0) {
        console.log('No occurrences found.');
        return;
    }

    // Verify Head/Tail/Sum counts (Should match occurrence count since they are Prize 1 only)
    const sumCounts = (obj: any[]) => obj.reduce((a, b) => a + b.count, 0);

    const totalHeads = sumCounts(stats.heads);
    const totalTails = sumCounts(stats.tails);
    const totalSums = sumCounts(stats.sums);

    console.log('--- Verification for Head/Tail/Sum (Should equal occurrence count) ---');
    console.log(`Total Heads Count: ${totalHeads} / ${stats.occurrenceCount}`);
    console.log(`Total Tails Count: ${totalTails} / ${stats.occurrenceCount}`);
    console.log(`Total Sums Count: ${totalSums} / ${stats.occurrenceCount}`);

    if (totalHeads === stats.occurrenceCount && totalTails === stats.occurrenceCount && totalSums === stats.occurrenceCount) {
        console.log('SUCCESS: Head/Tail/Sum statistics are strictly based on single Prize 1 per occurrence.');
    } else {
        console.error('FAILURE: Head/Tail/Sum statistics counts do not match occurrence count.');
    }

    // Verify Frequencies (Should be approx 27x occurrence count)
    const totalFreq = sumCounts(stats.frequencies);
    const expectedFreq = stats.occurrenceCount * 27;

    console.log('--- Verification for Frequencies (Should be approx 27x occurrence count) ---');
    console.log(`Total Frequency Count: ${totalFreq}`);
    console.log(`Expected Frequency Count: ${expectedFreq}`);

    if (totalFreq === expectedFreq) {
        console.log('SUCCESS: Frequency statistics are based on all prizes.');
    } else {
        console.warn(`WARNING: Frequency count ${totalFreq} differs from expected ${expectedFreq}. (Likely acceptable if historical data had missed entries, but should be close).`);
        console.log(`Difference: ${expectedFreq - totalFreq}`);
    }
}

verify().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
