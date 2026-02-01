
import { findAIPatterns } from '../src/lib/soi-cau-bach-thu';

async function debug() {
    console.log("Debugging AI Logic directly...");
    const patterns = await findAIPatterns('2026-01-30');
    console.log("Patterns found:", patterns.length);
    console.log(JSON.stringify(patterns, null, 2));
}

debug().catch(console.error);
