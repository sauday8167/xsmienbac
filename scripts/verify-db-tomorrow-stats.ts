
import { getDbTomorrowStats } from '../src/lib/db-tomorrow-stats';
import { query } from '../src/lib/db';

async function verify() {
    console.log('Starting verification...');

    // 1. Pick a test number
    const testNumber = '00'; // Let's test with '00'
    console.log(`Testing with Special Prize ending in: ${testNumber}`);

    // 2. Run the actual function
    const stats = await getDbTomorrowStats(testNumber);
    console.log(`Found ${stats.occurrenceCount} historical occurrences.`);

    if (stats.occurrenceCount === 0) {
        console.log('No occurrences found. Try a different number.');
        return;
    }

    // 3. Manual verification for the first occurrence
    const firstOccurrence = stats.history[0];
    console.log('Verifying first occurrence:', firstOccurrence);

    if (!firstOccurrence.nextDate) {
        console.log('No next date for this occurrence, skipping manual check.');
        return;
    }

    // Fetch the full record for the next day
    const nextDayRecord = await query<any[]>(
        'SELECT * FROM xsmb_results WHERE draw_date = ?',
        [firstOccurrence.nextDate]
    );

    if (!nextDayRecord || nextDayRecord.length === 0) {
        console.error('Could not find next day record manually!');
        return;
    }

    const row = nextDayRecord[0];
    console.log('Next day record found:', row.draw_date);

    // Helper to extract lotos manually
    const lotos: string[] = [];
    const add = (val: string) => {
        if (val && val.length >= 2) lotos.push(val.trim().slice(-2));
    }

    add(row.special_prize);
    add(row.prize_1);
    const parse = (json: string) => {
        try {
            JSON.parse(json).forEach((v: string) => add(v));
        } catch (e) { }
    }
    parse(row.prize_2);
    parse(row.prize_3);
    parse(row.prize_4);
    parse(row.prize_5);
    parse(row.prize_6);
    parse(row.prize_7);

    console.log(`Manually extracted ${lotos.length} loto numbers from ${row.draw_date}`);
    console.log('Lotos:', lotos.join(', '));

    // Check if these numbers are present in the aggregated stats
    // Note: getDbTomorrowStats aggregates ALL occurrences, so we can't functionally compare 
    // the exact counts of ONE day against the total average easily without calculating it all.
    // BUT, we can check if the total count of lotos processed roughly matches 27 * occurrenceCount (since there are 27 prizes in XSMB)

    const totalLotosProcessed = Object.values(stats.frequencies).reduce((a, b) => a + b.count, 0);
    const expectedTotal = stats.occurrenceCount * 27;

    console.log(`Total occurrences: ${stats.occurrenceCount}`);
    console.log(`Total loto numbers counted in stats: ${totalLotosProcessed}`);
    console.log(`Expected total (approx 27 * occurrences): ${expectedTotal}`);

    if (totalLotosProcessed === expectedTotal) {
        console.log('SUCCESS: The stats calculation seems to include exactly 27 prizes per day.');
    } else {
        console.log('WARNING: The total count does not match 27 * occurrences.');
        console.log('Diff:', totalLotosProcessed - expectedTotal);
    }

}

verify().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
});
