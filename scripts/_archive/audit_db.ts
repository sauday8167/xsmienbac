
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function auditDatabase() {
    const dbPath = path.join(process.cwd(), 'database', 'xsmb.sqlite');
    console.log(`Auditing database: ${dbPath}`);

    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // 1. Get all results ordered by date
        const results = await db.all('SELECT * FROM xsmb_results ORDER BY draw_date DESC');
        console.log(`Total records found: ${results.length}`);

        if (results.length === 0) {
            console.warn("⚠️ Database is empty!");
            return;
        }

        const errors: string[] = [];
        let dateGaps: string[] = [];

        // 2. Iterate and check data
        for (let i = 0; i < results.length; i++) {
            const row = results[i];
            const date = new Date(row.draw_date);

            // Check for date gaps (skip first record)
            if (i < results.length - 1) {
                const nextRow = results[i + 1];
                const nextDate = new Date(nextRow.draw_date);
                const diffTime = Math.abs(date.getTime() - nextDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                // Usually gap is 1 day. If > 1, valid gap (maybe Tet holiday or missing data)
                // Tet holiday is usually 4 days.
                if (diffDays > 1) {
                    // Check if it's Tet (Lunar New Year) - simple check or just log it
                    dateGaps.push(`Gap of ${diffDays} days between ${row.draw_date} and ${nextRow.draw_date}`);
                }
            }

            // Check specific logic according to schema comments
            // Prize 2: 2 numbers
            try {
                const p2 = JSON.parse(row.prize_2);
                if (!Array.isArray(p2) || p2.length !== 2) errors.push(`[${row.draw_date}] Prize 2 invalid: ${row.prize_2}`);
            } catch (e) { errors.push(`[${row.draw_date}] Prize 2 JSON error: ${row.prize_2}`); }

            // Prize 3: 6 numbers
            try {
                const p3 = JSON.parse(row.prize_3);
                if (!Array.isArray(p3) || p3.length !== 6) errors.push(`[${row.draw_date}] Prize 3 invalid: ${row.prize_3}`);
            } catch (e) { errors.push(`[${row.draw_date}] Prize 3 JSON error: ${row.prize_3}`); }

            // Prize 4: 4 numbers
            try {
                const p4 = JSON.parse(row.prize_4);
                if (!Array.isArray(p4) || p4.length !== 4) errors.push(`[${row.draw_date}] Prize 4 invalid: ${row.prize_4}`);
            } catch (e) { errors.push(`[${row.draw_date}] Prize 4 JSON error: ${row.prize_4}`); }

            // Prize 5: 6 numbers
            try {
                const p5 = JSON.parse(row.prize_5);
                if (!Array.isArray(p5) || p5.length !== 6) errors.push(`[${row.draw_date}] Prize 5 invalid: ${row.prize_5}`);
            } catch (e) { errors.push(`[${row.draw_date}] Prize 5 JSON error: ${row.prize_5}`); }

            // Prize 6: 3 numbers
            try {
                const p6 = JSON.parse(row.prize_6);
                if (!Array.isArray(p6) || p6.length !== 3) errors.push(`[${row.draw_date}] Prize 6 invalid: ${row.prize_6}`);
            } catch (e) { errors.push(`[${row.draw_date}] Prize 6 JSON error: ${row.prize_6}`); }

            // Prize 7: 4 numbers
            try {
                const p7 = JSON.parse(row.prize_7);
                if (!Array.isArray(p7) || p7.length !== 4) errors.push(`[${row.draw_date}] Prize 7 invalid: ${row.prize_7}`);
            } catch (e) { errors.push(`[${row.draw_date}] Prize 7 JSON error: ${row.prize_7}`); }

            // Check Special Prize and Prize 1
            if (!row.special_prize) errors.push(`[${row.draw_date}] Special Prize is missing`);
            if (!row.prize_1) errors.push(`[${row.draw_date}] Prize 1 is missing`);
        }

        console.log("\nAuthentication Report:");
        if (errors.length > 0) {
            console.log(`⚠️ Found ${errors.length} data integrity errors:`);
            errors.slice(0, 50).forEach(e => console.log(e)); // Print first 50
            if (errors.length > 50) console.log(`...and ${errors.length - 50} more.`);
        } else {
            console.log("✅ No data integrity errors found in JSON structures or missing fields.");
        }

        if (dateGaps.length > 0) {
            console.log(`\n⚠️ Found ${dateGaps.length} date gaps (potential missing days):`);
            dateGaps.slice(0, 20).forEach(g => console.log(g));
        } else {
            console.log("\n✅ No significant date gaps found.");
        }

    } catch (error) {
        console.error("Audit failed:", error);
    }
}

auditDatabase();
